import type { ResearchDepth } from "@/lib/research/types";

export function getOutputTemplate(depth: ResearchDepth): string {
  const sections: Record<ResearchDepth, string> = {
    quick: `
## LEVEL 1: EXECUTIVE SUMMARY (required)
- Overall assessment (risk level headline)
- Key findings (top 3)
- Critical attention areas
- Primary recommendations (CRITICAL/HIGH/MEDIUM)

Keep concise. Cite sources as [N] matching the evidence bundle index.
`.trim(),

    standard: `
## LEVEL 1: EXECUTIVE SUMMARY
- Overall assessment, key findings (top 5), critical attention areas, primary recommendations

## LEVEL 2: DETAILED ANALYSIS
For each major finding across focus areas A-F:
- Finding title and summary
- Supporting evidence with citations [N], source tier, date
- Confidence level (HIGH/MEDIUM/LOW) and basis
- Contradictions (if any)
- Implications and recommended actions

## LEVEL 4: LIMITATIONS & GAPS (brief)
- What could not be verified
- Staleness concerns
`.trim(),

    comprehensive: `
## LEVEL 1: EXECUTIVE SUMMARY
- Overall assessment (risk level), key findings (top 5), critical attention areas, primary recommendations

## LEVEL 2: DETAILED ANALYSIS
Cover all focus areas A-F. Each finding must include:
- Claim summary, evidence with [N] citations, source tier, date, confidence level, contradictions, freshness, implications, recommended actions

## LEVEL 3: SOURCE DOCUMENTATION
- Summary of search methodology
- Source count by tier
- Information excluded and why

## LEVEL 4: LIMITATIONS & GAPS
- Unverified claims, information age concerns, areas requiring additional research, methodological limitations

Use recommendation format: CRITICAL (24-48h), HIGH (1 week), MEDIUM (1 month), MONITORING (ongoing).
`.trim(),
  };

  return sections[depth];
}

export const FINDING_TEMPLATE = `
## FINDING: [Title]
**Claim**: [One sentence]
**Evidence**: [Citations with tier and date]
**Confidence Level**: [HIGH/MEDIUM/LOW]
**Contradictions**: [None or description]
**Freshness**: [Current/Recent/Aging/Stale]
**Implications**: [Business impact]
**Recommended Actions**: [Prioritized steps]
`.trim();
