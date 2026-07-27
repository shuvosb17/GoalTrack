import { differenceInCalendarDays, addDays, format } from "date-fns";
import type { Difficulty, LearningSession, Module, Subtopic, Topic } from "./types";
import {
  APPLY_CHECKLIST,
  DEFAULT_CHECKLIST_THRESHOLD,
  JOB_PHASES,
  isGoBackendModule,
  parseModuleNumber,
  type JobPhaseId,
  type JobReadinessReport,
  type ModuleReadiness,
} from "./job-readiness";
import { isPsSubtopic } from "./ps-course-integration";
import { GO_BACKEND_PROJECT_TOPIC_PREFIX } from "./go-backend-projects";
import { getModuleLoggedMs } from "./time-log";
import { isSubtopicDone, parseLocalDate, todayISO } from "./utils";

const MS_PER_HOUR = 3_600_000;
const DAYS_PER_WEEK = 7;

/**
 * Difficulty-weighted cost units. A "unit" is one medium concept subtopic.
 * Hard/expert material and project deliverables cost more; ignoring that was
 * the main source of optimistic bias (rates get calibrated on the easy items
 * you complete first, then applied to concurrency/AWS/capstone work).
 */
const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  easy: 0.7,
  medium: 1,
  hard: 1.5,
  expert: 2,
};

/** Project deliverables are build work, not reading — they cost extra on top of difficulty. */
const PROJECT_WEIGHT_MULTIPLIER = 1.5;

/**
 * Prior: one weighted unit ≈ 1 hour for a beginner (watch/read + hands-on +
 * notes). The old 0.75h flat fallback assumed uniform difficulty and no
 * practice overhead.
 */
export const PRIOR_HOURS_PER_UNIT = 1.0;
/**
 * Shrinkage weight (in units) for the personal rate. The observed rate only
 * dominates once you've completed meaningfully more than this many weighted
 * units — a handful of easy completions can no longer set the global rate.
 */
const GLOBAL_PRIOR_WEIGHT_UNITS = 20;
/** Shrinkage weight for per-module rates (they see far fewer samples). */
const MODULE_PRIOR_WEIGHT_UNITS = 5;

/**
 * Review / re-learning overhead applied to the conservative plan. Spaced
 * review, returning to stalled modules, and forgetting are real costs the
 * raw burndown never carried.
 */
export const CONSERVATIVE_BUFFER = 1.25;

export type PaceVerdict = "ahead" | "on_track" | "behind" | "critical";

export interface CoachVelocity {
  /** Core Go subtopics completed per week. */
  subtopicsPerWeek: number;
  /** Hours logged against Go modules per week. */
  hoursPerWeek: number;
  subtopicsCompleted: number;
  hoursLogged: number;
  /** Effective window — clamped to your actual history span. */
  weeks: number;
}

export interface ModuleBudget {
  moduleNumber: number;
  moduleId: string;
  name: string;
  phaseId: JobPhaseId;
  doneCount: number;
  totalCount: number;
  percent: number;
  /** Subtopics left to fully finish the module. */
  subtopicsRemaining: number;
  /** Subtopics left to reach the apply-checklist threshold (0 when not gating). */
  subtopicsToThreshold: number;
  /** Threshold percent this module must reach for the checklist, when it gates one. */
  thresholdPercent: number | null;
  /** Checklist item ids this module blocks. */
  blockingChecklistIds: string[];
  /** Expected cost of one remaining subtopic in this module (difficulty-aware). */
  hoursPerSubtopic: number;
  hoursRemaining: number;
  hoursToThreshold: number;
  loggedHours: number;
  inProgress: boolean;
  complete: boolean;
  /** Days since the most recent session touching this module; null when never studied. */
  daysSinceLastSession: number | null;
}

export interface RemainingWork {
  subtopics: number;
  hours: number;
}

export interface CoachProjection {
  /** Weeks to apply-ready at the given weekly hours; null when pace is zero. */
  weeks: number | null;
  /** ISO date (yyyy-MM-dd) of the projected apply-ready day; null when pace is zero. */
  date: string | null;
  hoursPerWeek: number;
}

