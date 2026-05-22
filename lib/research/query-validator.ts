import { HARASSMENT_PATTERNS, PROFANITY_PATTERN } from "@/lib/prompts/compliance";
import { checkCompliance } from "@/lib/research/compliance-gate";
import { parseEntityFromQuery } from "@/lib/research/entity-parser";

const DOMAIN_PATTERN =
  /\b([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|org|net|io|co|ai|dev)\b/i;

const COMPANY_SUFFIX =
  /\b(inc\.?|llc|ltd\.?|corp\.?|plc|limited|llp|co\.?|group|holdings)\b/i;

const RESEARCH_PHRASE =
  /vendor\s+assessment|due\s+diligence|competitive\s+intelligence|market\s+intelligence|risk\s+assessment|m\s*&\s*a/i;

const ENTITY_ON_PATTERN =
  /(?:on|for|about|regarding|assess(?:ment)?\s+(?:on|of)?)\s+[A-Za-z0-9]/i;

const PROFANITY_WORDS = new Set([
  "fuck",
  "fucking",
  "fucked",
  "fucker",
  "shit",
  "shitty",
  "bitch",
  "bitches",
  "damn",
  "ass",
  "asshole",
  "cunt",
  "bastard",
  "dick",
  "piss",
  "crap",
  "wtf",
]);

export type ConversationSituation = "welcome" | "no_company" | "policy" | "general";

function containsProfanity(text: string): boolean {
  const normalized = text.toLowerCase();
  if (PROFANITY_PATTERN.test(normalized)) return true;
  return normalized
    .split(/\s+/)
    .some((word) => PROFANITY_WORDS.has(word.replace(/[^a-z]/g, "")));
}

function hasCompanyResearchSignal(query: string): boolean {
  return (
    RESEARCH_PHRASE.test(query) ||
    ENTITY_ON_PATTERN.test(query) ||
    DOMAIN_PATTERN.test(query) ||
    COMPANY_SUFFIX.test(query) ||
    /"[^"]+"/.test(query)
  );
}

export function isValidEntityName(entityName: string): boolean {
  const trimmed = entityName.trim();
  if (trimmed.length < 2) return false;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;

  if (words.some((word) => PROFANITY_WORDS.has(word.toLowerCase()))) {
    return false;
  }

  if (containsProfanity(trimmed)) return false;

  if (words.length === 1) {
    const word = words[0]!;
    if (PROFANITY_WORDS.has(word.toLowerCase())) return false;
    if (/^[a-z]+$/.test(word) && word.length < 4) return false;
  }

  return true;
}

function wordsLookLikeNoise(query: string): boolean {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  if (words.length === 1) {
    const word = words[0]!.toLowerCase();
    return PROFANITY_WORDS.has(word) || word.length < 3;
  }
  return words.every((word) => PROFANITY_WORDS.has(word.toLowerCase()));
}

/** Local check — should skip research and open a natural chat reply instead. */
export function detectConversationSituation(
  query: string,
): ConversationSituation | null {
  const trimmed = query.trim();
  if (!trimmed) return "no_company";

  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(trimmed)) return "policy";
  }

  const compliance = checkCompliance(trimmed);
  if (!compliance.allowed) return "policy";

  if (containsProfanity(trimmed) && !hasCompanyResearchSignal(trimmed)) {
    return "policy";
  }

  const { entityName } = parseEntityFromQuery(trimmed);
  if (!isValidEntityName(entityName)) return "no_company";

  if (!hasCompanyResearchSignal(trimmed) && wordsLookLikeNoise(trimmed)) {
    return "no_company";
  }

  return null;
}
