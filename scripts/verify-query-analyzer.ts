import { analyzeResearchQuery } from "../lib/research/query-analyzer";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log("Query analyzer verification\n");

  const hello = await analyzeResearchQuery({ query: "hello" });
  assert(hello.mode === "conversation", "hello should open conversation mode");
  console.log("✓ hello → conversational assistant");

  const help = await analyzeResearchQuery({ query: "help" });
  assert(help.mode === "conversation", "help should open conversation mode");
  console.log("✓ help → conversational assistant");

  const stripe = await analyzeResearchQuery({
    query: "Vendor assessment on Stripe",
    objective: "vendor_assessment",
  });

  assert(stripe.mode === "research", "Stripe query should enter research mode");
  assert(
    stripe.entityName?.toLowerCase().includes("stripe") ?? false,
    `Expected Stripe entity, got ${stripe.entityName}`,
  );
  console.log(`✓ company query → research on ${stripe.entityName}`);

  console.log("\nQuery analyzer verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
