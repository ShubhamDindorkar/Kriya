"use client";

import { cn } from "@/lib/utils";

interface CitationBadgeProps {
  index: number;
  onClick?: (index: number) => void;
  className?: string;
}

export function CitationBadge({
  index,
  onClick,
  className,
}: CitationBadgeProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(index)}
      className={cn(
        "mx-0.5 inline-flex size-[18px] -translate-y-px items-center justify-center rounded-md bg-teal/10 text-[10px] font-semibold text-teal transition-colors hover:bg-teal hover:text-white",
        className,
      )}
      aria-label={`View source ${index}`}
    >
      {index}
    </button>
  );
}

export function scrollToSource(
  sourceId: number,
  onHighlight?: (id: number) => void,
): void {
  const element = document.getElementById(`source-${sourceId}`);
  if (!element) return;

  element.scrollIntoView({ behavior: "smooth", block: "nearest" });
  onHighlight?.(sourceId);
}
