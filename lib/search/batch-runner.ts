import { throwIfAborted } from "@/lib/research/stream";
import { aggregateSearchResults } from "@/lib/search/aggregate";
import type { GeneratedQuery } from "@/lib/search/query-builder";
import { enrichSearchResult, getTavilyProvider } from "@/lib/search/tavily";
import type { SearchProvider, SearchResult } from "@/lib/search/types";

export interface BatchRunnerOptions {
  batchSize?: number;
  batchDelayMs?: number;
  maxResultsPerQuery?: number;
  maxSources?: number;
  snippetMaxLength?: number;
  entityDomain?: string;
  signal?: AbortSignal;
  provider?: SearchProvider;
  onProgress?: (event: BatchProgressEvent) => void;
}

export type BatchProgressEvent =
  | {
      type: "search_started";
      totalQueries: number;
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
      source: SearchResult;
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
    };

export interface BatchRunnerResult {
  sources: SearchResult[];
  allSources: SearchResult[];
  queriesExecuted: number;
  totalRawResults: number;
  durationMs: number;
  errors: Array<{ index: number; query: string; error: string }>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runSearchBatch(
  queries: GeneratedQuery[] | string[],
  options: BatchRunnerOptions = {},
): Promise<BatchRunnerResult> {
  const {
    batchSize = 10,
    batchDelayMs = 200,
    maxResultsPerQuery = 5,
    maxSources = 120,
    snippetMaxLength = 300,
    entityDomain,
    signal,
    provider = getTavilyProvider(),
    onProgress,
  } = options;

  const normalizedQueries: GeneratedQuery[] = queries.map((item) =>
    typeof item === "string"
      ? { query: item, focusArea: "companyProfile", focusAreaId: "A" }
      : item,
  );

  const startTime = Date.now();
  const rawResults: SearchResult[] = [];
  const errors: BatchRunnerResult["errors"] = [];
  let nextId = 1;

  onProgress?.({
    type: "search_started",
    totalQueries: normalizedQueries.length,
  });

  for (let i = 0; i < normalizedQueries.length; i += batchSize) {
    throwIfAborted(signal);

    const batch = normalizedQueries.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (item, batchIndex) => {
        const index = i + batchIndex;
        const total = normalizedQueries.length;

        onProgress?.({
          type: "query_executing",
          index,
          total,
          query: item.query,
          focusAreaId: item.focusAreaId,
        });

        try {
          const results = await provider.search(item.query, {
            maxResults: maxResultsPerQuery,
          });

          for (const result of results) {
            const enriched = enrichSearchResult(
              result,
              nextId++,
              index,
              entityDomain,
            );
            rawResults.push(enriched);
            onProgress?.({ type: "source_found", source: enriched });
          }

          onProgress?.({
            type: "query_complete",
            index,
            total,
            resultCount: results.length,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown search error";
          errors.push({ index, query: item.query, error: message });
          onProgress?.({
            type: "query_error",
            index,
            query: item.query,
            error: message,
          });
        }
      }),
    );

    if (i + batchSize < normalizedQueries.length) {
      await sleep(batchDelayMs);
      throwIfAborted(signal);
    }
  }

  const allSources = aggregateSearchResults(rawResults, {
    maxSources: rawResults.length,
    snippetMaxLength,
    entityDomain,
  });

  const sources = aggregateSearchResults(rawResults, {
    maxSources,
    snippetMaxLength,
    entityDomain,
  });

  const durationMs = Date.now() - startTime;

  onProgress?.({
    type: "search_complete",
    totalRawResults: rawResults.length,
    uniqueSources: allSources.length,
    durationMs,
  });

  return {
    sources,
    allSources,
    queriesExecuted: normalizedQueries.length,
    totalRawResults: rawResults.length,
    durationMs,
    errors,
  };
}
