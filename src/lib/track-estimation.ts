import {
  addMonths,
  addDays,
  differenceInDays,
  eachMonthOfInterval,
  endOfMonth,
  format,
} from "date-fns";
import { db } from "./db";
import { getTrackProgress } from "./analytics";
import type {
  Track,
  Module,
  Topic,
  Subtopic,
  LearningSession,
  TrackEstimate,
  TrackEstimationStats,
  TrackEstimationPoint,
  TrackPaceStatus,
} from "./types";
import { DEFAULT_YEAR_START } from "./analytics";
import { nowISO, todayISO, parseLocalDate, toLocalDateKey } from "./utils";

export const TRACK_ESTIMATE_MONTH_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const DEFAULT_TRACK_TARGET_MONTHS = 6;

function isDoneAtDate(
  status: string,
  statusChangedAt: string | undefined,
  updatedAt: string,
  asOfDate: string
): boolean {
  if (status !== "completed" && status !== "mastered") return false;
  const changed = statusChangedAt ? toLocalDateKey(statusChangedAt) : updatedAt.slice(0, 10);
  return changed <= asOfDate;
}

function topicsProgressAtDate(topics: Topic[], subtopics: Subtopic[], asOfDate: string): number {
  const active = topics.filter((t) => !t.archived);
  if (active.length === 0) return 0;

  let totalWeight = 0;
  let totalUnits = 0;

  for (const topic of active) {
    const subs = subtopics.filter((s) => s.topicId === topic.id && !s.archived);
    if (subs.length > 0) {
      const done = subs.filter((s) => isDoneAtDate(s.status, s.statusChangedAt, s.updatedAt, asOfDate)).length;
      const percent = Math.round((done / subs.length) * 100);
      totalWeight += (percent / 100) * subs.length;
      totalUnits += subs.length;
    } else if (isDoneAtDate(topic.status, topic.statusChangedAt, topic.updatedAt, asOfDate)) {
      totalWeight += 1;
      totalUnits += 1;
    }
  }

  return totalUnits > 0 ? Math.round((totalWeight / totalUnits) * 100) : 0;
}

export function computeTrackProgressAtDate(
  trackId: string,
  asOfDate: string,
  topics: Topic[],
  subtopics: Subtopic[]
): number {
  const trackTopics = topics.filter((t) => t.trackId === trackId && !t.archived);
  return topicsProgressAtDate(trackTopics, subtopics, asOfDate);
}

function buildChartData(
  trackId: string,
  startDate: string,
  endDate: string,
  currentProgress: number,
  dailyProgressRate: number,
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[]
): TrackEstimationPoint[] {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const todayStr = todayISO();
  const months = eachMonthOfInterval({ start, end });

  return months.map((month) => {
    const monthEnd = endOfMonth(month);
    const rangeEnd = monthEnd > end ? end : monthEnd;
    const rangeEndStr = format(rangeEnd, "yyyy-MM-dd");
    const daysTotal = Math.max(1, differenceInDays(end, start) + 1);
    const daysToPoint = Math.max(0, differenceInDays(rangeEnd, start) + 1);
    const target = Math.min(100, Math.round((daysToPoint / daysTotal) * 100));

    const point: TrackEstimationPoint = { label: format(month, "MMM"), target };

    if (rangeEndStr <= todayStr) {
      point.actual = computeTrackProgressAtDate(trackId, rangeEndStr, topics, subtopics);
    }

    if (rangeEndStr >= todayStr) {
      const daysFromToday = Math.max(0, differenceInDays(rangeEnd, parseLocalDate(todayStr)));
      point.projected = Math.min(
        100,
        Math.round(currentProgress + dailyProgressRate * daysFromToday)
      );
    }

    return point;
  });
}

