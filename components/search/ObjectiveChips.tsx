"use client";

import { Input } from "@/components/ui/input";
import {
  OBJECTIVE_LABELS,
  type ResearchObjective,
} from "@/lib/research/types";
import { cn } from "@/lib/utils";

const OBJECTIVES = Object.keys(OBJECTIVE_LABELS) as ResearchObjective[];

const OBJECTIVE_DESCRIPTIONS: Record<ResearchObjective, string> = {
  vendor_assessment:
    "Evaluate a vendor's financial health, security posture, and reliability before you sign.",
  ma_research:
    "Due diligence for mergers, acquisitions, or investments — ownership, risks, synergies.",
  competitive_intelligence:
    "Understand competitors, market positioning, and strategic moves.",
  market_intelligence:
    "Industry size, trends, regulation, and emerging players in a sector.",
  risk_assessment:
    "Operational, financial, legal, and cybersecurity risk indicators.",
  custom:
    "Define your own lens — ESG screening, supply chain audit, partnership review, etc.",
};

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
      <div className="w-full text-center">
        <p className="text-xs font-medium text-muted-foreground">
          Research type
        </p>
        <p className="mt-1 text-xs text-muted-foreground/80">
          Select what kind of analysis to run on the company
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {OBJECTIVES.map((objective) => {
          const isSelected = selected === objective;
          return (
            <button
              key={objective}
              type="button"
              onClick={() => onSelect(objective)}
              title={OBJECTIVE_DESCRIPTIONS[objective]}
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

      <p className="max-w-md text-center text-xs leading-relaxed text-muted-foreground">
        {OBJECTIVE_DESCRIPTIONS[selected]}
      </p>

      {selected === "custom" && (
        <Input
          value={customObjective}
          onChange={(event) => onCustomObjectiveChange?.(event.target.value)}
          placeholder="Describe your objective… e.g. ESG screening, supply chain audit"
          className="h-11 max-w-md rounded-xl border-border bg-white text-sm shadow-sm"
        />
      )}
    </div>
  );
}
