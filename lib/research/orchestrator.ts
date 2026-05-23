import {
  buildAssistantSystemPrompt,
  buildAssistantUserPrompt,
} from "@/lib/prompts/assistant-chat";
import { streamOpenRouterChat } from "@/lib/openrouter/client";
import {
  buildEvidenceBlock,
  buildSystemPrompt,
  buildUserPrompt,
} from "@/lib/prompts/system";
import { collectEvidence } from "@/lib/research/collect-evidence";
import { checkCompliance } from "@/lib/research/compliance-gate";
import {
  analyzeResearchQuery,
  buildIntakeFromAnalysis,
} from "@/lib/research/query-analyzer";
import { detectConversationSituation } from "@/lib/research/query-validator";
import type { ResearchRequestBody } from "@/lib/research/schemas";
import { getResearchDepthConfig } from "@/lib/research/depth-config";
import type { ResearchStreamEvent } from "@/lib/research/stream";
import { getObjectiveLabel } from "@/lib/research/types";
import { buildQueries } from "@/lib/search/query-builder";
import type { BatchProgressEvent } from "@/lib/search/batch-runner";

function mapBatchEvent(event: BatchProgressEvent): ResearchStreamEvent | null {
  switch (event.type) {
    case "search_started":
      return null;
    case "query_executing":
      return {
        type: "query_executing",
        index: event.index,
        total: event.total,
        query: event.query,
        focusAreaId: event.focusAreaId,
      };
    case "query_complete":
      return {
        type: "query_complete",
        index: event.index,
        total: event.total,
        resultCount: event.resultCount,
      };
    case "source_found":
      return {
        type: "source_found",
        source: {
          id: event.source.id,
          title: event.source.title,
          url: event.source.url,
          snippet: event.source.snippet,
          domain: event.source.domain,
          tier: event.source.tier,
          publishedDate: event.source.publishedDate,
        },
      };
    case "search_complete":
      return {
        type: "search_complete",
        totalRawResults: event.totalRawResults,
        uniqueSources: event.uniqueSources,
        durationMs: event.durationMs,
      };
    case "query_error":
      return {
        type: "query_error",
        index: event.index,
        query: event.query,
        error: event.error,
      };
  }
}

async function runConversation(
  body: ResearchRequestBody,
  send: (event: ResearchStreamEvent) => void,
): Promise<void> {
  send({ type: "conversation_started" });

  for await (const chunk of streamOpenRouterChat({
    system: buildAssistantSystemPrompt(),
    user: buildAssistantUserPrompt({
      query: body.query,
      objective: body.objective,
    }),
    maxTokens: 768,
  })) {
    send({ type: "text_delta", content: chunk });
  }

  send({ type: "done", reportId: crypto.randomUUID() });
}

export async function runResearchPipeline(
  body: ResearchRequestBody,
  send: (event: ResearchStreamEvent) => void,
): Promise<void> {
  const compliance = checkCompliance(body.query);
  if (!compliance.allowed) {
    await runConversation(body, send);
    return;
  }

  const quickChat = detectConversationSituation(body.query);
  if (quickChat) {
    await runConversation(body, send);
    return;
  }

  send({ type: "analysis_started" });

  const analysis = await analyzeResearchQuery(body);

  if (analysis.mode === "conversation") {
    await runConversation(body, send);
    return;
  }

  const intake = buildIntakeFromAnalysis(body, analysis);
  const depthConfig = getResearchDepthConfig(intake.depth);

  send({
    type: "query_analyzed",
    entity: intake.entityName,
    objective: getObjectiveLabel(intake.objective, intake.customObjective),
    researchIntent: analysis.researchIntent ?? `Research on ${intake.entityName}`,
  });

  const queries = buildQueries({
    entityName: intake.entityName,
    domain: intake.domain,
    objective: intake.objective,
    customObjective: intake.customObjective,
    depth: intake.depth,
    timeWindowMonths: intake.timeWindowMonths,
    geographicFocus: intake.geographicFocus,
    priorityAreas: intake.priorityAreas,
  });

  send({
    type: "search_started",
    totalQueries: queries.length,
    entity: intake.entityName,
    objective: getObjectiveLabel(intake.objective, intake.customObjective),
  });

  const evidence = await collectEvidence(intake, {
    onProgress: (event) => {
      const mapped = mapBatchEvent(event);
      if (mapped) send(mapped);
    },
  });

  send({ type: "synthesis_started" });

  const evidenceBlock = buildEvidenceBlock(evidence.sources);
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(intake, evidenceBlock);

  const reportId = crypto.randomUUID();

  for await (const chunk of streamOpenRouterChat({
    system: systemPrompt,
    user: userPrompt,
    maxTokens: depthConfig.synthesisMaxTokens,
  })) {
    send({ type: "text_delta", content: chunk });
  }

  send({ type: "done", reportId });
}
