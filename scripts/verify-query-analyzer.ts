import { analyzeResearchQuery } from "../lib/research/query-analyzer";
import { detectConversationSituation } from "../lib/research/query-validator";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log("Query analyzer verification\n");

  const hello = await analyzeResearchQuery({ query: "hello" });
  assert(hello.mode === "conversation", "hello should open conversation mode");
  assert(hello.conversationSituation === "welcome", "hello should be welcome");
  console.log("✓ hello → conversational assistant");

  const help = await analyzeResearchQuery({ query: "help" });
  assert(help.mode === "conversation", "help should open conversation mode");
  console.log("✓ help → conversational assistant");

  const profanity = await analyzeResearchQuery({ query: "fucking" });
  assert(profanity.mode === "conversation", "profanity should chat, not research");
  assert(
    profanity.conversationSituation === "no_company" ||
      profanity.conversationSituation === "policy",
    "profanity should route to chat",
  );
  console.log("✓ profanity-only query → natural chat");

  const harassment = detectConversationSituation("fucking black ass");
  assert(harassment === "policy", "abusive query should route to policy chat");
  console.log("✓ abusive query → policy chat (not hard error)");

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
