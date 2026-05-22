import { AlertTriangle, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchErrorProps {
  message: string;
  code?: string | null;
  className?: string;
}

export function ResearchError({ message, code, className }: ResearchErrorProps) {
  const isCompliance = code === "COMPLIANCE_BLOCKED";

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4",
        isCompliance
          ? "border-amber-500/30 bg-amber-50"
          : "border-destructive/30 bg-destructive/5",
        className,
      )}
    >
      <div className="flex gap-3">
        {isCompliance ? (
          <ShieldX className="mt-0.5 size-5 shrink-0 text-amber-700" />
        ) : (
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
        )}
        <div className="space-y-2">
          <h3
            className={cn(
              "text-sm font-semibold",
              isCompliance ? "text-amber-900" : "text-destructive",
            )}
          >
            {isCompliance ? "Request not permitted" : "Research failed"}
          </h3>
          <p
            className={cn(
              "text-sm leading-relaxed",
              isCompliance ? "text-amber-900/90" : "text-destructive/90",
            )}
          >
            {message}
          </p>
          {isCompliance && (
            <p className="text-sm text-amber-800/80">
              Try rephrasing your request to focus on public business
              information — company financials, leadership, legal filings, or
              market position.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
