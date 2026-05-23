"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo } from "react";
import { TierBadge } from "@/components/answer/TierBadge";
import type { ResearchSource } from "@/lib/hooks/useResearchStream";
import { getFaviconUrl } from "@/lib/utils/favicon";
import { cn } from "@/lib/utils";

interface SourceCarouselProps {
  sources: ResearchSource[];
  highlightedSourceId?: number | null;
  className?: string;
}

export function SourceCarousel({
  sources,
  highlightedSourceId,
  className,
}: SourceCarouselProps) {
  const uniqueSources = useMemo(() => {
    const seen = new Set<string>();
    return sources.filter((source) => {
      const key = source.url.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [sources]);

  if (uniqueSources.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Sources</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {uniqueSources.map((source, index) => (
          <motion.a
            key={source.url}
            id={`source-${source.id}`}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.4) }}
            className={cn(
              "group flex w-[200px] shrink-0 flex-col gap-2 rounded-xl border bg-white p-3 shadow-sm transition-all hover:border-teal/30 hover:shadow-md",
              highlightedSourceId === source.id
                ? "border-teal ring-2 ring-teal/30"
                : "border-border",
            )}
          >
            <div className="flex items-center gap-2">
              <Image
                src={getFaviconUrl(source.domain)}
                alt=""
                width={16}
                height={16}
                className="size-4 shrink-0 rounded-sm"
                unoptimized
              />
              <span className="truncate text-xs text-muted-foreground">
                {source.domain}
              </span>
              <TierBadge tier={source.tier} className="ml-auto" />
            </div>
            <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-teal">
              {source.title}
            </p>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
