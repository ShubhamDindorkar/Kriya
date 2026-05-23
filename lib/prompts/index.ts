export {
  COMPLIANCE_PROMPT,
  COMPLIANCE_REJECTION_MESSAGE,
  PROHIBITED_PATTERNS,
} from "@/lib/prompts/compliance";
export { FOCUS_AREAS, SOURCE_TIER_GUIDE } from "@/lib/prompts/focus-areas";
export {
  ANALYSIS_PRINCIPLES,
  CORE_MISSION,
  DEFAULT_WORK_MODE,
  EVIDENCE_STANDARDS,
  FINDING_TEMPLATE,
  SOURCE_TIER_FRAMEWORK,
} from "@/lib/prompts/framework";
export { getOutputTemplate } from "@/lib/prompts/templates";
export {
  buildEvidenceBlock,
  buildSystemPrompt,
  buildUserPrompt,
  getDepthConfig,
} from "@/lib/prompts/system";
