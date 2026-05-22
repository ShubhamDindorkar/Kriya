"use client";

import { cn } from "@/lib/utils";

interface PromptExamplesProps {
  examples: readonly string[];
  onSelect: (prompt: string) => void;
  className?: string;
  disabled?: boolean;
}

export function PromptExamples({
  examples,
  onSelect,
  className,
  disabled = false,
}: PromptExamplesProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <p className="text-xs font-medium text-muted-foreground">
        Try an example — click to fill the search box
      </p>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(example)}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:border-teal/40 hover:bg-accent/40 disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
