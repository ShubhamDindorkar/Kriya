import type { SourceTier } from "@/lib/search/types";
import { getDomainFromUrl } from "@/lib/search/tier-classifier";

export interface ClassifySourceInput {
  url: string;
  title: string;
  snippet?: string;
  domain?: string;
  entityDomain?: string;
}

const T4_DOMAINS = [
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

const T1_GOV_DOMAINS = [
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

const T2_NEWS_DOMAINS = [
  "reuters.com",
  "bloomberg.com",
  "wsj.com",
  "ft.com",
  "cnbc.com",
  "finance.yahoo.com",
  "marketwatch.com",
  "apnews.com",
  "bbc.com",
  "bbc.co.uk",
  "nytimes.com",
  "theguardian.com",
  "economist.com",
  "businesswire.com",
  "prnewswire.com",
  "globenewswire.com",
];

const T2_ANALYST_DOMAINS = [
  "gartner.com",
  "forrester.com",
  "spglobal.com",
  "moodys.com",
  "fitchratings.com",
  "law360.com",
  "idc.com",
];

const T2_PROFESSIONAL_DOMAINS = [
  "pwc.com",
  "deloitte.com",
  "ey.com",
  "kpmg.com",
  "mckinsey.com",
  "bcg.com",
  "bain.com",
];

const T3_INDUSTRY_DOMAINS = [
  "techcrunch.com",
  "venturebeat.com",
  "crunchbase.com",
  "pitchbook.com",
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

const BLOG_PATH_RE =
  /\/(?:blog|blogs|viewpoint|viewpoints|authors?|opinion|commentary|perspectives?)(?:\/|$)/i;

const T1_FILING_RE =
  /\b(?:10-?[kq]|8-?k|form-?10|sec-?filing|edgar|def-?14a|proxy-?statement|annual-?report(?:\s+filing)?)\b/i;

const ENTITY_OFFICIAL_PATH_RE =
  /\/(?:press(?:-release)?|newsroom|news\/(?:press|release)|investors?|ir|financials?|sec-filings?|annual-reports?)(?:\/|$)/i;

const PROFESSIONAL_OFFICIAL_PATH_RE =
  /\/(?:press(?:-release)?|newsroom|news|publications?|research|reports?|surveys?|insights?|thought-?leadership)(?:\/|$)/i;

function matchesDomain(domain: string, patterns: string[]): boolean {
  return patterns.some(
    (pattern) => domain === pattern || domain.endsWith(`.${pattern}`),
  );
}

function normalizeDomain(domain: string): string {
  return domain.replace(/^www\./, "").toLowerCase();
}

function domainsMatch(a: string, b: string): boolean {
  const left = normalizeDomain(a);
  const right = normalizeDomain(b);
  return left === right || left.endsWith(`.${right}`) || right.endsWith(`.${left}`);
}

function combinedText(input: ClassifySourceInput): string {
  return `${input.title} ${input.url} ${input.snippet ?? ""}`.toLowerCase();
}

function isBlogOrOpinion(input: ClassifySourceInput): boolean {
  const text = combinedText(input);
  if (BLOG_PATH_RE.test(input.url)) return true;
  return /\b(?:blog post|author blog|opinion piece|guest post|personal view)\b/.test(
    text,
  );
}

function isRegulatoryFiling(input: ClassifySourceInput): boolean {
  return T1_FILING_RE.test(combinedText(input));
}

function isEntityOfficialDisclosure(
  input: ClassifySourceInput,
  domain: string,
): boolean {
  if (!input.entityDomain || !domainsMatch(domain, input.entityDomain)) {
    return false;
  }
  if (isBlogOrOpinion(input)) return false;
  if (ENTITY_OFFICIAL_PATH_RE.test(input.url)) return true;
  if (isRegulatoryFiling(input)) return true;

  const text = combinedText(input);
  return /\b(?:press release|investor relations|official announcement|earnings release)\b/.test(
    text,
  );
}

function isProfessionalOfficialRelease(
  input: ClassifySourceInput,
  domain: string,
): boolean {
  if (
    !matchesDomain(domain, T2_PROFESSIONAL_DOMAINS) &&
    !matchesDomain(domain, T2_ANALYST_DOMAINS)
  ) {
    return false;
  }
  if (isBlogOrOpinion(input)) return false;
  if (PROFESSIONAL_OFFICIAL_PATH_RE.test(input.url)) return true;

  const text = combinedText(input);
  return /\b(?:official announcement|press release|industry report|survey report|research report)\b/.test(
    text,
  );
}

function isLinkedInProfile(url: string, domain: string): boolean {
  return domain.includes("linkedin.com") && /\/in\//i.test(url);
}

export function classifySource(input: ClassifySourceInput): SourceTier {
  const domain = normalizeDomain(input.domain ?? getDomainFromUrl(input.url));
  if (!domain) return 4;

  if (matchesDomain(domain, T4_DOMAINS)) return 4;

  if (matchesDomain(domain, T1_GOV_DOMAINS) || domain.endsWith(".gov")) {
    return 1;
  }

  if (isRegulatoryFiling(input)) return 1;

  if (isBlogOrOpinion(input)) return 3;

  if (isEntityOfficialDisclosure(input, domain)) return 1;

  if (matchesDomain(domain, T2_NEWS_DOMAINS)) return 2;

  if (isProfessionalOfficialRelease(input, domain)) return 2;

  if (isLinkedInProfile(input.url, domain)) return 2;

  if (matchesDomain(domain, T2_ANALYST_DOMAINS)) return 2;

  if (matchesDomain(domain, T3_INDUSTRY_DOMAINS)) return 3;

  if (domain.endsWith(".edu")) return 3;

  if (/\b(?:whitepaper|conference presentation|trade journal)\b/.test(combinedText(input))) {
    return 3;
  }

  return 3;
}
