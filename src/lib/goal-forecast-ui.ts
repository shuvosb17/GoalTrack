import {
  differenceInDays,
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import type { AppSettings, LearningSession } from "./types";
import {
  getHoursLoggedThisYear,
  getWeeksUntilYearEnd,
  resolveTieredGoal,
} from "./goals";
import { parseLocalDate, todayISO } from "./utils";

export interface PaceCheckSummary {
  weeklyPace: number;
  projectedHours: number;
  loggedHours: number;
  minimumHours: number;
  targetHours: number;
  stretchHours: number;
  shortOfMinimum: number;
  extraPerWeekForMinimum: number;
  extraPerWeekForTarget: number;
  yearEndLabel: string;
  onTrackMinimum: boolean;
  onTrackTarget: boolean;
}

export function getPaceCheckSummary(
  sessions: LearningSession[],
  settings: AppSettings | null | undefined,
  yearStart: string,
  yearEnd: string,
  projectedHours: number,
  dailyAverage: number
): PaceCheckSummary {
  const tiered = resolveTieredGoal(settings);
  const logged = getHoursLoggedThisYear(sessions, yearStart, yearEnd);
  const weeksRemaining = getWeeksUntilYearEnd(yearEnd);
  const weeklyPace = Math.round(dailyAverage * 7 * 10) / 10;

  const requiredWeeklyMin =
    weeksRemaining > 0 ? (tiered.minimum - logged) / weeksRemaining : 0;
  const requiredWeeklyTarget =
    weeksRemaining > 0 ? (tiered.target - logged) / weeksRemaining : 0;

  const extraPerWeekForMinimum = Math.max(0, Math.round((requiredWeeklyMin - weeklyPace) * 10) / 10);
  const extraPerWeekForTarget = Math.max(0, Math.round((requiredWeeklyTarget - weeklyPace) * 10) / 10);

  return {
    weeklyPace,
    projectedHours: Math.round(projectedHours),
    loggedHours: Math.round(logged),
    minimumHours: tiered.minimum,
    targetHours: tiered.target,
    stretchHours: tiered.stretch,
    shortOfMinimum: Math.max(0, tiered.minimum - projectedHours),
    extraPerWeekForMinimum,
    extraPerWeekForTarget,
    yearEndLabel: format(parseLocalDate(yearEnd), "MMMM"),
    onTrackMinimum: projectedHours >= tiered.minimum,
    onTrackTarget: projectedHours >= tiered.target,
  };
}

export interface TrajectoryPoint {
  label: string;
  actual?: number;
  currentPace?: number;
  reqMinimum: number;
  reqTarget: number;
  reqStretch: number;
  isToday: boolean;
}

export function buildTrajectoryData(
  sessions: LearningSession[],
  settings: AppSettings | null | undefined,
  yearStart: string,
  yearEnd: string,
  projectedHours: number,
  dailyAverage: number
): TrajectoryPoint[] {
  const tiered = resolveTieredGoal(settings);
  const start = parseLocalDate(yearStart);
  const end = parseLocalDate(yearEnd);
  const todayStr = todayISO();
  const today = parseLocalDate(todayStr);
  const totalDays = Math.max(1, differenceInDays(end, start) + 1);
  const logged = getHoursLoggedThisYear(sessions, yearStart, yearEnd);

  const periodSessions = sessions.filter(
    (s) => s.date >= yearStart && s.date <= yearEnd && s.date <= todayStr
  );

  const months = eachMonthOfInterval({ start, end });

  return months.map((month) => {
    const monthStart = startOfMonth(month) < start ? start : startOfMonth(month);
    const monthEnd = endOfMonth(month) > end ? end : endOfMonth(month);
    const monthEndStr = format(monthEnd, "yyyy-MM-dd");
    const daysFromStart = differenceInDays(monthEnd, start) + 1;
    const fraction = Math.min(1, daysFromStart / totalDays);

    const reqMinimum = Math.round(tiered.minimum * fraction);
    const reqTarget = Math.round(tiered.target * fraction);
    const reqStretch = Math.round(tiered.stretch * fraction);

    const isToday = today >= monthStart && today <= monthEnd;

    let actual: number | undefined;
    if (monthStart <= today) {
      const cutoff = monthEnd > today ? todayStr : monthEndStr;
      const ms = periodSessions
        .filter((s) => s.date <= cutoff)
        .reduce((sum, s) => sum + s.duration, 0);
      actual = Math.round((ms / 3600000) * 10) / 10;
    }

    let currentPace: number | undefined;
    if (monthEnd >= today) {
      const daysFromToday = Math.max(0, differenceInDays(monthEnd, today));
      currentPace = Math.round((logged + dailyAverage * daysFromToday) * 10) / 10;
    }

    return {
      label: format(month, "MMM"),
      actual,
      currentPace,
      reqMinimum,
      reqTarget,
      reqStretch,
      isToday,
    };
  });
}

export function getTrajectoryYMax(
  points: TrajectoryPoint[],
  projectedHours: number,
  stretchHours: number
): number {
  const values = points.flatMap((p) =>
    [p.actual, p.currentPace, p.reqMinimum, p.reqTarget, p.reqStretch].filter(
      (v): v is number => v !== undefined
    )
  );
  const max = Math.max(...values, projectedHours, stretchHours, 1);
  const step = max <= 500 ? 500 : max <= 1000 ? 500 : max <= 2000 ? 500 : 1000;
  return Math.ceil(max / step) * step;
}

export const TIER_FORECAST_COLORS = {
  minimum: { bar: "#34d399", icon: "#4ade80", req: "#10b981" },
  target: { bar: "#a78bfa", icon: "#8b5cf6", req: "#8b5cf6" },
  stretch: { bar: "#38bdf8", icon: "#3b82f6", req: "#3b82f6" },
} as const;

export function pacePercentColor(percent: number): string {
  if (percent >= 90) return "#34d399";
  if (percent >= 70) return "#fbbf24";
  return "#f87171";
}

export function paceBadgeStyles(percent: number): { color: string; background: string } {
  if (percent >= 90) return { color: "#34d399", background: "rgba(52, 211, 153, 0.14)" };
  if (percent >= 70) return { color: "#fbbf24", background: "rgba(251, 191, 36, 0.14)" };
  return { color: "#f87171", background: "rgba(248, 113, 113, 0.14)" };
}

export function formatHours(n: number): string {
  return n.toLocaleString("en-US");
}
