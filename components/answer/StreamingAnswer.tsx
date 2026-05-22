"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMemo } from "react";
import { createCitationMarkdownComponents } from "@/lib/markdown/citations";
import { cn } from "@/lib/utils";

interface StreamingAnswerProps {
  content: string;
  isStreaming?: boolean;
  onCitationClick?: (index: number) => void;
  className?: string;
}

const markdownStyles = [
  "space-y-4 text-[15px] leading-7 text-foreground",
  "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-foreground",
  "[&_h2]:mt-8 [&_h2]:border-b [&_h2]:border-border/60 [&_h2]:pb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground",
  "[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-foreground",
  "[&_h4]:mt-4 [&_h4]:text-base [&_h4]:font-medium [&_h4]:text-foreground",
  "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6",
  "[&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-6",
  "[&_a]:font-medium [&_a]:text-teal [&_a]:underline-offset-2 hover:[&_a]:underline",
  "[&_hr]:my-8 [&_hr]:border-border",
];

export function StreamingAnswer({
  content,
  isStreaming = false,
  onCitationClick,
  className,
}: StreamingAnswerProps) {
  const components = useMemo(
    () => createCitationMarkdownComponents(onCitationClick),
    [onCitationClick],
  );

  if (!content && !isStreaming) return null;

  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-white px-5 py-6 shadow-sm md:px-7 md:py-8",
        markdownStyles,
        className,
      )}
    >
      {content ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      ) : (
        <p className="text-muted-foreground">Preparing report…</p>
      )}
      {isStreaming && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-teal align-middle" />
      )}
    </article>
  );
}
