"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listResearchSessions,
  type ResearchSession,
} from "@/lib/research/session";

export function useSearchHistory() {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);

  const refresh = useCallback(() => {
    setSessions(listResearchSessions());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  return { sessions, refresh };
}
