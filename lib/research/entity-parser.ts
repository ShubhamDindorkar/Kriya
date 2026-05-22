import type {
  ResearchDepth,
  ResearchIntake,
  ResearchObjective,
} from "@/lib/research/types";

const DOMAIN_PATTERN =
  /\b([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|org|net|io|co|ai|dev)\b/i;

const STRUCTURED_DELIMITER_PATTERN = /\s*(?:\/+|\s*[|·•]\s*|\s+-\s+|\s*:\s*)\s*/;

const DEPTH_VALUES = new Set<ResearchDepth>([
  "quick",
  "standard",
  "comprehensive",
]);

const OBJECTIVE_PHRASES: Array<{
  pattern: RegExp;
  objective: ResearchObjective;
}> = [
  {
    pattern:
      /due\s+diligence|m\s*&\s*a(?:\s+research)?|mergers?\s+and\s+acquisitions?/i,
    objective: "ma_research",
  },
  { pattern: /vendor\s+assessment/i, objective: "vendor_assessment" },
  {
    pattern: /competitive\s+intelligence/i,
    objective: "competitive_intelligence",
  },
  {
    pattern: /market\s+intelligence/i,
    objective: "market_intelligence",
  },
  { pattern: /risk\s+assessment/i, objective: "risk_assessment" },
];

export interface ParsedEntity {
  entityName: string;
  domain?: string;
}

export interface ParsedQueryMetadata {
  entityName: string;
  domain?: string;
  objective?: ResearchObjective;
  depth?: ResearchDepth;
}

function matchObjectivePhrase(text: string): ResearchObjective | undefined {
  for (const { pattern, objective } of OBJECTIVE_PHRASES) {
    if (pattern.test(text)) return objective;
  }
  return undefined;
}

function matchDepth(text: string): ResearchDepth | undefined {
  const normalized = text.trim().toLowerCase();
  if (DEPTH_VALUES.has(normalized as ResearchDepth)) {
    return normalized as ResearchDepth;
  }
  return undefined;
}

function matchDepthInText(text: string): ResearchDepth | undefined {
  for (const depth of DEPTH_VALUES) {
    if (new RegExp(`\\b${depth}\\b`, "i").test(text)) {
      return depth;
    }
  }
  return undefined;
}

function splitStructuredSegments(query: string): string[] | null {
  const trimmed = query.trim();
  const hasStructuredDelimiter =
    trimmed.includes("/") ||
    trimmed.includes("|") ||
    trimmed.includes("·") ||
    trimmed.includes("•") ||
    /\s-\s/.test(trimmed) ||
    /:/.test(trimmed) ||
    (trimmed.includes(",") && trimmed.split(",").length >= 3);

  if (!hasStructuredDelimiter) return null;

  const delimiterPattern = trimmed.includes(",") && !trimmed.includes("/")
    ? /\s*,\s*/
    : STRUCTURED_DELIMITER_PATTERN;

  const segments = trimmed
    .split(delimiterPattern)
    .map((segment) => segment.trim())
    .filter(Boolean);

  return segments.length >= 2 ? segments : null;
}

function parseStructuredQuery(query: string): ParsedQueryMetadata | null {
  const segments = splitStructuredSegments(query);
  if (!segments) return null;

  let entityName: string | undefined;
  let objective: ResearchObjective | undefined;
  let depth: ResearchDepth | undefined;

  for (const segment of segments) {
    const quoted = segment.match(/^"([^"]+)"$/);
    const normalizedSegment = quoted?.[1]?.trim() ?? segment;

    const segmentDepth = matchDepth(normalizedSegment);
    if (segmentDepth) {
      depth = segmentDepth;
      continue;
    }

    const segmentObjective = matchObjectivePhrase(normalizedSegment);
    if (segmentObjective) {
      objective = segmentObjective;
      continue;
    }

    if (!entityName) {
      entityName = normalizedSegment;
    }
  }

  if (!entityName) return null;

  return {
    entityName: capitalizeWords(entityName),
    objective,
    depth,
  };
}

function stripResearchMetadata(query: string): string {
  let result = query.trim();

  for (const depth of DEPTH_VALUES) {
    result = result.replace(new RegExp(`\\b${depth}\\b`, "i"), " ");
  }

  for (const { pattern } of OBJECTIVE_PHRASES) {
    result = result.replace(pattern, " ");
  }

  result = result.replace(/[:/|·•-]+/g, " ");
  result = result.replace(/\s+/g, " ").trim();
  return result || query.trim();
}

function parseNaturalLanguageQuery(query: string): ParsedEntity {
  const domainMatch = query.match(DOMAIN_PATTERN);
  const domain = domainMatch?.[0]?.toLowerCase();

  const onPattern = query.match(
    /(?:on|for|about|regarding|assess(?:ment)?\s+(?:on|of)?)\s+([A-Za-z0-9][A-Za-z0-9&.\-\s]{0,60}?(?:,\s*(?:Inc\.?|LLC|Ltd\.?|Corp\.?|Co\.?|PLC|Limited|LLP))?)(?:\s*[—\-]|$|\s+(?:for|focus|financial|legal|vendor))/i,
  );

  if (onPattern?.[1]) {
    return {
      entityName: capitalizeWords(onPattern[1].trim()),
      domain,
    };
  }

  if (domain) {
    const nameFromDomain = domain.split(".")[0];
    return {
      entityName: capitalize(nameFromDomain),
      domain,
    };
  }

  const quoted = query.match(/"([^"]+)"/);
  if (quoted?.[1]) {
    return { entityName: quoted[1].trim(), domain };
  }

  const stripped = stripResearchMetadata(query);
  const strippedWords = stripped.split(/\s+/).filter(Boolean);

  if (strippedWords.length > 0 && strippedWords.length <= 6) {
    return { entityName: capitalizeWords(stripped), domain };
  }

  const words = query.trim().split(/\s+/);
  if (words.length <= 3) {
    return { entityName: query.trim(), domain };
  }

  return { entityName: capitalizeWords(stripped), domain };
}

export function parseEntityFromQuery(query: string): ParsedEntity {
  const structured = parseStructuredQuery(query);
  if (structured) {
    return {
      entityName: structured.entityName,
      domain: query.match(DOMAIN_PATTERN)?.[0]?.toLowerCase(),
    };
  }

  return parseNaturalLanguageQuery(query);
}

export function parseQueryMetadata(query: string): ParsedQueryMetadata {
  const structured = parseStructuredQuery(query);
  if (structured) return structured;

  const parsed = parseNaturalLanguageQuery(query);
  const objective = matchObjectivePhrase(query);
  const depth = matchDepthInText(query);

  return {
    entityName: parsed.entityName,
    domain: parsed.domain,
    objective,
    depth,
  };
}

export function buildIntakeFromQuery(
  query: string,
  partial: Partial<ResearchIntake> = {},
): ResearchIntake & { entityName: string } {
  const metadata = parseQueryMetadata(query);

  return {
    query,
    entityName: partial.entityName ?? metadata.entityName,
    domain: partial.domain ?? metadata.domain,
    objective: partial.objective ?? metadata.objective ?? "vendor_assessment",
    customObjective: partial.customObjective,
    depth: partial.depth ?? metadata.depth ?? "comprehensive",
    timeWindowMonths: partial.timeWindowMonths ?? 12,
    geographicFocus: partial.geographicFocus,
    priorityAreas: partial.priorityAreas ?? [],
  };
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function capitalizeWords(value: string): string {
  return value
    .split(/\s+/)
    .map((word) => capitalize(word))
    .join(" ");
}
