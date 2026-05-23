import { getQueryCount } from "../lib/search/query-builder";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function main() {
  console.log("Depth config verification\n");

  const base = {
    entityName: "Stripe",
    domain: "stripe.com",
    objective: "vendor_assessment" as const,
  };

  const quick = getQueryCount({ ...base, depth: "quick" });
  const standard = getQueryCount({ ...base, depth: "standard" });
  const comprehensive = getQueryCount({ ...base, depth: "comprehensive" });

  console.log(`  quick:          ${quick} searches`);
  console.log(`  standard:       ${standard} searches`);
  console.log(`  comprehensive:  ${comprehensive} searches`);

  assert(quick < standard, `quick (${quick}) should be fewer than standard (${standard})`);
  assert(
    comprehensive > standard + 15,
    `comprehensive (${comprehensive}) should be much larger than standard (${standard})`,
  );
  assert(quick <= 25, `quick should stay lean, got ${quick}`);
  assert(standard >= 60, `standard should remain thorough, got ${standard}`);

  console.log("\nDepth config verification passed.");
}

main();
