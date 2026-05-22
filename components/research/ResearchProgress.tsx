import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResearchProgressProps {
  phase: "searching" | "synthesizing" | "complete" | "stopped" | "error" | "idle";
  entity?: string | null;
  totalQueries?: number;
  completedQueries?: number;
  uniqueSources?: number;
  onStop?: () => void;
  className?: string;
}

export function ResearchProgress({
  phase,
  entity,
  totalQueries = 0,
  completedQueries = 0,
  uniqueSources = 0,
  onStop,
  className,
}: ResearchProgressProps) {
  if (
    phase === "idle" ||
    phase === "complete" ||
    phase === "stopped" ||
    phase === "error"
  ) {
    return null;
  }

  const progress =
    totalQueries > 0
      ? Math.min(100, Math.round((completedQueries / totalQueries) * 100))
      : 0;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white px-4 py-3 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="font-medium text-foreground">
          {phase === "searching"
            ? `Researching${entity ? ` ${entity}` : ""}…`
            : "Writing report…"}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {phase === "searching" && totalQueries > 0 && (
            <span className="text-muted-foreground">
              {completedQueries}/{totalQueries}
            </span>
          )}
          {onStop && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onStop}
              className="hidden gap-1.5 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive md:inline-flex"
            >
              <Square className="size-3.5 fill-current" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {phase === "searching" && totalQueries > 0 && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-teal transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {phase === "synthesizing" && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-full animate-pulse rounded-full bg-teal/70" />
        </div>
      )}

      {uniqueSources > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {uniqueSources} sources collected
          {phase === "searching" ? " — you can stop anytime" : ""}
        </p>
      )}
    </div>
  );
}
