export type ResearchStreamEvent =
  | {
      type: "analysis_started";
    }
  | {
      type: "query_analyzed";
      entity: string;
      objective: string;
      researchIntent: string;
    }
  | { type: "conversation_started" }
  | {
      type: "search_started";
      totalQueries: number;
      entity: string;
      objective: string;
    }
  | {
      type: "query_executing";
      index: number;
      total: number;
      query: string;
      focusAreaId: string;
    }
  | {
      type: "query_complete";
      index: number;
      total: number;
      resultCount: number;
    }
  | {
      type: "source_found";
      source: {
        id: number;
        title: string;
        url: string;
        snippet: string;
        domain: string;
        tier: number;
        publishedDate?: string;
      };
    }
  | {
      type: "search_complete";
      totalRawResults: number;
      uniqueSources: number;
      durationMs: number;
    }
  | {
      type: "query_error";
      index: number;
      query: string;
      error: string;
    }
  | { type: "synthesis_started" }
  | { type: "text_delta"; content: string }
  | { type: "followups"; questions: string[] }
  | { type: "error"; message: string; code?: string }
  | { type: "done"; reportId: string };

export type ResearchStreamSender = (event: ResearchStreamEvent) => void;

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export function createSseStream(
  handler: (
    send: ResearchStreamSender,
    signal: AbortSignal,
  ) => Promise<void>,
  requestSignal?: AbortSignal,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const abortController = new AbortController();
      const linkedSignals = [abortController.signal];
      const onRequestAbort = () => abortController.abort();

      if (requestSignal) {
        if (requestSignal.aborted) {
          abortController.abort();
        } else {
          requestSignal.addEventListener("abort", onRequestAbort);
          linkedSignals.push(requestSignal);
        }
      }

      const send: ResearchStreamSender = (event) => {
        if (abortController.signal.aborted) {
          throw new DOMException("The operation was aborted.", "AbortError");
        }

        const { type, ...payload } = event;
        controller.enqueue(
          encoder.encode(
            `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`,
          ),
        );
      };

      try {
        await handler(send, abortController.signal);
      } catch (error) {
        if (isAbortError(error)) return;

        const message =
          error instanceof Error ? error.message : "Unknown server error";
        send({
          type: "error",
          message,
          code: "INTERNAL_ERROR",
        });
      } finally {
        requestSignal?.removeEventListener("abort", onRequestAbort);
        try {
          controller.close();
        } catch {
          // Stream may already be closed after client disconnect.
        }
      }
    },
    cancel() {
      // Client disconnected — abort is handled via requestSignal listener.
    },
  });
}

export function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("The operation was aborted.", "AbortError");
  }
}
