import {
  classifyDomain,
  getDomainFromUrl,
} from "@/lib/search/tier-classifier";
import type { SearchProvider, SearchResult } from "@/lib/search/types";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  published_date?: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

export class TavilySearchProvider implements SearchProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.TAVILY_API_KEY;
    if (!key) {
      throw new Error("TAVILY_API_KEY is not configured");
    }
    this.apiKey = key;
  }

  async search(
    query: string,
    options?: { maxResults?: number },
  ): Promise<Omit<SearchResult, "id" | "tier" | "domain">[]> {
    const maxResults = options?.maxResults ?? 5;

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        max_results: maxResults,
        search_depth: "basic",
        include_answer: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Tavily search failed (${response.status}): ${text}`);
    }

    const data = (await response.json()) as TavilyResponse;

    return (data.results ?? []).map((result) => ({
      title: result.title || "Untitled",
      url: result.url,
      snippet: result.content?.slice(0, 500) ?? "",
      publishedDate: result.published_date,
    }));
  }
}

export function enrichSearchResult(
  raw: Omit<SearchResult, "id" | "tier" | "domain">,
  id: number,
  queryIndex?: number,
): SearchResult {
  const domain = getDomainFromUrl(raw.url);
  return {
    ...raw,
    id,
    domain,
    tier: classifyDomain(raw.url),
    queryIndex,
  };
}

export function getTavilyProvider(): TavilySearchProvider {
  return new TavilySearchProvider();
}
