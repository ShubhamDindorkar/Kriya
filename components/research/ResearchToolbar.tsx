"use client";

import Link from "next/link";
import { Plus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ResearchToolbarProps {
  isActive: boolean;
  onStop?: () => void;
  className?: string;
  variant?: "header" | "sticky";
}

export function ResearchToolbar({
  isActive,
  onStop,
  className,
  variant = "header",
}: ResearchToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        variant === "sticky" && "w-full justify-end",
        className,
      )}
    >
      {isActive && onStop && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onStop}
                className="gap-1.5 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
              />
            }
          >
            <Square className="size-3.5 fill-current" />
            Stop
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Cancel the current search or report. Partial results are kept.
          </TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href="/"
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-xl px-2.5 text-[0.8rem] font-medium transition-colors",
                variant === "sticky"
                  ? "bg-teal text-teal-foreground hover:bg-teal/90"
                  : "border border-border bg-background hover:bg-muted",
              )}
            />
          }
        >
          <Plus className="size-3.5" />
          New research
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Start over on the home page with a new company query.
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
