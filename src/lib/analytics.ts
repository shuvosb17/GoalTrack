import {
  differenceInDays,
  parseISO,
  format,
  subDays,
  addDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
} from "date-fns";
import type {
  Track,
  Module,
  Topic,
  Subtopic,
  LearningSession,
  Insight,
  RadarDimension,
  MomentumLevel,
  AppSettings,
} from "./types";
import type { SkipLog, SkipReason } from "./types/metrics";
import type { SessionQualityRating } from "./types/metrics";
import {
  calculateSubtopicProgress,
  getCalendarWeekRange,
  getMomentumLevel,
  isSubtopicDone,
  todayISO,
  parseLocalDate,
  weekEnd,
  weekStart,
} from "./utils";
import { aggregateStudyHours as aggregateStudyHoursItems, aggregateStudyTrackerHours } from "./session-attribution";

export const DEFAULT_YEAR_START = "2026-06-01";
export const DEFAULT_YEAR_END = "2026-12-31";

const RADAR_TRACK_MAP: Record<string, string[]> = {
  Algorithms: ["CS Fundamentals", "LeetCode"],
  "Data Structures": ["LeetCode", "CS Fundamentals"],
  "Competitive Programming": ["CS Fundamentals"],
  "Problem Solving": ["LeetCode"],
  "Backend Engineering": ["Development"],
  Databases: ["Development"],
  Cloud: ["Development"],
  DevOps: ["Development"],
  "System Design": ["System Design"],
  "Academic Knowledge": ["Academic"],
};

function getPeriodLearningStats(
  sessions: LearningSession[],
  yearStart: string,
  yearEnd: string
) {
  const todayStr = todayISO();
  const start = parseLocalDate(yearStart);
  const end = parseLocalDate(yearEnd);
  const today = parseLocalDate(todayStr);

  const periodSessions = sessions.filter(
    (s) => s.date >= yearStart && s.date <= yearEnd && s.date <= todayStr
  );
  const totalHours = periodSessions.reduce((sum, s) => sum + s.duration, 0) / 3600000;

  const firstSessionDate =
    periodSessions.length > 0
      ? periodSessions.map((s) => s.date).sort()[0]
      : yearStart;
  const trackingStart = firstSessionDate > yearStart ? firstSessionDate : yearStart;

  const elapsedEnd = today < start ? start : today > end ? end : today;
  const daysElapsed = Math.max(1, differenceInDays(elapsedEnd, parseLocalDate(trackingStart)) + 1);
  const daysRemaining = Math.max(0, differenceInDays(end, today));
  const dailyAvg = totalHours / daysElapsed;

  return { periodSessions, totalHours, daysElapsed, daysRemaining, dailyAvg, end };
}

export function buildForecastChartData(
  sessions: LearningSession[],
  yearStart: string,
  yearEnd: string
): { label: string; actual?: number; projected: number }[] {
  const { periodSessions, dailyAvg } = getPeriodLearningStats(sessions, yearStart, yearEnd);
  const start = parseLocalDate(yearStart);
  const end = parseLocalDate(yearEnd);
  const todayStr = todayISO();
  const months = eachMonthOfInterval({ start, end });

  return months.map((month) => {
    const monthEnd = endOfMonth(month);
    const rangeEnd = monthEnd > end ? end : monthEnd;
    const rangeEndStr = format(rangeEnd, "yyyy-MM-dd");
    const monthStart = startOfMonth(month);
    const effectiveStart = monthStart < start ? start : monthStart;

    const daysFromPeriodStart = differenceInDays(rangeEnd, start) + 1;
    const projected = Math.round(dailyAvg * Math.max(0, daysFromPeriodStart) * 10) / 10;

    if (rangeEndStr < yearStart || effectiveStart > parseLocalDate(todayStr)) {
      return { label: format(month, "MMM yy"), projected };
    }

    const cutoff = rangeEndStr > todayStr ? todayStr : rangeEndStr;
    const ms = periodSessions
      .filter((s) => s.date <= cutoff)
      .reduce((sum, s) => sum + s.duration, 0);
    const actual = Math.round((ms / 3600000) * 10) / 10;

    return { label: format(month, "MMM yy"), actual, projected };
  });
}
import { isTopicComplete, calculateTopicsProgress, getTopicProgressPercent } from "./in-progress";
import { getGoalReframeMessage } from "./goals";
import { getTopicsDueForReview, getDominantSkipReason, getSkipInsightMessage, getAverageSessionQuality } from "./metrics";

export function getSubtopicProgress(subtopics: Subtopic[]) {
  const active = subtopics.filter((s) => !s.archived);
  const total = active.length;
  const completed = active.filter((s) => s.status === "completed" || s.status === "mastered").length;
  const mastered = active.filter((s) => s.status === "mastered").length;
  const inProgress = active.filter((s) => s.status === "in_progress").length;
  return { total, completed, mastered, inProgress, percentage: calculateSubtopicProgress(active) };
}

export function getTopicProgress(topic: Topic, subtopics: Subtopic[]) {
  const subs = subtopics.filter((s) => s.topicId === topic.id && !s.archived);
  const total = subs.length;
  const completed = subs.filter((s) => s.status === "completed" || s.status === "mastered").length;
  const mastered = subs.filter((s) => s.status === "mastered").length;
  const inProgress = subs.filter((s) => s.status === "in_progress").length;
  const percentage = getTopicProgressPercent(topic, subtopics);
  return { total, completed, mastered, inProgress, percentage };
}

