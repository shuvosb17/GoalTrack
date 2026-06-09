import { v4 as uuid } from "uuid";
import { addMonths, differenceInCalendarDays, format, parseISO } from "date-fns";
import { db } from "./db";
import type {
  GoalMilestone, GoalMilestoneStats, GoalPaceStatus, GoalScopeType,
  Module, Topic, Track, Subtopic, ProgressStatus,
} from "./types";
import { getModuleProgress, getTopicProgress, getTrackProgress } from "./analytics";
import { calculateTopicsProgress, isTopicComplete } from "./in-progress";
import { nowISO, todayISO, parseLocalDate } from "./utils";

export type GoalScopeInput = Pick<GoalMilestone, "trackId" | "moduleId" | "topicId" | "topicIds">;

export function computeEndDate(startDate: string, months: number): string {
  return format(addMonths(parseLocalDate(startDate), months), "yyyy-MM-dd");
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

export function getGoalScopeType(goal: Pick<GoalMilestone, "topicId" | "topicIds" | "moduleId">): GoalScopeType {
  const topicIds = getGoalTopicIds(goal);
  if (topicIds.length > 1) return "topics";
  if (topicIds.length === 1) return "topic";
  if (goal.moduleId) return "module";
  return "track";
}

/** Topics included in this milestone — same boundaries as Tracks hierarchy */
export function getGoalScopeTopics(
  goal: Pick<GoalMilestone, "trackId" | "moduleId" | "topicId" | "topicIds">,
  topics: Topic[]
): Topic[] {
  const topicIds = getGoalTopicIds(goal);
  if (topicIds.length > 0) {
    return topics.filter((t) => topicIds.includes(t.id) && !t.archived);
  }
  if (goal.moduleId) {
    return topics.filter((t) => t.moduleId === goal.moduleId && !t.archived);
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
  if (goal.moduleId) {
    return getModuleProgress(goal.moduleId, topics, subtopics).percentage;
  }
  return getTrackProgress(goal.trackId, topics, subtopics, modules).percentage;
}

export function formatGoalScopeLabel(
  goal: GoalScopeInput,
  topics: Topic[],
  modules: Module[],
  tracks: Track[]
): string {
  const scopeTopics = getGoalScopeTopics(goal, topics);
  const mod = goal.moduleId ? modules.find((m) => m.id === goal.moduleId) : undefined;
  const track = tracks.find((t) => t.id === goal.trackId);

  if (scopeTopics.length === 1) {
    const parts = [mod?.name, scopeTopics[0].name].filter(Boolean);
    return parts.join(" → ");
  }
  if (scopeTopics.length > 1) {
    const names = scopeTopics.map((t) => t.name);
    const preview = names.slice(0, 2).join(", ");
    const suffix = names.length > 2 ? ` +${names.length - 2} more` : "";
    return mod ? `${mod.name} → ${preview}${suffix}` : `${preview}${suffix}`;
  }
  if (mod) return mod.name;
  return track?.name ?? "Track";
}

export function goalCoversTopic(goal: GoalMilestone, topic: Topic): boolean {
  if (goal.trackId !== topic.trackId) return false;
  const topicIds = getGoalTopicIds(goal);
  if (topicIds.length > 0) return topicIds.includes(topic.id);
  if (goal.moduleId) return goal.moduleId === topic.moduleId;
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
  const mod = goal.moduleId ? modules.find((m) => m.id === goal.moduleId) : undefined;
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
  topicIds?: string[];
  startDate: string;
  months: number;
  targetProgress?: number;
  notes?: string;
  topics: Topic[];
  subtopics: Subtopic[];
  modules: Module[];
}) {
  const count = await db.goalMilestones.count();
  const topicScope = normalizeGoalTopicScope(input.topicIds ?? []);
  const scope: GoalScopeInput = {
    trackId: input.trackId,
    moduleId: input.moduleId,
    ...topicScope,
  };
  const baselineProgress = resolveGoalProgress(scope, input.topics, input.subtopics, input.modules);
  const goal: GoalMilestone = {
    id: uuid(),
    title: input.title.trim(),
    trackId: input.trackId,
    moduleId: input.moduleId || undefined,
    ...topicScope,
    startDate: input.startDate,
    months: input.months,
    endDate: computeEndDate(input.startDate, input.months),
    baselineProgress,
    targetProgress: input.targetProgress ?? 100,
    notes: input.notes?.trim() || undefined,
    order: count,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.goalMilestones.add(goal);
  return goal;
}

export async function updateGoalMilestone(
  id: string,
  input: Partial<Pick<GoalMilestone, "title" | "trackId" | "moduleId" | "topicId" | "topicIds" | "startDate" | "months" | "targetProgress" | "notes">>,
  topics?: Topic[],
  subtopics?: Subtopic[],
  modules?: Module[]
) {
  const existing = await db.goalMilestones.get(id);
  if (!existing) return;

  const updates: Partial<GoalMilestone> = { ...input, updatedAt: nowISO() };

  if (input.topicIds !== undefined) {
    const topicScope = normalizeGoalTopicScope(input.topicIds);
    updates.topicIds = topicScope.topicIds;
    updates.topicId = topicScope.topicId;
  }

  if (input.months !== undefined || input.startDate !== undefined) {
    const start = input.startDate ?? existing.startDate;
    const months = input.months ?? existing.months;
    updates.endDate = computeEndDate(start, months);
  }

  const scopeChanged =
    input.trackId !== undefined ||
    input.moduleId !== undefined ||
    input.topicId !== undefined ||
    input.topicIds !== undefined;

  if (scopeChanged && topics && subtopics && modules) {
    const merged: GoalScopeInput = {
      trackId: input.trackId ?? existing.trackId,
      moduleId: input.moduleId ?? existing.moduleId,
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
