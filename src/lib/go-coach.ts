import { differenceInCalendarDays, addDays, format } from "date-fns";
import type { LearningSession, Module, Subtopic, Topic } from "./types";
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
import { getModuleLoggedMs } from "./time-log";
import { isSubtopicDone, parseLocalDate, todayISO } from "./utils";

const MS_PER_HOUR = 3_600_000;
const DAYS_PER_WEEK = 7;

/** Used until there is enough history to derive a personal rate. */
export const FALLBACK_HOURS_PER_SUBTOPIC = 0.75;
/** Minimum completed subtopics before the global rate is trusted. */
const GLOBAL_SAMPLE_MIN = 5;
/** Minimum completed subtopics in a module before its own rate is trusted. */
const MODULE_SAMPLE_MIN = 3;

export type PaceVerdict = "ahead" | "on_track" | "behind" | "critical";

export interface CoachVelocity {
  /** Core Go subtopics completed per week. */
  subtopicsPerWeek: number;
  /** Hours logged against Go modules per week. */
  hoursPerWeek: number;
  subtopicsCompleted: number;
  hoursLogged: number;
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
  /** Hours per week needed from today to be apply-ready by the target date. */
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
  hoursPerSubtopic: number;
  hoursPerSubtopicIsEstimate: boolean;
  toApplyReady: RemainingWork;
  toFullPath: RemainingWork;
  byPhase: Array<{ id: JobPhaseId; name: string; remaining: RemainingWork; percent: number }>;
  recentVelocity: CoachVelocity;
  baselineVelocity: CoachVelocity;
  /** Projection using the faster of the two velocity windows. */
  optimistic: CoachProjection;
  /** Projection using the slower of the two velocity windows. */
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
 * Hours it historically takes you to finish one core subtopic.
 * Falls back to a flat estimate until there is enough completion history.
 */
export function deriveHoursPerSubtopic(
  totalGoHoursLogged: number,
  completedCoreSubtopics: number
): { hoursPerSubtopic: number; isEstimate: boolean } {
  if (completedCoreSubtopics < GLOBAL_SAMPLE_MIN || totalGoHoursLogged <= 0) {
    return { hoursPerSubtopic: FALLBACK_HOURS_PER_SUBTOPIC, isEstimate: true };
  }
  return {
    hoursPerSubtopic: totalGoHoursLogged / completedCoreSubtopics,
    isEstimate: false,
  };
}

/** Completions and hours over a trailing window, scoped to Go modules. */
export function measureVelocity(
  coreSubs: Subtopic[],
  scopedSessions: LearningSession[],
  weeks: number,
  now: Date
): CoachVelocity {
  const cutoff = addDays(now, -weeks * DAYS_PER_WEEK);

  const subtopicsCompleted = coreSubs.filter((s) => {
    if (!isSubtopicDone(s.status)) return false;
    const stamp = s.completionMeta?.completedAt ?? s.statusChangedAt;
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
    weeks,
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
  toApplyReady: RemainingWork,
  actualHoursPerWeek: number,
  hoursPerSubtopic: number,
  now: Date
): CoachTargetPlan | null {
  if (!targetDate) return null;

  const daysUntilTarget = differenceInCalendarDays(parseLocalDate(targetDate), now);
  const overdue = daysUntilTarget <= 0;
  const weeksUntilTarget = Math.max(daysUntilTarget / DAYS_PER_WEEK, 1 / DAYS_PER_WEEK);

  const requiredHoursPerWeek = overdue
    ? toApplyReady.hours
    : toApplyReady.hours / weeksUntilTarget;
  const requiredSubtopicsPerWeek =
    hoursPerSubtopic > 0 ? requiredHoursPerWeek / hoursPerSubtopic : 0;

  // Nothing left to do means you are trivially on pace.
  const paceRatio =
    toApplyReady.hours <= 0
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
    verdict: overdue && toApplyReady.hours > 0 ? "critical" : verdictFor(paceRatio),
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
  const completedCore = coreSubs.filter((s) => isSubtopicDone(s.status)).length;

  const { hoursPerSubtopic, isEstimate } = deriveHoursPerSubtopic(
    totalGoHoursLogged,
    completedCore
  );

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
    // Prefer the module's own observed rate once it has enough completions.
    const moduleRate =
      stats.doneCount >= MODULE_SAMPLE_MIN && loggedHours > 0
        ? loggedHours / stats.doneCount
        : hoursPerSubtopic;

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
      hoursPerSubtopic: round1(moduleRate),
      hoursRemaining: round1(subtopicsRemaining * moduleRate),
      hoursToThreshold: round1(subtopicsToThreshold * moduleRate),
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

  const fastHours = Math.max(recentVelocity.hoursPerWeek, baselineVelocity.hoursPerWeek);
  const slowHours = Math.min(recentVelocity.hoursPerWeek, baselineVelocity.hoursPerWeek);

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
    optimistic: projectFinish(toApplyReady.hours, fastHours, now),
    conservative: projectFinish(toApplyReady.hours, slowHours, now),
    targetPlan: buildTargetPlan(
      targetDate,
      toApplyReady,
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
  const totalHours = report.toApplyReady.hours;
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
