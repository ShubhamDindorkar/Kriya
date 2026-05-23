import { classifySource } from "../lib/search/source-classifier";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function tier(
  url: string,
  title: string,
  options?: { snippet?: string; entityDomain?: string },
): number {
  return classifySource({
    url,
    title,
    snippet: options?.snippet,
    entityDomain: options?.entityDomain,
  });
}

console.log("Source classifier verification\n");

assert(
  tier(
    "https://www.sec.gov/Archives/edgar/data/0000320193/000032019324000106/aapl-10k.htm",
    "Apple 10-K Annual Report",
  ) === 1,
  "SEC 10-K filing should be Tier 1",
);
console.log("✓ SEC regulatory filing → T1");

assert(
  tier("https://www.reuters.com/business/finance/stripe-funding/", "Stripe funding") ===
    2,
  "Reuters article should be Tier 2",
);
console.log("✓ Major news (Reuters) → T2");

assert(
  tier(
    "https://www.pwc.com/gx/en/news-room/press-releases/2024/ai-survey.html",
    "PwC Global AI Survey press release",
  ) === 2,
  "PwC official press release should be Tier 2",
);
console.log("✓ PwC official announcement → T2");

assert(
  tier(
    "https://www.pwc.com/us/en/blogs/tax-policy-watch.html",
    "Tax Policy Watch blog",
    { snippet: "Author blog post on tax policy trends" },
  ) === 3,
  "PwC author blog should be Tier 3",
);
console.log("✓ PwC author blog → T3");

assert(
  tier(
    "https://viewpoint.pwc.com/content/pwc/us/en/blogs/viewpoints.html",
    "PwC Viewpoint: market outlook",
    { snippet: "Opinion piece from a PwC partner" },
  ) === 3,
  "PwC viewpoint/blog content should be Tier 3",
);
console.log("✓ PwC viewpoint/blog → T3");

assert(
  tier(
    "https://stripe.com/newsroom/news/stripe-annual-update",
    "Stripe announces annual update",
    { entityDomain: "stripe.com" },
  ) === 1,
  "Target entity official press release should be Tier 1",
);
console.log("✓ Entity official press release → T1");

assert(
  tier(
    "https://stripe.com/blog/engineering/payment-apis",
    "Building payment APIs at Stripe",
    { entityDomain: "stripe.com" },
  ) === 3,
  "Entity engineering blog should be Tier 3",
);
console.log("✓ Entity blog → T3");

assert(
  tier("https://www.reddit.com/r/stocks/comments/stripe", "Stripe discussion") === 4,
  "Reddit thread should be Tier 4",
);
console.log("✓ Social/unverified (Reddit) → T4");

assert(
  tier(
    "https://www.gartner.com/en/documents/market-guide-payments",
    "Gartner Market Guide for Payments",
  ) === 2,
  "Gartner report page should be Tier 2",
);
console.log("✓ Analyst firm publication → T2");

console.log("\nSource classifier verification passed.");
