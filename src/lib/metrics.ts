import { differenceInDays, format, parseISO, subDays, addDays, eachDayOfInterval } from "date-fns";
import type {
  AppSettings,
  LearningSession,
  Module,
  Subtopic,
  Topic,
  Track,
} from "./types";
import type {
  DailyPaceTarget,
  MomentumBreakdown,
  PinnedNextItem,
  SkipLog,
  TrackHealth,
  WeeklyConsistency,
} from "./types/metrics";
import { getTotalHours, getTodayHours } from "./analytics";
import { getTargetGoal, getWeeksUntilYearEnd, getHoursLoggedThisYear } from "./goals";
import { isTopicComplete } from "./in-progress";
import {
  getCalendarWeekRange,
  isSubtopicDone,
  parseLocalDate,
  todayISO,
} from "./utils";

export function getDailyPaceTarget(
  settings: AppSettings | null | undefined,
  sessions: LearningSession[],
  yearStart: string,
  yearEnd: string
): DailyPaceTarget {
  const weeksRemaining = getWeeksUntilYearEnd(yearEnd);
  const hoursLoggedTotal = getHoursLoggedThisYear(sessions, yearStart, yearEnd);
  const target = getTargetGoal(settings);
  const hoursRemaining = Math.max(0, target - hoursLoggedTotal);
  // Days-based catch-up: as days run out (and remaining stays high), the daily
  // ask rises automatically, rolling any shortfall forward instead of hiding it
  // behind a flat weekly average.
  const daysRemaining = Math.max(
    1,
    differenceInDays(parseLocalDate(yearEnd), parseLocalDate(todayISO()))
  );
  const hoursNeededToday = Math.round((hoursRemaining / daysRemaining) * 10) / 10;
  const hoursLoggedToday = getTodayHours(sessions) / 3600000;
  const hoursLeftToday = Math.max(0, Math.round((hoursNeededToday - hoursLoggedToday) * 10) / 10);

  return {
    hoursNeededToday,
    hoursLoggedToday: Math.round(hoursLoggedToday * 10) / 10,
    onPace: hoursLoggedToday >= hoursNeededToday,
    weeksRemaining,
    hoursLeftToday,
  };
}

export function getWeeklyConsistency(
  sessions: LearningSession[],
  dailyGoal: number
): WeeklyConsistency {
  const threshold = dailyGoal * 0.8;
  const today = parseLocalDate(todayISO());
  const currentWeek = getCalendarWeekRange(0, today);
  const priorWeek = getCalendarWeekRange(1, today);

  const countOnTarget = (start: Date, end: Date) => {
    let count = 0;
    eachDayOfInterval({ start, end }).forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      const hours =
        sessions.filter((s) => s.date === key).reduce((sum, s) => sum + s.duration, 0) / 3600000;
      if (hours >= threshold) count++;
    });
    return count;
  };

  return {
    daysOnTarget: countOnTarget(currentWeek.start, currentWeek.end),
    totalDays: 7,
    lastWeekDays: countOnTarget(priorWeek.start, priorWeek.end),
  };
}