export interface CoachTargetPlan {
  targetDate: string;
  daysUntilTarget: number;
  weeksUntilTarget: number;
  /** Hours per week needed from today to be apply-ready by the target date (incl. review buffer). */
  requiredHoursPerWeek: number;
  /** Core subtopics per week needed from today. */
  requiredSubtopicsPerWeek: number;
  /** requiredHoursPerWeek minus current actual — positive means a shortfall. */
  gapHoursPerWeek: number;
  verdict: PaceVerdict;
  /** Ratio of actual pace to required pace. */
  paceRatio: number;
  /** Whether the target date has already passed. */
  overdue: boolean;
}

export interface GoCoachReport {
  generatedAt: string;
  moduleBudgets: ModuleBudget[];
  /** Modules that still gate at least one apply-checklist item. */
  blockingModules: ModuleBudget[];
  /** Sorted by hoursToThreshold — the fastest checklist items to close. */
  cheapestWins: ModuleBudget[];
  /** Expected cost of an average remaining subtopic across the path. */
  hoursPerSubtopic: number;
  hoursPerSubtopicIsEstimate: boolean;
  toApplyReady: RemainingWork;
  toFullPath: RemainingWork;
  byPhase: Array<{ id: JobPhaseId; name: string; remaining: RemainingWork; percent: number }>;
  recentVelocity: CoachVelocity;
  baselineVelocity: CoachVelocity;
  /** Projection at your recent pace with no buffer. */
  expected: CoachProjection;
  /** Projection at your slower window pace with the review buffer applied. */
  conservative: CoachProjection;
  targetPlan: CoachTargetPlan | null;
  totalGoHoursLogged: number;
  readyToApply: boolean;
}

export interface GoCoachInput {
  modules: Module[];
  topics: Topic[];
  subtopics: Subtopic[];
  sessions: LearningSession[];
  readiness: JobReadinessReport;
  targetDate?: string;
  now?: Date;
}

