import { checkCompliance } from "../lib/research/compliance-gate";
import { buildIntakeFromQuery, parseEntityFromQuery } from "../lib/research/entity-parser";
import { buildQueries } from "../lib/search/query-builder";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log("Phase 6 smoke verification (offline checks)\n");

  const stripeQueries = buildQueries({
    entityName: "Stripe",
    domain: "stripe.com",
    objective: "vendor_assessment",
    depth: "comprehensive",
    timeWindowMonths: 12,
    geographicFocus: "global",
    priorityAreas: ["financial", "legal"],
  });
  assert(
    stripeQueries.length >= 70,
    `Expected 70+ queries for Stripe, got ${stripeQueries.length}`,
  );
  console.log(`✓ Query builder: ${stripeQueries.length} queries for Stripe`);

  const acme = parseEntityFromQuery("Due diligence on Acme Corp");
  assert(
    acme.entityName.toLowerCase().includes("acme"),
    `Expected Acme entity, got ${acme.entityName}`,
  );
  console.log(`✓ Entity parser: "${acme.entityName}" from natural language`);

  const reliance = buildIntakeFromQuery("Reliance / Due Diligence/ comprehensive");
  assert(
    reliance.entityName === "Reliance",
    `Expected Reliance, got ${reliance.entityName}`,
  );
  assert(
    reliance.objective === "ma_research",
    `Expected ma_research, got ${reliance.objective}`,
  );
  assert(
    reliance.depth === "comprehensive",
    `Expected comprehensive depth, got ${reliance.depth}`,
  );
  console.log("✓ Slash-delimited query: Reliance + M&A + comprehensive");

  const blocked = checkCompliance("Find CEO home address");
  assert(!blocked.allowed, "Compliance should block PII/home address request");
  console.log("✓ Compliance gate blocks PII requests");

  const envChecks = [
    ["OPENROUTER_API_KEY", process.env.OPENROUTER_API_KEY],
    ["TAVILY_API_KEY", process.env.TAVILY_API_KEY],
  ] as const;

  for (const [name, value] of envChecks) {
    if (!value) {
      console.warn(`⚠ ${name} is not set — live synthesis/search will fail`);
    } else {
      console.log(`✓ ${name} is configured`);
    }
  }

  console.log("\nManual smoke tests (production URL or localhost):");
  console.log('  1. "Vendor assessment on Stripe" → 70+ searches, streamed report');
  console.log('  2. "Due diligence on Acme Corp" → entity extraction');
  console.log('  3. "Find CEO home address" → compliance block, no searches');
  console.log("  4. Mobile viewport → layout + carousel scroll");
  console.log("  5. Follow-up chip → new research thread");
  console.log("  6. Export markdown → valid .md download");
  console.log("  7. Deployed URL in incognito → works without local setup");

  console.log("\nPhase 6 offline checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