export function getMomentumBreakdown(
  sessions: LearningSession[],
  topics: Topic[],
  subtopics: Subtopic[],
  tracks: Track[],
  settings: AppSettings | null | undefined,
  yearStart: string,
  yearEnd: string
): MomentumBreakdown {
  const now = new Date();
  // Use local-date cutoffs for date-only fields (s.date) to avoid timezone off-by-one.
  const today = parseLocalDate(todayISO());
  const cutoff14 = subDays(today, 13); // 14-day window inclusive of today
  const { start: weekStartDate } = getCalendarWeekRange(0, today);
  const recentSessions = sessions.filter((s) => parseLocalDate(s.date) >= cutoff14);
  const recentDays = new Set(recentSessions.map((s) => s.date)).size;
  const consistency = Math.min(25, Math.round((recentDays / 14) * 25));

  const target = getTargetGoal(settings);
  const weeksRemaining = getWeeksUntilYearEnd(yearEnd);
  const hoursThisWeek =
    sessions
      .filter((s) => parseLocalDate(s.date) >= weekStartDate)
      .reduce((sum, s) => sum + s.duration, 0) / 3600000;
  const weeklyTarget = weeksRemaining > 0 ? (Math.max(0, target - getHoursLoggedThisYear(sessions, yearStart, yearEnd)) / weeksRemaining) : 0;
  const volume = weeklyTarget > 0 ? Math.min(25, Math.round((hoursThisWeek / weeklyTarget) * 25)) : 0;

  const completedThisPeriod = subtopics.filter(
    (s) => !s.archived && isSubtopicDone(s.status) && parseISO(s.updatedAt) >= subDays(now, 14)
  ).length;
  const completedPrior = subtopics.filter(
    (s) => !s.archived && isSubtopicDone(s.status) &&
      parseISO(s.updatedAt) >= subDays(now, 28) && parseISO(s.updatedAt) < subDays(now, 14)
  ).length;
  const velocity = completedPrior > 0
    ? Math.min(25, Math.round((completedThisPeriod / completedPrior) * 12.5))
    : completedThisPeriod > 0 ? 15 : 5;

  const neglected = tracks.filter((t) => {
    const trackSessions = sessions.filter((s) => s.trackId === t.id);
    if (trackSessions.length === 0) return true;
    const last = trackSessions.map((s) => s.date).sort().pop()!;
    return differenceInDays(parseLocalDate(todayISO()), parseLocalDate(last)) > 14;
  }).length;
  const balance = Math.max(0, 25 - neglected * 5);

  const scores = { consistency, volume, velocity, balance };
  const weakest = (Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0]) as MomentumBreakdown["weakest"];
  const total = consistency + volume + velocity + balance;

  const dragMessages: Record<MomentumBreakdown["weakest"], string> = {
    consistency: "Consistency is your biggest drag. Study on more days this week.",
    volume: "Volume is your biggest drag. Log more hours toward your weekly target.",
    velocity: "Velocity is your biggest drag. Finish more topics to pick up pace.",
    balance: `Balance (${balance}/25) is your biggest drag. Start a session on a neglected track.`,
  };

  const neglectedTrack = tracks.find((t) => {
    const trackSessions = sessions.filter((s) => s.trackId === t.id);
    if (trackSessions.length === 0) return true;
    const last = trackSessions.map((s) => s.date).sort().pop()!;
    return differenceInDays(parseLocalDate(todayISO()), parseLocalDate(last)) > 14;
  });

  return {
    ...scores,
    total,
    weakest,
    dragMessage: weakest === "balance" && neglectedTrack
      ? `Balance (${balance}/25) is your biggest drag. Start a ${neglectedTrack.name} session to improve it.`
      : dragMessages[weakest],
  };
}

export function getTrackBalance(
  tracks: Track[],
  sessions: LearningSession[],
  settings: AppSettings | null | undefined
): TrackHealth[] {
  const totalMs = getTotalHours(sessions);
  const today = todayISO();

  return tracks.map((track) => {
    const trackSessions = sessions.filter((s) => s.trackId === track.id);
    const threshold = settings?.trackSettings?.[track.id]?.neglectThresholdDays ?? 14;
    const lastStudied = trackSessions.length > 0
      ? trackSessions.map((s) => s.date).sort().pop()!
      : null;
    const daysSinceStudied = lastStudied
      ? differenceInDays(parseLocalDate(today), parseLocalDate(lastStudied))
      : 999;
    const trackMs = trackSessions.reduce((sum, s) => sum + s.duration, 0);

    let status: TrackHealth["status"] = "healthy";
    if (daysSinceStudied >= threshold) status = "neglected";
    else if (daysSinceStudied >= 7) status = "at-risk";

    return {
      trackId: track.id,
      trackName: track.name,
      lastStudied,
      daysSinceStudied: lastStudied ? daysSinceStudied : -1,
      status,
      shareOfTotalTime: totalMs > 0 ? Math.round((trackMs / totalMs) * 100) : 0,
    };
  });
}

export function resolveNextUpItem(
  track: Track,
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[]
): PinnedNextItem | null {
  if (track.pinnedNextItem) return track.pinnedNextItem;

  const trackModules = modules.filter((m) => m.trackId === track.id && !m.archived).sort((a, b) => a.order - b.order);
  for (const mod of trackModules) {
    const modTopics = topics.filter((t) => t.moduleId === mod.id && !t.archived).sort((a, b) => a.order - b.order);
    for (const topic of modTopics) {
      if (isTopicComplete(topic, subtopics)) continue;
      const subs = subtopics.filter((s) => s.topicId === topic.id && !s.archived).sort((a, b) => a.order - b.order);
      const nextSub = subs.find((s) => !isSubtopicDone(s.status));
      if (nextSub) {
        return { type: "subtopic", id: nextSub.id, label: nextSub.name };
      }
      if (topic.status !== "completed" && topic.status !== "mastered") {
        return { type: "topic", id: topic.id, label: topic.name };
      }
    }
    const modIncomplete = modTopics.some((t) => !isTopicComplete(t, subtopics));
    if (modIncomplete) {
      return { type: "module", id: mod.id, label: mod.name };
    }
  }
  return null;
}

