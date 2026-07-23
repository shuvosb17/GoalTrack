import type { JobPhaseId } from "./job-readiness";

/** Subtopics merged from the Software Engineering course carry this prefix in the curriculum. */
export const PS_SUBTOPIC_PREFIX = "[PS] ";

export function isPsSubtopic(name: string): boolean {
  return name.startsWith(PS_SUBTOPIC_PREFIX);
}

export interface PsWatchHint {
  pathModule: string;
  courseModules: string;
  extract: string;
}

/** Phase-aligned PS course watch order — watch when you reach the matching path module. */
export const PS_COURSE_WATCH_BY_PHASE: Record<JobPhaseId, PsWatchHint[]> = {
  A: [
    {
      pathModule: "M0.4 How the Web Works",
      courseModules: "Welcome · Webservers · Backend Systems intro",
      extract: "Server, port, IP, localhost, DNS, cloud-deploy mental model",
    },
    {
      pathModule: "M1.6 Methods & Interfaces",
      courseModules: "Typescript OOP (theory) · Interface and Polymorphism",
      extract: "OOP pillars; Go composition vs class-based OOP",
    },
    {
      pathModule: "M2.1 Goroutines",
      courseModules: "Async JS / event loop lessons",
      extract: "Event loop vs goroutines — interview comparison",
    },
    {
      pathModule: "M4 REST + Middleware + File Uploads",
      courseModules: "API Dev 1 & 2 · Beyond CRUD · Pagination · CORS · File Uploader",
      extract: "PUT/PATCH, cursor pagination, middleware, CORS, multipart uploads",
    },
    {
      pathModule: "M5 SQL & Modeling",
      courseModules: "Data Modeling · Database · Schema · ERD",
      extract: "Normalization, keys, joins, ERD practice",
    },
    {
      pathModule: "M6 Auth & Security",
      courseModules: "Cookies/Session · JWT · Auth deep-dive · API Security",
      extract: "Sessions, hashing/salting, RS256 JWT, SQLi/XSS/CSRF",
    },
  ],
  B: [],
  C: [
    {
      pathModule: "M10.1 Logging · M10.5 Load Testing",
      courseModules: "Loggers · Load Testing (K6)",
      extract: "Logger architecture; P95/P99; load-test your notes-api",
    },
    {
      pathModule: "M16.1 + M16.5 Design Patterns",
      courseModules: "Software Design Patterns",
      extract: "Singleton, DI, Factory, Strategy, Decorator — implement in Go",
    },
    {
      pathModule: "M22.4 Delivery Workflow",
      courseModules: "NestJS Project One (PRD/grooming/P0 only)",
      extract: "Requirement analysis, technical grooming, P0 prioritization",
    },
  ],
  D: [],
};

export function getPsWatchHintsForPhase(phaseId: JobPhaseId): PsWatchHint[] {
  return PS_COURSE_WATCH_BY_PHASE[phaseId] ?? [];
}
