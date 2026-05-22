import { checkCompliance } from "../lib/research/compliance-gate";
import { parseEntityFromQuery } from "../lib/research/entity-parser";
import { researchRequestSchema } from "../lib/research/schemas";
import { createSseStream } from "../lib/research/stream";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log("Phase 2 verification\n");

  const parsed = researchRequestSchema.safeParse({
    query: "Vendor assessment on Stripe",
    objective: "vendor_assessment",
    depth: "quick",
  });
  assert(parsed.success, "Request schema should accept valid body");
  console.log("✓ Request schema validates input");

  const entity = parseEntityFromQuery("Vendor assessment on Stripe");
  assert(
    entity.entityName === "Stripe",
    `Expected Stripe, got ${entity.entityName}`,
  );
  console.log(`✓ Entity parser: ${entity.entityName}`);

  const slashEntity = parseEntityFromQuery("Reliance / Due Diligence/ comprehensive");
  assert(
    slashEntity.entityName === "Reliance",
    `Expected Reliance, got ${slashEntity.entityName}`,
  );
  console.log(`✓ Slash-delimited parser: ${slashEntity.entityName}`);

  const blocked = checkCompliance("Find Patrick Collison home address");
  assert(!blocked.allowed, "Compliance should block PII request");
  console.log("✓ Compliance gate integrated");

  const events: string[] = [];
  const stream = createSseStream(async (send) => {
    send({ type: "synthesis_started" });
    send({ type: "text_delta", content: "# Test" });
    send({ type: "done", reportId: "test-id" });
  });

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    events.push(decoder.decode(value));
  }

  assert(
    events.some((e) => e.includes("event: synthesis_started")),
    "SSE should emit synthesis_started",
  );
  assert(
    events.some((e) => e.includes("event: text_delta")),
    "SSE should emit text_delta",
  );
  assert(
    events.some((e) => e.includes("event: done")),
    "SSE should emit done",
  );
  console.log("✓ SSE stream emits formatted events");

  console.log("\nPhase 2 verification passed.");
  console.log("\nLive test:");
  console.log('curl -N -X POST http://localhost:3000/api/research \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"query":"Vendor assessment on Stripe","depth":"quick"}\'');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
