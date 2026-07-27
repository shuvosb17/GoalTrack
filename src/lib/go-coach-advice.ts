import { addDays, differenceInCalendarDays, format } from "date-fns";
import type { LearningSession, Module, Subtopic, Topic } from "./types";
import type { MomentumBreakdown } from "./types/metrics";
import {
  CONSERVATIVE_BUFFER,
  resolveSessionModuleId,
  scopeGoSessions,
  type GoCoachReport,
  type ModuleBudget,
  type PaceVerdict,
} from "./go-coach";
import type { JobPhaseId, JobReadinessReport } from "./job-readiness";
import { isGoBackendModule } from "./job-readiness";
import { isPsSubtopic } from "./ps-course-integration";
import { isSubtopicDone, parseLocalDate, todayISO } from "./utils";

const MS_PER_HOUR = 3_600_000;
/** A module counts as stalled after this many days without a session. */
export const STALL_DAYS = 14;
/** More open modules than this splits attention too thin. */
export const MAX_HEALTHY_WIP = 3;

export interface PaceDiagnosis {
  verdict: PaceVerdict;
  label: string;
  headline: string;
  /** The single dominant reason progress is slower than it should be. */
  dragCause: string;
  /** One concrete action that addresses the drag cause. */
  correction: string;
  tone: "positive" | "neutral" | "warning" | "critical";
}

export interface Bottleneck {
  id: string;
  kind: "stalled" | "wip" | "near_miss";
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
}

export interface PlanItem {
  id: string;
  moduleNumber: number;
  moduleName: string;
  topicName: string;
  subtopicsRemaining: number;
  estimatedHours: number;
  /** Why this item earned its slot in the week. */
  reason: string;
  blocksChecklist: boolean;
}

export interface WeeklyPlan {
  capacityHours: number;
  plannedHours: number;
  items: PlanItem[];
  /** True when the blocking backlog is smaller than the week's capacity. */
  capacitySpare: boolean;
}

export interface WeeklyReport {
  hoursThisWeek: number;
  hoursPriorWeek: number;
  hoursDelta: number;
  subtopicsThisWeek: number;
  subtopicsPriorWeek: number;
  subtopicsDelta: number;
  modulesTouched: number;
  activeDays: number;
  /** Percent of the required weekly hours actually logged; null without a target. */
  targetAttainment: number | null;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
  correctiveAction: string;
}

export interface RetentionDebt {
  topicsDue: number;
  subtopicsDue: number;
  totalDue: number;
  /** Completions rated 1–2 confidence that are not yet re-reviewed. */
  lowConfidenceCount: number;
  lowConfidenceItems: Array<{ id: string; name: string; moduleName: string; rating: number }>;
  /** Share of Go completions carrying review debt. */
  debtPercent: number;
  inflatedReadiness: boolean;
  message: string;
}

const VERDICT_LABEL: Record<PaceVerdict, string> = {
  ahead: "Ahead of pace",
  on_track: "On track",
  behind: "Behind pace",
  critical: "Critically behind",
};

const VERDICT_TONE: Record<PaceVerdict, PaceDiagnosis["tone"]> = {
  ahead: "positive",
  on_track: "neutral",
  behind: "warning",
  critical: "critical",
};

