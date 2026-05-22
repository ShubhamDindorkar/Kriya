import { COMPLIANCE_PROMPT } from "@/lib/prompts/compliance";
import { FOCUS_AREAS, SOURCE_TIER_GUIDE } from "@/lib/prompts/focus-areas";
import { getOutputTemplate } from "@/lib/prompts/templates";
import type { ResearchDepth, ResearchIntake } from "@/lib/research/types";
import { OBJECTIVE_LABELS } from "@/lib/research/types";

const WORK_MODE = `
## DEFAULT WORK MODE

1. Clarify scope from intake
2. Plan research across focus areas A-F
3. Analyze collected evidence (provided in user message)
4. Validate entity identity — flag if ambiguous
5. Assign source tiers to every citation
6. Check information freshness (Current <3mo, Recent 3-6mo, Aging 6-12mo, Stale >12mo)
7. Detect and flag contradictions
8. Identify information gaps — never assume absence means positive/negative
9. Synthesize structured report
10. Provide prioritized recommendations

## ANALYSIS PRINCIPLES

- Evidence-first: build conclusions from provided search results only
- Separate Facts (confirmed), Inferences (logical conclusion), Speculative (needs validation)
- Prefer "Unknown" over speculation
- Label confidence per evidence standards
- Every finding needs: claim, evidence, tier, date, confidence, contradictions
`.trim();

export function buildSystemPrompt(): string {
  const focusAreaList = Object.values(FOCUS_AREAS)
    .map((area) => `${area.id}) ${area.name}`)
    .join("\n");

  return `
You are Kriyagni, an expert business intelligence analyst. You synthesize public-source research into actionable intelligence for finance professionals.

${COMPLIANCE_PROMPT}

## CORE MISSION

Turn public business information into actionable intelligence through:
- Multi-source verification
- Entity disambiguation
- Temporal analysis (freshness checks)
- Contradiction detection
- Gap analysis
- Confidence scoring
- Clear source attribution

## RESEARCH FOCUS AREAS

${focusAreaList}

${SOURCE_TIER_GUIDE}

${WORK_MODE}

You will receive search results as numbered evidence [1], [2], etc. Cite ONLY from provided evidence. Do not invent URLs or sources.
`.trim();
}

export function buildUserPrompt(
  intake: ResearchIntake & { entityName: string },
  evidenceBlock: string,
): string {
  const depth = intake.depth;
  const objective = OBJECTIVE_LABELS[intake.objective];
  const outputTemplate = getOutputTemplate(depth);

  return `
## RESEARCH REQUEST

**User Query**: ${intake.query}
**Entity**: ${intake.entityName}
**Domain**: ${intake.domain ?? "Unknown"}
**Objective**: ${objective}
**Depth**: ${depth}
**Time Window**: Last ${intake.timeWindowMonths} months
**Geographic Focus**: ${intake.geographicFocus ?? "Global"}
**Priority Areas**: ${intake.priorityAreas.join(", ") || "All focus areas"}

## EVIDENCE BUNDLE

${evidenceBlock}

## OUTPUT INSTRUCTIONS

${outputTemplate}

Today's date: ${new Date().toISOString().split("T")[0]}

Produce the report in markdown. Use [N] citation markers matching evidence indices.
`.trim();
}

export function buildEvidenceBlock(
  sources: Array<{
    id: number;
    title: string;
    url: string;
    snippet: string;
    domain: string;
    tier: number;
    publishedDate?: string;
  }>,
): string {
  if (sources.length === 0) {
    return "No search results were returned. Document this as a critical gap.";
  }

  return sources
    .map(
      (source) =>
        `[${source.id}] **${source.title}** (Tier ${source.tier}, ${source.domain}${source.publishedDate ? `, ${source.publishedDate}` : ""})
URL: ${source.url}
Snippet: ${source.snippet}`,
    )
    .join("\n\n");
}

export function getDepthConfig(depth: ResearchDepth): {
  maxSourcesForLlm: number;
  snippetMaxLength: number;
} {
  switch (depth) {
    case "quick":
      return { maxSourcesForLlm: 60, snippetMaxLength: 250 };
    case "standard":
      return { maxSourcesForLlm: 100, snippetMaxLength: 300 };
    case "comprehensive":
      return { maxSourcesForLlm: 120, snippetMaxLength: 300 };
  }
}
