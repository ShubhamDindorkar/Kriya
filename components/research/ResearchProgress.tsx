import { Square, CheckCircle2, Loader2, AlertCircle, Search, Compass, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QueryStep } from "@/lib/hooks/useResearchStream";
import { motion, AnimatePresence } from "framer-motion";

interface ResearchProgressProps {
  phase:
    | "analyzing"
    | "conversing"
    | "searching"
    | "synthesizing"
    | "complete"
    | "stopped"
    | "error"
    | "idle";
  entity?: string | null;
  sourceCount?: number;
  totalQueries?: number;
  completedQueries?: number;
  querySteps?: QueryStep[];
  onStop?: () => void;
  className?: string;
}

export function ResearchProgress({
  phase,
  entity,
  sourceCount = 0,
  totalQueries = 0,
  completedQueries = 0,
  querySteps = [],
  onStop,
  className,
}: ResearchProgressProps) {
  if (
    phase === "idle" ||
    phase === "complete" ||
    phase === "conversing" ||
    phase === "stopped" ||
    phase === "error"
  ) {
    return null;
  }

  // Define phases with labels and base percentages
  let progressPercentage = 10;
  let phaseIcon = <Compass className="size-4 text-teal animate-pulse" />;
  let statusLabel = "Analyzing intent…";
  let subLabel = "Extracting entities & parsing compliance parameters";

  if (phase === "analyzing") {
    progressPercentage = 15;
    phaseIcon = <Compass className="size-4 text-teal animate-pulse" />;
    statusLabel = "Analyzing context…";
    subLabel = "Generating focus areas and validating query boundaries";
  } else if (phase === "searching") {
    const total = Math.max(totalQueries, 1);
    const ratio = Math.min(completedQueries / total, 1);
    progressPercentage = Math.round(15 + ratio * 65); // 15% to 80%
    phaseIcon = <Search className="size-4 text-teal animate-pulse" />;
    statusLabel = entity ? `Researching ${entity}` : "Gathering intelligence";
    subLabel = `${completedQueries} of ${total} parallel search pipelines completed`;
  } else if (phase === "synthesizing") {
    progressPercentage = 90;
    phaseIcon = <PenTool className="size-4 text-teal animate-pulse" />;
    statusLabel = "Synthesizing report…";
    subLabel = "Cross-verifying source claims & calculating confidence index";
  }

  // Get last 3 query steps to display in a live stream
  const activeSteps = [...querySteps]
    .reverse()
    .slice(0, 3);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-white p-5 shadow-sm space-y-4 transition-all duration-300",
        className,
      )}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal/10">
              {phaseIcon}
            </div>
            <h3 className="font-semibold text-sm text-foreground md:text-base">
              {statusLabel}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground pl-9">
            {subLabel}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {sourceCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {sourceCount} {sourceCount === 1 ? "source" : "sources"}
            </span>
          )}
          {onStop && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onStop}
              className="inline-flex gap-1.5 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive text-xs py-1 h-8"
            >
              <Square className="size-3 fill-current" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar with smooth transition */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
          <span>Progress</span>
          <span className="tabular-nums font-bold text-teal">{progressPercentage}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary/80">
          <div
            className="h-full rounded-full bg-teal transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Live Stream Dashboard */}
      {activeSteps.length > 0 && (
        <div className="border-t border-border/50 pt-3.5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">
            Live Research Pipeline
          </p>
          <div className="space-y-2 overflow-hidden">
            <AnimatePresence initial={false}>
              {activeSteps.map((step) => {
                let stepIcon = <Loader2 className="size-3.5 animate-spin text-teal" />;
                let stepClass = "border-border/60 bg-canvas/30 text-foreground";
                
                if (step.status === "complete") {
                  stepIcon = <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />;
                  stepClass = "border-emerald-100 bg-emerald-50/20 text-muted-foreground";
                } else if (step.status === "error") {
                  stepIcon = <AlertCircle className="size-3.5 text-rose-500 shrink-0" />;
                  stepClass = "border-rose-100 bg-rose-50/20 text-rose-800";
                }

                return (
                  <motion.div
                    key={`${step.index}-${step.status}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-2 text-xs font-medium leading-relaxed transition-all duration-200",
                      stepClass
                    )}
                  >
                    {stepIcon}
                    <span className="truncate flex-1 font-normal">
                      {step.query}
                    </span>
                    {step.status === "complete" && typeof step.resultCount === "number" && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded-full shrink-0">
                        {step.resultCount} results
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
