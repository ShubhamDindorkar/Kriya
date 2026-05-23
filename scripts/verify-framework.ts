import { buildSystemPrompt, buildUserPrompt } from "../lib/prompts/system";
import { buildAssistantSystemPrompt } from "../lib/prompts/assistant-chat";
import { buildQueryAnalysisSystemPrompt } from "../lib/prompts/query-analysis";
import { getOutputTemplate } from "../lib/prompts/templates";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function includesAll(text: string, phrases: string[]): void {
  for (const phrase of phrases) {
    assert(text.includes(phrase), `Missing framework section: ${phrase}`);
  }
}

console.log("Framework alignment verification\n");

const system = buildSystemPrompt();
includesAll(system, [
  "CORE MISSION",
  "SAFETY & COMPLIANCE",
  "DEFAULT WORK MODE",
  "SOURCE RELIABILITY FRAMEWORK",
  "EVIDENCE STANDARDS",
  "TEMPORAL VALIDATION",
  "CONTRADICTION HANDLING",
  "INTELLIGENCE GAPS",
  "ANALYSIS APPROACH PRINCIPLES",
  "Company Profile & Footprint",
  "Risk Indicators",
]);
console.log("✓ Synthesis system prompt includes full framework");

const assistant = buildAssistantSystemPrompt();
includesAll(assistant, [
  "INITIAL RESPONSE PROTOCOL",
  "SAFETY & COMPLIANCE",
]);
console.log("✓ Assistant chat prompt includes intake protocol");

const analyzer = buildQueryAnalysisSystemPrompt();
includesAll(analyzer, [
  "geographicFocus",
  "priorityAreas",
  "vendor_assessment",
]);
console.log("✓ Query analyzer includes intake fields");

const standardTemplate = getOutputTemplate("standard");
includesAll(standardTemplate, [
  "LEVEL 1: EXECUTIVE SUMMARY",
  "LEVEL 2: DETAILED ANALYSIS",
  "LEVEL 3: SOURCE DOCUMENTATION",
  "LEVEL 4: LIMITATIONS & GAPS",
  "FINDING:",
  "RECOMMENDATIONS FORMAT",
]);
console.log("✓ Standard output template includes Levels 1–4");

const comprehensiveTemplate = getOutputTemplate("comprehensive");
includesAll(comprehensiveTemplate, [
  "CRITICAL",
  "MONITORING",
]);
console.log("✓ Comprehensive output template includes recommendation priorities");

const userPrompt = buildUserPrompt(
  {
    query: "Vendor assessment on Stripe",
    entityName: "Stripe",
    domain: "stripe.com",
    objective: "vendor_assessment",
    depth: "standard",
    timeWindowMonths: 12,
    priorityAreas: ["financial"],
  },
  "[1] **Stripe 10-K** (Tier 1, sec.gov)\nURL: https://sec.gov\nSnippet: Annual report",
  {
    queriesExecuted: 86,
    totalRawResults: 400,
    uniqueSources: 100,
    tierSummary: { 1: 10, 2: 25, 3: 60, 4: 5 },
    searchDurationMs: 45000,
  },
);
includesAll(userPrompt, [
  "ENTITY DISAMBIGUATION",
  "RESEARCH METHODOLOGY",
  "Source count by tier",
  "EVIDENCE STANDARDS",
]);
console.log("✓ User prompt includes methodology and disambiguation");

console.log("\nFramework alignment verification passed.");
