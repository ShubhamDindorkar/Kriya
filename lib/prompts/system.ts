import { COMPLIANCE_PROMPT } from "@/lib/prompts/compliance";
import { FOCUS_AREAS } from "@/lib/prompts/focus-areas";
import {
  ANALYSIS_PRINCIPLES,
  CONTRADICTION_HANDLING,
  CORE_MISSION,
  DEFAULT_WORK_MODE,
  EVIDENCE_STANDARDS,
  FOCUS_AREA_GUIDE,
  INTAKE_QUESTIONS,
  INTELLIGENCE_GAPS,
  SOURCE_TIER_FRAMEWORK,
  TEMPORAL_VALIDATION,
} from "@/lib/prompts/framework";
import { getOutputTemplate } from "@/lib/prompts/templates";
import type { ResearchIntake } from "@/lib/research/types";
import { getObjectiveLabel } from "@/lib/research/types";

export interface ResearchMethodologyContext {
  queriesExecuted: number;
  totalRawResults: number;
  uniqueSources: number;
  tierSummary: Record<number, number>;
  searchDurationMs: number;
}

export function buildSystemPrompt(): string {
  const focusAreaList = Object.values(FOCUS_AREAS)
    .map((area) => `${area.id}) ${area.name}`)
    .join("\n");

  return `
You are Kriyagni, an expert business intelligence analyst. You synthesize public-source research into actionable intelligence for finance professionals.

${COMPLIANCE_PROMPT}

${CORE_MISSION}

${INTAKE_QUESTIONS}

## RESEARCH FOCUS AREAS

${focusAreaList}

${FOCUS_AREA_GUIDE}

${SOURCE_TIER_FRAMEWORK}

${EVIDENCE_STANDARDS}

${DEFAULT_WORK_MODE}

${TEMPORAL_VALIDATION}

${CONTRADICTION_HANDLING}

${INTELLIGENCE_GAPS}

${ANALYSIS_PRINCIPLES}

You will receive search results as numbered evidence [1], [2], etc. Cite ONLY from provided evidence. Do not invent URLs, sources, or data.
`.trim();
}

function buildMethodologyBlock(context: ResearchMethodologyContext): string {
  const tiers = [1, 2, 3, 4]
    .map((t) => `T${t}: ${context.tierSummary[t] ?? 0}`)
    .join(", ");

  return `
## RESEARCH METHODOLOGY (Level 3)

- **Queries executed**: ${context.queriesExecuted}
- **Raw results collected**: ${context.totalRawResults}
- **Unique sources in evidence bundle**: ${context.uniqueSources}
- **Source count by tier**: ${tiers}
- **Search duration**: ${Math.round(context.searchDurationMs / 1000)}s
- **Research date**: ${new Date().toISOString().split("T")[0]}
`.trim();
}

export function buildUserPrompt(
  intake: ResearchIntake & { entityName: string },
  evidenceBlock: string,
  methodology: ResearchMethodologyContext,
): string {
  const depth = intake.depth;
  const objective = getObjectiveLabel(intake.objective, intake.customObjective);
  const outputTemplate = getOutputTemplate(depth);
  const methodologyBlock = buildMethodologyBlock(methodology);

  return `
## RESEARCH REQUEST

**User Query**: ${intake.query}
**Entity**: ${intake.entityName}
**Domain**: ${intake.domain ?? "Unknown — verify entity identity"}
**Objective**: ${objective}
**Depth**: ${depth}
**Time Window**: Last ${intake.timeWindowMonths} months
**Geographic Focus**: ${intake.geographicFocus ?? "Global"}
**Priority Areas**: ${intake.priorityAreas.join(", ") || "All focus areas A–F"}

## ENTITY DISAMBIGUATION

Confirm the evidence relates to **${intake.entityName}**${intake.domain ? ` (${intake.domain})` : ""}. Flag immediately if sources appear to reference a different entity with a similar name.

${methodologyBlock}

## EVIDENCE BUNDLE

${evidenceBlock}

## OUTPUT INSTRUCTIONS

Follow DEFAULT WORK MODE steps 4–10. Apply EVIDENCE STANDARDS for every confidence label. Use TEMPORAL VALIDATION for freshness. Apply CONTRADICTION HANDLING when sources conflict. Document gaps per INTELLIGENCE GAPS in Level 4.

${outputTemplate}

Today's date: ${new Date().toISOString().split("T")[0]}

Produce the full report in markdown. Use [N] citation markers matching evidence indices. Label every finding as Confirmed, Inferred, or Speculative where appropriate.
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
    return "No search results were returned. Document this as a CRITICAL gap in Level 4.";
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

export { getDepthConfig } from "@/lib/research/depth-config";
