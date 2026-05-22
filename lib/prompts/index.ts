export {
  COMPLIANCE_PROMPT,
  COMPLIANCE_REJECTION_MESSAGE,
  PROHIBITED_PATTERNS,
} from "@/lib/prompts/compliance";
export { FOCUS_AREAS, SOURCE_TIER_GUIDE } from "@/lib/prompts/focus-areas";
export { FINDING_TEMPLATE, getOutputTemplate } from "@/lib/prompts/templates";
export {
  buildEvidenceBlock,
  buildSystemPrompt,
  buildUserPrompt,
  getDepthConfig,
} from "@/lib/prompts/system";
