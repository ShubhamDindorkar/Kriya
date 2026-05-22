import { getDepthConfig } from "@/lib/prompts/system";
import { checkCompliance } from "@/lib/research/compliance-gate";
import type { ResearchIntake } from "@/lib/research/types";
import {
  aggregateSearchResults,
  buildQueries,
  runSearchBatch,
  summarizeSourcesByTier,
} from "@/lib/search";
import type { BatchProgressEvent } from "@/lib/search/batch-runner";

export interface CollectEvidenceInput extends ResearchIntake {
  entityName: string;
}

export interface CollectEvidenceResult {
  sources: ReturnType<typeof aggregateSearchResults>;
  allSources: ReturnType<typeof aggregateSearchResults>;
  queries: ReturnType<typeof buildQueries>;
  queriesExecuted: number;
  totalRawResults: number;
  durationMs: number;
  tierSummary: Record<number, number>;
  errors: Array<{ index: number; query: string; error: string }>;
}

export interface CollectEvidenceOptions {
  onProgress?: (event: BatchProgressEvent) => void;
}

export async function collectEvidence(
  input: CollectEvidenceInput,
  options: CollectEvidenceOptions = {},
): Promise<CollectEvidenceResult> {
  const compliance = checkCompliance(input.query);
  if (!compliance.allowed) {
    throw new Error(compliance.reason ?? "Request blocked by compliance gate");
  }

  const queries = buildQueries({
    entityName: input.entityName,
    domain: input.domain,
    objective: input.objective,
    depth: input.depth,
    timeWindowMonths: input.timeWindowMonths,
    geographicFocus: input.geographicFocus,
    priorityAreas: input.priorityAreas,
  });

  const depthConfig = getDepthConfig(input.depth);

  const batchResult = await runSearchBatch(queries, {
    maxSources: depthConfig.maxSourcesForLlm,
    snippetMaxLength: depthConfig.snippetMaxLength,
    onProgress: options.onProgress,
  });

  return {
    sources: batchResult.sources,
    allSources: batchResult.allSources,
    queries,
    queriesExecuted: batchResult.queriesExecuted,
    totalRawResults: batchResult.totalRawResults,
    durationMs: batchResult.durationMs,
    tierSummary: summarizeSourcesByTier(batchResult.allSources),
    errors: batchResult.errors,
  };
}
