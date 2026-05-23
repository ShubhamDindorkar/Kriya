"use client";

import { Input } from "@/components/ui/input";
import {
  OBJECTIVE_LABELS,
  type ResearchObjective,
} from "@/lib/research/types";
import { cn } from "@/lib/utils";

const OBJECTIVES = Object.keys(OBJECTIVE_LABELS) as ResearchObjective[];

interface ObjectiveChipsProps {
  selected: ResearchObjective;
  onSelect: (objective: ResearchObjective) => void;
  customObjective?: string;
  onCustomObjectiveChange?: (value: string) => void;
  className?: string;
}

export function ObjectiveChips({
  selected,
  onSelect,
  customObjective = "",
  onCustomObjectiveChange,
  className,
}: ObjectiveChipsProps) {
  return (
    <div className={cn("flex w-full flex-col items-center gap-3", className)}>
      <div className="flex flex-wrap justify-center gap-2">
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

      {selected === "custom" && (
        <Input
          value={customObjective}
          onChange={(event) => onCustomObjectiveChange?.(event.target.value)}
          placeholder="Describe your objective…"
          className="h-11 max-w-md rounded-xl border-border bg-white text-sm shadow-sm"
        />
      )}
    </div>
  );
}