export function getNextUpHref(item: PinnedNextItem, trackId: string): string {
  const base = `/tracks?track=${trackId}`;
  if (item.type === "module") return `${base}&module=${item.id}`;
  if (item.type === "topic") return `${base}&topic=${item.id}`;
  return `${base}&subtopic=${item.id}`;
}

export function computeNextReviewDate(confidence: 1 | 2 | 3 | 4 | 5, fromDate?: string): string {
  const base = fromDate ? parseLocalDate(fromDate) : parseLocalDate(todayISO());
  return format(addDays(base, confidence * 3), "yyyy-MM-dd");
}

export function isTopicDueForReview(topic: Topic): boolean {
  if (!topic.completionMeta) return false;
  if (topic.status !== "completed" && topic.status !== "mastered") return false;
  return (
    topic.completionMeta.nextReviewDue <= todayISO() &&
    topic.completionMeta.confidenceRating < 4
  );
}

export function getReviewDueLabel(topic: Topic): string | null {
  if (!topic.completionMeta) return null;
  if (topic.status !== "completed" && topic.status !== "mastered") return null;
  const days = differenceInDays(
    parseLocalDate(topic.completionMeta.nextReviewDue),
    parseLocalDate(todayISO())
  );
  if (days < 0) return `Review overdue · ${Math.abs(days)}d`;
  if (days === 0) return "Review due today";
  if (days <= 2) return `Review in ${days}d`;
  return null;
}

export function getTopicsDueForReview(topics: Topic[]): Topic[] {
  return topics.filter(isTopicDueForReview);
}

export function getQualityWeight(rating?: 1 | 2 | 3): number {
  if (rating === 1) return 0.7;
  if (rating === 3) return 1.5;
  return 1.0;
}

export function getAverageSessionQuality(sessions: LearningSession[]): number {
  const rated = sessions.filter((s) => s.qualityRating);
  if (rated.length === 0) return 1;
  const sum = rated.reduce((acc, s) => acc + getQualityWeight(s.qualityRating), 0);
  return sum / rated.length;
}

export function getDominantSkipReason(skipLogs: SkipLog[]): SkipReason | null {
  if (skipLogs.length < 4) return null;
  const counts = new Map<SkipReason, number>();
  for (const log of skipLogs) {
    counts.set(log.reason, (counts.get(log.reason) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0][1] >= 4 ? sorted[0][0] : null;
}

export type SkipReason = import("./types/metrics").SkipReason;

export function getSkipInsightMessage(reason: SkipReason): string {
  const messages: Record<SkipReason, string> = {
    "too-tired": "You skip most often when tired. Try shorter 25-min sessions instead.",
    "too-busy": "Busy days are your main blocker. Schedule a fixed 30-min slot.",
    "unclear-what-to-do": "You skip most often when unclear what to do. Pin a 'next up' item to each track.",
    forgot: "Forgetting to study is common. Enable a daily reminder or check 'Need today' each morning.",
    other: "Track patterns in your skip reasons to find what helps you show up.",
  };
  return messages[reason];
}

/** Weekday hours/day needed to reach the Target tier, accounting for hours already logged. */
export function getSuggestedDailyFromTarget(
  settings: AppSettings | null | undefined,
  sessions: LearningSession[] = [],
  yearStart?: string,
  yearEnd?: string
): number {
  const target = getTargetGoal(settings);
  const end = yearEnd ?? settings?.yearEnd ?? "2026-12-31";
  const start = yearStart ?? settings?.yearStart ?? "2026-06-01";
  const weeks = getWeeksUntilYearEnd(end);
  const logged = getHoursLoggedThisYear(sessions, start, end);
  const remaining = Math.max(0, target - logged);
  // ~5 weekdays per week
  return Math.round((remaining / weeks / 5) * 10) / 10;
}
