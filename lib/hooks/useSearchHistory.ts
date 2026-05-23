"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listResearchSessions,
  type ResearchSession,
} from "@/lib/research/session";

export function useSearchHistory() {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(() => {
    setSessions(listResearchSessions());
  }, []);

  useEffect(() => {
    refresh();
    setIsReady(true);
  }, [refresh]);

  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  return { sessions, refresh, isReady };
}