export function getModuleProgress(moduleId: string, topics: Topic[], subtopics: Subtopic[]) {
  const moduleTopics = topics.filter((t) => t.moduleId === moduleId && !t.archived);
  const total = moduleTopics.length;
  const completed = moduleTopics.filter((t) => isTopicComplete(t, subtopics)).length;
  const inProgress = moduleTopics.filter((t) => {
    const subs = subtopics.filter((s) => s.topicId === t.id && !s.archived);
    return subs.some((s) => s.status === "in_progress") && !isTopicComplete(t, subtopics);
  }).length;
  return {
    total,
    completed,
    mastered: 0,
    inProgress,
    percentage: calculateTopicsProgress(moduleTopics, subtopics),
  };
}

export function getTrackProgress(
  trackId: string,
  topics: Topic[],
  subtopics: Subtopic[]
) {
  const trackTopics = topics.filter((t) => t.trackId === trackId && !t.archived);

  const inProgress = trackTopics.filter((t) => {
    const subs = subtopics.filter((s) => s.topicId === t.id && !s.archived);
    return subs.some((s) => s.status === "in_progress") && !isTopicComplete(t, subtopics);
  }).length;

  // Weight every topic/subtopic in the track — never average module percentages.
  const percentage = calculateTopicsProgress(trackTopics, subtopics);

  let totalUnits = 0;
  let completedUnits = 0;
  for (const topic of trackTopics) {
    const subs = subtopics.filter((s) => s.topicId === topic.id && !s.archived);
    if (subs.length > 0) {
      totalUnits += subs.length;
      completedUnits += subs.filter((s) => isSubtopicDone(s.status)).length;
    } else {
      totalUnits += 1;
      if (isTopicComplete(topic, subtopics)) completedUnits += 1;
    }
  }

  return {
    total: totalUnits,
    completed: completedUnits,
    mastered: 0,
    inProgress,
    percentage,
  };
}

/** Incomplete learning units in a track (subtopics + topic-only items). */
export function getTrackRemainingCount(
  trackId: string,
  topics: Topic[],
  subtopics: Subtopic[]
): number {
  const trackTopics = topics.filter((t) => t.trackId === trackId && !t.archived);
  let remaining = 0;

  for (const topic of trackTopics) {
    const subs = subtopics.filter((s) => s.topicId === topic.id && !s.archived);
    if (subs.length > 0) {
      remaining += subs.filter((s) => !isSubtopicDone(s.status)).length;
    } else if (!isTopicComplete(topic, subtopics)) {
      remaining += 1;
    }
  }

  return remaining;
}

export function getGlobalProgress(topics: Topic[], subtopics: Subtopic[]) {
  const activeTopics = topics.filter((t) => !t.archived);
  const total = activeTopics.length;
  const completed = activeTopics.filter((t) => isTopicComplete(t, subtopics)).length;
  const inProgress = activeTopics.filter((t) => {
    const subs = subtopics.filter((s) => s.topicId === t.id && !s.archived);
    return subs.some((s) => s.status === "in_progress") && !isTopicComplete(t, subtopics);
  }).length;
  return {
    total,
    completed,
    mastered: 0,
    inProgress,
    percentage: calculateTopicsProgress(activeTopics, subtopics),
  };
}

export function getTotalHours(sessions: LearningSession[]): number {
  return sessions.reduce((sum, s) => sum + s.duration, 0);
}

export function getTodayHours(sessions: LearningSession[]): number {
  const today = todayISO();
  return sessions.filter((s) => s.date === today).reduce((sum, s) => sum + s.duration, 0);
}

export function getHoursByTrack(sessions: LearningSession[], tracks: Track[]) {
  const map = new Map<string, number>();
  tracks.forEach((t) => map.set(t.id, 0));
  sessions.forEach((s) => map.set(s.trackId, (map.get(s.trackId) || 0) + s.duration));
  return tracks.map((t) => ({
    name: t.name,
    value: map.get(t.id) || 0,
    color: t.color,
    percentage: 0,
  }));
}

export function withPercentages(data: { name: string; value: number; color: string }[]) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return data.map((d) => ({ ...d, percentage: total > 0 ? Math.round((d.value / total) * 100) : 0 }));
}

export function getHoursByPeriod(sessions: LearningSession[], days: number) {
  const result: { date: string; hours: number; label: string }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const key = format(d, "yyyy-MM-dd");
    const duration = sessions.filter((s) => s.date === key).reduce((sum, s) => sum + s.duration, 0);
    result.push({ date: key, hours: duration / 3600000, label: format(d, days <= 7 ? "EEE" : "MMM d") });
  }
  return result;
}

/** Saturday-aligned week buckets; current week runs through today */
export function getHoursByWeek(sessions: LearningSession[], weekCount = 12) {
  const result: { date: string; hours: number; label: string }[] = [];
  const today = parseLocalDate(todayISO());

  for (let w = weekCount - 1; w >= 0; w--) {
    const { start: weekStartDate, end: weekEndDate } = getCalendarWeekRange(w, today);
    const startKey = format(weekStartDate, "yyyy-MM-dd");
    const endKey = format(weekEndDate, "yyyy-MM-dd");
    const hours =
      sessions
        .filter((s) => s.date >= startKey && s.date <= endKey)
        .reduce((sum, s) => sum + s.duration, 0) / 3600000;

    result.push({
      date: endKey,
      hours,
      label: w === 0 ? "This week" : format(weekStartDate, "MMM d"),
    });
  }
  return result;
}

