import type { Module, Subtopic, Topic } from "./types";
import { isSubtopicDone } from "./utils";
import { getPsWatchHintsForPhase, isPsSubtopic } from "./ps-course-integration";

export type JobPhaseId = "A" | "B" | "C" | "D";

export interface JobPhaseDef {
  id: JobPhaseId;
  name: string;
  timeline: string;
  goal: string;
  moduleNumbers: number[];
}

export interface ModuleReadiness {
  moduleNumber: number;
  name: string;
  moduleId: string;
  doneCount: number;
  totalCount: number;
  psDoneCount: number;
  psTotalCount: number;
  percent: number;
  inProgress: boolean;
  complete: boolean;
}

export interface ChecklistItem {
  id: string;
  label: string;
  moduleNumbers: number[];
  met: boolean;
  percent: number;
  progressLabel: string;
}

export interface JobReadinessReport {
  goBackendModuleCount: number;
  phases: Array<JobPhaseDef & { modules: ModuleReadiness[]; percent: number; complete: boolean }>;
  currentPhase: JobPhaseId;
  readyToApply: boolean;
  employabilityPercent: number;
  checklist: ChecklistItem[];
  nextSteps: string[];
  psWatchHints: ReturnType<typeof getPsWatchHintsForPhase>;
  psSubtopicsDone: number;
  psSubtopicsTotal: number;
  headline: string;
  summary: string;
}

const GO_MODULE_RE = /^Module (\d+):/;

export const JOB_PHASES: JobPhaseDef[] = [
  {
    id: "A",
    name: "Employable Core",
    timeline: "Months 1–4",
    goal: "Build, test, containerize, and secure a real REST API backed by Postgres.",
    moduleNumbers: [0, 1, 2, 3, 4, 5, 6, 9, 18, 22],
  },
  {
    id: "B",
    name: "Prove It + Start Applying",
    timeline: "Months 4–6",
    goal: "Ship a live HTTPS deploy and start 5–10 applications per week.",
    moduleNumbers: [7, 8, 12, 19, 21, 23],
  },
  {
    id: "C",
    name: "Differentiators While Interviewing",
    timeline: "Months 6–9",
    goal: "Capstone polish: observability, CI/CD, system design, API docs.",
    moduleNumbers: [10, 11, 13, 16, 20],
  },
  {
    id: "D",
    name: "Deferred / Post-First-Job",
    timeline: "Later",
    goal: "gRPC, deep K8s, AI — learn on the job or when a role requires them.",
    moduleNumbers: [14, 15, 17],
  },
];

/** Checklist order follows the Go backend path: Phase A (M0–M6, M9) then Phase B (M7, M12) then job prep (M22, M23). */
const APPLY_CHECKLIST: Array<{
  id: string;
  label: string;
  moduleNumbers: number[];
  order: number;
  threshold?: number;
}> = [
  { id: "git", label: "Git/GitHub fluency and clean READMEs", moduleNumbers: [0], order: 0 },
  { id: "go", label: "Go fundamentals + concurrency basics", moduleNumbers: [1, 2], order: 1 },
  { id: "tests", label: "Tests you actually wrote (unit + integration)", moduleNumbers: [3], order: 2 },
  { id: "rest", label: "REST API with validation and middleware", moduleNumbers: [4], order: 3 },
  { id: "db", label: "PostgreSQL: schema, joins, transactions, migrations", moduleNumbers: [5], order: 4 },
  { id: "auth", label: "Auth: bcrypt + JWT + RBAC", moduleNumbers: [6], order: 5 },
  { id: "docker", label: "Docker + docker-compose; image in a registry", moduleNumbers: [9], order: 6 },
  {
    id: "deploy",
    label: "Basic Linux + one deployed live service (HTTPS)",
    moduleNumbers: [7, 12],
    order: 7,
    threshold: 50,
  },
  { id: "tradeoffs", label: "Can explain trade-offs aloud", moduleNumbers: [22], order: 8, threshold: 40 },
  { id: "jobkit", label: "Resume + LinkedIn + pinned repos", moduleNumbers: [23], order: 9, threshold: 40 },
];

function parseModuleNumber(name: string): number | null {
  const match = name.match(GO_MODULE_RE);
  return match ? Number(match[1]) : null;
}

