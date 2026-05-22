"use client";

import {
  OBJECTIVE_LABELS,
  type ResearchObjective,
} from "@/lib/research/types";
import { cn } from "@/lib/utils";

const OBJECTIVES = Object.keys(OBJECTIVE_LABELS) as ResearchObjective[];

interface ObjectiveChipsProps {
  selected: ResearchObjective;
  onSelect: (objective: ResearchObjective) => void;
  className?: string;
}

export function ObjectiveChips({
  selected,
  onSelect,
  className,
}: ObjectiveChipsProps) {
  return (
    <div className={cn("flex flex-wrap justify-center gap-2", className)}>
      {OBJECTIVES.map((objective) => {
        const isSelected = selected === objective;
        return (
          <button
            key={objective}
            type="button"
            onClick={() => onSelect(objective)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              isSelected
                ? "border-teal bg-teal text-teal-foreground"
                : "border-border bg-white text-muted-foreground hover:border-teal/40 hover:text-foreground",
            )}
          >
            {OBJECTIVE_LABELS[objective]}
          </button>
        );
      })}
    </div>
  );
}
