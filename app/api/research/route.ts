import { runResearchPipeline } from "@/lib/research/orchestrator";
import { researchRequestSchema } from "@/lib/research/schemas";
import { createSseStream, sseResponse } from "@/lib/research/stream";

export const maxDuration = 300;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = researchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const stream = createSseStream((send) =>
    runResearchPipeline(parsed.data, send),
  );

  return sseResponse(stream);
}
