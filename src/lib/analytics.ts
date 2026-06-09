import {
  differenceInDays,
  parseISO,
  format,
  subDays,
  addDays,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
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
} from "./types";
import {
  calculateSubtopicProgress,
  getMomentumLevel,
  todayISO,
  parseLocalDate,
} from "./utils";

export const DEFAULT_YEAR_START = "2026-06-01";
export const DEFAULT_YEAR_END = "2027-04-30";

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

export function getTrackProgress(trackId: string, topics: Topic[], subtopics: Subtopic[]) {
  const trackTopics = topics.filter((t) => t.trackId === trackId && !t.archived);
  const total = trackTopics.length;
  const completed = trackTopics.filter((t) => isTopicComplete(t, subtopics)).length;
  const inProgress = trackTopics.filter((t) => {
    const subs = subtopics.filter((s) => s.topicId === t.id && !s.archived);
    return subs.some((s) => s.status === "in_progress") && !isTopicComplete(t, subtopics);
  }).length;
  return {
    total,
    completed,
    mastered: 0,
    inProgress,
    percentage: calculateTopicsProgress(trackTopics, subtopics),
  };
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

/** Rolling 7-day buckets ending today so the current week is always included */
export function getHoursByWeek(sessions: LearningSession[], weekCount = 12) {
  const result: { date: string; hours: number; label: string }[] = [];
  const today = new Date();

  for (let w = weekCount - 1; w >= 0; w--) {
    const weekEnd = subDays(today, w * 7);
    const weekStart = subDays(weekEnd, 6);
    const startKey = format(weekStart, "yyyy-MM-dd");
    const endKey = format(weekEnd, "yyyy-MM-dd");
    const hours =
      sessions
        .filter((s) => s.date >= startKey && s.date <= endKey)
        .reduce((sum, s) => sum + s.duration, 0) / 3600000;

    result.push({
      date: endKey,
      hours,
      label: w === 0 ? "This week" : format(weekStart, "MMM d"),
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

export function getTopTopics(
  sessions: LearningSession[],
  topics: Topic[],
  limit = 10
) {
  const map = new Map<string, number>();
  sessions.forEach((s) => {
    if (s.topicId) map.set(s.topicId, (map.get(s.topicId) || 0) + s.duration);
  });
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, duration]) => ({
      name: topics.find((t) => t.id === id)?.name || "Unknown",
      hours: duration / 3600000,
    }));
}

export function getLearningVelocity(subtopics: Subtopic[], sessions: LearningSession[]) {
  const now = new Date();
  const weekAgo = subDays(now, 7);
  const monthAgo = subDays(now, 30);

  const recentCompleted = subtopics.filter(
    (s) => !s.archived && (s.status === "completed" || s.status === "mastered") &&
      parseISO(s.updatedAt) >= weekAgo
  ).length;

  const recentModules = new Set(
    subtopics.filter(
      (s) => !s.archived && (s.status === "completed" || s.status === "mastered") &&
        parseISO(s.updatedAt) >= monthAgo
    ).map((s) => s.moduleId)
  ).size;

  const recentHours = sessions
    .filter((s) => parseISO(s.date) >= weekAgo)
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
    const hours = sessions.filter((s) => s.trackId === track.id).reduce((sum, s) => sum + s.duration, 0) / 3600000;
    const efficiency = hours > 0 ? progress / hours : 0;
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
  yearEnd: string = DEFAULT_YEAR_END
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
    if (daysSince >= 7) {
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
      message: `At your current pace, you may fall short of your ${yearlyGoalHours}h yearly goal. Consider increasing daily study time.`,
      priority: 5,
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
  for (let i = weeks - 1; i >= 0; i--) {
    const end = subDays(new Date(), i * 7);
    const start = subDays(end, 6);
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
