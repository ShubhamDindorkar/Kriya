"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ObjectiveChips } from "@/components/search/ObjectiveChips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ResearchObjective } from "@/lib/research/types";
import { cn } from "@/lib/utils";

interface SearchComposerProps {
  onSubmit?: (query: string, objective: ResearchObjective) => void;
  className?: string;
  defaultObjective?: ResearchObjective;
  placeholder?: string;
  isLoading?: boolean;
}

export function SearchComposer({
  onSubmit,
  className,
  defaultObjective = "vendor_assessment",
  placeholder = "Ask about any company… e.g. Vendor assessment on Stripe",
  isLoading = false,
}: SearchComposerProps) {
  const [query, setQuery] = useState("");
  const [objective, setObjective] =
    useState<ResearchObjective>(defaultObjective);

  function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed, objective);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex w-full max-w-2xl flex-col gap-4", className)}
    >
      <div className="relative flex items-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="h-14 rounded-2xl border-border bg-white pr-14 text-base shadow-sm placeholder:text-muted-foreground/70 disabled:opacity-60"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!query.trim() || isLoading}
          className="absolute right-2 size-10 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90 disabled:opacity-60"
        >
          <ArrowRight className="size-4" />
          <span className="sr-only">Start research</span>
        </Button>
      </div>
      <ObjectiveChips selected={objective} onSelect={setObjective} />
    </form>
  );
}
