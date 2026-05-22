import {
  buildQueryAnalysisSystemPrompt,
  buildQueryAnalysisUserPrompt,
} from "@/lib/prompts/query-analysis";
import { completeOpenRouterChat } from "@/lib/openrouter/client";
import { buildIntakeFromQuery } from "@/lib/research/entity-parser";
import type { ResearchRequestBody } from "@/lib/research/schemas";
import type { ResearchObjective } from "@/lib/research/types";
import {
  isValidEntityName,
  detectConversationSituation,
  type ConversationSituation,
} from "@/lib/research/query-validator";

const VALID_OBJECTIVES = new Set<ResearchObjective>([
  "vendor_assessment",
  "ma_research",
  "competitive_intelligence",
  "market_intelligence",
  "risk_assessment",
  "custom",
]);

const GREETING_OR_CHITCHAT =
  /^(hi|hello|hey|yo|sup|thanks|thank you|ok|okay|help|what can you do|how does this work|who are you|good morning|good evening|how are you)[!.?\s]*$/i;

const COMMON_NON_COMPANY_WORDS = new Set([
  "hello",
  "hi",
  "hey",
  "test",
  "help",
  "thanks",
  "ok",
  "okay",
  "yes",
  "no",
  "what",
  "why",
  "how",
  "who",
  "company",
  "research",
  "business",
  "finance",
  "please",
]);

export interface QueryAnalysisResult {
  mode: "research" | "conversation";
  conversationSituation?: ConversationSituation;
  reason?: string;
  entityName?: string;
  domain?: string;
  objective?: ResearchObjective;
  customObjective?: string;
  researchIntent?: string;
  confidence?: number;
}

interface AiAnalysisPayload {
  allowed?: boolean;
  entityName?: string | null;
  domain?: string | null;
  objective?: string | null;
  customObjective?: string | null;
  researchIntent?: string | null;
  rejectionReason?: string | null;
  confidence?: number;
}

function conversation(situation: ConversationSituation = "general"): QueryAnalysisResult {
  return { mode: "conversation", conversationSituation: situation };
}

export function isStarterConversationQuery(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;

  if (GREETING_OR_CHITCHAT.test(trimmed)) return true;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1 && COMMON_NON_COMPANY_WORDS.has(words[0]!.toLowerCase())) {
    return true;
  }

  if (/^(what|how|who|can you|tell me about yourself)/i.test(trimmed)) {
    return true;
  }

  return false;
}

function parseJsonFromModel(text: string): AiAnalysisPayload | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? text).trim();

  try {
    return JSON.parse(candidate) as AiAnalysisPayload;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1)) as AiAnalysisPayload;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeObjective(
  value: string | null | undefined,
  fallback?: ResearchObjective,
): ResearchObjective | undefined {
  if (value && VALID_OBJECTIVES.has(value as ResearchObjective)) {
    return value as ResearchObjective;
  }
  return fallback;
}

function mergeWithRequest(
  body: ResearchRequestBody,
  ai: AiAnalysisPayload,
): QueryAnalysisResult {
  const parsed = buildIntakeFromQuery(body.query, {
    objective: body.objective,
    customObjective: body.customObjective,
    depth: body.depth,
    timeWindowMonths: body.timeWindowMonths,
    geographicFocus: body.geographicFocus,
    priorityAreas: body.priorityAreas,
    entityName: body.entityName,
    domain: body.domain,
  });

  const entityName =
    body.entityName?.trim() ||
    ai.entityName?.trim() ||
    parsed.entityName;

  const domain =
    body.domain?.trim() ||
    ai.domain?.trim()?.toLowerCase() ||
    parsed.domain;

  const objective =
    normalizeObjective(ai.objective, body.objective ?? parsed.objective) ??
    parsed.objective;

  const customObjective =
    body.customObjective?.trim() ||
    ai.customObjective?.trim() ||
    parsed.customObjective;

  if (
    !entityName ||
    entityName.length < 2 ||
    COMMON_NON_COMPANY_WORDS.has(entityName.toLowerCase()) ||
    !isValidEntityName(entityName)
  ) {
    return conversation("no_company");
  }

  if (objective === "custom" && !customObjective) {
    return conversation("no_company");
  }

  return {
    mode: "research",
    entityName,
    domain,
    objective,
    customObjective,
    researchIntent:
      ai.researchIntent?.trim() ||
      `Business intelligence research on ${entityName}`,
    confidence: ai.confidence,
  };
}

async function analyzeWithAi(
  body: ResearchRequestBody,
): Promise<QueryAnalysisResult | null> {
  const raw = await completeOpenRouterChat({
    system: buildQueryAnalysisSystemPrompt(),
    user: buildQueryAnalysisUserPrompt({
      query: body.query,
      objective: body.objective,
      customObjective: body.customObjective,
      depth: body.depth,
    }),
    maxTokens: 512,
    timeoutMs: 12_000,
  });

  const ai = parseJsonFromModel(raw);
  if (!ai) return null;

  if (!ai.allowed) {
    return conversation("no_company");
  }

  return mergeWithRequest(body, ai);
}

function analyzeWithHeuristics(body: ResearchRequestBody): QueryAnalysisResult {
  return mergeWithRequest(body, {
    allowed: true,
    entityName: body.entityName ?? undefined,
    domain: body.domain ?? undefined,
    objective: body.objective ?? undefined,
    customObjective: body.customObjective ?? undefined,
    researchIntent: `Business intelligence research on ${body.query.trim()}`,
  });
}

export async function analyzeResearchQuery(
  body: ResearchRequestBody,
): Promise<QueryAnalysisResult> {
  if (isStarterConversationQuery(body.query)) {
    return conversation("welcome");
  }

  const chatSituation = detectConversationSituation(body.query);
  if (chatSituation) {
    return conversation(chatSituation);
  }

  try {
    const aiResult = await analyzeWithAi(body);
    if (aiResult) return aiResult;
  } catch {
    // Fall back to heuristics if the model is unavailable
  }

  return analyzeWithHeuristics(body);
}

export function buildIntakeFromAnalysis(
  body: ResearchRequestBody,
  analysis: QueryAnalysisResult,
): ReturnType<typeof buildIntakeFromQuery> {
  return buildIntakeFromQuery(body.query, {
    objective: analysis.objective ?? body.objective,
    customObjective: analysis.customObjective ?? body.customObjective,
    depth: body.depth,
    timeWindowMonths: body.timeWindowMonths,
    geographicFocus: body.geographicFocus,
    priorityAreas: body.priorityAreas,
    entityName: analysis.entityName,
    domain: analysis.domain,
  });
}

export const CONVERSATION_STARTER_FOLLOWUPS = [
  "Vendor assessment on Stripe",
  "Due diligence on Reliance Industries",
  "Competitive intelligence on Shopify",
];
