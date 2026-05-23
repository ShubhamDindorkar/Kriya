"use client";

import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function ChatComposer({
  onSubmit,
  placeholder = "Message Kriyagni…",
  isLoading = false,
  className,
}: ChatComposerProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setMessage("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-end gap-2 rounded-2xl border border-border bg-white p-2 shadow-sm",
        className,
      )}
    >
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        rows={1}
        className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-60"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || isLoading}
        className="size-9 shrink-0 rounded-xl bg-teal text-teal-foreground hover:bg-teal/90 disabled:opacity-40"
      >
        <ArrowUp className="size-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
