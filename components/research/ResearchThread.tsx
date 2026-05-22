"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { scrollToSource } from "@/components/answer/CitationBadge";
import { FollowUpChips } from "@/components/answer/FollowUpChips";
import { SourceCarousel } from "@/components/answer/SourceCarousel";
import { StreamingAnswer } from "@/components/answer/StreamingAnswer";
import { SearchLayout } from "@/components/layout/SearchLayout";
import { ResearchError } from "@/components/research/ResearchError";
import { ResearchProgress } from "@/components/research/ResearchProgress";
import { ResearchSessionHelp } from "@/components/research/ResearchSessionHelp";
import { ResearchStoppedBanner } from "@/components/research/ResearchStoppedBanner";
import { ResearchToolbar } from "@/components/research/ResearchToolbar";
import { ReportActions } from "@/components/research/ReportActions";
import { SearchComposer } from "@/components/search/SearchComposer";
import { SearchSteps } from "@/components/search/SearchSteps";
import { useResearchStream } from "@/lib/hooks/useResearchStream";
import {
  createResearchSession,
  getResearchSession,
  saveResearchSession,
  updateResearchSession,
} from "@/lib/research/session";
import type { ResearchObjective } from "@/lib/research/types";
import { DEPTH_LABELS, getObjectiveLabel } from "@/lib/research/types";

interface ResearchThreadProps {
  sessionId: string;
}

export function ResearchThread({ sessionId }: ResearchThreadProps) {
  const session = getResearchSession(sessionId);
  const { state, startResearch, stopResearch } = useResearchStream();
  const startedRef = useRef(false);
  const [highlightedSourceId, setHighlightedSourceId] = useState<number | null>(
    null,
  );

  const isActive =
    state.phase === "analyzing" ||
    state.phase === "conversing" ||
    state.phase === "searching" ||
    state.phase === "synthesizing";

  useEffect(() => {
    if (!session || startedRef.current) return;

    startedRef.current = true;
    void startResearch({
      query: session.query,
      objective: session.objective,
      customObjective: session.customObjective,
      depth: session.depth,
    });
  }, [session, sessionId, startResearch]);

  useEffect(() => {
    if (state.phase !== "complete" || !session) return;

    updateResearchSession(sessionId, {
      entityName: state.entity ?? undefined,
      answerPreview: state.answer.slice(0, 200),
    });
  }, [state.phase, state.entity, state.answer, session, sessionId]);

  useEffect(() => {
    return () => {
      stopResearch();
    };
  }, [stopResearch]);

  const handleCitationClick = useCallback((index: number) => {
    scrollToSource(index, (id) => {
      setHighlightedSourceId(id);
      window.setTimeout(() => setHighlightedSourceId(null), 2000);
    });
  }, []);

  const handleStop = useCallback(() => {
    stopResearch();
  }, [stopResearch]);

  if (!session) {
    return (
      <SearchLayout>
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
          <p className="text-center text-muted-foreground">
            Research session not found. Start a new search from the home page.
          </p>
          <Link
            href="/"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            New research
          </Link>
        </div>
      </SearchLayout>
    );
  }

  const { query: sessionQuery, objective: sessionObjective, customObjective, depth } =
    session;
  const showSearchViz =
    state.phase === "searching" || state.phase === "synthesizing";
  const showFollowUpComposer =
    state.phase === "complete" ||
    state.phase === "stopped" ||
    state.phase === "error";

  function handleFollowUp({
    query,
    objective,
    customObjective: nextCustomObjective,
  }: {
    query: string;
    objective: ResearchObjective;
    customObjective?: string;
  }) {
    const next = createResearchSession({
      query,
      objective,
      customObjective: nextCustomObjective,
      depth,
    });
    saveResearchSession(next);
    window.location.href = `/search/${next.id}`;
  }

  return (
    <SearchLayout
      headerActions={
        <ResearchToolbar isActive={isActive} onStop={handleStop} />
      }
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 pb-28 md:px-6 md:pb-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-teal">
              {getObjectiveLabel(sessionObjective, customObjective)}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              {DEPTH_LABELS[depth]}
            </span>
            {state.isConversation && state.phase === "complete" && (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                Assistant
              </span>
            )}
            {state.entity && !state.isConversation && (
              <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground">
                {state.entity}
              </span>
            )}
          </div>
          <h1 className="text-xl font-medium leading-snug text-foreground md:text-2xl">
            {sessionQuery}
          </h1>
        </header>

        <ResearchSessionHelp
          phase={state.phase}
          isConversation={state.isConversation}
        />

        {state.phase === "stopped" && <ResearchStoppedBanner />}

        {state.phase === "error" && (
          <ResearchError
            message={state.error ?? "Unknown error"}
            code={state.errorCode}
          />
        )}

        <ResearchProgress
          phase={state.phase}
          entity={state.entity}
          researchIntent={state.researchIntent}
          totalQueries={state.totalQueries}
          completedQueries={state.completedQueries}
          uniqueSources={state.uniqueSources || state.sources.length}
          onStop={handleStop}
        />

        {showSearchViz && (
          <SearchSteps
            steps={state.querySteps}
            totalQueries={state.totalQueries}
            isActive={state.phase === "searching"}
          />
        )}

        {state.phase === "synthesizing" && state.sources.length === 0 && (
          <p className="text-sm text-muted-foreground">Analyzing evidence…</p>
        )}

        <SourceCarousel
          sources={state.sources}
          highlightedSourceId={highlightedSourceId}
        />

        {(state.answer ||
          state.phase === "synthesizing" ||
          state.phase === "conversing") && (
          <StreamingAnswer
            content={state.answer}
            isStreaming={
              state.phase === "synthesizing" || state.phase === "conversing"
            }
            onCitationClick={handleCitationClick}
          />
        )}

        {(state.phase === "complete" || state.phase === "stopped") &&
          state.answer &&
          !state.isConversation && (
            <ReportActions
              content={state.answer}
              query={sessionQuery}
              entity={state.entity}
            />
          )}

        {state.phase === "complete" && state.followups.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Suggested follow-ups — each starts a new research session
            </p>
            <FollowUpChips
              questions={state.followups}
              onSelect={(question) =>
                handleFollowUp({
                  query: question,
                  objective: sessionObjective,
                  customObjective,
                })
              }
            />
          </div>
        )}

        {showFollowUpComposer && (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-canvas/95 px-4 py-4 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:px-0 md:py-0 md:pt-6">
            <SearchComposer
              placeholder={
                state.phase === "complete" && !state.isConversation
                  ? "Research another company…"
                  : "Ask about a company or say hello…"
              }
              defaultObjective={sessionObjective}
              defaultCustomObjective={customObjective}
              showExamples={state.isConversation}
              showHints={false}
              onSubmit={handleFollowUp}
            />
          </div>
        )}

        {isActive && (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-canvas/95 px-4 py-3 backdrop-blur-sm md:hidden">
            <ResearchToolbar
              isActive={isActive}
              onStop={handleStop}
              variant="sticky"
            />
          </div>
        )}
      </div>
    </SearchLayout>
  );
}
