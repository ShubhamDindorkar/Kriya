"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { EXAMPLE_PROMPTS } from "@/components/home/HowItWorks";
import { ObjectiveChips } from "@/components/search/ObjectiveChips";
import { PromptExamples } from "@/components/search/PromptExamples";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ResearchObjective } from "@/lib/research/types";
import { cn } from "@/lib/utils";

export interface SearchSubmitPayload {
  query: string;
  objective: ResearchObjective;
  customObjective?: string;
}

interface SearchComposerProps {
  onSubmit?: (payload: SearchSubmitPayload) => void;
  className?: string;
  defaultObjective?: ResearchObjective;
  defaultCustomObjective?: string;
  placeholder?: string;
  isLoading?: boolean;
  showExamples?: boolean;
  showHints?: boolean;
}

export function SearchComposer({
  onSubmit,
  className,
  defaultObjective = "vendor_assessment",
  defaultCustomObjective = "",
  placeholder = "Vendor assessment on Stripe",
  isLoading = false,
  showExamples = true,
  showHints = true,
}: SearchComposerProps) {
  const [query, setQuery] = useState("");
  const [objective, setObjective] =
    useState<ResearchObjective>(defaultObjective);
  const [customObjective, setCustomObjective] = useState(
    defaultCustomObjective,
  );

  const needsCustomLabel = objective === "custom" && !customObjective.trim();

  function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || needsCustomLabel) return;
    onSubmit?.({
      query: trimmed,
      objective,
      customObjective:
        objective === "custom" ? customObjective.trim() : undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex w-full max-w-2xl flex-col gap-5", className)}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 px-1">
          <label
            htmlFor="research-query"
            className="text-sm font-medium text-foreground"
          >
            Ask about a company
          </label>
          <span className="text-xs text-muted-foreground">
            Press{" "}
            <span className="inline-flex items-center rounded border border-border bg-secondary px-1 py-0.5 font-mono text-[10px]">
              Enter
            </span>{" "}
            or{" "}
            <span className="inline-flex size-4 items-center justify-center rounded bg-teal text-teal-foreground">
              <ArrowRight className="size-2.5" />
            </span>{" "}
            to start
          </span>
        </div>
        <div className="relative flex items-center">
          <Input
            id="research-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="h-14 rounded-2xl border-border bg-white pr-14 text-base shadow-sm placeholder:text-muted-foreground/70 disabled:opacity-60"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!query.trim() || isLoading || needsCustomLabel}
            title={
              needsCustomLabel
                ? "Add a custom objective description first"
                : "Start — Enter or click to submit"
            }
            className="absolute right-2 size-10 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90 disabled:opacity-60"
          >
            <ArrowRight className="size-4" />
            <span className="sr-only">Start research</span>
          </Button>
        </div>
        {showHints && (
          <p className="px-1 text-xs leading-relaxed text-muted-foreground">
            Name a specific company. Greetings like &quot;hello&quot; get a
            helpful reply — company names trigger full research.
          </p>
        )}
      </div>

      {showExamples && (
        <PromptExamples
          examples={EXAMPLE_PROMPTS}
          onSelect={setQuery}
          disabled={isLoading}
        />
      )}

      <ObjectiveChips
        selected={objective}
        onSelect={setObjective}
        customObjective={customObjective}
        onCustomObjectiveChange={setCustomObjective}
      />

      {needsCustomLabel && query.trim() && (
        <p className="text-center text-xs text-amber-700">
          Add a short description of your custom objective above.
        </p>
      )}
    </form>
  );
}
