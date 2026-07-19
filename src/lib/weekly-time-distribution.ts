import { addDays, differenceInCalendarDays, format, subDays } from "date-fns";
import type { LearningSession, Track } from "@/lib/types";
import { TRACK_BAR_COLORS } from "@/lib/types/metrics";
import {
  parseLocalDate,
  todayISO,
  weekEnd,
  weekStart,
} from "@/lib/utils";

/** Sat → Fri labels matching WEEK_STARTS_ON = 6 */
export const WEEK_DAY_LABELS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export interface WeekRange {
  start: Date;
  end: Date;
  startKey: string;
  endKey: string;
}

export function getWeekRange(referenceDate: Date = parseLocalDate(todayISO())): WeekRange {
  const start = weekStart(referenceDate);
  const end = weekEnd(referenceDate);
  return {
    start,
    end,
    startKey: format(start, "yyyy-MM-dd"),
    endKey: format(end, "yyyy-MM-dd"),
  };
}

/** `weeksAgo = 0` is the current Sat–Fri week; older weeks are full 7-day ranges. */
export function getWeekRangeByOffset(
  weeksAgo: number,
  referenceDate: Date = parseLocalDate(todayISO())
): WeekRange {
  const start = subDays(weekStart(referenceDate), weeksAgo * 7);
  const end = addDays(start, 6);
  return {
    start,
    end,
    startKey: format(start, "yyyy-MM-dd"),
    endKey: format(end, "yyyy-MM-dd"),
  };
}

/** How many weeks back the user can navigate, based on earliest session. */
export function getMaxWeekOffset(
  sessions: LearningSession[],
  referenceDate: Date = parseLocalDate(todayISO())
): number {
  if (sessions.length === 0) return 0;
  const earliest = sessions.reduce(
    (min, s) => (s.date < min ? s.date : min),
    sessions[0].date
  );
  const currentStart = weekStart(referenceDate);
  const earliestStart = weekStart(parseLocalDate(earliest));
  const diffWeeks = Math.floor(
    (currentStart.getTime() - earliestStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  return Math.max(0, diffWeeks);
}

export function formatWeekRangeLabel(range: WeekRange): string {
  const sameMonth = format(range.start, "MMM") === format(range.end, "MMM");
  if (sameMonth) {
    return `${format(range.start, "MMM d")} — ${format(range.end, "d")}`;
  }
  return `${format(range.start, "MMM d")} — ${format(range.end, "MMM d")}`;
}

export function formatWeekNavLabel(range: WeekRange, weeksAgo: number): string {
  const span = `${format(range.start, "MMM d")} — ${format(range.end, "MMM d")}`;
  if (weeksAgo === 0) return `This week · ${span}`;
  if (weeksAgo === 1) return `Last week · ${span}`;
  return span;
}

export function trackAccentColor(track: Track): string {
  return TRACK_BAR_COLORS[track.name] ?? track.color;
}

/** hours[trackId][dayIndex 0=Sat … 6=Fri] */
export function getHoursPerTrackPerDay(
  sessions: LearningSession[],
  weekRange: WeekRange,
  trackIds: string[]
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const id of trackIds) {
    result[id] = [0, 0, 0, 0, 0, 0, 0];
  }

  for (const s of sessions) {
    if (s.date < weekRange.startKey || s.date > weekRange.endKey) continue;
    if (!result[s.trackId]) continue;
    const day = parseLocalDate(s.date);
    const idx = differenceInCalendarDays(day, weekRange.start);
    if (idx < 0 || idx > 6) continue;
    result[s.trackId][idx] += s.duration / 3600000;
  }

  return result;
}

export function getLoggedThisWeek(
  sessions: LearningSession[],
  trackId: string,
  weekRange: WeekRange
): number {
  return sessions
    .filter((s) => s.trackId === trackId && s.date >= weekRange.startKey && s.date <= weekRange.endKey)
    .reduce((sum, s) => sum + s.duration, 0) / 3600000;
}

export function getTotalLoggedThisWeek(
  sessions: LearningSession[],
  weekRange: WeekRange
): number {
  return sessions
    .filter((s) => s.date >= weekRange.startKey && s.date <= weekRange.endKey)
    .reduce((sum, s) => sum + s.duration, 0) / 3600000;
}

export function getCommitmentTotal(tracks: Track[]): number {
  return tracks.reduce((sum, t) => sum + (t.weeklyCommitmentHours ?? 0), 0);
}

export function tracksWithCommitment(tracks: Track[]): Track[] {
  return tracks.filter((t) => (t.weeklyCommitmentHours ?? 0) > 0);
}

/** Calendar days remaining in the week after today (0 on Friday). */
export function getDaysLeftInWeek(
  referenceDate: Date = parseLocalDate(todayISO())
): number {
  const end = weekEnd(referenceDate);
  const today = parseLocalDate(format(referenceDate, "yyyy-MM-dd"));
  return Math.max(0, differenceInCalendarDays(end, today));
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return format(a, "yyyy-MM-dd") === format(b, "yyyy-MM-dd");
}

export function dayIndexInWeek(
  date: Date,
  weekRange: WeekRange
): number {
  return differenceInCalendarDays(parseLocalDate(format(date, "yyyy-MM-dd")), weekRange.start);
}

export function formatHoursCompact(h: number): string {
  const rounded = Math.round(h * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
}

export function chartYMax(dayTotals: number[], paceLine: number | null): number {
  const peak = Math.max(...dayTotals, paceLine ?? 0, 0);
  if (peak <= 0) return 4;
  const padded = peak * 1.15;
  const step = padded <= 4 ? 1 : padded <= 8 ? 2 : padded <= 16 ? 4 : 8;
  return Math.max(step, Math.ceil(padded / step) * step);
}

export function yAxisTicks(maxHours: number): number[] {
  const step = maxHours <= 4 ? 1 : maxHours <= 8 ? 2 : maxHours <= 16 ? 4 : 8;
  const ticks: number[] = [];
  for (let v = maxHours; v >= 0; v -= step) ticks.push(v);
  return ticks;
}

export function weekDayDates(weekRange: WeekRange): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekRange.start, i));
}