function moduleStats(moduleId: string, subtopics: Subtopic[]) {
  const subs = subtopics.filter((s) => s.moduleId === moduleId && !s.archived);
  if (subs.length === 0) {
    return {
      doneCount: 0,
      totalCount: 0,
      psDoneCount: 0,
      psTotalCount: 0,
      percent: 0,
      inProgress: false,
      complete: false,
    };
  }
  const psSubs = subs.filter((s) => isPsSubtopic(s.name));
  const doneCount = subs.filter((s) => isSubtopicDone(s.status)).length;
  const psDoneCount = psSubs.filter((s) => isSubtopicDone(s.status)).length;
  const inProgress = subs.some((s) => s.status === "in_progress") || doneCount > 0;
  const percent = Math.round((doneCount / subs.length) * 100);
  return {
    doneCount,
    totalCount: subs.length,
    psDoneCount,
    psTotalCount: psSubs.length,
    percent,
    inProgress,
    complete: percent >= 90,
  };
}

function buildModuleReadiness(modules: Module[], subtopics: Subtopic[]): Map<number, ModuleReadiness> {
  const byNumber = new Map<number, ModuleReadiness>();

  for (const mod of modules) {
    const num = parseModuleNumber(mod.name);
    if (num == null || mod.archived) continue;
    const stats = moduleStats(mod.id, subtopics);
    byNumber.set(num, {
      moduleNumber: num,
      name: mod.name,
      moduleId: mod.id,
      ...stats,
    });
  }

  return byNumber;
}

function phasePercent(modules: ModuleReadiness[]): number {
  if (modules.length === 0) return 0;
  return Math.round(modules.reduce((sum, m) => sum + m.percent, 0) / modules.length);
}

function checklistProgress(
  moduleNumbers: number[],
  byNumber: Map<number, ModuleReadiness>,
  threshold = 70
): { met: boolean; percent: number; progressLabel: string } {
  const modules = moduleNumbers.map((n) => byNumber.get(n)).filter(Boolean) as ModuleReadiness[];
  if (modules.length === 0) {
    return { met: false, percent: 0, progressLabel: "Modules not found in track" };
  }
  const avg = Math.round(modules.reduce((sum, m) => sum + m.percent, 0) / modules.length);
  const met = modules.every((m) => m.percent >= threshold);
  const detail = modules.map((m) => `M${m.moduleNumber} ${m.percent}%`).join(" · ");
  return { met, percent: avg, progressLabel: `${avg}% avg (${detail})` };
}

function deriveNextSteps(
  byNumber: Map<number, ModuleReadiness>,
  phases: JobReadinessReport["phases"],
  readyToApply: boolean,
  currentPhase: JobPhaseId
): string[] {
  const steps: string[] = [];
  const psHints = getPsWatchHintsForPhase(currentPhase);

  if (readyToApply) {
    steps.push("Start applying: 5–10 tailored applications per week with your live project URL.");
    steps.push("Finish taka-flow capstone MVP while interviewing (auth, RBAC, one core wallet flow).");
    steps.push("Add one Node.js or Python REST API for Bangladesh local keyword match.");
    return steps.slice(0, 3);
  }

  if (psHints.length > 0) {
    const hint = psHints[0];
    steps.push(
      `Watch PS course (${hint.courseModules}) while studying ${hint.pathModule}, then implement in Go.`
    );
  }

  const phaseA = phases.find((p) => p.id === "A");
  const incompleteA = phaseA?.modules.filter((m) => !m.complete && [0, 1, 2, 3, 4, 5, 6, 9].includes(m.moduleNumber)) ?? [];
  if (incompleteA.length > 0) {
    const next = incompleteA.sort((a, b) => a.moduleNumber - b.moduleNumber)[0];
    steps.push(`Focus Phase A: complete ${next.name} (${next.doneCount}/${next.totalCount} subtopics done).`);
  }

  const m4 = byNumber.get(4);
  const m9 = byNumber.get(9);
  if (m4 && m4.percent >= 50 && (!m9 || m9.percent < 30)) {
    steps.push("Build jobtrackr locally: CRUD, JWT, Postgres, Redis, tests, Docker Compose (Modules 4–6, 9).");
  }

  const m12 = byNumber.get(12);
  if ((phaseA?.percent ?? 0) >= 60 && (!m12 || m12.percent < 30)) {
    steps.push("Begin Module 12 deploy: VPC → IAM → EC2/ECS + RDS so you have a public HTTPS URL.");
  }

  if (steps.length === 0) {
    steps.push("Continue marking subtopics complete as you finish each learning block.");
    steps.push("Ship jobtrackr with HTTPS — that unlocks the apply-ready checklist.");
    steps.push("Prepare resume and pinned GitHub repos (Module 23).");
  }

  return steps.slice(0, 3);
}

