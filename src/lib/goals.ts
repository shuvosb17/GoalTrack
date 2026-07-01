import type { AppSettings, LearningSession } from "./types";
import type { TieredGoal, TierGoalProgress } from "./types/metrics";
import { DEFAULT_TIERED_GOAL } from "./types/metrics";
import { differenceInDays } from "date-fns";
import { parseLocalDate, todayISO } from "./utils";

export function resolveTieredGoal(settings: AppSettings | null | undefined): TieredGoal {
  if (settings?.tieredGoal) return settings.tieredGoal;
  const stretch = settings?.yearlyHourGoal ?? DEFAULT_TIERED_GOAL.stretch;
  return {
    ...DEFAULT_TIERED_GOAL,
    stretch,
    year: parseLocalDate(settings?.yearEnd ?? DEFAULT_TIERED_GOAL.year + "-12-31").getFullYear(),
  };
}

export function getWeeksUntilYearEnd(yearEnd: string): number {
  const today = parseLocalDate(todayISO());
  const end = parseLocalDate(yearEnd);
  const days = Math.max(0, differenceInDays(end, today));
  return Math.max(1, Math.ceil(days / 7));
}

export function getHoursLoggedThisYear(
  sessions: LearningSession[],
  yearStart: string,
  yearEnd: string
): number {
  const today = todayISO();
  return (
    sessions
      .filter((s) => s.date >= yearStart && s.date <= yearEnd && s.date <= today)
      .reduce((sum, s) => sum + s.duration, 0) / 3600000
  );
}

export function getTieredGoalProgress(
  sessions: LearningSession[],
  settings: AppSettings | null | undefined,
  yearStart: string,
  yearEnd: string,
  projectedHours: number
): TierGoalProgress[] {
  const tiered = resolveTieredGoal(settings);
  const logged = getHoursLoggedThisYear(sessions, yearStart, yearEnd);
  const weeksRemaining = getWeeksUntilYearEnd(yearEnd);
  const weeksTotal = Math.max(1, getWeeksUntilYearEnd(yearEnd) + Math.floor(
    differenceInDays(parseLocalDate(todayISO()), parseLocalDate(yearStart)) / 7
  ));

  const tiers: { tier: TierGoalProgress["tier"]; label: string; hours: number }[] = [
    { tier: "minimum", label: "Minimum", hours: tiered.minimum },
    { tier: "target", label: "Target", hours: tiered.target },
    { tier: "stretch", label: "Stretch", hours: tiered.stretch },
  ];

  return tiers.map(({ tier, label, hours }) => {
    const expectedByNow = (hours / weeksTotal) * (weeksTotal - weeksRemaining);
    const percentOnTrack = hours > 0 ? Math.min(100, Math.round((logged / Math.max(1, expectedByNow)) * 100)) : 0;
    return {
      tier,
      label,
      hours,
      loggedHours: Math.round(logged),
      projectedHours: Math.round(projectedHours),
      percentOnTrack,
      onTrack: projectedHours >= hours || logged >= expectedByNow * 0.9,
    };
  });
}

export function getGoalReframeMessage(
  sessions: LearningSession[],
  settings: AppSettings | null | undefined,
  yearStart: string,
  yearEnd: string,
  projectedHours: number
): string {
  const progress = getTieredGoalProgress(sessions, settings, yearStart, yearEnd, projectedHours);
  const minimum = progress.find((p) => p.tier === "minimum")!;
  const target = progress.find((p) => p.tier === "target")!;
  const tiered = resolveTieredGoal(settings);
  const weeksRemaining = getWeeksUntilYearEnd(yearEnd);
  const logged = getHoursLoggedThisYear(sessions, yearStart, yearEnd);
  const hoursToTarget = Math.max(0, tiered.target - logged);
  const extraPerWeek = weeksRemaining > 0 ? Math.round((hoursToTarget / weeksRemaining) * 10) / 10 : 0;

  if (minimum.onTrack && !target.onTrack) {
    return `You're ${minimum.percentOnTrack}% on pace for your Minimum goal (${tiered.minimum}h). Add ${extraPerWeek}h/week to reach your Target (${tiered.target}h) by Dec ${tiered.year}.`;
  }
  if (target.onTrack) {
    return `You're on track for your Target (${tiered.target}h). Keep your current pace to stay ahead.`;
  }
  return `You're ${minimum.percentOnTrack}% on pace for your Minimum goal (${tiered.minimum}h). Add ${extraPerWeek}h/week to reach your Target (${tiered.target}h) by Dec ${tiered.year}.`;
}

export function getStretchGoal(settings: AppSettings | null | undefined): number {
  return resolveTieredGoal(settings).stretch;
}

export function getTargetGoal(settings: AppSettings | null | undefined): number {
  return resolveTieredGoal(settings).target;
}
