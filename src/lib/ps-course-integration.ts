import type { JobPhaseId } from "./job-readiness";

/** Subtopics merged from the instructor SWE course carry this prefix in the curriculum. */
export const PS_SUBTOPIC_PREFIX = "[PS] ";

export function isPsSubtopic(name: string): boolean {
  return name.startsWith(PS_SUBTOPIC_PREFIX);
}

/** Dedicated per-module [PS] topics use Topic N.PS in the Development track. */
export function isPsTopic(name: string): boolean {
  return name.includes("[PS]") || /\.PS\d/i.test(name);
}

export interface PsWatchHint {
  pathModule: string;
  courseModules: string;
  extract: string;
}

/** Phase-aligned PS course watch order — each maps to Topic N.PS* rows in the track tree. */
export const PS_COURSE_WATCH_BY_PHASE: Record<JobPhaseId, PsWatchHint[]> = {
  A: [
    {
      pathModule: "M0 → Topics 0.PS1–0.PS3",
      courseModules: "Welcome · Webservers · Backend Systems intro",
      extract: "One topic per instructor module; tick each lesson subtopic as you watch",
    },
    {
      pathModule: "M1 → Topics 1.PS1–1.PS6 (skim)",
      courseModules: "JS/Express · Async JS · JS Essentials · Process · TS OOP · Polymorphism",
      extract: "Skim for interview contrasts; do not rebuild in Node",
    },
    {
      pathModule: "M4 → Topics 4.PS1–4.PS6",
      courseModules: "API Dev 1 & 2 · Data Modeling · Beyond CRUD · Pagination · CORS",
      extract: "Watch each [PS] topic; implement audit logger + pagination on jobtrackr",
    },
    {
      pathModule: "M5 → Topics 5.PS1–5.PS5",
      courseModules: "Database · Schema/SQL · Read queries · ER/normalization · ERD",
      extract: "Stack-agnostic SQL — complete ERD homework subtopics",
    },
    {
      pathModule: "M6 → Topics 6.PS1–6.PS4",
      courseModules: "Cookies/Session · JWT · Auth deep-dive · API Security",
      extract: "Cookie auth first, then JWT/RBAC on Secure jobtrackr",
    },
    {
      pathModule: "M9 → Topic 9.PS1",
      courseModules: "File Uploader Project",
      extract: "Every lesson → implement in Go for vaultdrop",
    },
  ],
  B: [],
  C: [
    {
      pathModule: "M10 → Topic 10.PS1",
      courseModules: "Loggers",
      extract: "Winston/Pino lessons → map to slog/zap on your services",
    },
    {
      pathModule: "M11 → Topic 11.PS1",
      courseModules: "Load Testing (K6)",
      extract: "Complete all K6 subtopics; load-test every flagship",
    },
    {
      pathModule: "M16 → Topics 16.PS1–16.PS2",
      courseModules: "Design Patterns · NestJS Project One (process only)",
      extract: "Patterns in Go; PRD/grooming/P0 subtopics for taka-flow",
    },
  ],
  D: [],
};

export function getPsWatchHintsForPhase(phaseId: JobPhaseId): PsWatchHint[] {
  return PS_COURSE_WATCH_BY_PHASE[phaseId] ?? [];
}
