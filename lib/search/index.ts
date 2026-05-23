export {
  aggregateSearchResults,
  dedupeSearchResults,
  rankSearchResults,
  summarizeSourcesByTier,
  truncateSnippet,
} from "@/lib/search/aggregate";
export {
  type BatchProgressEvent,
  type BatchRunnerOptions,
  type BatchRunnerResult,
  runSearchBatch,
} from "@/lib/search/batch-runner";
export {
  buildQueries,
  getQueryCount,
  getQueryStrings,
  type GeneratedQuery,
  type QueryBuilderInput,
} from "@/lib/search/query-builder";
export {
  classifyDomain,
  getDomainFromUrl,
  getTierLabel,
  getTierWeight,
} from "@/lib/search/tier-classifier";
export { classifySource } from "@/lib/search/source-classifier";
export type { ClassifySourceInput } from "@/lib/search/source-classifier";
export {
  enrichSearchResult,
  getTavilyProvider,
  TavilySearchProvider,
} from "@/lib/search/tavily";
export type { SearchProvider, SearchResult, SourceTier } from "@/lib/search/types";