function hoursFromMs(ms: number): number {
  return ms / MS_PER_HOUR;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function goModuleIds(modules: Module[]): Set<string> {
  return new Set(
    modules.filter((m) => isGoBackendModule(m.name) && !m.archived).map((m) => m.id)
  );
}

function completedAtOf(item: Subtopic): string | undefined {
  return item.completionMeta?.completedAt ?? item.statusChangedAt;
}

/**
 * Explains the pace verdict with the one cause that matters most, preferring
 * Go-specific evidence over the generic all-track momentum drag.
 */
export function diagnosePace(
  report: GoCoachReport,
  momentum: MomentumBreakdown | null,
  bottlenecks: Bottleneck[]
): PaceDiagnosis {
  const plan = report.targetPlan;
  const verdict = plan?.verdict ?? (report.recentVelocity.hoursPerWeek > 0 ? "on_track" : "behind");
  const actual = round1(report.recentVelocity.hoursPerWeek);

  if (report.readyToApply) {
    return {
      verdict: "ahead",
      label: "Apply-ready",
      headline: "Every checklist item is met — the remaining path is upside, not a blocker.",
      dragCause: "Nothing is gating your applications right now.",
      correction: "Shift hours from learning to applications: 5–10 tailored sends per week.",
      tone: "positive",
    };
  }

  let headline: string;
  if (!plan) {
    headline = `You're logging ${actual}h/week on the Go path. Set a target apply date to turn that into a deadline.`;
  } else if (plan.overdue) {
    headline = `Your target date has passed with ${report.toApplyReady.hours}h of checklist work left.`;
  } else {
    headline = `You need ${plan.requiredHoursPerWeek}h/week to be apply-ready by ${format(parseLocalDate(plan.targetDate), "MMM d, yyyy")}; you're averaging ${actual}h/week.`;
  }

  // Ordered by how directly each cause explains a Go-path shortfall.
  const stalled = bottlenecks.find((b) => b.kind === "stalled");
  const wip = bottlenecks.find((b) => b.kind === "wip");

  let dragCause: string;
  let correction: string;

  if (plan && plan.gapHoursPerWeek > 0 && plan.gapHoursPerWeek >= actual * 0.5) {
    const perDay = round1(plan.requiredHoursPerWeek / 7);
    dragCause = `Raw hours. You're ${round1(plan.gapHoursPerWeek)}h/week short of the pace your target date demands.`;
    correction = `Book ${perDay}h/day, every day, or move the target date out by ${Math.max(1, Math.ceil((report.toApplyReady.hours * CONSERVATIVE_BUFFER) / Math.max(actual, 0.5) - plan.weeksUntilTarget))} weeks.`;
  } else if (wip) {
    dragCause = wip.detail;
    correction = "Close one module to its checklist threshold before opening anything new.";
  } else if (stalled) {
    dragCause = stalled.detail;
    correction = `Spend the next session on ${stalled.title} to bring it back into rotation.`;
  } else if (report.recentVelocity.hoursPerWeek < report.baselineVelocity.hoursPerWeek * 0.75) {
    dragCause = `Your last 4 weeks (${actual}h/week) are running below your 12-week average (${round1(report.baselineVelocity.hoursPerWeek)}h/week).`;
    correction = "Restore your old rhythm before adding scope — schedule fixed study blocks.";
  } else if (momentum) {
    dragCause = momentum.dragMessage;
    correction = "Fix the weakest momentum component first; the rest follows.";
  } else {
    dragCause = "No clear single drag — progress is limited by total time available.";
    correction = "Add one extra study block per week and re-check this card.";
  }

  return {
    verdict,
    label: VERDICT_LABEL[verdict],
    headline,
    dragCause,
    correction,
    tone: VERDICT_TONE[verdict],
  };
}

/** Stalled modules, too much work-in-progress, and modules a hair under their threshold. */
export function detectBottlenecks(report: GoCoachReport): Bottleneck[] {
  const bottlenecks: Bottleneck[] = [];

  const openModules = report.moduleBudgets.filter((m) => m.inProgress && !m.complete);

  for (const mod of openModules) {
    if (mod.daysSinceLastSession != null && mod.daysSinceLastSession >= STALL_DAYS) {
      bottlenecks.push({
        id: `stalled-${mod.moduleId}`,
        kind: "stalled",
        title: mod.name,
        detail: `Open at ${mod.percent}% with no session for ${mod.daysSinceLastSession} days — ${mod.subtopicsRemaining} subtopics still parked.`,
        severity: mod.blockingChecklistIds.length > 0 ? "high" : "medium",
      });
    }
  }

  if (openModules.length > MAX_HEALTHY_WIP) {
    bottlenecks.push({
      id: "wip",
      kind: "wip",
      title: `${openModules.length} modules open at once`,
      detail: `${openModules.length} modules are in progress but none are finished. Splitting attention past ${MAX_HEALTHY_WIP} modules delays every checklist item.`,
      severity: "high",
    });
  }

  for (const mod of report.blockingModules) {
    if (mod.subtopicsToThreshold > 0 && mod.subtopicsToThreshold <= 2) {
      bottlenecks.push({
        id: `near-${mod.moduleId}`,
        kind: "near_miss",
        title: mod.name,
        detail: `${mod.subtopicsToThreshold} subtopic${mod.subtopicsToThreshold === 1 ? "" : "s"} (~${mod.hoursToThreshold}h) from clearing its checklist threshold of ${mod.thresholdPercent}%.`,
        severity: "low",
      });
    }
  }

  const order: Record<Bottleneck["severity"], number> = { high: 0, medium: 1, low: 2 };
  return bottlenecks.sort((a, b) => order[a.severity] - order[b.severity]);
}

/** Modules the current phase wants first, then the cheapest checklist wins anywhere. */
function prioritiseModules(
  report: GoCoachReport,
  currentPhase: JobPhaseId
): ModuleBudget[] {
  const scored = report.moduleBudgets
    .filter((m) => m.subtopicsRemaining > 0)
    .map((m) => {
      let score = 0;
      if (m.subtopicsToThreshold > 0) score -= 100;
      if (m.phaseId === currentPhase) score -= 50;
      if (m.inProgress) score -= 25;
      score += m.hoursToThreshold > 0 ? m.hoursToThreshold : m.hoursRemaining;
      return { mod: m, score };
    });

  return scored.sort((a, b) => a.score - b.score).map((s) => s.mod);
}

/**
 * Fills one week of capacity with concrete topics, prioritising work that
 * unblocks the apply checklist in the phase you are currently in.
 */
export function buildNextSevenDays(
  report: GoCoachReport,
  readiness: JobReadinessReport,
  topics: Topic[],
  subtopics: Subtopic[],
  capacityHours: number
): WeeklyPlan {
  const items: PlanItem[] = [];
  let remainingCapacity = capacityHours;

  const activeTopics = topics.filter((t) => !t.archived);
  const topicsByModule = new Map<string, Topic[]>();
  for (const topic of activeTopics) {
    const list = topicsByModule.get(topic.moduleId);
    if (list) list.push(topic);
    else topicsByModule.set(topic.moduleId, [topic]);
  }

  for (const mod of prioritiseModules(report, readiness.currentPhase)) {
    if (remainingCapacity <= 0.25) break;

    const modTopics = (topicsByModule.get(mod.moduleId) ?? []).sort(
      (a, b) => a.order - b.order
    );

    for (const topic of modTopics) {
      if (remainingCapacity <= 0.25) break;

      const open = subtopics.filter(
        (s) =>
          s.topicId === topic.id &&
          !s.archived &&
          !isPsSubtopic(s.name) &&
          !isSubtopicDone(s.status)
      );
      if (open.length === 0) continue;

      // Never plan more of a topic than the week can actually absorb.
      const affordable = Math.max(
        1,
        Math.min(open.length, Math.floor(remainingCapacity / Math.max(mod.hoursPerSubtopic, 0.25)))
      );
      const estimatedHours = round1(affordable * mod.hoursPerSubtopic);

      items.push({
        id: `${topic.id}`,
        moduleNumber: mod.moduleNumber,
        moduleName: mod.name,
        topicName: topic.name,
        subtopicsRemaining: affordable,
        estimatedHours,
        reason:
          mod.subtopicsToThreshold > 0
            ? `Unblocks the apply checklist (${mod.thresholdPercent}% threshold, now ${mod.percent}%)`
            : mod.phaseId === readiness.currentPhase
              ? `Phase ${mod.phaseId} work — keeps the current phase moving`
              : "Burns down the remaining path",
        blocksChecklist: mod.subtopicsToThreshold > 0,
      });

      remainingCapacity = round1(remainingCapacity - estimatedHours);
      if (items.length >= 6) break;
    }

    if (items.length >= 6) break;
  }

  const plannedHours = round1(items.reduce((sum, i) => sum + i.estimatedHours, 0));

  return {
    capacityHours: round1(capacityHours),
    plannedHours,
    items,
    capacitySpare: plannedHours < capacityHours - 0.5,
  };
}

/** Last 7 days against the 7 before them, graded against the target-date requirement. */
export function buildWeeklyReport(
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[],
  sessions: LearningSession[],
  report: GoCoachReport,
  now = new Date()
): WeeklyReport {
  const goSessions = scopeGoSessions(modules, topics, subtopics, sessions);
  const thisWeekStart = addDays(now, -6);
  const priorWeekStart = addDays(now, -13);

  const inWindow = (session: LearningSession, start: Date, end: Date) => {
    const d = parseLocalDate(session.date);
    return d >= start && d <= end;
  };

  const thisWeekSessions = goSessions.filter((s) =>
    inWindow(s, thisWeekStart, now)
  );
  const priorWeekSessions = goSessions.filter((s) =>
    inWindow(s, priorWeekStart, addDays(thisWeekStart, -1))
  );

  const hoursThisWeek = round1(
    hoursFromMs(thisWeekSessions.reduce((sum, s) => sum + s.duration, 0))
  );
  const hoursPriorWeek = round1(
    hoursFromMs(priorWeekSessions.reduce((sum, s) => sum + s.duration, 0))
  );

  const moduleIds = goModuleIds(modules);
  const activeTopicIds = new Set(topics.filter((t) => !t.archived).map((t) => t.id));
  const goSubs = subtopics.filter(
    (s) =>
      moduleIds.has(s.moduleId) &&
      !s.archived &&
      activeTopicIds.has(s.topicId) &&
      !isPsSubtopic(s.name)
  );

  const completedBetween = (start: Date, end: Date) =>
    goSubs.filter((s) => {
      if (!isSubtopicDone(s.status)) return false;
      const stamp = completedAtOf(s);
      if (!stamp) return false;
      const d = new Date(stamp);
      return d >= start && d <= end;
    }).length;

  const subtopicsThisWeek = completedBetween(thisWeekStart, now);
  const subtopicsPriorWeek = completedBetween(priorWeekStart, addDays(thisWeekStart, -1));

  const topicModule = new Map(topics.map((t) => [t.id, t.moduleId]));
  const subtopicModule = new Map(subtopics.map((s) => [s.id, s.moduleId]));
  const modulesTouched = new Set(
    thisWeekSessions
      .map((s) => resolveSessionModuleId(s, topicModule, subtopicModule))
      .filter(Boolean)
  ).size;
  const activeDays = new Set(thisWeekSessions.map((s) => s.date)).size;

  const required = report.targetPlan?.requiredHoursPerWeek ?? null;
  const targetAttainment =
    required && required > 0 ? Math.round((hoursThisWeek / required) * 100) : null;

  let grade: WeeklyReport["grade"];
  if (targetAttainment == null) {
    grade = hoursThisWeek >= 15 ? "A" : hoursThisWeek >= 10 ? "B" : hoursThisWeek >= 5 ? "C" : hoursThisWeek > 0 ? "D" : "F";
  } else if (targetAttainment >= 100) grade = "A";
  else if (targetAttainment >= 80) grade = "B";
  else if (targetAttainment >= 60) grade = "C";
  else if (targetAttainment >= 35) grade = "D";
  else grade = "F";

  const hoursDelta = round1(hoursThisWeek - hoursPriorWeek);
  const subtopicsDelta = subtopicsThisWeek - subtopicsPriorWeek;

  const summary =
    targetAttainment == null
      ? `${hoursThisWeek}h logged across ${activeDays} day${activeDays === 1 ? "" : "s"} and ${subtopicsThisWeek} subtopic${subtopicsThisWeek === 1 ? "" : "s"} finished.`
      : `${hoursThisWeek}h of the ${required}h you needed (${targetAttainment}%), across ${activeDays} active day${activeDays === 1 ? "" : "s"}.`;

  let correctiveAction: string;
  if (grade === "A") {
    correctiveAction = "Hold this exact schedule — it is the pace that hits your target date.";
  } else if (activeDays <= 2 && hoursThisWeek > 0) {
    correctiveAction = `You studied on only ${activeDays} day${activeDays === 1 ? "" : "s"}. Spread the same hours over 5 days to finish more subtopics.`;
  } else if (subtopicsThisWeek === 0 && hoursThisWeek > 2) {
    correctiveAction = "Hours went in but nothing got marked done. Close one subtopic before starting the next.";
  } else if (required && hoursThisWeek < required) {
    correctiveAction = `Add ${round1(required - hoursThisWeek)}h next week, or push your target date out.`;
  } else {
    correctiveAction = "Book your study blocks in the calendar before the week starts.";
  }

  return {
    hoursThisWeek,
    hoursPriorWeek,
    hoursDelta,
    subtopicsThisWeek,
    subtopicsPriorWeek,
    subtopicsDelta,
    modulesTouched,
    activeDays,
    targetAttainment,
    grade,
    summary,
    correctiveAction,
  };
}

/** Go-scoped spaced-review debt plus completions you rated low confidence. */
export function buildRetentionDebt(
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[],
  employabilityPercent: number
): RetentionDebt {
  const moduleIds = goModuleIds(modules);
  const moduleName = new Map(modules.map((m) => [m.id, m.name]));
  const today = todayISO();

  const activeTopicIds = new Set(topics.filter((t) => !t.archived).map((t) => t.id));
  const goTopics = topics.filter((t) => moduleIds.has(t.moduleId) && !t.archived);
  const goSubs = subtopics.filter(
    (s) => moduleIds.has(s.moduleId) && !s.archived && activeTopicIds.has(s.topicId)
  );

  const isDue = (meta: { nextReviewDue: string; confidenceRating: number } | undefined) =>
    !!meta && meta.nextReviewDue <= today && meta.confidenceRating < 4;

  const topicsDueList = goTopics.filter(
    (t) =>
      isSubtopicDone(t.status) &&
      !goSubs.some((s) => s.topicId === t.id) &&
      isDue(t.completionMeta)
  );
  const subtopicsDueList = goSubs.filter(
    (s) => isSubtopicDone(s.status) && isDue(s.completionMeta)
  );

  const lowConfidenceItems = goSubs
    .filter(
      (s) =>
        isSubtopicDone(s.status) &&
        s.completionMeta &&
        s.completionMeta.confidenceRating <= 2 &&
        !s.completionMeta.reviewedAt
    )
    .map((s) => ({
      id: s.id,
      name: s.name,
      moduleName: moduleName.get(s.moduleId) ?? "Unknown module",
      rating: s.completionMeta!.confidenceRating,
    }))
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 8);

  const lowConfidenceCount = goSubs.filter(
    (s) =>
      isSubtopicDone(s.status) &&
      s.completionMeta &&
      s.completionMeta.confidenceRating <= 2 &&
      !s.completionMeta.reviewedAt
  ).length;

  const completedGo = goSubs.filter((s) => isSubtopicDone(s.status)).length;
  const totalDue = topicsDueList.length + subtopicsDueList.length;
  const debtPercent =
    completedGo === 0 ? 0 : Math.round(((totalDue + lowConfidenceCount) / completedGo) * 100);
  const inflatedReadiness = debtPercent >= 20;

  const message = inflatedReadiness
    ? `${debtPercent}% of your completed Go work is shaky or overdue for review — your ${employabilityPercent}% readiness reads higher than what you could defend in an interview today.`
    : totalDue > 0
      ? `${totalDue} item${totalDue === 1 ? "" : "s"} due for review. Clear them before they compound.`
      : "No review debt. Your completed work is holding.";

  return {
    topicsDue: topicsDueList.length,
    subtopicsDue: subtopicsDueList.length,
    totalDue,
    lowConfidenceCount,
    lowConfidenceItems,
    debtPercent,
    inflatedReadiness,
    message,
  };
}

/** Days from now until an ISO date, for target-date labels. */
export function daysUntil(dateStr: string, now = new Date()): number {
  return differenceInCalendarDays(parseLocalDate(dateStr), now);
}
