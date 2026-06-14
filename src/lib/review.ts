import { eachMonthOfInterval, format, getWeek, parseISO } from "date-fns";
import type { AppSettings, LearningSession, Module, Subtopic, Topic, Track, Insight } from "./types";
import {
  DEFAULT_YEAR_START,
  DEFAULT_YEAR_END,
  getTotalHours,
  countCompletedItems,
  getTopTopics,
  withPercentages,
  getHoursByTrack,
  generateInsights,
} from "./analytics";
import { calculateStreaks, parseLocalDate } from "./utils";

export interface ReviewWindow {
  yearStart: string;
  yearEnd: string;
  label: string;
}

export interface AnnualReport {
  window: ReviewWindow;
  totalHours: number;
  totalSessions: number;
  avgSession: number;
  completed: ReturnType<typeof countCompletedItems>;
  streaks: ReturnType<typeof calculateStreaks>;
  topTrack: { name: string; percentage: number } | undefined;
  topTopics: { name: string; hours: number }[];
  bestMonth: { month: string; hours: number } | undefined;
  bestWeekHours: number;
  monthlyHours: { month: string; hours: number }[];
  insights: Insight[];
}

export function getReviewWindow(settings: AppSettings | null | undefined): ReviewWindow {
  const yearStart = settings?.yearStart ?? DEFAULT_YEAR_START;
  const yearEnd = settings?.yearEnd ?? DEFAULT_YEAR_END;
  return {
    yearStart,
    yearEnd,
    label: `${format(parseLocalDate(yearStart), "MMM yyyy")} – ${format(parseLocalDate(yearEnd), "MMM yyyy")}`,
  };
}

export function filterSessionsInWindow(
  sessions: LearningSession[],
  yearStart: string,
  yearEnd: string
): LearningSession[] {
  return sessions.filter((s) => s.date >= yearStart && s.date <= yearEnd);
}

export function buildAnnualReport(
  sessions: LearningSession[],
  subtopics: Subtopic[],
  modules: Module[],
  topics: Topic[],
  tracks: Track[],
  settings: AppSettings | null | undefined
): AnnualReport {
  const window = getReviewWindow(settings);
  const windowSessions = filterSessionsInWindow(sessions, window.yearStart, window.yearEnd);

  const totalHours = getTotalHours(windowSessions) / 3600000;
  const totalSessions = windowSessions.length;
  const avgSession = totalSessions > 0 ? totalHours / totalSessions : 0;
  const completed = countCompletedItems(subtopics, modules, topics);
  const streaks = calculateStreaks(windowSessions.map((s) => s.date));
  const distribution = withPercentages(getHoursByTrack(windowSessions, tracks));
  const topTrack = distribution.sort((a, b) => b.value - a.value)[0];
  const topTopics = getTopTopics(windowSessions, topics, 5, subtopics);

  const interval = {
    start: parseLocalDate(window.yearStart),
    end: parseLocalDate(window.yearEnd),
  };
  const monthlyHours = eachMonthOfInterval(interval).map((monthDate) => {
    const monthKey = format(monthDate, "yyyy-MM");
    const hours =
      windowSessions
        .filter((s) => s.date.startsWith(monthKey))
        .reduce((sum, s) => sum + s.duration, 0) / 3600000;
    return { month: format(monthDate, "MMMM yyyy"), hours };
  });
  const bestMonth = [...monthlyHours].sort((a, b) => b.hours - a.hours)[0];

  const weeklyHours = new Map<number, number>();
  windowSessions.forEach((s) => {
    const week = getWeek(parseISO(s.date));
    weeklyHours.set(week, (weeklyHours.get(week) || 0) + s.duration);
  });
  const bestWeekEntry = [...weeklyHours.entries()].sort((a, b) => b[1] - a[1])[0];

  const yearlyGoal = settings?.tieredGoal?.stretch ?? settings?.yearlyHourGoal ?? 2000;
  const insights = generateInsights(
    tracks,
    modules,
    topics,
    subtopics,
    windowSessions,
    streaks.current,
    yearlyGoal,
    window.yearStart,
    window.yearEnd,
    settings
  );

  return {
    window,
    totalHours,
    totalSessions,
    avgSession,
    completed,
    streaks,
    topTrack: topTrack ? { name: topTrack.name, percentage: topTrack.percentage } : undefined,
    topTopics,
    bestMonth: bestMonth?.hours ? bestMonth : undefined,
    bestWeekHours: (bestWeekEntry?.[1] || 0) / 3600000,
    monthlyHours,
    insights,
  };
}

export function buildReviewNarrative(report: AnnualReport): string[] {
  const { window } = report;
  return [
    `During ${window.label}, you invested ${report.totalHours.toFixed(0)} hours across ${report.totalSessions} learning sessions.`,
    report.topTrack
      ? `Your primary focus was ${report.topTrack.name}, accounting for ${report.topTrack.percentage}% of your study time.`
      : "",
    `You completed ${report.completed.completedSubtopics} subtopics, ${report.completed.completedTopics} topics, and ${report.completed.completedModules} modules.`,
    report.streaks.longest > 0
      ? `Your longest learning streak reached ${report.streaks.longest} consecutive days.`
      : "",
    report.bestMonth
      ? `Your most productive month was ${report.bestMonth.month} with ${report.bestMonth.hours.toFixed(0)} hours.`
      : "",
    report.topTopics[0]
      ? `You spent the most time on ${report.topTopics[0].name} (${report.topTopics[0].hours.toFixed(1)} hours).`
      : "",
    "Keep pushing forward — every hour invested compounds into expertise.",
  ].filter(Boolean);
}
