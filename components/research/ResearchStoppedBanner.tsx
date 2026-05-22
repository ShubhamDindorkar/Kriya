import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchStoppedBannerProps {
  className?: string;
}

export function ResearchStoppedBanner({ className }: ResearchStoppedBannerProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-border bg-secondary/60 px-4 py-3",
        className,
      )}
    >
      <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Research stopped</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Partial results are shown below. Start a new research or re-run this
          query from the home page.
        </p>
      </div>
    </div>
  );
}
