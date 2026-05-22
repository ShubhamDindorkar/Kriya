"use client";

import { ResearchThread } from "@/components/research/ResearchThread";

interface SearchPageClientProps {
  id: string;
}

export function SearchPageClient({ id }: SearchPageClientProps) {
  return <ResearchThread sessionId={id} />;
}