/** Average session quality (1–3) per Saturday-aligned week. */
export function getQualityByWeek(sessions: LearningSession[], weekCount = 12) {
  const result: { label: string; quality: number | null }[] = [];
  const today = parseLocalDate(todayISO());
  for (let w = weekCount - 1; w >= 0; w--) {
    const { start: weekStartDate, end: weekEndDate } = getCalendarWeekRange(w, today);
    const startKey = format(weekStartDate, "yyyy-MM-dd");
    const endKey = format(weekEndDate, "yyyy-MM-dd");
    const rated = sessions.filter(
      (s) => s.date >= startKey && s.date <= endKey && s.qualityRating
    );
    const quality = rated.length
      ? Math.round((rated.reduce((sum, s) => sum + (s.qualityRating ?? 0), 0) / rated.length) * 100) / 100
      : null;
    result.push({ label: w === 0 ? "This week" : format(weekStartDate, "MMM d"), quality });
  }
  return result;
}

/** LeetCode problems solved per Saturday-aligned week, split by difficulty. */
export function getProblemsByWeek(
  log: { date: string; difficulty: "easy" | "medium" | "hard" }[],
  weekCount = 12
) {
  const result: { label: string; easy: number; medium: number; hard: number }[] = [];
  const today = parseLocalDate(todayISO());
  for (let w = weekCount - 1; w >= 0; w--) {
    const { start: weekStartDate, end: weekEndDate } = getCalendarWeekRange(w, today);
    const startKey = format(weekStartDate, "yyyy-MM-dd");
    const endKey = format(weekEndDate, "yyyy-MM-dd");
    const inWeek = log.filter((e) => e.date >= startKey && e.date <= endKey);
    result.push({
      label: w === 0 ? "This week" : format(weekStartDate, "MMM d"),
      easy: inWeek.filter((e) => e.difficulty === "easy").length,
      medium: inWeek.filter((e) => e.difficulty === "medium").length,
      hard: inWeek.filter((e) => e.difficulty === "hard").length,
    });
  }
  return result;
}

export function getFocusHeatmap(sessions: LearningSession[]) {
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  sessions.forEach((s) => {
    const start = parseISO(s.startTime);
    const day = start.getDay();
    const hour = start.getHours();
    grid[day][hour] += s.duration;
  });
  return grid;
}

/** Saturday-first day order for focus heatmap rows */
export const FOCUS_HEATMAP_DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] as const;
export const FOCUS_HEATMAP_DAY_INDEX = [6, 0, 1, 2, 3, 4, 5];

export const FOCUS_MODE_META: Record<
  SessionQualityRating,
  { label: string; color: string; bg: string }
