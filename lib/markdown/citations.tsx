import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { CitationBadge } from "@/components/answer/CitationBadge";
import { cn } from "@/lib/utils";

const CITATION_PATTERN = /(\[\d+\])/g;

export function renderTextWithCitations(
  text: string,
  onCitation?: (index: number) => void,
): ReactNode[] {
  return text.split(CITATION_PATTERN).map((part, index) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      return (
        <CitationBadge
          key={`cite-${index}-${match[1]}`}
          index={Number(match[1])}
          onClick={onCitation}
        />
      );
    }
    return part;
  });
}

export function processChildrenWithCitations(
  children: ReactNode,
  onCitation?: (index: number) => void,
): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      return renderTextWithCitations(child, onCitation);
    }

    if (isValidElement(child)) {
      const element = child as ReactElement<{ children?: ReactNode }>;
      if (element.props.children) {
        return cloneElement(element, {
          ...element.props,
          children: processChildrenWithCitations(
            element.props.children,
            onCitation,
          ),
        });
      }
    }

    return child;
  });
}

type MarkdownWrapperProps = {
  children?: ReactNode;
  className?: string;
};

function wrap(
  Tag: "p" | "li" | "td" | "th" | "strong" | "em" | "h1" | "h2" | "h3" | "h4" | "blockquote",
  onCitation?: (index: number) => void,
  className?: string,
) {
  return function MarkdownWrapper({ children }: MarkdownWrapperProps) {
    return (
      <Tag className={className}>
        {processChildrenWithCitations(children, onCitation)}
      </Tag>
    );
  };
}

export function createCitationMarkdownComponents(
  onCitation?: (index: number) => void,
) {
  return {
    p: wrap("p", onCitation, "leading-7 text-foreground/90"),
    li: wrap("li", onCitation, "leading-7"),
    strong: wrap("strong", onCitation),
    em: wrap("em", onCitation),
    h1: wrap("h1", onCitation),
    h2: wrap("h2", onCitation),
    h3: wrap("h3", onCitation),
    h4: wrap("h4", onCitation),
    blockquote: wrap("blockquote", onCitation),
    table: function MarkdownTable({ children }: MarkdownWrapperProps) {
      return (
        <div className="my-6 overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            {processChildrenWithCitations(children, onCitation)}
          </table>
        </div>
      );
    },
    thead: function MarkdownThead({ children }: MarkdownWrapperProps) {
      return (
        <thead className="border-b border-border bg-secondary/70">
          {processChildrenWithCitations(children, onCitation)}
        </thead>
      );
    },
    tbody: function MarkdownTbody({ children }: MarkdownWrapperProps) {
      return (
        <tbody className="divide-y divide-border/80">
          {processChildrenWithCitations(children, onCitation)}
        </tbody>
      );
    },
    tr: function MarkdownTr({ children }: MarkdownWrapperProps) {
      return (
        <tr className="transition-colors even:bg-secondary/25 hover:bg-accent/30">
          {processChildrenWithCitations(children, onCitation)}
        </tr>
      );
    },
    th: function MarkdownTh({ children }: MarkdownWrapperProps) {
      return (
        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground">
          {processChildrenWithCitations(children, onCitation)}
        </th>
      );
    },
    td: function MarkdownTd({ children }: MarkdownWrapperProps) {
      return (
        <td className="px-4 py-3 align-top text-foreground/90">
          {processChildrenWithCitations(children, onCitation)}
        </td>
      );
    },
    pre: function MarkdownPre({ children }: MarkdownWrapperProps) {
      return (
        <pre className="my-4 overflow-x-auto rounded-xl border border-border bg-secondary/50 p-4 text-sm leading-6">
          {children}
        </pre>
      );
    },
    code: function MarkdownCode({
      children,
      className,
    }: MarkdownWrapperProps & { className?: string }) {
      const isBlock = className?.includes("language-");
      if (isBlock) {
        return <code className={cn("font-mono text-[13px]", className)}>{children}</code>;
      }
      return (
        <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[13px] text-foreground">
          {children}
        </code>
      );
    },
  };
}
