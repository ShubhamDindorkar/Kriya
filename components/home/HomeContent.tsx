"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ControlsGuide,
  HowItWorks,
} from "@/components/home/HowItWorks";
import { WhatToAsk } from "@/components/home/WhatToAsk";
import { SearchComposer } from "@/components/search/SearchComposer";
import { SearchLayout } from "@/components/layout/SearchLayout";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { useSearchHistory } from "@/lib/hooks/useSearchHistory";
import {
  createResearchSession,
  saveResearchSession,
} from "@/lib/research/session";
import type { ResearchObjective } from "@/lib/research/types";
import { getObjectiveLabel } from "@/lib/research/types";

const VALID_OBJECTIVES = new Set<ResearchObjective>([
  "vendor_assessment",
  "ma_research",
  "competitive_intelligence",
  "market_intelligence",
  "risk_assessment",
  "custom",
]);

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sessions, isReady } = useSearchHistory();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const objectiveParam = searchParams.get("objective");
  const defaultObjective = VALID_OBJECTIVES.has(
    objectiveParam as ResearchObjective,
  )
    ? (objectiveParam as ResearchObjective)
    : "vendor_assessment";

  function handleSubmit({
    query,
    objective,
    customObjective,
  }: {
    query: string;
    objective: ResearchObjective;
    customObjective?: string;
  }) {
    setIsSubmitting(true);
    const session = createResearchSession({ query, objective, customObjective });
    saveResearchSession(session);
    router.push(`/search/${session.id}`);
  }

  return (
    <SearchLayout>
      <div className="flex flex-1 flex-col items-center px-6 py-10 md:py-14">
        <div className="flex w-full max-w-3xl flex-col items-center gap-10">
          <header className="flex flex-col items-center text-center">
            <GradientOrb className="mb-6" />
            <h1 className="text-4xl font-normal tracking-tight text-foreground md:text-5xl">
              Kriyagni
            </h1>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
              AI business intelligence for finance teams. Ask about any
              company — Kriyagni researches public sources and delivers cited
              reports.
            </p>
          </header>

          <div className="w-full max-w-2xl rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
            <SearchComposer
              defaultObjective={defaultObjective}
              isLoading={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>

          <WhatToAsk />

          <HowItWorks />

          <ControlsGuide />

          {isReady && sessions.length > 0 && (
            <section className="w-full space-y-3">
              <h2 className="text-sm font-medium text-foreground">
                Recent research
              </h2>
              <p className="text-xs text-muted-foreground">
                Click a past session to reopen it from the sidebar menu anytime.
              </p>
              <div className="grid gap-2">
                {sessions.slice(0, 4).map((session) => (
                  <Link
                    key={session.id}
                    href={`/search/${session.id}`}
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-left transition-colors hover:border-teal/30 hover:bg-accent/30"
                  >
                    <p className="line-clamp-1 text-sm font-medium text-foreground">
                      {session.query}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getObjectiveLabel(
                        session.objective,
                        session.customObjective,
                      )}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="max-w-md text-center text-xs leading-relaxed text-muted-foreground">
            Uses only publicly available information. Respects privacy
            regulations and terms of service. Not financial advice.
          </p>
        </div>
      </div>
    </SearchLayout>
  );
}

export function HomeContent() {
  return (
    <Suspense
      fallback={
        <SearchLayout>
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <GradientOrb size="sm" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        </SearchLayout>
      }
    >
      <HomeInner />
    </Suspense>
  );
}