export function buildTrackEstimation(
  track: Track,
  estimate: TrackEstimate,
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[],
  sessions: LearningSession[]
): TrackEstimationStats {
  const startDate = estimate.startDate;
  const endDate = format(addMonths(parseLocalDate(startDate), estimate.targetMonths), "yyyy-MM-dd");
  const todayStr = todayISO();
  const today = parseLocalDate(todayStr);
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  const currentProgress = getTrackProgress(track.id, topics, subtopics, modules).percentage;

  const trackSessions = sessions.filter((s) => s.trackId === track.id && s.date >= startDate);
  const hoursInvested = trackSessions.reduce((sum, s) => sum + s.duration, 0) / 3600000;

  const elapsedEnd = today < start ? start : today > end ? end : today;
  const daysElapsed = Math.max(1, differenceInDays(elapsedEnd, start) + 1);
  const daysRemaining = Math.max(0, differenceInDays(end, today));
  const dailyProgressRate = currentProgress / daysElapsed;

  const recentSessions = trackSessions.filter(
    (s) => differenceInDays(today, parseLocalDate(s.date)) <= 28
  );
  const hoursPerWeek =
    recentSessions.length > 0
      ? (recentSessions.reduce((sum, s) => sum + s.duration, 0) / 3600000) / 4
      : 0;

  const projectedProgressAtDeadline = Math.min(
    100,
    Math.round(currentProgress + dailyProgressRate * daysRemaining)
  );

  let daysToComplete: number | null = null;
  let projectedCompletionDate = "—";
  let successProbability = 0;
  let paceStatus: TrackPaceStatus = "not_started";
  let paceDelta = 0;
  let insight = "";

  const daysTotal = Math.max(1, differenceInDays(end, start) + 1);
  const expectedProgress = Math.min(100, Math.round((daysElapsed / daysTotal) * 100));
  paceDelta = currentProgress - expectedProgress;

  if (currentProgress >= 100) {
    paceStatus = "completed";
    successProbability = 100;
    projectedCompletionDate = "Completed";
    insight = "Track complete — great work!";
  } else if (currentProgress === 0 && trackSessions.length === 0) {
    paceStatus = "not_started";
    successProbability = dailyProgressRate > 0 ? 20 : 10;
    insight = `Set a ${estimate.targetMonths}-month window and start studying to unlock predictions.`;
  } else if (dailyProgressRate > 0) {
    daysToComplete = Math.ceil((100 - currentProgress) / dailyProgressRate);
    const finishDate = addDays(today, daysToComplete);
    projectedCompletionDate = format(finishDate, "MMM d, yyyy");

    if (finishDate <= end) {
      const marginDays = differenceInDays(end, finishDate);
      successProbability = Math.min(100, Math.round(72 + Math.min(28, marginDays * 1.5)));
      paceStatus = paceDelta >= 8 ? "ahead" : "on_track";
      insight =
        marginDays > 14
          ? `Strong pace — on track to finish ~${marginDays} days early.`
          : `On track to finish by ${projectedCompletionDate} with current momentum.`;
    } else {
      const shortfall = 100 - projectedProgressAtDeadline;
      successProbability = Math.max(5, Math.min(65, projectedProgressAtDeadline));
      paceStatus = "behind";
      const extraMonths = Math.ceil(differenceInDays(finishDate, end) / 30);
      insight =
        shortfall > 0
          ? `Behind pace — try +${extraMonths} month${extraMonths === 1 ? "" : "s"} or increase weekly study time.`
          : `Slightly behind — add time or extend your deadline by a month.`;
    }
  } else {
    successProbability = 8;
    paceStatus = "behind";
    insight = "No progress velocity yet — complete modules to build your trend.";
  }

  if (hoursPerWeek < 1 && paceStatus === "behind") {
    successProbability = Math.max(5, successProbability - 15);
    insight = `Low study time (${hoursPerWeek.toFixed(1)}h/wk). Increase focus hours to improve odds.`;
  }

  const chartData = buildChartData(
    track.id,
    startDate,
    endDate,
    currentProgress,
    dailyProgressRate,
    modules,
    topics,
    subtopics
  );

  return {
    track,
    estimate,
    currentProgress,
    targetMonths: estimate.targetMonths,
    startDate,
    endDate,
    daysElapsed,
    daysRemaining,
    daysToComplete,
    projectedCompletionDate,
    projectedProgressAtDeadline,
    successProbability,
    paceStatus,
    paceDelta,
    hoursInvested,
    hoursPerWeek,
    chartData,
    insight,
  };
}

export function buildAllTrackEstimations(
  tracks: Track[],
  estimates: TrackEstimate[],
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[],
  sessions: LearningSession[]
): TrackEstimationStats[] {
  return tracks.map((track) => {
    const estimate =
      estimates.find((e) => e.trackId === track.id) ??
      {
        trackId: track.id,
        targetMonths: DEFAULT_TRACK_TARGET_MONTHS,
        startDate: DEFAULT_YEAR_START,
        updatedAt: nowISO(),
      };
    return buildTrackEstimation(track, estimate, modules, topics, subtopics, sessions);
  });
}

export async function upsertTrackEstimate(trackId: string, targetMonths: number) {
  const existing = await db.trackEstimates.get(trackId);
  const estimate: TrackEstimate = {
    trackId,
    targetMonths,
    startDate: existing?.startDate ?? DEFAULT_YEAR_START,
    updatedAt: nowISO(),
  };
  await db.trackEstimates.put(estimate);
  return estimate;
}

export async function ensureTrackEstimates(tracks: Track[]) {
  const existing = await db.trackEstimates.toArray();
  const missing = tracks.filter((t) => !existing.some((e) => e.trackId === t.id));
  if (missing.length === 0) return;
  await db.trackEstimates.bulkPut(
    missing.map((t) => ({
      trackId: t.id,
      targetMonths: DEFAULT_TRACK_TARGET_MONTHS,
      startDate: DEFAULT_YEAR_START,
      updatedAt: nowISO(),
    }))
  );
}

export const PACE_STATUS_LABELS: Record<TrackPaceStatus, string> = {
  ahead: "Ahead of plan",
  on_track: "On track",
  behind: "Behind pace",
  completed: "Completed",
  not_started: "Not started",
};

export const PACE_STATUS_COLORS: Record<TrackPaceStatus, string> = {
  ahead: "#10b981",
  on_track: "#3b82f6",
  behind: "#f59e0b",
  completed: "#8b5cf6",
  not_started: "#71717a",
};
