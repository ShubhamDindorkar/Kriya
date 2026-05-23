import type { ResearchDepth } from "@/lib/research/types";
import { buildOutputLevels, FINDING_TEMPLATE } from "@/lib/prompts/framework";

export function getOutputTemplate(depth: ResearchDepth): string {
  return `${buildOutputLevels(depth)}

${FINDING_TEMPLATE}`;
}

export { FINDING_TEMPLATE } from "@/lib/prompts/framework";
