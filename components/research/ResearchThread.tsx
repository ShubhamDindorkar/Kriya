"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { scrollToSource } from "@/components/answer/CitationBadge";
import { SourceCarousel } from "@/components/answer/SourceCarousel";
import { StreamingAnswer } from "@/components/answer/StreamingAnswer";
import { SearchLayout } from "@/components/layout/SearchLayout";
import { ResearchError } from "@/components/research/ResearchError";
import { ResearchProgress } from "@/components/research/ResearchProgress";
import { ResearchStoppedBanner } from "@/components/research/ResearchStoppedBanner";
import { ResearchToolbar } from "@/components/research/ResearchToolbar";
import { ReportActions } from "@/components/research/ReportActions";
import { SearchComposer } from "@/components/search/SearchComposer";
import { useResearchStream } from "@/lib/hooks/useResearchStream";
import { useResearchSession } from "@/lib/hooks/useResearchSession";
import {
  createResearchSession,
  saveResearchSession,
  updateResearchSession,
} from "@/lib/research/session";
import type { ResearchObjective } from "@/lib/research/types";
import { DEPTH_LABELS, getObjectiveLabel } from "@/lib/research/types";

interface ResearchThreadProps {
  sessionId: string;
}

export function ResearchThread({ sessionId }: ResearchThreadProps) {
  const { session, isReady } = useResearchSession(sessionId);
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

  if (!isReady) {
    return (
      <SearchLayout>
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </SearchLayout>
    );
  }

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

  const isChat = state.isConversation;
  const showResearchChrome =
    !isChat &&
    (state.phase === "analyzing" ||
      state.phase === "searching" ||
      state.phase === "synthesizing" ||
      (state.phase === "complete" && state.totalQueries > 0) ||
      (state.phase === "stopped" && state.totalQueries > 0));

  return (
    <SearchLayout
      headerActions={
        <ResearchToolbar isActive={isActive && !isChat} onStop={handleStop} />
      }
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 pb-28 md:px-6 md:pb-8">
        {!showResearchChrome && !isChat && state.phase === "idle" && (
          <h1 className="text-xl font-medium leading-snug text-foreground md:text-2xl">
            {sessionQuery}
          </h1>
        )}

        {showResearchChrome && (
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-teal">
                {getObjectiveLabel(sessionObjective, customObjective)}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                {DEPTH_LABELS[depth]}
              </span>
              {state.entity && (
                <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground">
                  {state.entity}
                </span>
              )}
            </div>
            <h1 className="text-xl font-medium leading-snug text-foreground md:text-2xl">
              {sessionQuery}
            </h1>
          </header>
        )}

        {isChat && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-teal px-4 py-3 text-sm leading-relaxed text-teal-foreground">
              {sessionQuery}
            </div>
          </div>
        )}

        {state.phase === "stopped" && <ResearchStoppedBanner />}

        {state.phase === "error" && (
          <ResearchError
            message={state.error ?? "Unknown error"}
            code={state.errorCode}
          />
        )}

        {!isChat && (
          <ResearchProgress
            phase={state.phase}
            entity={state.entity}
            onStop={handleStop}
          />
        )}

        {!isChat && (
          <SourceCarousel
            sources={state.sources}
            highlightedSourceId={highlightedSourceId}
          />
        )}

        {(state.answer ||
          state.phase === "synthesizing" ||
          state.phase === "conversing" ||
          (isChat && state.phase === "idle")) && (
          <div className={isChat ? "flex justify-start" : undefined}>
            <StreamingAnswer
              content={state.answer}
              variant={isChat ? "chat" : "report"}
              isStreaming={
                isChat
                  ? state.phase === "conversing"
                  : state.phase === "synthesizing"
              }
              onCitationClick={handleCitationClick}
              className={isChat ? "max-w-[90%]" : undefined}
            />
          </div>
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

        {showFollowUpComposer && (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-canvas/95 px-4 py-4 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:px-0 md:py-0 md:pt-6">
            <SearchComposer
              placeholder={
                isChat
                  ? "Message Kriyagni…"
                  : state.phase === "complete"
                    ? "Research another company…"
                    : "Ask about a company…"
              }
              defaultObjective={sessionObjective}
              defaultCustomObjective={customObjective}
              showExamples={false}
              showHints={false}
              showObjectiveChips={!isChat}
              onSubmit={handleFollowUp}
            />
          </div>
        )}

        {isActive && !isChat && (
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
