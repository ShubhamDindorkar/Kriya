"use client";

import { motion } from "framer-motion";
import { Check, Circle, Loader2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { QueryStep } from "@/lib/hooks/useResearchStream";
import { cn } from "@/lib/utils";

interface SearchStepsProps {
  steps: QueryStep[];
  totalQueries: number;
  isActive: boolean;
  className?: string;
}

function StepIcon({ status }: { status: QueryStep["status"] }) {
  if (status === "executing") {
    return <Loader2 className="size-3.5 shrink-0 animate-spin text-teal" />;
  }
  if (status === "complete") {
    return <Check className="size-3.5 shrink-0 text-teal" />;
  }
  if (status === "error") {
    return <X className="size-3.5 shrink-0 text-destructive" />;
  }
  return <Circle className="size-3.5 shrink-0 text-border" />;
}

export function SearchSteps({
  steps,
  totalQueries,
  isActive,
  className,
}: SearchStepsProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [steps.length, isActive]);

  if (!isActive && steps.length === 0) return null;

  const completed = steps.filter((s) => s.status === "complete").length;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground">Live searches</p>
        {totalQueries > 0 && (
          <span className="text-xs text-muted-foreground">
            {completed}/{totalQueries}
          </span>
        )}
      </div>

      <ScrollArea className="h-[220px] md:h-[280px]">
        <ul className="space-y-0.5 p-2">
          {steps.map((step) => (
            <motion.li
              key={step.index}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors",
                step.status === "executing" && "bg-accent/60",
                step.status === "complete" && "text-foreground/80",
                step.status === "error" && "text-destructive/80",
              )}
            >
              <span className="mt-0.5">
                <StepIcon status={step.status} />
              </span>
              <span className="min-w-0 flex-1 leading-snug">
                <span className="mr-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {step.focusAreaId}
                </span>
                {step.query}
                {step.status === "complete" && step.resultCount != null && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    · {step.resultCount} results
                  </span>
                )}
              </span>
            </motion.li>
          ))}
          <div ref={bottomRef} />
        </ul>
      </ScrollArea>
    </div>
  );
}
