import { MessageCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = [
  {
    icon: MessageCircle,
    title: "Chat",
    badge: "No searches",
    description:
      "Say hello, ask how Kriyagni works, or get help choosing a research type.",
    examples: ["hello", "what can you research?", "help me get started"],
    accent: "border-border bg-secondary/30",
    iconClass: "text-muted-foreground",
  },
  {
    icon: Search,
    title: "Full research",
    badge: "Web research",
    description:
      "Name a company and pick a research type. Kriyagni searches public data and writes a cited report.",
    examples: [
      "Vendor assessment on Stripe",
      "Due diligence on Reliance Industries",
      "Competitive intelligence on Shopify",
    ],
    accent: "border-teal/25 bg-accent/50",
    iconClass: "text-teal",
  },
] as const;

interface WhatToAskProps {
  className?: string;
}

export function WhatToAsk({ className }: WhatToAskProps) {
  return (
    <section className={cn("w-full space-y-3", className)}>
      <div className="text-center">
        <h2 className="text-sm font-medium text-foreground">What to type</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Kriyagni decides automatically — greetings stay in chat; company names
          start research
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {MODES.map(
          ({
            icon: Icon,
            title,
            badge,
            description,
            examples,
            accent,
            iconClass,
          }) => (
            <div
              key={title}
              className={cn("rounded-2xl border p-4 shadow-sm", accent)}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Icon className={cn("size-4", iconClass)} />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {title}
                  </span>
                </div>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {badge}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
              <ul className="mt-3 space-y-1.5">
                {examples.map((example) => (
                  <li
                    key={example}
                    className="rounded-lg bg-white/70 px-2.5 py-1.5 font-mono text-[11px] text-foreground/90"
                  >
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          ),
        )}
      </div>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Best format:{" "}
        <span className="font-medium text-foreground">
          [Research type] on [Company]
        </span>{" "}
        — or pick a type chip below the search box first
      </p>
    </section>
  );
}
