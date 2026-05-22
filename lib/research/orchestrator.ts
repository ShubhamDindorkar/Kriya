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
  CONVERSATION_STARTER_FOLLOWUPS,
} from "@/lib/research/query-analyzer";
import type { ResearchRequestBody } from "@/lib/research/schemas";
import type { ResearchStreamEvent } from "@/lib/research/stream";
import type { ResearchIntake } from "@/lib/research/types";
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

function generateFollowups(intake: ResearchIntake & { entityName: string }): string[] {
  const entity = intake.entityName;
  const customLabel = intake.customObjective?.trim();

  const byObjective: Record<string, string[]> = {
    vendor_assessment: [
      `What are ${entity}'s financial stability indicators over the last 12 months?`,
      `Does ${entity} have any active regulatory or legal issues?`,
      `Who are ${entity}'s largest public enterprise customers or partners?`,
    ],
    ma_research: [
      `What is ${entity}'s ownership structure and recent funding history?`,
      `Are there material litigation or compliance risks for ${entity}?`,
      `What synergies or integration risks exist with ${entity}?`,
    ],
    competitive_intelligence: [
      `Who are ${entity}'s primary competitors and market share trends?`,
      `What is ${entity}'s product differentiation vs competitors?`,
      `What recent strategic moves has ${entity} made in the market?`,
    ],
    market_intelligence: [
      `What is the market size and growth rate for ${entity}'s sector?`,
      `What regulatory trends could impact ${entity}'s industry?`,
      `Who are emerging players challenging ${entity}?`,
    ],
    risk_assessment: [
      `What are ${entity}'s top operational and financial risk indicators?`,
      `Has ${entity} disclosed any cybersecurity or data incidents?`,
      `What leadership or organizational changes has ${entity} experienced recently?`,
    ],
    custom: customLabel
      ? [
          `What are the latest developments related to ${customLabel} at ${entity}?`,
          `What public evidence supports or contradicts ${entity}'s position on ${customLabel}?`,
          `How does ${entity} compare to peers on ${customLabel}?`,
        ]
      : [],
  };

  return (
    byObjective[intake.objective] ?? [
      `What are the key financial metrics for ${entity}?`,
      `What legal or regulatory risks does ${entity} face?`,
      `How does ${entity} compare to industry peers?`,
    ]
  );
}

export async function runResearchPipeline(
  body: ResearchRequestBody,
  send: (event: ResearchStreamEvent) => void,
): Promise<void> {
  const compliance = checkCompliance(body.query);
  if (!compliance.allowed) {
    send({
      type: "error",
      message: compliance.reason ?? "Request blocked",
      code: "COMPLIANCE_BLOCKED",
    });
    return;
  }

  send({ type: "analysis_started" });

  const analysis = await analyzeResearchQuery(body);

  if (analysis.mode === "conversation") {
    send({ type: "conversation_started" });

    for await (const chunk of streamOpenRouterChat({
      system: buildAssistantSystemPrompt(),
      user: buildAssistantUserPrompt({
        query: body.query,
        objective: body.objective,
      }),
      maxTokens: 1024,
    })) {
      send({ type: "text_delta", content: chunk });
    }

    send({
      type: "followups",
      questions: CONVERSATION_STARTER_FOLLOWUPS,
    });

    send({ type: "done", reportId: crypto.randomUUID() });
    return;
  }

  const intake = buildIntakeFromAnalysis(body, analysis);

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
    maxTokens: 8192,
  })) {
    send({ type: "text_delta", content: chunk });
  }

  send({
    type: "followups",
    questions: generateFollowups(intake),
  });

  send({ type: "done", reportId });
}
