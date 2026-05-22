"use client";

import { Copy, Download } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ReportActionsProps {
  content: string;
  query: string;
  entity?: string | null;
  className?: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function ReportActions({
  content,
  query,
  entity,
  className,
}: ReportActionsProps) {
  const [copied, setCopied] = useState(false);

  if (!content) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const label = entity ?? query;
    const filename = `${slugify(label)}-${new Date().toISOString().slice(0, 10)}.md`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      >
        <Copy className="size-4" />
        {copied ? "Copied" : "Copy report"}
      </button>
      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      >
        <Download className="size-4" />
        Download .md
      </button>
    </div>
  );
}
