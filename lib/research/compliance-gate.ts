import {
  COMPLIANCE_REJECTION_MESSAGE,
  PROHIBITED_PATTERNS,
} from "@/lib/prompts/compliance";

export interface ComplianceResult {
  allowed: boolean;
  reason?: string;
}

export function checkCompliance(text: string): ComplianceResult {
  const normalized = text.trim();
  if (!normalized) {
    return { allowed: false, reason: "Query cannot be empty." };
  }

  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        allowed: false,
        reason: COMPLIANCE_REJECTION_MESSAGE,
      };
    }
  }

  return { allowed: true };
}
