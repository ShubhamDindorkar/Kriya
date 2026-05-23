import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  onStop?: () => void;
  className?: string;
}

export function ResearchProgress({
  phase,
  entity,
  sourceCount = 0,
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

  const statusLabel =
    phase === "analyzing"
      ? "Thinking…"
      : phase === "searching"
        ? entity
          ? `Researching ${entity}…`
          : "Researching…"
        : "Writing report…";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white px-4 py-3 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="font-medium text-foreground">{statusLabel}</p>
        <div className="flex shrink-0 items-center gap-2">
          {sourceCount > 0 && (
            <span className="text-sm tabular-nums text-muted-foreground">
              {sourceCount}
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

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-teal/70" />
      </div>
    </div>
  );
}
