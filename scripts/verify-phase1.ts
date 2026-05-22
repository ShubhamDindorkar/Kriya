import { checkCompliance } from "../lib/research/compliance-gate";
import { getQueryCount } from "../lib/search/query-builder";
import { classifyDomain } from "../lib/search/tier-classifier";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

console.log("Phase 1 verification\n");

const queryCount = getQueryCount({
  entityName: "Stripe",
  domain: "stripe.com",
  objective: "vendor_assessment",
  depth: "comprehensive",
  timeWindowMonths: 12,
  priorityAreas: ["financial", "legal"],
});

assert(queryCount >= 70, `Expected 70+ queries, got ${queryCount}`);
console.log(`✓ Query builder: ${queryCount} queries for Stripe`);

const blocked = checkCompliance("Find Patrick Collison home address");
assert(!blocked.allowed, "Compliance gate should block PII request");
console.log("✓ Compliance gate blocks prohibited requests");

const allowed = checkCompliance(
  "Vendor assessment on Stripe financial stability",
);
assert(allowed.allowed, "Compliance gate should allow valid request");
console.log("✓ Compliance gate allows valid requests");

assert(
  classifyDomain("https://www.sec.gov/Archives/edgar/data/") === 1,
  "sec.gov should be Tier 1",
);
assert(
  classifyDomain("https://www.reuters.com/business/") === 2,
  "reuters.com should be Tier 2",
);
assert(
  classifyDomain("https://techcrunch.com/") === 3,
  "techcrunch.com should be Tier 3",
);
assert(
  classifyDomain("https://www.reddit.com/r/") === 4,
  "reddit.com should be Tier 4",
);
console.log("✓ Tier classifier maps domains correctly");

console.log("\nPhase 1 verification passed.");
