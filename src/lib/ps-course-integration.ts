import type { JobPhaseId } from "./job-readiness";

/** Subtopics merged from the instructor SWE course carry this prefix in the curriculum. */
export const PS_SUBTOPIC_PREFIX = "[PS] ";

export function isPsSubtopic(name: string): boolean {
  return name.startsWith(PS_SUBTOPIC_PREFIX);
}

/** Dedicated per-module [PS] topics use Topic N.PS in the Development track. */
export function isPsTopic(name: string): boolean {
  return name.includes("[PS]") || /\.PS:/i.test(name);
}

export interface PsWatchHint {
  pathModule: string;
  courseModules: string;
  extract: string;
}

/** Phase-aligned PS course watch order — open Topic N.PS in the track when you reach each module. */
export const PS_COURSE_WATCH_BY_PHASE: Record<JobPhaseId, PsWatchHint[]> = {
  A: [
    {
      pathModule: "M0 → Topic 0.PS",
      courseModules: "Welcome · Setup · Webservers · Backend Systems intro",
      extract: "Server, port, IP, localhost, DNS; rebuild his Node demo in Go at M4",
    },
    {
      pathModule: "M1 → Topic 1.PS (skim)",
      courseModules: "JS/Express · Async JS · TS OOP · Interface & Polymorphism",
      extract: "Interview contrasts: event loop vs goroutines; TS explicit vs Go implicit interfaces",
    },
    {
      pathModule: "M4 → Topic 4.PS",
      courseModules: "API Dev 1 & 2 · Data Modeling · Beyond CRUD · Pagination · CORS",
      extract: "Implement audit logger, rate limiter, cursor pagination on jobtrackr in Go",
    },
    {
      pathModule: "M5 → Topic 5.PS",
      courseModules: "Database · Schema/SQL · Entity Relationship · ERD Basics",
      extract: "Normalization, keys, joins, ERD homework — stack-agnostic SQL",
    },
    {
      pathModule: "M6 → Topic 6.PS",
      courseModules: "Cookies/Session · JWT · Auth deep-dive · API Security",
      extract: "Cookie auth first, then JWT/RBAC on Secure jobtrackr; run SQLi simulation",
    },
    {
      pathModule: "M9 → Topic 9.PS",
      courseModules: "File Uploader Project",
      extract: "Multipart/MIME/uploads → implement in Go for vaultdrop flagship",
    },
  ],
  B: [],
  C: [
    {
      pathModule: "M10 → Topic 10.PS",
      courseModules: "Loggers",
      extract: "Winston/Pino concepts → map to slog/zap on jobtrackr or hookrelay",
    },
    {
      pathModule: "M11 → Topic 11.PS",
      courseModules: "Load Testing (K6)",
      extract: "Load-test every flagship; publish P95/P99 in READMEs",
    },
    {
      pathModule: "M16 → Topic 16.PS",
      courseModules: "Design Patterns · NestJS Project One (process only)",
      extract: "Patterns in idiomatic Go; PRD → grooming → P0 for taka-flow capstone",
    },
  ],
  D: [],
};

export function getPsWatchHintsForPhase(phaseId: JobPhaseId): PsWatchHint[] {
  return PS_COURSE_WATCH_BY_PHASE[phaseId] ?? [];
}
