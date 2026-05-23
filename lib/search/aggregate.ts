import { getTierWeight } from "@/lib/search/tier-classifier";
import { classifySource } from "@/lib/search/source-classifier";
import type { SearchResult } from "@/lib/search/types";

export interface AggregateOptions {
  maxSources?: number;
  snippetMaxLength?: number;
  entityDomain?: string;
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    let normalized = parsed.toString();
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function parseDate(value?: string): number {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function scoreSource(source: SearchResult): number {
  const tierScore = getTierWeight(source.tier);
  const recencyScore = parseDate(source.publishedDate);
  const recencyBoost = recencyScore > 0 ? recencyScore / 1e13 : 0;
  const snippetBoost = Math.min(source.snippet.length / 500, 1) * 0.1;
  return tierScore + recencyBoost + snippetBoost;
}

export function dedupeSearchResults(results: SearchResult[]): SearchResult[] {
  const byUrl = new Map<string, SearchResult>();

  for (const result of results) {
    const key = normalizeUrl(result.url);
    const existing = byUrl.get(key);
    if (!existing || scoreSource(result) > scoreSource(existing)) {
      byUrl.set(key, result);
    }
  }

  return Array.from(byUrl.values());
}

export function rankSearchResults(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => scoreSource(b) - scoreSource(a));
}

export function truncateSnippet(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function applySourceTiers(
  results: SearchResult[],
  entityDomain?: string,
): SearchResult[] {
  return results.map((source) => ({
    ...source,
    tier: classifySource({
      url: source.url,
      title: source.title,
      snippet: source.snippet,
      domain: source.domain,
      entityDomain,
    }),
  }));
}

export function aggregateSearchResults(
  results: SearchResult[],
  options: AggregateOptions = {},
): SearchResult[] {
  const { maxSources = 120, snippetMaxLength = 300, entityDomain } = options;

  const classified = applySourceTiers(results, entityDomain);
  const deduped = dedupeSearchResults(classified);
  const ranked = rankSearchResults(deduped);

  return ranked.slice(0, maxSources).map((source, index) => ({
    ...source,
    id: index + 1,
    snippet: truncateSnippet(source.snippet, snippetMaxLength),
  }));
}

export function summarizeSourcesByTier(
  results: SearchResult[],
): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const result of results) {
    counts[result.tier] = (counts[result.tier] ?? 0) + 1;
  }
  return counts;
}