> = {
  1: { label: "Distracted", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  2: { label: "Normal", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  3: { label: "Deep focus", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
};

export interface FocusModeEntry {
  id: string;
  date: string;
  startTime: string;
  duration: number;
  rating: SessionQualityRating;
  trackName?: string;
  topicName?: string;
}

export function getFocusModeTimeline(
  sessions: LearningSession[],
  tracks: Track[],
  topics: Topic[],
  limit = 40
): FocusModeEntry[] {
  const trackMap = new Map(tracks.map((t) => [t.id, t.name]));
  const topicMap = new Map(topics.map((t) => [t.id, t.name]));

  return sessions
    .filter((s): s is LearningSession & { qualityRating: SessionQualityRating } => !!s.qualityRating)
    .sort((a, b) => b.startTime.localeCompare(a.startTime))
    .slice(0, limit)
    .map((s) => ({
      id: s.id,
      date: s.date,
      startTime: s.startTime,
      duration: s.duration,
      rating: s.qualityRating,
      trackName: s.trackId ? trackMap.get(s.trackId) : undefined,
      topicName: s.topicId ? topicMap.get(s.topicId) : undefined,
    }));
}

export function getFocusModeSummary(sessions: LearningSession[]) {
  const today = parseLocalDate(todayISO());
  const { start } = getCalendarWeekRange(0, today);
  const weekKey = format(start, "yyyy-MM-dd");
  const rated = sessions.filter((s) => s.qualityRating);

  const count = (arr: LearningSession[], rating: SessionQualityRating) =>
    arr.filter((s) => s.qualityRating === rating).length;

  const thisWeek = rated.filter((s) => s.date >= weekKey);

  return {
    total: rated.length,
    thisWeek: thisWeek.length,
    distracted: count(rated, 1),
    normal: count(rated, 2),
    deep: count(rated, 3),
    weekDistracted: count(thisWeek, 1),
    weekNormal: count(thisWeek, 2),
    weekDeep: count(thisWeek, 3),
  };
}

export type StudyHoursLevel = "topic" | "module" | "track";

export interface AggregatedStudyHours {
  id: string;
  level: StudyHoursLevel;
  name: string;
  trackId: string;
  hoursMs: number;
}

/** Attribute session time to topic, module, or track — status does not affect counting. */
export function aggregateStudyHours(
  sessions: LearningSession[],
  topics: Topic[],
  modules: Module[],
  tracks: Track[],
  subtopics: Subtopic[]
): AggregatedStudyHours[] {
  return aggregateStudyHoursItems(sessions, topics, modules, tracks, subtopics).map(
    (item) => ({
      id: item.id.includes(":") ? item.id.split(":")[1]! : item.id,
      level: item.level,
      name: item.name,
      trackId: item.trackId,
      hoursMs: item.hours * 3600000,
    })
  );
}

export function getTopTopicsWithTrack(
  sessions: LearningSession[],
  topics: Topic[],
  tracks: Track[],
  subtopics: Subtopic[] = [],
  modules: Module[] = [],
  limit = 10,
  days?: number
) {
  const scoped =
    days !== undefined
      ? sessions.filter((s) => s.date >= format(subDays(new Date(), days - 1), "yyyy-MM-dd"))
      : sessions;

  return aggregateStudyTrackerHours(scoped, topics, modules, tracks, subtopics)
    .filter((e) => e.hours > 0)
    .slice(0, limit);
}

export function getTopTopics(
  sessions: LearningSession[],
  topics: Topic[],
  limit = 10,
  subtopics: Subtopic[] = [],
  modules: Module[] = [],
  tracks: Track[] = []
) {
  return aggregateStudyHours(sessions, topics, modules, tracks, subtopics)
    .slice(0, limit)
    .map((e) => ({
      id: `${e.level}:${e.id}`,
      name: e.name,
      hours: e.hoursMs / 3600000,
    }));
}

export function getLearningVelocity(subtopics: Subtopic[], sessions: LearningSession[]) {
  const today = parseLocalDate(todayISO());
  const { start: thisWeekStart } = getCalendarWeekRange(0, today);
  const monthAgo = subDays(today, 30);
  const thisWeekKey = format(thisWeekStart, "yyyy-MM-dd");

  const recentCompleted = subtopics.filter(
    (s) => !s.archived && (s.status === "completed" || s.status === "mastered") &&
      parseISO(s.updatedAt) >= thisWeekStart
  ).length;

  const recentModules = new Set(
    subtopics.filter(
      (s) => !s.archived && (s.status === "completed" || s.status === "mastered") &&
        parseISO(s.updatedAt) >= monthAgo
    ).map((s) => s.moduleId)
  ).size;

  const recentHours = sessions
    .filter((s) => s.date >= thisWeekKey)
    .reduce((sum, s) => sum + s.duration, 0) / 3600000;

  return { topicsPerWeek: recentCompleted, modulesPerMonth: recentModules, hoursPerWeek: recentHours };
}

export function getEfficiencyScores(
  tracks: Track[],
  topics: Topic[],
  subtopics: Subtopic[],
  sessions: LearningSession[]
) {
  return tracks.map((track) => {
    const trackTopics = topics.filter((t) => t.trackId === track.id && !t.archived);
    const progress = calculateTopicsProgress(trackTopics, subtopics);
    const trackSessions = sessions.filter((s) => s.trackId === track.id);
    const hours = trackSessions.reduce((sum, s) => sum + s.duration, 0) / 3600000;
    const qualityWeight = getAverageSessionQuality(trackSessions);
    const efficiency = hours > 0 ? (progress * qualityWeight) / hours : 0;
    return { name: track.name, progress, hours, efficiency, color: track.color };
  }).sort((a, b) => b.efficiency - a.efficiency);
}

export function calculateMomentumScore(
  sessions: LearningSession[],
  topics: Topic[],
  subtopics: Subtopic[],
  streak: number,
  yearlyGoalHours: number
): { score: number; level: MomentumLevel } {
  const totalHours = getTotalHours(sessions) / 3600000;
  const progress = getGlobalProgress(topics, subtopics).percentage;

  const now = new Date();
  const recentSessions = sessions.filter((s) => parseISO(s.date) >= subDays(now, 14));
  const recentDays = new Set(recentSessions.map((s) => s.date)).size;
  const consistency = Math.min(100, (recentDays / 14) * 100);

  const hoursScore = Math.min(100, (totalHours / yearlyGoalHours) * 100 * 12);
  const streakScore = Math.min(100, streak * 5);
  const completionScore = progress;
  const activityScore = recentSessions.length > 0 ? Math.min(100, recentSessions.length * 10) : 0;

  const score = Math.round(
    consistency * 0.3 + hoursScore * 0.2 + streakScore * 0.2 + completionScore * 0.2 + activityScore * 0.1
  );

  return { score: Math.min(100, score), level: getMomentumLevel(score) };
}

export function getGoalForecast(
  sessions: LearningSession[],
  topics: Topic[],
  subtopics: Subtopic[],
  yearlyGoalHours: number,
  yearStart: string,
  yearEnd: string
) {
  const { totalHours, daysElapsed, daysRemaining, dailyAvg } = getPeriodLearningStats(
    sessions,
    yearStart,
    yearEnd
  );
  const progress = getGlobalProgress(topics, subtopics).percentage;
  const projectedHours = totalHours + dailyAvg * daysRemaining;

  const hoursRemaining = Math.max(0, yearlyGoalHours - totalHours);
  let estimatedCompletionDate = "—";
  if (totalHours >= yearlyGoalHours) {
    estimatedCompletionDate = "Goal reached";
  } else if (dailyAvg > 0) {
    const daysToGoal = Math.ceil(hoursRemaining / dailyAvg);
    estimatedCompletionDate = format(addDays(new Date(), daysToGoal), "MMM d, yyyy");
  }

  const successProbability = Math.min(100, Math.round((projectedHours / yearlyGoalHours) * 100));
  const confidence = Math.min(100, Math.round(dailyAvg > 0 ? 50 + Math.min(50, daysElapsed / 2) : 15));

  return {
    projectedHours: Math.round(projectedHours),
    estimatedCompletionDate,
    successProbability,
    confidence,
    dailyAverage: dailyAvg,
    onTrack: projectedHours >= yearlyGoalHours,
    progress,
  };
}

export function getRadarData(
  tracks: Track[],
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[],
  sessions: LearningSession[]
): RadarDimension[] {
  const dimensions = [
    { name: "Algorithms", keywords: ["algorithm", "dynamic", "graph"] },
    { name: "Data Structures", keywords: ["array", "tree", "data structure"] },
    { name: "Competitive Programming", keywords: ["cs fundamentals", "cps", "number theory", "graph theory"] },
    { name: "Problem Solving", keywords: ["leetcode", "problem"] },
    { name: "Backend Engineering", keywords: ["backend", "golang", "concurrency"] },
    { name: "Databases", keywords: ["database", "postgresql", "sql"] },
    { name: "Cloud", keywords: ["cloud", "docker", "kubernetes"] },
    { name: "DevOps", keywords: ["devops", "ci/cd", "container"] },
    { name: "System Design", keywords: ["system design", "scalab", "distributed"] },
    { name: "Academic Knowledge", keywords: ["academic", "theory", "mathematics"] },
  ];

  return dimensions.map((dim) => {
    const matchingTrackIds = tracks
      .filter((t) => RADAR_TRACK_MAP[dim.name]?.includes(t.name))
      .map((t) => t.id);

    const matchingModules = modules.filter(
      (m) =>
        matchingTrackIds.includes(m.trackId) ||
        dim.keywords.some((k) => m.name.toLowerCase().includes(k))
    );

    const matchingTopicEntities = topics.filter(
      (t) =>
        !t.archived &&
        (matchingTrackIds.includes(t.trackId) ||
          matchingModules.some((m) => m.id === t.moduleId) ||
          dim.keywords.some((k) => t.name.toLowerCase().includes(k)))
    );

    const progress =
      matchingTopicEntities.length > 0
        ? calculateTopicsProgress(matchingTopicEntities, subtopics)
        : 0;

    const hours =
      sessions
        .filter(
          (s) =>
            matchingTrackIds.includes(s.trackId) ||
            (s.moduleId && matchingModules.some((m) => m.id === s.moduleId)) ||
            (s.topicId && matchingTopicEntities.some((t) => t.id === s.topicId))
        )
        .reduce((sum, s) => sum + s.duration, 0) / 3600000;

    const value = Math.min(100, Math.round(progress * 0.55 + Math.min(hours * 4, 45)));
    return { name: dim.name, value, fullMark: 100 };
  });
}

export function generateInsights(
  tracks: Track[],
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[],
  sessions: LearningSession[],
  streak: number,
  yearlyGoalHours: number,
  yearStart: string = DEFAULT_YEAR_START,
  yearEnd: string = DEFAULT_YEAR_END,
  settings?: AppSettings | null,
  skipLogs: SkipLog[] = []
): Insight[] {
  const insights: Insight[] = [];
  const distribution = withPercentages(getHoursByTrack(sessions, tracks));

  if (distribution.length > 0 && distribution[0].percentage > 0) {
    insights.push({
      id: "time-distribution",
      type: "info",
      message: `You spent ${distribution.sort((a, b) => b.percentage - a.percentage)[0].percentage}% of your time on ${distribution[0].name}.`,
      priority: 1,
    });
  }

  tracks.forEach((track) => {
    const trackSessions = sessions.filter((s) => s.trackId === track.id);
    if (trackSessions.length === 0) return;
    const lastSession = trackSessions.sort((a, b) => b.date.localeCompare(a.date))[0];
    const daysSince = differenceInDays(new Date(), parseISO(lastSession.date));
    const threshold = settings?.trackSettings?.[track.id]?.neglectThresholdDays ?? 14;
    if (daysSince >= threshold) {
      insights.push({
        id: `neglect-${track.id}`,
        type: "warning",
        message: `${track.name} has not been studied for ${daysSince} days.`,
        priority: 2,
      });
    }
  });

  const heatmap = getFocusHeatmap(sessions);
  let maxHour = 0;
  let maxDay = 0;
  let maxVal = 0;
  heatmap.forEach((row, day) => {
    row.forEach((val, hour) => {
      if (val > maxVal) { maxVal = val; maxDay = day; maxHour = hour; }
    });
  });
  if (maxVal > 0) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const endHour = maxHour + 1;
    insights.push({
      id: "peak-hours",
      type: "tip",
      message: `Your productivity peaks on ${days[maxDay]}s between ${maxHour}:00 and ${endHour}:00.`,
      priority: 3,
    });
  }

  const efficiency = getEfficiencyScores(tracks, topics, subtopics, sessions);
  if (efficiency.length >= 2) {
    insights.push({
      id: "pace-comparison",
      type: "success",
      message: `You're progressing faster in ${efficiency[0].name} than in ${efficiency[efficiency.length - 1].name}.`,
      priority: 4,
    });
  }

  const forecast = getGoalForecast(sessions, topics, subtopics, yearlyGoalHours, yearStart, yearEnd);
  const reframe = getGoalReframeMessage(sessions, settings ?? null, yearStart, yearEnd, forecast.projectedHours);
  if (forecast.onTrack) {
    const excess = forecast.projectedHours - yearlyGoalHours;
    if (excess > 0) {
      insights.push({
        id: "yearly-forecast",
        type: "success",
        message: `If you maintain this pace, you will exceed your yearly target by ${Math.round(excess)} hours.`,
        priority: 5,
      });
    }
  } else {
    insights.push({
      id: "yearly-behind",
      type: "warning",
      message: reframe,
      priority: 5,
    });
  }

  const dueForReview = getTopicsDueForReview(topics);
  if (dueForReview.length >= 3) {
    insights.push({
      id: "review-due",
      type: "tip",
      message: `${dueForReview.length} topics are due for review. Refresh them to lock in retention.`,
      priority: 6,
    });
  }

  const dominantSkip = getDominantSkipReason(skipLogs);
  if (dominantSkip) {
    insights.push({
      id: "skip-pattern",
      type: "tip",
      message: getSkipInsightMessage(dominantSkip),
      priority: 7,
    });
  }

  if (streak >= 7) {
    insights.push({
      id: "streak-celebration",
      type: "success",
      message: `Amazing! You're on a ${streak}-day learning streak. Keep the momentum going!`,
      priority: 6,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

export function getCompletionTrends(sessions: LearningSession[], subtopics: Subtopic[], weeks: number) {
  const trends: { week: string; hours: number; completed: number }[] = [];
  const today = parseLocalDate(todayISO());
  for (let i = weeks - 1; i >= 0; i--) {
    const { start, end } = getCalendarWeekRange(i, today);
    const weekLabel = format(start, "MMM d");
    const hours = sessions
      .filter((s) => { const d = parseISO(s.date); return d >= start && d <= end; })
      .reduce((sum, s) => sum + s.duration, 0) / 3600000;
    const completed = subtopics.filter((s) => {
      const d = parseISO(s.updatedAt);
      return d >= start && d <= end && (s.status === "completed" || s.status === "mastered");
    }).length;
    trends.push({ week: weekLabel, hours, completed });
  }
  return trends;
}

/** Daily hours + completions — always shows full day range (min 7 days) */
export function getCompletionTrendsDaily(
  sessions: LearningSession[],
  subtopics: Subtopic[],
  days: number
) {
  const span = Math.max(7, days);
  const result: { label: string; date: string; hours: number; completed: number }[] = [];
  for (let i = span - 1; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const key = format(d, "yyyy-MM-dd");
    const dayStart = startOfDay(d);
    const dayEnd = endOfDay(d);
    const hours =
      sessions.filter((s) => s.date === key).reduce((sum, s) => sum + s.duration, 0) / 3600000;
    const completed = subtopics.filter((s) => {
      const updated = parseISO(s.updatedAt);
      return (
        updated >= dayStart &&
        updated <= dayEnd &&
        (s.status === "completed" || s.status === "mastered")
      );
    }).length;
    result.push({
      date: key,
      label: format(d, span <= 14 ? "EEE" : "MMM d"),
      hours: Math.round(hours * 10) / 10,
      completed,
    });
  }
  return result;
}

export function getDifficultyAnalytics(subtopics: Subtopic[], sessions: LearningSession[]) {
  const difficulties = ["easy", "medium", "hard", "expert"] as const;
  return difficulties.map((diff) => {
    const subs = subtopics.filter((s) => s.difficulty === diff && !s.archived);
    const completed = subs.filter((s) => s.status === "completed" || s.status === "mastered").length;
    const hours = sessions.length > 0 ? 0 : 0;
    return {
      difficulty: diff,
      total: subs.length,
      completed,
      completionRate: subs.length > 0 ? Math.round((completed / subs.length) * 100) : 0,
      hours,
    };
  });
}

export function getDaysRemainingInYear(yearEnd: string): number {
  return Math.max(0, differenceInDays(parseISO(yearEnd), new Date()));
}

export function countCompletedItems(subtopics: Subtopic[], modules: Module[], topics: Topic[]) {
  const activeSubs = subtopics.filter((s) => !s.archived);
  const completedSubtopics = activeSubs.filter((s) => s.status === "completed" || s.status === "mastered").length;

  const completedTopics = topics.filter((t) => !t.archived).filter((t) => isTopicComplete(t, subtopics)).length;

  const completedModules = modules.filter((m) => !m.archived).filter((m) => {
    const modTopics = topics.filter((t) => t.moduleId === m.id && !t.archived);
    return modTopics.length > 0 && modTopics.every((t) => isTopicComplete(t, subtopics));
  }).length;

  return { completedSubtopics, completedTopics, completedModules };
}

// ─── Analytics page helpers ───────────────────────────────────────────────

export type ConsistencyDayStatus = "on_pace" | "partial" | "missed" | "skipped" | "future";

export interface ConsistencyCalendarDay {
  date: string;
  hours: number;
  status: ConsistencyDayStatus;
  skipReason?: SkipReason;
  avgQuality: number | null;
  topicLabels: string[];
}

export interface AnalyticsKpis {
  hoursThisWeek: number;
  hoursLastWeek: number;
  hoursWeekDelta: number;
  avgQualityThisWeek: number | null;
  ratedSessionsThisWeek: number;
  problemsThisWeek: number;
  peakFocusLabel: string;
  onPaceToday: boolean;
  hoursLeftToday: number;
  totalHours: number;
}

export interface LearningVelocityWithDelta {
  topicsPerWeek: number;
  topicsPriorWeek: number;
  modulesPerMonth: number;
  modulesPriorMonth: number;
  hoursPerWeek: number;
  hoursPriorWeek: number;
}

export interface AnalyticsDiagnostics {
  timeInvestment: string;
  distribution: string;
  efficiency: string;
  consistency: string;
  velocity: string;
}

export const CHART_TOOLTIP_STYLE = {
  background: "#18181b",
  border: "0.5px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
};

const SKIP_LABELS: Record<SkipReason, string> = {
  "too-tired": "Too tired",
  "too-busy": "Too busy",
  "unclear-what-to-do": "Unclear what to do",
  forgot: "Forgot",
  other: "Other",
};

/** Drop leading weeks with no activity (keep one empty week before first data point). */
export function trimLeadingEmptyWeeks<T>(
  data: T[],
  hasData: (d: T) => boolean
): T[] {
  const idx = data.findIndex(hasData);
  if (idx <= 0) return data;
  return data.slice(Math.max(0, idx - 1));
}

export function trimLeadingEmptyProblemWeeks(
  data: { easy: number; medium: number; hard: number }[]
) {
  return trimLeadingEmptyWeeks(data, (d) => d.easy + d.medium + d.hard > 0);
}

export function getPeakFocusLabel(sessions: LearningSession[]): string {
  const heatmap = getFocusHeatmap(sessions);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let maxVal = 0;
  let maxDay = 0;
  let maxHour = 0;
  heatmap.forEach((row, day) =>
    row.forEach((val, hour) => {
      if (val > maxVal) {
        maxVal = val;
        maxDay = day;
        maxHour = hour;
      }
    })
  );
  if (maxVal === 0) return "Log sessions to find your peak focus window.";
  return `${days[maxDay]}s ${maxHour}:00–${maxHour + 1}:00`;
}

export function getConsistencyCalendar(
  sessions: LearningSession[],
  topics: Topic[],
  skipLogs: SkipLog[],
  dailyGoal: number,
  days = 84
): ConsistencyCalendarDay[] {
  const today = todayISO();
  const threshold = dailyGoal * 0.8;
  const skipMap = new Map(skipLogs.map((s) => [s.date, s.reason]));
  const topicMap = new Map(topics.map((t) => [t.id, t.name]));
  const end = parseLocalDate(today);
  const alignedStart = weekStart(subDays(end, days - 1));
  const calendarEnd = weekEnd(end);

  return eachDayOfInterval({ start: alignedStart, end: calendarEnd }).map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const daySessions = sessions.filter((s) => s.date === key);
    const hours = daySessions.reduce((sum, s) => sum + s.duration, 0) / 3600000;
    const rated = daySessions.filter((s) => s.qualityRating);
    const avgQuality = rated.length
      ? Math.round((rated.reduce((sum, s) => sum + (s.qualityRating ?? 0), 0) / rated.length) * 10) / 10
      : null;
    const topicLabels = [
      ...new Set(
        daySessions
          .map((s) => (s.topicId ? topicMap.get(s.topicId) : undefined))
          .filter(Boolean)
      ),
    ] as string[];

    let status: ConsistencyDayStatus;
    if (key > today) status = "future";
    else if (skipMap.has(key) && hours === 0) status = "skipped";
    else if (hours >= threshold) status = "on_pace";
    else if (hours > 0) status = "partial";
    else if (key < today) status = "missed";
    else status = "partial";

    return {
      date: key,
      hours: Math.round(hours * 10) / 10,
      status,
      skipReason: skipMap.get(key),
      avgQuality,
      topicLabels: topicLabels.slice(0, 3),
    };
  });
}

export function getConsistencyInsight(days: ConsistencyCalendarDay[]): string {
  const today = todayISO();
  const past = days.filter((d) => d.date < today && d.status !== "future");
  if (past.length === 0) return "Your consistency calendar fills in as you log study days.";
  const missed = past.filter((d) => d.status === "missed");
  if (missed.length === 0) return "No missed days in this window — strong consistency.";
  const byDow = new Map<number, number>();
  for (const d of missed) {
    const dow = parseLocalDate(d.date).getDay();
    byDow.set(dow, (byDow.get(dow) ?? 0) + 1);
  }
  const worst = [...byDow.entries()].sort((a, b) => b[1] - a[1])[0];
  const dayNames = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
  return `You miss most often on ${dayNames[worst[0]]} (${worst[1]}×). Pre-commit a fixed slot that day.`;
}

export function getAnalyticsKpis(
  sessions: LearningSession[],
  settings: AppSettings | null | undefined,
  leetCodeLog: { date: string }[],
  pace: { onPace: boolean; hoursLeftToday: number }
): AnalyticsKpis {
  const weekly = getHoursByWeek(sessions, 2);
  const hoursThisWeek = weekly[1]?.hours ?? 0;
  const hoursLastWeek = weekly[0]?.hours ?? 0;
  const quality = getQualityByWeek(sessions, 2);
  const today = parseLocalDate(todayISO());
  const thisWeek = getCalendarWeekRange(0, today);
  const thisWeekStartKey = format(thisWeek.start, "yyyy-MM-dd");
  const thisWeekEndKey = format(thisWeek.end, "yyyy-MM-dd");
  const ratedThisWeek = sessions.filter(
    (s) => s.date >= thisWeekStartKey && s.date <= thisWeekEndKey && s.qualityRating
  );

  const problemsThisWeek = leetCodeLog.filter(
    (e) => e.date >= thisWeekStartKey && e.date <= thisWeekEndKey
  ).length;

  return {
    hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
    hoursLastWeek: Math.round(hoursLastWeek * 10) / 10,
    hoursWeekDelta: Math.round((hoursThisWeek - hoursLastWeek) * 10) / 10,
    avgQualityThisWeek: quality[1]?.quality ?? null,
    ratedSessionsThisWeek: ratedThisWeek.length,
    problemsThisWeek,
    peakFocusLabel: getPeakFocusLabel(sessions),
    onPaceToday: pace.onPace,
    hoursLeftToday: pace.hoursLeftToday,
    totalHours: Math.round((getTotalHours(sessions) / 3600000) * 10) / 10,
  };
}

export function getLearningVelocityWithDelta(
  subtopics: Subtopic[],
  sessions: LearningSession[]
): LearningVelocityWithDelta {
  const today = parseLocalDate(todayISO());
  const monthAgo = subDays(today, 30);
  const twoMonthsAgo = subDays(today, 60);

  const completedInRange = (start: Date, end: Date) =>
    subtopics.filter(
      (s) =>
        !s.archived &&
        (s.status === "completed" || s.status === "mastered") &&
        parseISO(s.updatedAt) >= start &&
        parseISO(s.updatedAt) <= end
    ).length;

  const modulesInRange = (start: Date, end: Date) =>
    new Set(
      subtopics
        .filter(
          (s) =>
            !s.archived &&
            (s.status === "completed" || s.status === "mastered") &&
            parseISO(s.updatedAt) >= start &&
            parseISO(s.updatedAt) <= end
        )
        .map((s) => s.moduleId)
    ).size;

  const hoursInRange = (startKey: string, endKey: string) =>
    sessions
      .filter((s) => s.date >= startKey && s.date <= endKey)
      .reduce((sum, s) => sum + s.duration, 0) / 3600000;

  const thisWeek = getCalendarWeekRange(0, today);
  const priorWeek = getCalendarWeekRange(1, today);
  const thisWeekStartKey = format(thisWeek.start, "yyyy-MM-dd");
  const thisWeekEndKey = format(thisWeek.end, "yyyy-MM-dd");
  const priorWeekStartKey = format(priorWeek.start, "yyyy-MM-dd");
  const priorWeekEndKey = format(priorWeek.end, "yyyy-MM-dd");

  return {
    topicsPerWeek: completedInRange(thisWeek.start, today),
    topicsPriorWeek: completedInRange(priorWeek.start, priorWeek.end),
    modulesPerMonth: modulesInRange(monthAgo, today),
    modulesPriorMonth: modulesInRange(twoMonthsAgo, subDays(today, 30)),
    hoursPerWeek: Math.round(hoursInRange(thisWeekStartKey, thisWeekEndKey) * 10) / 10,
    hoursPriorWeek: Math.round(hoursInRange(priorWeekStartKey, priorWeekEndKey) * 10) / 10,
  };
}

export function getActiveDistribution(
  sessions: LearningSession[],
  tracks: Track[]
) {
  return withPercentages(getHoursByTrack(sessions, tracks)).filter((d) => d.value > 0);
}

export function getAnalyticsDiagnostics(
  sessions: LearningSession[],
  tracks: Track[],
  topics: Topic[],
  subtopics: Subtopic[],
  skipLogs: SkipLog[],
  dailyGoal: number,
  kpis: AnalyticsKpis,
  velocity: LearningVelocityWithDelta,
  efficiency: ReturnType<typeof getEfficiencyScores>,
  consistencyDays: ConsistencyCalendarDay[]
): AnalyticsDiagnostics {
  const activeDist = getActiveDistribution(sessions, tracks);
  const top = activeDist[0];
  const neglected = activeDist.filter((d) => d.percentage > 0 && d.percentage < 5);

  let timeInvestment = "Log a few more days to see weekly patterns.";
  if (kpis.hoursThisWeek > 0) {
    const deltaLabel =
      kpis.hoursWeekDelta >= 0 ? `↑${kpis.hoursWeekDelta}h` : `↓${Math.abs(kpis.hoursWeekDelta)}h`;
    timeInvestment = `This week: ${kpis.hoursThisWeek}h (${deltaLabel} vs last week).`;
    if (kpis.avgQualityThisWeek !== null && kpis.avgQualityThisWeek < 2) {
      timeInvestment += " Volume is up but quality is low — protect deep-focus blocks.";
    } else if (kpis.ratedSessionsThisWeek === 0) {
      timeInvestment += " Rate sessions after stopping to unlock the quality trend.";
    }
  }

  let distribution = "Spread time across tracks for balanced growth.";
  if (top) {
    distribution = `${top.percentage}% of your time goes to ${top.name}.`;
    if (neglected.length > 0) {
      distribution += ` ${neglected.map((d) => d.name).join(", ")} get almost none — consider a short session there.`;
    }
  }

  let efficiencyMsg = "Efficiency = (progress × avg quality) ÷ hours. Higher means more progress per hour invested.";
  const activeEff = efficiency.filter((e) => e.hours > 0);
  if (activeEff.length >= 2) {
    const best = activeEff[0];
    const worst = activeEff[activeEff.length - 1];
    efficiencyMsg = `${best.name} returns ${(best.efficiency / Math.max(worst.efficiency, 0.1)).toFixed(0)}× the ROI of ${worst.name} per hour.`;
  }

  return {
    timeInvestment,
    distribution,
    efficiency: efficiencyMsg,
    consistency: getConsistencyInsight(consistencyDays),
    velocity:
      velocity.hoursPerWeek >= velocity.hoursPriorWeek
        ? `Hours/week is ${velocity.hoursPerWeek}h (↑ vs ${velocity.hoursPriorWeek}h prior week).`
        : `Hours/week dipped to ${velocity.hoursPerWeek}h (was ${velocity.hoursPriorWeek}h). Reclaim one on-pace day.`,
  };
}

export { SKIP_LABELS as SKIP_REASON_LABELS };
