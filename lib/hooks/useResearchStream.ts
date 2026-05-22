"use client";

import { useCallback, useRef, useState } from "react";
import type { ResearchRequestBody } from "@/lib/research/schemas";
import type { ResearchStreamEvent } from "@/lib/research/stream";

export type ResearchPhase =
  | "idle"
  | "analyzing"
  | "conversing"
  | "searching"
  | "synthesizing"
  | "complete"
  | "stopped"
  | "error";

export interface ResearchSource {
  id: number;
  title: string;
  url: string;
  snippet: string;
  domain: string;
  tier: number;
  publishedDate?: string;
}

export interface QueryStep {
  index: number;
  query: string;
  focusAreaId: string;
  status: "executing" | "complete" | "error";
  resultCount?: number;
}

export interface ResearchStreamState {
  phase: ResearchPhase;
  answer: string;
  entity: string | null;
  objective: string | null;
  researchIntent: string | null;
  totalQueries: number;
  completedQueries: number;
  uniqueSources: number;
  sources: ResearchSource[];
  querySteps: QueryStep[];
  followups: string[];
  reportId: string | null;
  isConversation: boolean;
  error: string | null;
  errorCode: string | null;
}

const INITIAL_STATE: ResearchStreamState = {
  phase: "idle",
  answer: "",
  entity: null,
  objective: null,
  researchIntent: null,
  totalQueries: 0,
  completedQueries: 0,
  uniqueSources: 0,
  sources: [],
  querySteps: [],
  followups: [],
  reportId: null,
  isConversation: false,
  error: null,
  errorCode: null,
};

function upsertQueryStep(
  steps: QueryStep[],
  step: QueryStep,
): QueryStep[] {
  const next = [...steps];
  const existingIndex = next.findIndex((item) => item.index === step.index);
  if (existingIndex >= 0) next[existingIndex] = { ...next[existingIndex], ...step };
  else next.push(step);
  return next.sort((a, b) => a.index - b.index);
}

function addUniqueSource(
  sources: ResearchSource[],
  source: ResearchSource,
): ResearchSource[] {
  if (sources.some((item) => item.url.toLowerCase() === source.url.toLowerCase())) {
    return sources;
  }
  return [...sources, source];
}

async function consumeSse(
  response: Response,
  onEvent: (event: ResearchStreamEvent["type"], data: Record<string, unknown>) => void,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream available");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;

      let eventType = "message";
      let dataLine = "";

      for (const line of chunk.split("\n")) {
        if (line.startsWith("event: ")) eventType = line.slice(7).trim();
        if (line.startsWith("data: ")) dataLine = line.slice(6);
      }

      if (dataLine) {
        onEvent(
          eventType as ResearchStreamEvent["type"],
          JSON.parse(dataLine) as Record<string, unknown>,
        );
      }
    }
  }
}

export function useResearchStream() {
  const [state, setState] = useState<ResearchStreamState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const startResearch = useCallback(async (body: ResearchRequestBody) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({
      ...INITIAL_STATE,
      phase: "idle",
    });

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? `Request failed (${response.status})`);
      }

      await consumeSse(response, (type, data) => {
        setState((prev) => {
          switch (type) {
            case "analysis_started":
              return { ...prev, phase: "analyzing" };
            case "query_analyzed":
              return {
                ...prev,
                entity: data.entity as string,
                objective: data.objective as string,
                researchIntent: data.researchIntent as string,
              };
            case "conversation_started":
              return { ...prev, phase: "conversing", isConversation: true };
            case "search_started":
              return {
                ...prev,
                phase: "searching",
                entity: data.entity as string,
                objective: data.objective as string,
                totalQueries: data.totalQueries as number,
              };
            case "query_executing":
              return {
                ...prev,
                querySteps: upsertQueryStep(prev.querySteps, {
                  index: data.index as number,
                  query: data.query as string,
                  focusAreaId: data.focusAreaId as string,
                  status: "executing",
                }),
              };
            case "query_complete": {
              const index = data.index as number;
              const existing = prev.querySteps.find((item) => item.index === index);
              return {
                ...prev,
                completedQueries: index + 1,
                querySteps: upsertQueryStep(prev.querySteps, {
                  index,
                  query: existing?.query ?? "",
                  focusAreaId: existing?.focusAreaId ?? "",
                  status: "complete",
                  resultCount: data.resultCount as number,
                }),
              };
            }
            case "query_error": {
              const index = data.index as number;
              const existing = prev.querySteps.find((item) => item.index === index);
              return {
                ...prev,
                querySteps: upsertQueryStep(prev.querySteps, {
                  index,
                  query: existing?.query ?? (data.query as string),
                  focusAreaId: existing?.focusAreaId ?? "",
                  status: "error",
                }),
              };
            }
            case "source_found": {
              const source = data.source as ResearchSource;
              return {
                ...prev,
                sources: addUniqueSource(prev.sources, source),
              };
            }
            case "search_complete":
              return {
                ...prev,
                uniqueSources: data.uniqueSources as number,
              };
            case "synthesis_started":
              return { ...prev, phase: "synthesizing" };
            case "text_delta":
              return {
                ...prev,
                answer: prev.answer + (data.content as string),
              };
            case "followups":
              return {
                ...prev,
                followups: data.questions as string[],
              };
            case "error":
              return {
                ...prev,
                phase: "error",
                error: data.message as string,
                errorCode: (data.code as string) ?? null,
              };
            case "done":
              return {
                ...prev,
                phase: "complete",
                reportId: data.reportId as string,
              };
            default:
              return prev;
          }
        });
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setState((prev) =>
          prev.phase === "analyzing" ||
          prev.phase === "conversing" ||
          prev.phase === "searching" ||
          prev.phase === "synthesizing"
            ? { ...prev, phase: "stopped" }
            : prev,
        );
        return;
      }
      setState((prev) => ({
        ...prev,
        phase: "error",
        error:
          error instanceof Error ? error.message : "Failed to start research",
      }));
    }
  }, []);

  const stopResearch = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  return { state, startResearch, stopResearch, reset };
}
