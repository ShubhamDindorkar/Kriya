import { z } from "zod";

export const researchRequestSchema = z.object({
  query: z.string().min(1, "Query is required"),
  objective: z
    .enum([
      "vendor_assessment",
      "ma_research",
      "competitive_intelligence",
      "market_intelligence",
      "risk_assessment",
      "custom",
    ])
    .optional(),
  customObjective: z.string().min(1).max(120).optional(),
  depth: z.enum(["quick", "standard", "comprehensive"]).optional(),
  timeWindowMonths: z.number().int().min(1).max(60).optional(),
  geographicFocus: z.string().optional(),
  priorityAreas: z
    .array(
      z.enum([
        "financial",
        "reputational",
        "legal",
        "market_position",
        "supply_chain",
        "risk_indicators",
      ]),
    )
    .optional(),
  entityName: z.string().optional(),
  domain: z.string().optional(),
}).refine(
  (data) =>
    data.objective !== "custom" || Boolean(data.customObjective?.trim()),
  {
    message: "Custom objective description is required",
    path: ["customObjective"],
  },
);

export type ResearchRequestBody = z.infer<typeof researchRequestSchema>;
