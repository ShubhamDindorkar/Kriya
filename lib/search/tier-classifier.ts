import type { SourceTier } from "@/lib/search/types";

const TIER_1_DOMAINS = [
  "sec.gov",
  "edgar.sec.gov",
  "justice.gov",
  "ftc.gov",
  "treasury.gov",
  "uspto.gov",
  "pacer.gov",
  "gov.uk",
  "europa.eu",
  "courtlistener.com",
  "open.corporates.com",
];

const TIER_2_DOMAINS = [
  "reuters.com",
  "bloomberg.com",
  "wsj.com",
  "ft.com",
  "cnbc.com",
  "finance.yahoo.com",
  "marketwatch.com",
  "gartner.com",
  "forrester.com",
  "spglobal.com",
  "moodys.com",
  "fitchratings.com",
  "law360.com",
  "sec.gov", // also tier 1
  "businesswire.com",
  "prnewswire.com",
  "globenewswire.com",
];

const TIER_3_DOMAINS = [
  "techcrunch.com",
  "venturebeat.com",
  "crunchbase.com",
  "pitchbook.com",
  "linkedin.com",
  "glassdoor.com",
  "g2.com",
  "capterra.com",
  "forbes.com",
  "businessinsider.com",
  "theinformation.com",
  "axios.com",
  "sifted.eu",
  "inc.com",
  "hbr.org",
];

const TIER_4_DOMAINS = [
  "reddit.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "quora.com",
  "medium.com",
  "substack.com",
];

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function matchesDomain(domain: string, patterns: string[]): boolean {
  return patterns.some(
    (pattern) => domain === pattern || domain.endsWith(`.${pattern}`),
  );
}

export function classifyDomain(url: string): SourceTier {
  const domain = extractDomain(url);
  if (!domain) return 4;

  if (matchesDomain(domain, TIER_1_DOMAINS)) return 1;
  if (matchesDomain(domain, TIER_2_DOMAINS)) return 2;
  if (matchesDomain(domain, TIER_3_DOMAINS)) return 3;
  if (matchesDomain(domain, TIER_4_DOMAINS)) return 4;

  if (domain.endsWith(".gov")) return 1;
  if (domain.endsWith(".edu")) return 3;

  return 3;
}

export function getDomainFromUrl(url: string): string {
  return extractDomain(url);
}

export function getTierWeight(tier: SourceTier): number {
  switch (tier) {
    case 1:
      return 1.0;
    case 2:
      return 0.7;
    case 3:
      return 0.4;
    case 4:
      return 0.1;
  }
}

export function getTierLabel(tier: SourceTier): string {
  return `T${tier}`;
}
