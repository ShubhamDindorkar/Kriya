"use client";

import { useEffect, useState } from "react";
import {
  getResearchSession,
  type ResearchSession,
} from "@/lib/research/session";

export function useResearchSession(sessionId: string) {
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(getResearchSession(sessionId));
    setIsReady(true);
  }, [sessionId]);

  return { session, isReady };
}
