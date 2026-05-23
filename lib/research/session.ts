import { resolveResearchDepth } from "@/lib/research/entity-parser";
import type {
  ResearchDepth,
  ResearchObjective,
} from "@/lib/research/types";

const STORAGE_KEY = "kriyagni-research-sessions";

export interface ResearchSession {
  id: string;
  query: string;
  objective: ResearchObjective;
  customObjective?: string;
  depth: ResearchDepth;
  createdAt: number;
  entityName?: string;
  answerPreview?: string;
}

function readAll(): Record<string, ResearchSession> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ResearchSession>) : {};
  } catch {
    return {};
  }
}

function writeAll(sessions: Record<string, ResearchSession>): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function saveResearchSession(session: ResearchSession): void {
  const sessions = readAll();
  sessions[session.id] = session;
  writeAll(sessions);
}

export function getResearchSession(id: string): ResearchSession | null {
  return readAll()[id] ?? null;
}

export function listResearchSessions(limit = 20): ResearchSession[] {
  return Object.values(readAll())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export function createResearchSession(input: {
  query: string;
  objective?: ResearchObjective;
  customObjective?: string;
  depth?: ResearchDepth;
}): ResearchSession {
  const depth = input.depth ?? resolveResearchDepth(input.query);

  return {
    id: crypto.randomUUID(),
    query: input.query,
    objective: input.objective ?? "vendor_assessment",
    customObjective: input.customObjective?.trim() || undefined,
    depth,
    createdAt: Date.now(),
  };
}

export function updateResearchSession(
  id: string,
  patch: Partial<Pick<ResearchSession, "entityName" | "answerPreview">>,
): void {
  const sessions = readAll();
  const session = sessions[id];
  if (!session) return;
  writeAll({ ...sessions, [id]: { ...session, ...patch } });
}
