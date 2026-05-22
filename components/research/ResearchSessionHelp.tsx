import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchSessionHelpProps {
  phase:
    | "analyzing"
    | "conversing"
    | "searching"
    | "synthesizing"
    | "complete"
    | "stopped"
    | "error"
    | "idle";
  isConversation?: boolean;
  className?: string;
}

export function ResearchSessionHelp({
  phase,
  isConversation = false,
  className,
}: ResearchSessionHelpProps) {
  let message: string | null = null;

  switch (phase) {
    case "analyzing":
      message =
        "Kriyagni is reading your message. If you named a company, 70+ public-source searches begin next. Greetings get a helpful reply instead.";
      break;
    case "conversing":
      message =
        "This is an assistant reply — no web research yet. Pick an example below or name a company to start a full report.";
      break;
    case "searching":
      message =
        "Collecting evidence from public sources. Use Stop in the header to cancel, or New research to start fresh.";
      break;
    case "synthesizing":
      message =
        "Writing your report from verified sources. Citations like [1] link to sources below.";
      break;
    case "complete":
      message = isConversation
        ? "Ready for a company query? Click an example chip or type e.g. Vendor assessment on Stripe."
        : "Report complete. Export as markdown, click follow-ups for new research, or ask another question below.";
      break;
    case "stopped":
      message =
        "Research was cancelled. Partial results are below. Use New research for a fresh start, or type another company in the box below.";
      break;
    default:
      message = null;
  }

  if (!message) return null;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-teal/20 bg-accent/40 px-4 py-3",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-teal" />
      <p className="text-sm leading-relaxed text-foreground/90">{message}</p>
    </div>
  );
}
