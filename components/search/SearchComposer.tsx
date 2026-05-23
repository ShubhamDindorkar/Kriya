"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ObjectiveChips } from "@/components/search/ObjectiveChips";
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
  showObjectiveChips?: boolean;
}

export function SearchComposer({
  onSubmit,
  className,
  defaultObjective = "vendor_assessment",
  defaultCustomObjective = "",
  placeholder = "Vendor assessment on Stripe",
  isLoading = false,
  showObjectiveChips = true,
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
      className={cn("flex w-full max-w-2xl flex-col gap-4", className)}
    >
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
          className="absolute right-2 size-10 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90 disabled:opacity-60"
        >
          <ArrowRight className="size-4" />
          <span className="sr-only">Submit</span>
        </Button>
      </div>

      {showObjectiveChips && (
        <ObjectiveChips
          selected={objective}
          onSelect={setObjective}
          customObjective={customObjective}
          onCustomObjectiveChange={setCustomObjective}
        />
      )}

      {needsCustomLabel && query.trim() && (
        <p className="text-center text-xs text-amber-700">
          Describe your custom objective above.
        </p>
      )}
    </form>
  );
}
