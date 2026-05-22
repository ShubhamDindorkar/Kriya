export type ResearchObjective =
  | "vendor_assessment"
  | "ma_research"
  | "competitive_intelligence"
  | "market_intelligence"
  | "risk_assessment";

export type ResearchDepth = "quick" | "standard" | "comprehensive";

export type PriorityArea =
  | "financial"
  | "reputational"
  | "legal"
  | "market_position"
  | "supply_chain"
  | "risk_indicators";

export interface ResearchIntake {
  query: string;
  entityName?: string;
  domain?: string;
  objective: ResearchObjective;
  depth: ResearchDepth;
  timeWindowMonths: number;
  geographicFocus?: string;
  priorityAreas: PriorityArea[];
}

export const OBJECTIVE_LABELS: Record<ResearchObjective, string> = {
  vendor_assessment: "Vendor Assessment",
  ma_research: "M&A Research",
  competitive_intelligence: "Competitive Intelligence",
  market_intelligence: "Market Intelligence",
  risk_assessment: "Risk Assessment",
};

export const DEPTH_LABELS: Record<ResearchDepth, string> = {
  quick: "Quick",
  standard: "Standard",
  comprehensive: "Comprehensive",
};