export function isGoBackendModule(name: string): boolean {
  return GO_MODULE_RE.test(name);
}

export function buildJobReadinessReport(
  modules: Module[],
  _topics: Topic[],
  subtopics: Subtopic[]
): JobReadinessReport | null {
  const goModules = modules.filter((m) => isGoBackendModule(m.name) && !m.archived);
  if (goModules.length === 0) return null;

  const byNumber = buildModuleReadiness(modules, subtopics);

  const phases = JOB_PHASES.map((phase) => {
    const phaseModules = phase.moduleNumbers
      .map((n) => byNumber.get(n))
      .filter(Boolean) as ModuleReadiness[];
    const percent = phasePercent(phaseModules);
    return {
      ...phase,
      modules: phaseModules,
      percent,
      complete: percent >= 75,
    };
  });

  const corePhaseA = phases.find((p) => p.id === "A");
  const corePhaseB = phases.find((p) => p.id === "B");

  let currentPhase: JobPhaseId = "A";
  if (corePhaseA && corePhaseA.percent >= 70) currentPhase = "B";
  if (corePhaseA && corePhaseA.percent >= 70 && corePhaseB && corePhaseB.percent >= 60) currentPhase = "C";
  if (phases.every((p) => p.id === "D" || p.percent >= 75)) currentPhase = "D";

  const checklist: ChecklistItem[] = [...APPLY_CHECKLIST]
    .sort((a, b) => a.order - b.order)
    .map((item) => {
    const { met, percent, progressLabel } = checklistProgress(item.moduleNumbers, byNumber, item.threshold ?? 70);
    return { id: item.id, label: item.label, moduleNumbers: item.moduleNumbers, met, percent, progressLabel };
  });

  const readyToApply = checklist.every((c) => c.met);
  const employabilityPercent = Math.round(
    (checklist.filter((c) => c.met).length / checklist.length) * 100
  );

  const goModuleIds = new Set(goModules.map((m) => m.id));
  const goSubs = subtopics.filter((s) => goModuleIds.has(s.moduleId) && !s.archived);
  const psSubs = goSubs.filter((s) => isPsSubtopic(s.name));
  const psSubtopicsTotal = psSubs.length;
  const psSubtopicsDone = psSubs.filter((s) => isSubtopicDone(s.status)).length;

  const headline = readyToApply
    ? "Ready to start applying"
    : currentPhase === "A"
      ? "Building employable core"
      : currentPhase === "B"
        ? "Close to apply-ready — ship a live deploy"
        : currentPhase === "C"
          ? "Interviewing phase — add differentiators"
          : "Advanced / post-first-job topics";

  const summary = readyToApply
    ? `You've met the minimum employable checklist (${employabilityPercent}%). Start applications now while finishing Phase C differentiators.`
    : `You're in Phase ${currentPhase} (${phases.find((p) => p.id === currentPhase)?.name}). Phase A is ${corePhaseA?.percent ?? 0}% · Phase B is ${corePhaseB?.percent ?? 0}% · Apply checklist ${employabilityPercent}% complete · PS course ${psSubtopicsDone}/${psSubtopicsTotal} [PS] subtopics done.`;

  return {
    goBackendModuleCount: goModules.length,
    phases,
    currentPhase,
    readyToApply,
    employabilityPercent,
    checklist,
    nextSteps: deriveNextSteps(byNumber, phases, readyToApply, currentPhase),
    psWatchHints: getPsWatchHintsForPhase(currentPhase),
    psSubtopicsDone,
    psSubtopicsTotal,
    headline,
    summary,
  };
}
