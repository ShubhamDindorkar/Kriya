"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const uniqueSources = useMemo(() => {
    const seen = new Set<string>();
    return sources.filter((source) => {
      const key = source.url.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [sources]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
    };
    setIsDragging(true);
    el.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !dragState.current.active) return;
    event.preventDefault();
    const delta = event.clientX - dragState.current.startX;
    el.scrollLeft = dragState.current.scrollLeft - delta;
  }, []);

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragState.current.active = false;
    setIsDragging(false);
    scrollRef.current?.releasePointerCapture(event.pointerId);
  }, []);

  if (uniqueSources.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-medium text-foreground">Sources</h2>
        <span className="text-sm tabular-nums text-muted-foreground">
          {uniqueSources.length}
        </span>
      </div>

      <div className="relative -mx-1">
        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
          className={cn(
            "flex cursor-grab gap-3 overflow-x-auto px-1 pb-2 select-none",
            "scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "touch-pan-x",
            isDragging && "cursor-grabbing",
          )}
        >
          {uniqueSources.map((source, index) => (
            <motion.a
              key={source.url}
              id={`source-${source.id}`}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              onClick={(event) => {
                if (isDragging) event.preventDefault();
              }}
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
                  draggable={false}
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
      </div>
    </section>
  );
}
