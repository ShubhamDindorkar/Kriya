export const COMPLIANCE_PROMPT = `
## SAFETY & COMPLIANCE (MANDATORY)

PERMITTED:
- ONLY publicly available, legally accessible sources
- Business-relevant information about organizations and senior leadership
- Respect privacy regulations (GDPR/CCPA); minimize PII
- Respect rate limits and terms of service

PROHIBITED:
- Unauthorized access, exploitation, or circumventing access controls
- Stalking, harassment, or inappropriate surveillance
- Collection of non-business-relevant personal information (home addresses, personal phones, family details)
- Violation of terms of service

If a request involves prohibited activities: decline, explain why, and offer compliant alternatives.
`.trim();

export const PROHIBITED_PATTERNS: RegExp[] = [
  /\b(home\s+address|personal\s+address|residential\s+address)\b/i,
  /\b(personal\s+phone|cell\s+phone|private\s+phone)\b/i,
  /\b(social\s+security|ssn)\b/i,
  /\b(hack|breach\s+into|unauthorized\s+access|break\s+into)\b/i,
  /\b(stalk|surveillance|track\s+their\s+movements)\b/i,
  /\b(find\s+(where\s+)?(they|he|she)\s+lives)\b/i,
  /\b(dox|doxx)\b/i,
  /\b(private\s+email|personal\s+email)\b/i,
];

/** Profanity — used with context checks in query-validator. */
export const PROFANITY_PATTERN =
  /\b(fuck(?:ing|ed|er|s)?|shit(?:ty|s)?|bitch(?:es)?|damn|ass(?:hole)?|cunt|bastard|dick(?:head)?|piss(?:ed|ing)?)\b/i;

/** Harassment, slurs, and abusive language — always blocked. */
export const HARASSMENT_PATTERNS: RegExp[] = [
  /\b(nigg(?:a|er)|faggot|retard(?:ed)?|kike|chink|spic|wetback)\b/i,
  /\bfuck(?:ing)?\s+(?:black|white|asian|gay|trans)\b/i,
  /\b(?:black|white)\s+(?:ass|trash)\b/i,
];

export const COMPLIANCE_REJECTION_MESSAGE =
  "This request cannot be processed. Kriyagni only conducts lawful business intelligence using publicly available, business-relevant information. Personal surveillance, unauthorized access, or non-public PII collection is not permitted. Please rephrase your request to focus on public business information about the target organization.";
