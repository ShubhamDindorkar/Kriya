import { buildIntakeFromQuery } from "../lib/research/entity-parser";
import type { ResearchDepth, ResearchObjective } from "../lib/research/types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

interface Case {
  query: string;
  entity: string;
  objective?: ResearchObjective;
  depth?: ResearchDepth;
}

const CASES: Case[] = [
  {
    query: "Reliance / Due Diligence/ comprehensive",
    entity: "Reliance",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "Reliance | Due Diligence | comprehensive",
    entity: "Reliance",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "Reliance - Due Diligence - comprehensive",
    entity: "Reliance",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "Reliance: due diligence: comprehensive",
    entity: "Reliance",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "Reliance Industries Limited / M&A / comprehensive",
    entity: "Reliance Industries Limited",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "Reliance / comprehensive",
    entity: "Reliance",
    depth: "comprehensive",
  },
  {
    query: "Reliance / Due Diligence",
    entity: "Reliance",
    objective: "ma_research",
  },
  {
    query: "Stripe / competitive intelligence / quick",
    entity: "Stripe",
    objective: "competitive_intelligence",
    depth: "quick",
  },
  {
    query: "Tesla / risk assessment / standard",
    entity: "Tesla",
    objective: "risk_assessment",
    depth: "standard",
  },
  {
    query: "Notion / market intelligence",
    entity: "Notion",
    objective: "market_intelligence",
  },
  {
    query: "Acme Corp / vendor assessment",
    entity: "Acme Corp",
    objective: "vendor_assessment",
  },
  {
    query: "Reliance Industries / due diligence / comprehensive",
    entity: "Reliance Industries",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "RELIANCE / DUE DILIGENCE / COMPREHENSIVE",
    entity: "RELIANCE",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "  Reliance  /  Due  Diligence  /  comprehensive  ",
    entity: "Reliance",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "Reliance due diligence",
    entity: "Reliance",
    objective: "ma_research",
  },
  {
    query: "comprehensive due diligence on Reliance",
    entity: "Reliance",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "M&A research on Reliance Industries",
    entity: "Reliance Industries",
    objective: "ma_research",
  },
  {
    query: "Reliance Retail / risk assessment / quick",
    entity: "Reliance Retail",
    objective: "risk_assessment",
    depth: "quick",
  },
  {
    query: "Jio / competitive intelligence / standard",
    entity: "Jio",
    objective: "competitive_intelligence",
    depth: "standard",
  },
  {
    query: '"Reliance Industries" / due diligence / comprehensive',
    entity: "Reliance Industries",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "Reliance // due diligence // comprehensive",
    entity: "Reliance",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "Reliance · Due Diligence · comprehensive",
    entity: "Reliance",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "Reliance, due diligence, comprehensive",
    entity: "Reliance",
    objective: "ma_research",
    depth: "comprehensive",
  },
  {
    query: "Reliance Industries Ltd. / M&A research / standard",
    entity: "Reliance Industries Ltd.",
    objective: "ma_research",
    depth: "standard",
  },
  {
    query: "Vendor assessment on Stripe, Inc.",
    entity: "Stripe, Inc.",
    objective: "vendor_assessment",
  },
  {
    query: "Due diligence on Acme Corp",
    entity: "Acme Corp",
    objective: "ma_research",
  },
  {
    query: "stripe.com vendor assessment",
    entity: "Stripe",
    objective: "vendor_assessment",
  },
];

function main() {
  console.log("Entity parser verification\n");

  for (const testCase of CASES) {
    const intake = buildIntakeFromQuery(testCase.query);

    assert(
      intake.entityName === testCase.entity,
      `"${testCase.query}" → expected entity "${testCase.entity}", got "${intake.entityName}"`,
    );

    if (testCase.objective) {
      assert(
        intake.objective === testCase.objective,
        `"${testCase.query}" → expected objective "${testCase.objective}", got "${intake.objective}"`,
      );
    }

    if (testCase.depth) {
      assert(
        intake.depth === testCase.depth,
        `"${testCase.query}" → expected depth "${testCase.depth}", got "${intake.depth}"`,
      );
    }

    console.log(`✓ ${testCase.query}`);
  }

  console.log(`\n${CASES.length} entity parser cases passed.`);
}

main();
