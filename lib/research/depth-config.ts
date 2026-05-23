import type { FocusAreaKey } from "@/lib/prompts/focus-areas";
import type { ResearchDepth } from "@/lib/research/types";

export interface ResearchDepthConfig {
  timeWindowMonths: number;
  /** Which focus areas to search — quick uses a subset. */
  focusAreaKeys: FocusAreaKey[] | "all";
  /** Max topics per focus area, or all topics in that area. */
  topicsPerFocusArea: number | "all";
  /** How many objective-specific queries to add. */
  objectiveExtraCount: number | "all";
  includeDomainQueries: boolean;
  domainQueryCount: number;
  includeEntityMetaQueries: boolean;
  includePriorityBoosts: boolean;
  includeComprehensiveExtras: boolean;
  /** Extra deep-dive query templates per focus area (comprehensive only). */
  includeDeepDiveQueries: boolean;
  maxSourcesForLlm: number;
  maxResultsPerQuery: number;
  snippetMaxLength: number;
  batchSize: number;
  batchDelayMs: number;
  synthesisMaxTokens: number;
}

const QUICK_FOCUS_AREAS: FocusAreaKey[] = [
  "companyProfile",
  "financial",
  "risk",
];

const DEPTH_CONFIG: Record<ResearchDepth, ResearchDepthConfig> = {
  quick: {
    timeWindowMonths: 6,
    focusAreaKeys: QUICK_FOCUS_AREAS,
    topicsPerFocusArea: 3,
    objectiveExtraCount: 2,
    includeDomainQueries: true,
    domainQueryCount: 1,
    includeEntityMetaQueries: false,
    includePriorityBoosts: false,
    includeComprehensiveExtras: false,
    includeDeepDiveQueries: false,
    maxSourcesForLlm: 35,
    maxResultsPerQuery: 3,
    snippetMaxLength: 200,
    batchSize: 12,
    batchDelayMs: 100,
    synthesisMaxTokens: 4096,
  },
  standard: {
    timeWindowMonths: 12,
    focusAreaKeys: "all",
    topicsPerFocusArea: "all",
    objectiveExtraCount: "all",
    includeDomainQueries: true,
    domainQueryCount: 3,
    includeEntityMetaQueries: true,
    includePriorityBoosts: true,
    includeComprehensiveExtras: false,
    includeDeepDiveQueries: false,
    maxSourcesForLlm: 100,
    maxResultsPerQuery: 5,
    snippetMaxLength: 300,
    batchSize: 10,
    batchDelayMs: 200,
    synthesisMaxTokens: 8192,
  },
  comprehensive: {
    timeWindowMonths: 24,
    focusAreaKeys: "all",
    topicsPerFocusArea: "all",
    objectiveExtraCount: "all",
    includeDomainQueries: true,
    domainQueryCount: 5,
    includeEntityMetaQueries: true,
    includePriorityBoosts: true,
    includeComprehensiveExtras: true,
    includeDeepDiveQueries: true,
    maxSourcesForLlm: 160,
    maxResultsPerQuery: 8,
    snippetMaxLength: 350,
    batchSize: 10,
    batchDelayMs: 150,
    synthesisMaxTokens: 12288,
  },
};

export function getResearchDepthConfig(depth: ResearchDepth): ResearchDepthConfig {
  return DEPTH_CONFIG[depth];
}

/** @deprecated Use getResearchDepthConfig */
export function getDepthConfig(depth: ResearchDepth): {
  maxSourcesForLlm: number;
  snippetMaxLength: number;
} {
  const config = getResearchDepthConfig(depth);
  return {
    maxSourcesForLlm: config.maxSourcesForLlm,
    snippetMaxLength: config.snippetMaxLength,
  };
}

export function resolveTimeWindowMonths(
  depth: ResearchDepth,
  override?: number,
): number {
  if (override !== undefined) return override;
  return getResearchDepthConfig(depth).timeWindowMonths;
}
