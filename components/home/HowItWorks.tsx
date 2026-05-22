import {
  Building2,
  FileText,
  MessageCircle,
  Search,
  Square,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: MessageCircle,
    title: "Ask",
    description:
      "Type a company name and what you want to learn. Say hello anytime — Kriyagni will explain how it works.",
  },
  {
    icon: Search,
    title: "Research",
    description:
      "AI identifies the company, runs 70+ public-source searches, and collects verified evidence.",
  },
  {
    icon: FileText,
    title: "Report",
    description:
      "Get a streamed intelligence report with source tiers, confidence scores, and citations.",
  },
] as const;

interface HowItWorksProps {
  className?: string;
  compact?: boolean;
}

export function HowItWorks({ className, compact = false }: HowItWorksProps) {
  return (
    <section className={cn("w-full", className)}>
      {!compact && (
        <h2 className="mb-3 text-center text-sm font-medium text-foreground">
          How it works
        </h2>
      )}
      <div
        className={cn(
          "grid gap-3",
          compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-3",
        )}
      >
        {STEPS.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-white px-4 py-4 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-teal">
                <Icon className="size-4" />
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {index + 1}. {title}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const CONTROLS = [
  {
    icon: Building2,
    label: "Research type chips",
    description:
      "Six lenses below the search box — vendor, M&A, competitive, market, risk, or your own custom objective.",
  },
  {
    icon: Search,
    label: "Start button (→)",
    description:
      "Press Enter or the teal arrow to submit. Disabled until you type something (and a custom label if needed).",
  },
  {
    icon: Square,
    label: "Stop",
    description:
      "Top-right while research runs. Cancels searches and report writing; partial results stay visible.",
  },
  {
    icon: Plus,
    label: "New research",
    description:
      "Header or sidebar menu. Clears the session and returns home — use this instead of Stop when you want a fresh start.",
  },
] as const;

export function ControlsGuide({ className }: { className?: string }) {
  return (
    <section className={cn("w-full space-y-3", className)}>
      <h2 className="text-sm font-medium text-foreground">Controls</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {CONTROLS.map(({ icon: Icon, label, description }) => (
          <div
            key={label}
            className="flex gap-3 rounded-xl border border-border/80 bg-secondary/30 px-3 py-3"
          >
            <Icon className="mt-0.5 size-4 shrink-0 text-teal" />
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const PROMPT_TIPS = [
  "Name a specific company — e.g. Stripe, Reliance Industries, Acme Corp",
  "Use: [Research type] on [Company] — e.g. Vendor assessment on Stripe",
  "Say hello or ask for help to learn what Kriyagni can do",
  "Pick a research type chip below the search box before submitting",
];

export const EXAMPLE_PROMPTS = [
  "Vendor assessment on Stripe",
  "Due diligence on Reliance Industries",
  "Competitive intelligence on Shopify",
  "Risk assessment on CrowdStrike",
] as const;
