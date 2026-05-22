export type SourceTier = 1 | 2 | 3 | 4;

export interface SearchResult {
  id: number;
  title: string;
  url: string;
  snippet: string;
  domain: string;
  tier: SourceTier;
  publishedDate?: string;
  queryIndex?: number;
}

export interface SearchProvider {
  search(
    query: string,
    options?: { maxResults?: number },
  ): Promise<Omit<SearchResult, "id" | "tier" | "domain">[]>;
}
