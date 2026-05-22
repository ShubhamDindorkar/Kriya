import { AlertTriangle, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchErrorProps {
  message: string;
  code?: string | null;
  className?: string;
}

export function ResearchError({ message, code, className }: ResearchErrorProps) {
  const isCompliance = code === "COMPLIANCE_BLOCKED";
  const isInvalidQuery = code === "INVALID_QUERY";

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4",
        isCompliance
          ? "border-amber-500/30 bg-amber-50"
          : isInvalidQuery
            ? "border-border bg-secondary/50"
            : "border-destructive/30 bg-destructive/5",
        className,
      )}
    >
      <div className="flex gap-3">
        {isCompliance ? (
          <ShieldX className="mt-0.5 size-5 shrink-0 text-amber-700" />
        ) : (
          <AlertTriangle
            className={cn(
              "mt-0.5 size-5 shrink-0",
              isInvalidQuery ? "text-muted-foreground" : "text-destructive",
            )}
          />
        )}
        <div className="space-y-2">
          <h3
            className={cn(
              "text-sm font-semibold",
              isCompliance
                ? "text-amber-900"
                : isInvalidQuery
                  ? "text-foreground"
                  : "text-destructive",
            )}
          >
            {isCompliance
              ? "Request not permitted"
              : isInvalidQuery
                ? "Company not identified"
                : "Research failed"}
          </h3>
          <p
            className={cn(
              "text-sm leading-relaxed",
              isCompliance
                ? "text-amber-900/90"
                : isInvalidQuery
                  ? "text-muted-foreground"
                  : "text-destructive/90",
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
          {isInvalidQuery && (
            <p className="text-sm text-muted-foreground">
              Kriyagni researches specific companies. Try:{" "}
              <strong>Vendor assessment on Stripe</strong> or{" "}
              <strong>Due diligence on Reliance Industries</strong>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