function hoursFromMs(ms: number): number {
  return ms / MS_PER_HOUR;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Every Go module belongs to exactly one phase; falls back to D for unmapped numbers. */
function phaseForModule(moduleNumber: number): JobPhaseId {
  const phase = JOB_PHASES.find((p) => p.moduleNumbers.includes(moduleNumber));
  return phase?.id ?? "D";
}

/** Flattens the readiness phases into one lookup keyed by module number. */
function readinessByNumber(readiness: JobReadinessReport): Map<number, ModuleReadiness> {
  const map = new Map<number, ModuleReadiness>();
  for (const phase of readiness.phases) {
    for (const mod of phase.modules) {
      map.set(mod.moduleNumber, mod);
    }
  }
  return map;
}

/** Module number -> { threshold, checklistIds } for every module that gates the apply checklist. */
function checklistGates(): Map<number, { threshold: number; ids: string[] }> {
  const gates = new Map<number, { threshold: number; ids: string[] }>();
  for (const item of APPLY_CHECKLIST) {
    const threshold = item.threshold ?? DEFAULT_CHECKLIST_THRESHOLD;
    for (const num of item.moduleNumbers) {
      const existing = gates.get(num);
      if (existing) {
        existing.threshold = Math.max(existing.threshold, threshold);
        existing.ids.push(item.id);
      } else {
        gates.set(num, { threshold, ids: [item.id] });
      }
    }
  }
  return gates;
}

/** Subtopics still needed for a module to reach `thresholdPercent`. */
function subtopicsToReach(
  thresholdPercent: number,
  doneCount: number,
  totalCount: number
): number {
  if (totalCount === 0) return 0;
  const needed = Math.ceil((thresholdPercent / 100) * totalCount);
  return Math.max(0, needed - doneCount);
}

function goModuleIdSet(modules: Module[]): Set<string> {
  return new Set(
    modules.filter((m) => isGoBackendModule(m.name) && !m.archived).map((m) => m.id)
  );
}

/** Core (non-[PS]) subtopics inside active topics of Go modules. */
function coreGoSubtopics(
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[]
): Subtopic[] {
  const moduleIds = goModuleIdSet(modules);
  const activeTopicIds = new Set(topics.filter((t) => !t.archived).map((t) => t.id));
  return subtopics.filter(
    (s) =>
      moduleIds.has(s.moduleId) &&
      !s.archived &&
      activeTopicIds.has(s.topicId) &&
      !isPsSubtopic(s.name)
  );
}

/** Difficulty- and project-weighted cost of one subtopic, in units. */
export function subtopicUnits(sub: Subtopic, isProjectTopic: boolean): number {
  const base = DIFFICULTY_WEIGHT[sub.difficulty] ?? 1;
  return isProjectTopic ? base * PROJECT_WEIGHT_MULTIPLIER : base;
}

/**
 * Module a session belongs to, resolved through its subtopic or topic when the
 * session was not logged against a module directly.
 */
export function resolveSessionModuleId(
  session: LearningSession,
  topicModule: Map<string, string>,
  subtopicModule: Map<string, string>
): string | undefined {
  if (session.subtopicId) {
    const modId = subtopicModule.get(session.subtopicId);
    if (modId) return modId;
  }
  if (session.topicId) {
    const modId = topicModule.get(session.topicId);
    if (modId) return modId;
  }
  return session.moduleId;
}

/**
 * Sessions that count toward the Go path. `sessions` is expected to be scoped to
 * the Development track already, so unattributed track-level time still counts
 * toward total hours even though it cannot be costed to a module.
 */
export function scopeGoSessions(
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[],
  sessions: LearningSession[]
): LearningSession[] {
  const moduleIds = goModuleIdSet(modules);
  const topicModule = new Map(topics.map((t) => [t.id, t.moduleId]));
  const subtopicModule = new Map(subtopics.map((s) => [s.id, s.moduleId]));
  return sessions.filter((s) => {
    const modId = resolveSessionModuleId(s, topicModule, subtopicModule);
    if (modId) return moduleIds.has(modId);
    return !s.subtopicId && !s.topicId && !s.moduleId;
  });
}

/**
 * Personal hours-per-unit with Bayesian shrinkage toward the beginner prior.
 * With little history the prior dominates; the observed rate only takes over
 * as completed weighted units grow. This replaces the old rule that trusted
 * any 5 completions outright.
 */
export function deriveHoursPerUnit(
  totalGoHoursLogged: number,
  completedUnits: number
): { hoursPerUnit: number; isEstimate: boolean } {
  const hoursPerUnit =
    (totalGoHoursLogged + GLOBAL_PRIOR_WEIGHT_UNITS * PRIOR_HOURS_PER_UNIT) /
    (completedUnits + GLOBAL_PRIOR_WEIGHT_UNITS);
  return {
    hoursPerUnit,
    isEstimate: completedUnits < GLOBAL_PRIOR_WEIGHT_UNITS,
  };
}

function completedAtOf(sub: Subtopic): string | undefined {
  return sub.completionMeta?.completedAt ?? sub.statusChangedAt;
}

/**
 * Completions and hours over a trailing window. The window is clamped to your
 * actual history span so weeks before you started don't dilute the average.
 */
export function measureVelocity(
  coreSubs: Subtopic[],
  scopedSessions: LearningSession[],
  windowWeeks: number,
  now: Date
): CoachVelocity {
  let earliest: Date | null = null;
  for (const s of scopedSessions) {
    const d = parseLocalDate(s.date);
    if (!earliest || d < earliest) earliest = d;
  }
  for (const s of coreSubs) {
    const stamp = completedAtOf(s);
    if (!stamp) continue;
    const d = new Date(stamp);
    if (!earliest || d < earliest) earliest = d;
  }

  const historyWeeks = earliest
    ? Math.max(differenceInCalendarDays(now, earliest) / DAYS_PER_WEEK, 1)
    : windowWeeks;
  const weeks = Math.min(windowWeeks, historyWeeks);
  const cutoff = addDays(now, -weeks * DAYS_PER_WEEK);

  const subtopicsCompleted = coreSubs.filter((s) => {
    if (!isSubtopicDone(s.status)) return false;
    const stamp = completedAtOf(s);
    if (!stamp) return false;
    return new Date(stamp) >= cutoff;
  }).length;

  const hoursLogged = hoursFromMs(
    scopedSessions
      .filter((s) => parseLocalDate(s.date) >= cutoff)
      .reduce((sum, s) => sum + s.duration, 0)
  );

  return {
    subtopicsPerWeek: subtopicsCompleted / weeks,
    hoursPerWeek: hoursLogged / weeks,
    subtopicsCompleted,
    hoursLogged,
    weeks: round1(weeks),
  };
}

/** Weeks and finish date to burn down `hours` at `hoursPerWeek`. */
export function projectFinish(
  hoursRemaining: number,
  hoursPerWeek: number,
  now: Date
): CoachProjection {
  if (hoursRemaining <= 0) {
    return { weeks: 0, date: format(now, "yyyy-MM-dd"), hoursPerWeek };
  }
  if (hoursPerWeek <= 0) {
    return { weeks: null, date: null, hoursPerWeek };
  }
  const weeks = hoursRemaining / hoursPerWeek;
  const date = format(addDays(now, Math.ceil(weeks * DAYS_PER_WEEK)), "yyyy-MM-dd");
  return { weeks: round1(weeks), date, hoursPerWeek };
}

function verdictFor(paceRatio: number): PaceVerdict {
  if (paceRatio >= 1.1) return "ahead";
  if (paceRatio >= 0.9) return "on_track";
  if (paceRatio >= 0.65) return "behind";
  return "critical";
}

function buildTargetPlan(
  targetDate: string | undefined,
  bufferedApplyHours: number,
  actualHoursPerWeek: number,
  hoursPerAvgSubtopic: number,
  now: Date
): CoachTargetPlan | null {
  if (!targetDate) return null;

  const daysUntilTarget = differenceInCalendarDays(parseLocalDate(targetDate), now);
  const overdue = daysUntilTarget <= 0;
  const weeksUntilTarget = Math.max(daysUntilTarget / DAYS_PER_WEEK, 1 / DAYS_PER_WEEK);

  const requiredHoursPerWeek = overdue
    ? bufferedApplyHours
    : bufferedApplyHours / weeksUntilTarget;
  const requiredSubtopicsPerWeek =
    hoursPerAvgSubtopic > 0 ? requiredHoursPerWeek / hoursPerAvgSubtopic : 0;

  // Nothing left to do means you are trivially on pace.
  const paceRatio =
    bufferedApplyHours <= 0
      ? 2
      : requiredHoursPerWeek <= 0
        ? 2
        : actualHoursPerWeek / requiredHoursPerWeek;

  return {
    targetDate,
    daysUntilTarget,
    weeksUntilTarget: round1(weeksUntilTarget),
    requiredHoursPerWeek: round1(requiredHoursPerWeek),
    requiredSubtopicsPerWeek: round1(requiredSubtopicsPerWeek),
    gapHoursPerWeek: round1(requiredHoursPerWeek - actualHoursPerWeek),
    verdict: overdue && bufferedApplyHours > 0 ? "critical" : verdictFor(paceRatio),
    paceRatio,
    overdue,
  };
}

export function buildGoCoachReport({
  modules,
  topics,
  subtopics,
  sessions,
  readiness,
  targetDate,
  now = new Date(),
}: GoCoachInput): GoCoachReport {
  const coreSubs = coreGoSubtopics(modules, topics, subtopics);
  const scopedSessions = scopeGoSessions(modules, topics, subtopics, sessions);
  const totalGoHoursLogged = hoursFromMs(
    scopedSessions.reduce((sum, s) => sum + s.duration, 0)
  );

  const projectTopicIds = new Set(
    topics
      .filter((t) => !t.archived && t.name.startsWith(GO_BACKEND_PROJECT_TOPIC_PREFIX))
      .map((t) => t.id)
  );
  const unitsOf = (s: Subtopic) => subtopicUnits(s, projectTopicIds.has(s.topicId));

  const completedUnits = coreSubs
    .filter((s) => isSubtopicDone(s.status))
    .reduce((sum, s) => sum + unitsOf(s), 0);

  const { hoursPerUnit, isEstimate } = deriveHoursPerUnit(
    totalGoHoursLogged,
    completedUnits
  );

  // Average weight of a *remaining* subtopic across the whole path — what one
  // future subtopic actually costs, given the harder mix that lies ahead.
  const remainingSubs = coreSubs.filter((s) => !isSubtopicDone(s.status));
  const avgRemainingWeight =
    remainingSubs.length > 0
      ? remainingSubs.reduce((sum, s) => sum + unitsOf(s), 0) / remainingSubs.length
      : 1;
  const hoursPerSubtopic = hoursPerUnit * avgRemainingWeight;

  const byNumber = readinessByNumber(readiness);
  const gates = checklistGates();
  const topicModule = new Map(topics.map((t) => [t.id, t.moduleId]));
  const subtopicModule = new Map(subtopics.map((s) => [s.id, s.moduleId]));
  const lastSessionByModule = new Map<string, string>();
  for (const session of scopedSessions) {
    const modId = resolveSessionModuleId(session, topicModule, subtopicModule);
    if (!modId) continue;
    const prev = lastSessionByModule.get(modId);
    if (!prev || session.date > prev) lastSessionByModule.set(modId, session.date);
  }

  // Weighted units per module, split done vs remaining.
  const moduleUnits = new Map<
    string,
    { doneUnits: number; remainingUnits: number; remainingCount: number }
  >();
  for (const sub of coreSubs) {
    const entry =
      moduleUnits.get(sub.moduleId) ??
      { doneUnits: 0, remainingUnits: 0, remainingCount: 0 };
    const units = unitsOf(sub);
    if (isSubtopicDone(sub.status)) {
      entry.doneUnits += units;
    } else {
      entry.remainingUnits += units;
      entry.remainingCount += 1;
    }
    moduleUnits.set(sub.moduleId, entry);
  }

  const moduleBudgets: ModuleBudget[] = [];

  for (const mod of modules) {
    if (!isGoBackendModule(mod.name) || mod.archived) continue;
    const moduleNumber = parseModuleNumber(mod.name);
    if (moduleNumber == null) continue;

    const stats = byNumber.get(moduleNumber);
    if (!stats) continue;

    const gate = gates.get(moduleNumber) ?? null;
    const subtopicsRemaining = Math.max(0, stats.totalCount - stats.doneCount);
    const subtopicsToThreshold = gate
      ? subtopicsToReach(gate.threshold, stats.doneCount, stats.totalCount)
      : 0;

    const loggedHours = hoursFromMs(
      getModuleLoggedMs(mod.id, topics, subtopics, sessions)
    );

    const units = moduleUnits.get(mod.id) ?? {
      doneUnits: 0,
      remainingUnits: 0,
      remainingCount: 0,
    };

    // Module rate with shrinkage toward the global rate — a module's own
    // history refines the estimate but a few easy completions can't set it.
    const moduleRate =
      (loggedHours + MODULE_PRIOR_WEIGHT_UNITS * hoursPerUnit) /
      (units.doneUnits + MODULE_PRIOR_WEIGHT_UNITS);

    const avgModuleRemainingWeight =
      units.remainingCount > 0 ? units.remainingUnits / units.remainingCount : 1;

    const lastDate = lastSessionByModule.get(mod.id);

    moduleBudgets.push({
      moduleNumber,
      moduleId: mod.id,
      name: mod.name,
      phaseId: phaseForModule(moduleNumber),
      doneCount: stats.doneCount,
      totalCount: stats.totalCount,
      percent: stats.percent,
      subtopicsRemaining,
      subtopicsToThreshold,
      thresholdPercent: gate?.threshold ?? null,
      blockingChecklistIds: gate && subtopicsToThreshold > 0 ? gate.ids : [],
      hoursPerSubtopic: round1(moduleRate * avgModuleRemainingWeight),
      hoursRemaining: round1(units.remainingUnits * moduleRate),
      hoursToThreshold: round1(
        subtopicsToThreshold * avgModuleRemainingWeight * moduleRate
      ),
      loggedHours: round1(loggedHours),
      inProgress: stats.inProgress,
      complete: stats.complete,
      daysSinceLastSession: lastDate
        ? differenceInCalendarDays(now, parseLocalDate(lastDate))
        : null,
    });
  }

  moduleBudgets.sort((a, b) => a.moduleNumber - b.moduleNumber);

  const blockingModules = moduleBudgets.filter((m) => m.subtopicsToThreshold > 0);
  const cheapestWins = [...blockingModules].sort(
    (a, b) => a.hoursToThreshold - b.hoursToThreshold
  );

  const toApplyReady: RemainingWork = {
    subtopics: blockingModules.reduce((sum, m) => sum + m.subtopicsToThreshold, 0),
    hours: round1(blockingModules.reduce((sum, m) => sum + m.hoursToThreshold, 0)),
  };

  const toFullPath: RemainingWork = {
    subtopics: moduleBudgets.reduce((sum, m) => sum + m.subtopicsRemaining, 0),
    hours: round1(moduleBudgets.reduce((sum, m) => sum + m.hoursRemaining, 0)),
  };

  const byPhase = JOB_PHASES.map((phase) => {
    const phaseModules = moduleBudgets.filter((m) => m.phaseId === phase.id);
    return {
      id: phase.id,
      name: phase.name,
      remaining: {
        subtopics: phaseModules.reduce((sum, m) => sum + m.subtopicsRemaining, 0),
        hours: round1(phaseModules.reduce((sum, m) => sum + m.hoursRemaining, 0)),
      },
      percent: readiness.phases.find((p) => p.id === phase.id)?.percent ?? 0,
    };
  });

  const recentVelocity = measureVelocity(coreSubs, scopedSessions, 4, now);
  const baselineVelocity = measureVelocity(coreSubs, scopedSessions, 12, now);

  // Expected: your recent sustained pace, no window cherry-picking.
  // Conservative: your slower window plus the review/re-learning buffer.
  const slowHours = Math.min(recentVelocity.hoursPerWeek, baselineVelocity.hoursPerWeek);
  const bufferedApplyHours = round1(toApplyReady.hours * CONSERVATIVE_BUFFER);

  return {
    generatedAt: todayISO(),
    moduleBudgets,
    blockingModules,
    cheapestWins,
    hoursPerSubtopic: round1(hoursPerSubtopic),
    hoursPerSubtopicIsEstimate: isEstimate,
    toApplyReady,
    toFullPath,
    byPhase,
    recentVelocity,
    baselineVelocity,
    expected: projectFinish(toApplyReady.hours, recentVelocity.hoursPerWeek, now),
    conservative: projectFinish(bufferedApplyHours, slowHours, now),
    targetPlan: buildTargetPlan(
      targetDate,
      bufferedApplyHours,
      recentVelocity.hoursPerWeek,
      hoursPerSubtopic,
      now
    ),
    totalGoHoursLogged: round1(totalGoHoursLogged),
    readyToApply: readiness.readyToApply,
  };
}

/** Remaining-hours burndown from today to the target (or projected) finish. */
export function buildBurndownSeries(
  report: GoCoachReport,
  now = new Date()
): Array<{ label: string; projected: number | null; required: number | null }> {
  // Burn down the buffered load so the required-pace line reaches zero exactly
  // at the target date instead of pretending the buffer is free.
  const totalHours = round1(report.toApplyReady.hours * CONSERVATIVE_BUFFER);
  if (totalHours <= 0) return [];

  const paceHours = report.recentVelocity.hoursPerWeek;
  const requiredHours = report.targetPlan?.requiredHoursPerWeek ?? 0;

  const projectedWeeks = paceHours > 0 ? Math.ceil(totalHours / paceHours) : 0;
  const requiredWeeks = requiredHours > 0 ? Math.ceil(totalHours / requiredHours) : 0;
  const horizon = Math.min(Math.max(projectedWeeks, requiredWeeks, 4), 52);

  const points: Array<{ label: string; projected: number | null; required: number | null }> = [];
  for (let week = 0; week <= horizon; week++) {
    const projected = paceHours > 0 ? Math.max(0, totalHours - paceHours * week) : null;
    const required =
      requiredHours > 0 ? Math.max(0, totalHours - requiredHours * week) : null;
    points.push({
      label: format(addDays(now, week * DAYS_PER_WEEK), "MMM d"),
      projected: projected == null ? null : round1(projected),
      required: required == null ? null : round1(required),
    });
  }
  return points;
}
