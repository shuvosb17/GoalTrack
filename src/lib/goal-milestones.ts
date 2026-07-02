import { v4 as uuid } from "uuid";
import { addMonths, addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { db } from "./db";
import type {
  GoalMilestone, GoalMilestoneStats, GoalPaceStatus, GoalScopeType,
  Module, Topic, Track, Subtopic, ProgressStatus, GoalRiskLevel, GoalProjectedFinish,
} from "./types";
import { getModuleProgress, getTopicProgress, getTrackProgress } from "./analytics";
import { calculateTopicsProgress, isTopicComplete } from "./in-progress";
import { nowISO, todayISO, parseLocalDate } from "./utils";

export type GoalScopeInput = Pick<GoalMilestone, "trackId" | "moduleId" | "moduleIds" | "topicId" | "topicIds">;

export function computeEndDate(startDate: string, months: number): string {
  return format(addMonths(parseLocalDate(startDate), months), "yyyy-MM-dd");
}

/** Approximate month span for a start/end range — used to persist `months` for legacy display. */
export function monthsBetween(startDate: string, endDate: string): number {
  const days = Math.max(1, differenceInCalendarDays(parseLocalDate(endDate), parseLocalDate(startDate)));
  return Math.max(1, Math.round(days / 30));
}

/** Human-friendly duration label derived from the actual date range (days · weeks · months). */
export function formatGoalDuration(startDate: string, endDate: string): string {
  const days = Math.max(1, differenceInCalendarDays(parseLocalDate(endDate), parseLocalDate(startDate)));
  if (days >= 60) return `${Math.round(days / 30)} mo`;
  if (days >= 14) return `${Math.round(days / 7)} wk`;
  return `${days} day${days === 1 ? "" : "s"}`;
}

/** Resolve module IDs from moduleIds array or legacy single moduleId */
export function getGoalModuleIds(goal: Pick<GoalMilestone, "moduleId" | "moduleIds">): string[] {
  if (goal.moduleIds?.length) return goal.moduleIds;
  if (goal.moduleId) return [goal.moduleId];
  return [];
}

export function normalizeGoalModuleScope(moduleIds: string[]): Pick<GoalMilestone, "moduleId" | "moduleIds"> {
  if (moduleIds.length === 0) return { moduleId: undefined, moduleIds: undefined };
  return {
    moduleIds,
    moduleId: moduleIds.length === 1 ? moduleIds[0] : undefined,
  };
}

/** Resolve topic IDs from topicIds array or legacy single topicId */
export function getGoalTopicIds(goal: Pick<GoalMilestone, "topicId" | "topicIds">): string[] {
  if (goal.topicIds?.length) return goal.topicIds;
  if (goal.topicId) return [goal.topicId];
  return [];
}

export function normalizeGoalTopicScope(topicIds: string[]): Pick<GoalMilestone, "topicId" | "topicIds"> {
  if (topicIds.length === 0) return { topicId: undefined, topicIds: undefined };
  return {
    topicIds,
    topicId: topicIds.length === 1 ? topicIds[0] : undefined,
  };
}

export function getGoalScopeType(goal: Pick<GoalMilestone, "topicId" | "topicIds" | "moduleId" | "moduleIds">): GoalScopeType {
  const topicIds = getGoalTopicIds(goal);
  if (topicIds.length > 1) return "topics";
  if (topicIds.length === 1) return "topic";
  const moduleIds = getGoalModuleIds(goal);
  if (moduleIds.length > 1) return "modules";
  if (moduleIds.length === 1) return "module";
  return "track";
}

/** Topics included in this milestone — same boundaries as Tracks hierarchy */
export function getGoalScopeTopics(
  goal: Pick<GoalMilestone, "trackId" | "moduleId" | "moduleIds" | "topicId" | "topicIds">,
  topics: Topic[]
): Topic[] {
  const topicIds = getGoalTopicIds(goal);
  if (topicIds.length > 0) {
    return topics.filter((t) => topicIds.includes(t.id) && !t.archived);
  }
  const moduleIds = getGoalModuleIds(goal);
  if (moduleIds.length > 0) {
    return topics.filter((t) => t.moduleId != null && moduleIds.includes(t.moduleId) && !t.archived);
  }
  return topics.filter((t) => t.trackId === goal.trackId && !t.archived);
}

function emptyStatusCounts(): Record<ProgressStatus, number> {
  return { not_started: 0, in_progress: 0, completed: 0, mastered: 0 };
}

export function buildGoalScopeSummary(
  goal: Pick<GoalMilestone, "trackId" | "moduleId" | "topicId" | "topicIds">,
  topics: Topic[],
  subtopics: Subtopic[]
) {
  const scopeTopics = getGoalScopeTopics(goal, topics);
  const scopeSubtopics = subtopics.filter(
    (s) => !s.archived && scopeTopics.some((t) => t.id === s.topicId)
  );
  const topicStatusCounts = emptyStatusCounts();
  for (const topic of scopeTopics) {
    topicStatusCounts[topic.status] += 1;
  }
  return {
    scopeType: getGoalScopeType(goal),
    topicsTotal: scopeTopics.length,
    topicsCompleted: scopeTopics.filter((t) => isTopicComplete(t, subtopics)).length,
    subtopicsTotal: scopeSubtopics.length,
    subtopicsCompleted: scopeSubtopics.filter((s) => s.status === "completed" || s.status === "mastered").length,
    topicStatusCounts,
    scopeTopics,
    scopeSubtopics,
  };
}

/** Live progress from Tracks data — identical formulas to the Tracks page */
export function resolveGoalProgress(
  goal: GoalScopeInput,
  topics: Topic[],
  subtopics: Subtopic[],
  modules: Module[] = []
): number {
  const topicIds = getGoalTopicIds(goal);
  if (topicIds.length === 1) {
    const topic = topics.find((t) => t.id === topicIds[0]);
    if (!topic) return 0;
    return getTopicProgress(topic, subtopics).percentage;
  }
  if (topicIds.length > 1) {
    const scopeTopics = getGoalScopeTopics(goal, topics);
    return calculateTopicsProgress(scopeTopics, subtopics);
  }
  const moduleIds = getGoalModuleIds(goal);
  if (moduleIds.length === 1) {
    return getModuleProgress(moduleIds[0], topics, subtopics).percentage;
  }
  if (moduleIds.length > 1) {
    const scopeTopics = getGoalScopeTopics(goal, topics);
    return calculateTopicsProgress(scopeTopics, subtopics);
  }
  return getTrackProgress(goal.trackId, topics, subtopics, modules).percentage;
}

export function formatGoalScopeLabel(
  goal: GoalScopeInput,
  topics: Topic[],
  modules: Module[],
  tracks: Track[]
): string {
  const topicIds = getGoalTopicIds(goal);
  const moduleIds = getGoalModuleIds(goal);
  const mods = modules.filter((m) => moduleIds.includes(m.id));
  const track = tracks.find((t) => t.id === goal.trackId);

  if (topicIds.length > 0) {
    const scopeTopics = topics.filter((t) => topicIds.includes(t.id) && !t.archived);
    const mod = mods[0];
    if (scopeTopics.length === 1) {
      return [mod?.name, scopeTopics[0].name].filter(Boolean).join(" → ");
    }
    const names = scopeTopics.map((t) => t.name);
    const preview = names.slice(0, 2).join(", ");
    const suffix = names.length > 2 ? ` +${names.length - 2} more` : "";
    return mod ? `${mod.name} → ${preview}${suffix}` : `${preview}${suffix}`;
  }

  if (mods.length === 1) return mods[0].name;
  if (mods.length > 1) {
    const preview = mods.slice(0, 2).map((m) => m.name).join(", ");
    const suffix = mods.length > 2 ? ` +${mods.length - 2} more` : "";
    return `${preview}${suffix}`;
  }
  return track?.name ?? "Track";
}

export function goalCoversTopic(goal: GoalMilestone, topic: Topic): boolean {
  if (goal.trackId !== topic.trackId) return false;
  const topicIds = getGoalTopicIds(goal);
  if (topicIds.length > 0) return topicIds.includes(topic.id);
  const moduleIds = getGoalModuleIds(goal);
  if (moduleIds.length > 0) return topic.moduleId != null && moduleIds.includes(topic.moduleId);
  return true;
}

export function getActiveGoalsForTopic(topic: Topic, goals: GoalMilestone[]): GoalMilestone[] {
  const today = parseLocalDate(todayISO());
  return goals.filter((g) => {
    if (!goalCoversTopic(g, topic)) return false;
    const start = parseLocalDate(g.startDate);
    const end = parseLocalDate(g.endDate);
    return today >= start && today <= end;
  });
}

export function buildGoalStats(
  goal: GoalMilestone,
  tracks: Track[],
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[]
): GoalMilestoneStats {
  const track = tracks.find((t) => t.id === goal.trackId);
  const moduleIds = getGoalModuleIds(goal);
  const mod = moduleIds.length === 1 ? modules.find((m) => m.id === moduleIds[0]) : undefined;
  const topicIds = getGoalTopicIds(goal);
  const topic = topicIds.length === 1 ? topics.find((t) => t.id === topicIds[0]) : undefined;

  const today = parseLocalDate(todayISO());
  const start = parseLocalDate(goal.startDate);
  const end = parseLocalDate(goal.endDate);
  const daysTotal = Math.max(1, differenceInCalendarDays(end, start));
  const daysElapsed = Math.min(daysTotal, Math.max(0, differenceInCalendarDays(today, start)));
  const daysRemaining = Math.max(0, differenceInCalendarDays(end, today));
  const timeProgress = Math.min(100, Math.round((daysElapsed / daysTotal) * 100));

  const scope = buildGoalScopeSummary(goal, topics, subtopics);
  const currentProgress = resolveGoalProgress(goal, topics, subtopics, modules);
  const trackWideProgress = getTrackProgress(goal.trackId, topics, subtopics, modules).percentage;
  const progressGained = Math.max(0, currentProgress - goal.baselineProgress);
  const range = Math.max(1, goal.targetProgress - goal.baselineProgress);
  const expectedProgress = Math.min(
    goal.targetProgress,
    Math.round(goal.baselineProgress + (range * timeProgress) / 100)
  );
  const paceDelta = currentProgress - expectedProgress;

  let paceStatus: GoalPaceStatus = "on_track";
  if (currentProgress >= goal.targetProgress) {
    paceStatus = "completed";
  } else if (today > end) {
    paceStatus = "overdue";
  } else if (paceDelta >= 8) {
    paceStatus = "ahead";
  } else if (paceDelta <= -8) {
    paceStatus = "behind";
  }

  const scopeLabel = formatGoalScopeLabel(goal, topics, modules, tracks);

  return {
    goal,
    trackName: track?.name ?? "Track",
    trackIcon: track?.icon ?? "🎯",
    trackColor: track?.color ?? "#8b5cf6",
    moduleName: mod?.name,
    topicName: topic?.name,
    scopeLabel,
    scopeType: scope.scopeType,
    currentProgress,
    trackWideProgress,
    progressGained,
    timeProgress,
    daysTotal,
    daysElapsed,
    daysRemaining,
    expectedProgress,
    paceDelta,
    paceStatus,
    isActive: today >= start && today <= end && currentProgress < goal.targetProgress,
    topicsTotal: scope.topicsTotal,
    topicsCompleted: scope.topicsCompleted,
    subtopicsTotal: scope.subtopicsTotal,
    subtopicsCompleted: scope.subtopicsCompleted,
    topicStatusCounts: scope.topicStatusCounts,
  };
}

export function buildAllGoalStats(
  goals: GoalMilestone[],
  tracks: Track[],
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[]
): GoalMilestoneStats[] {
  return goals
    .map((g) => buildGoalStats(g, tracks, modules, topics, subtopics))
    .sort((a, b) => a.goal.order - b.goal.order);
}

export async function createGoalMilestone(input: {
  title: string;
  trackId: string;
  moduleId?: string;
  moduleIds?: string[];
  topicIds?: string[];
  startDate: string;
  months: number;
  endDate?: string;
  targetProgress?: number;
  notes?: string;
  checkpoints?: string[];
  topics: Topic[];
  subtopics: Subtopic[];
  modules: Module[];
}) {
  const count = await db.goalMilestones.count();
  const moduleScope = normalizeGoalModuleScope(
    input.moduleIds ?? (input.moduleId ? [input.moduleId] : [])
  );
  const topicScope = normalizeGoalTopicScope(input.topicIds ?? []);
  const scope: GoalScopeInput = {
    trackId: input.trackId,
    ...moduleScope,
    ...topicScope,
  };
  const baselineProgress = resolveGoalProgress(scope, input.topics, input.subtopics, input.modules);
  const endDate = input.endDate ?? computeEndDate(input.startDate, input.months);
  const months = input.endDate ? monthsBetween(input.startDate, endDate) : input.months;
  const goal: GoalMilestone = {
    id: uuid(),
    title: input.title.trim(),
    trackId: input.trackId,
    ...moduleScope,
    ...topicScope,
    startDate: input.startDate,
    months,
    endDate,
    baselineProgress,
    targetProgress: input.targetProgress ?? 100,
    notes: input.notes?.trim() || undefined,
    checkpoints: input.checkpoints?.filter(Boolean).map((label) => ({
      id: uuid(),
      label: label.trim(),
      done: false,
    })),
    order: count,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.goalMilestones.add(goal);
  return goal;
}

export async function updateGoalMilestone(
  id: string,
  input: Partial<Pick<GoalMilestone, "title" | "trackId" | "moduleId" | "moduleIds" | "topicId" | "topicIds" | "startDate" | "months" | "endDate" | "targetProgress" | "notes" | "checkpoints">>,
  topics?: Topic[],
  subtopics?: Subtopic[],
  modules?: Module[]
) {
  const existing = await db.goalMilestones.get(id);
  if (!existing) return;

  const updates: Partial<GoalMilestone> = { ...input, updatedAt: nowISO() };

  if (input.moduleIds !== undefined) {
    const moduleScope = normalizeGoalModuleScope(input.moduleIds);
    updates.moduleIds = moduleScope.moduleIds;
    updates.moduleId = moduleScope.moduleId;
  }

  if (input.topicIds !== undefined) {
    const topicScope = normalizeGoalTopicScope(input.topicIds);
    updates.topicIds = topicScope.topicIds;
    updates.topicId = topicScope.topicId;
  }

  if (input.endDate !== undefined) {
    const start = input.startDate ?? existing.startDate;
    updates.endDate = input.endDate;
    updates.months = monthsBetween(start, input.endDate);
  } else if (input.months !== undefined || input.startDate !== undefined) {
    const start = input.startDate ?? existing.startDate;
    const months = input.months ?? existing.months;
    updates.endDate = computeEndDate(start, months);
  }

  const scopeChanged =
    input.trackId !== undefined ||
    input.moduleId !== undefined ||
    input.moduleIds !== undefined ||
    input.topicId !== undefined ||
    input.topicIds !== undefined;

  if (scopeChanged && topics && subtopics && modules) {
    const merged: GoalScopeInput = {
      trackId: input.trackId ?? existing.trackId,
      moduleId: updates.moduleId ?? existing.moduleId,
      moduleIds: updates.moduleIds ?? existing.moduleIds,
      topicId: updates.topicId ?? existing.topicId,
      topicIds: updates.topicIds ?? existing.topicIds,
    };
    updates.baselineProgress = resolveGoalProgress(merged, topics, subtopics, modules);
  }

  await db.goalMilestones.update(id, updates);
}

export async function deleteGoalMilestone(id: string) {
  await db.goalMilestones.delete(id);
}

// ─── Pace quadrant, projection, checkpoints ─────────────────────────────

export interface PaceQuadrantPoint {
  id: string;
  title: string;
  trackIcon: string;
  trackColor: string;
  timeProgress: number;
  progressNormalized: number;
  currentProgress: number;
  expectedProgress: number;
  daysRemaining: number;
  paceStatus: GoalPaceStatus;
  paceDelta: number;
  risk: GoalRiskLevel;
}

export function normalizeGoalProgress(stats: GoalMilestoneStats): number {
  const range = Math.max(1, stats.goal.targetProgress - stats.goal.baselineProgress);
  return Math.min(100, Math.max(0, Math.round(((stats.currentProgress - stats.goal.baselineProgress) / range) * 100)));
}

export function projectGoalFinish(stats: GoalMilestoneStats): GoalProjectedFinish {
  const { goal, currentProgress, daysElapsed, daysRemaining } = stats;
  const remaining = goal.targetProgress - currentProgress;

  if (currentProgress >= goal.targetProgress) {
    return { projectedDate: todayISO(), daysToFinish: 0, onTimeProjection: true, daysEarlyOrLate: daysRemaining };
  }
  if (daysElapsed < 1 || stats.progressGained <= 0) {
    return { projectedDate: null, daysToFinish: null, onTimeProjection: false, daysEarlyOrLate: null };
  }

  const ratePerDay = stats.progressGained / daysElapsed;
  const daysToFinish = Math.ceil(remaining / ratePerDay);
  const projected = addDays(parseLocalDate(todayISO()), daysToFinish);
  const end = parseLocalDate(goal.endDate);
  const daysEarlyOrLate = differenceInCalendarDays(end, projected);

  return {
    projectedDate: format(projected, "yyyy-MM-dd"),
    daysToFinish,
    onTimeProjection: daysEarlyOrLate >= 0,
    daysEarlyOrLate,
  };
}

export function getGoalRisk(stats: GoalMilestoneStats): GoalRiskLevel {
  if (stats.paceStatus === "completed") return "on_track";
  if (stats.paceStatus === "overdue" || stats.paceDelta <= -20) return "critical";
  const projection = projectGoalFinish(stats);
  if (!projection.onTimeProjection && projection.projectedDate) return "critical";
  if (stats.paceStatus === "behind" || stats.paceDelta <= -8) return "at_risk";
  if (projection.daysEarlyOrLate !== null && projection.daysEarlyOrLate < 7 && projection.daysEarlyOrLate >= 0) return "at_risk";
  return "on_track";
}

export function buildPaceQuadrantData(stats: GoalMilestoneStats[]): PaceQuadrantPoint[] {
  return stats
    .filter((s) => s.paceStatus !== "overdue")
    .map((s) => ({
      id: s.goal.id,
      title: s.goal.title,
      trackIcon: s.trackIcon,
      trackColor: s.trackColor,
      timeProgress: s.timeProgress,
      progressNormalized: normalizeGoalProgress(s),
      currentProgress: s.currentProgress,
      expectedProgress: s.expectedProgress,
      daysRemaining: s.daysRemaining,
      paceStatus: s.paceStatus,
      paceDelta: s.paceDelta,
      risk: getGoalRisk(s),
    }));
}

export async function toggleGoalCheckpoint(goalId: string, checkpointId: string) {
  const goal = await db.goalMilestones.get(goalId);
  if (!goal?.checkpoints) return;
  const checkpoints = goal.checkpoints.map((c) =>
    c.id === checkpointId
      ? { ...c, done: !c.done, doneAt: !c.done ? nowISO() : undefined }
      : c
  );
  await db.goalMilestones.update(goalId, { checkpoints, updatedAt: nowISO() });
}

export async function setGoalCheckpoints(goalId: string, labels: string[]) {
  const goal = await db.goalMilestones.get(goalId);
  if (!goal) return;
  const existing = goal.checkpoints ?? [];
  const checkpoints = labels.map((label) => {
    const prev = existing.find((c) => c.label === label);
    return prev ?? { id: uuid(), label: label.trim(), done: false };
  });
  await db.goalMilestones.update(goalId, { checkpoints, updatedAt: nowISO() });
}

export function formatProjectedFinish(projection: GoalProjectedFinish): string {
  if (projection.daysToFinish === 0) return "Goal reached";
  if (!projection.projectedDate) return "Not enough data to project finish";
  const dateLabel = format(parseISO(projection.projectedDate), "MMM d, yyyy");
  if (projection.daysEarlyOrLate === null) return `Est. finish ${dateLabel}`;
  if (projection.daysEarlyOrLate > 0) {
    return `Est. finish ${dateLabel} — ${projection.daysEarlyOrLate}d before deadline`;
  }
  if (projection.daysEarlyOrLate === 0) return `Est. finish ${dateLabel} — on deadline`;
  return `Est. finish ${dateLabel} — ${Math.abs(projection.daysEarlyOrLate)}d late`;
}

export const RISK_COLORS: Record<GoalRiskLevel, string> = {
  on_track: "#10b981",
  at_risk: "#f59e0b",
  critical: "#ef4444",
};

export const RISK_LABELS: Record<GoalRiskLevel, string> = {
  on_track: "On track",
  at_risk: "At risk",
  critical: "Critical",
};

export function formatGoalDateRange(startDate: string, endDate: string): string {
  return `${format(parseISO(startDate), "MMM d, yyyy")} → ${format(parseISO(endDate), "MMM d, yyyy")}`;
}

export const GOAL_MONTH_OPTIONS = [1, 2, 3, 4, 6, 12] as const;

export const PACE_LABELS: Record<GoalPaceStatus, string> = {
  ahead: "Ahead of schedule",
  on_track: "On track",
  behind: "Behind pace",
  completed: "Goal reached",
  overdue: "Past deadline",
};

export const PACE_COLORS: Record<GoalPaceStatus, string> = {
  ahead: "#10b981",
  on_track: "#3b82f6",
  behind: "#f59e0b",
  completed: "#8b5cf6",
  overdue: "#ef4444",
};
