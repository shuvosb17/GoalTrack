import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  differenceInDays,
  eachDayOfInterval,
  subDays,
  addDays,
} from "date-fns";
import type { ProgressStatus, Subtopic } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function formatHours(ms: number, decimals = 1): string {
  return (ms / 3600000).toFixed(decimals);
}

export function formatHoursShort(ms: number): string {
  const hours = ms / 3600000;
  if (hours < 1) return `${Math.round(ms / 60000)}m`;
  return `${hours.toFixed(1)}h`;
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function nowISO(): string {
  return new Date().toISOString();
}

/** Local calendar date (yyyy-MM-dd) from an ISO timestamp — respects user timezone (e.g. Asia/Dhaka) */
export function toLocalDateKey(iso: string): string {
  return format(parseISO(iso), "yyyy-MM-dd");
}

/** Parse yyyy-MM-dd as local midnight (parseISO treats date-only strings as UTC) */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Calendar weeks run Saturday → Friday */
export const WEEK_STARTS_ON = 6 as const;

export function weekStart(date: Date = parseLocalDate(todayISO())): Date {
  return startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
}

export function weekEnd(date: Date = parseLocalDate(todayISO())): Date {
  return endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
}

/** `weeksAgo = 0` is the current week; older weeks use full Sat–Fri ranges. */
export function getCalendarWeekRange(
  weeksAgo: number,
  reference: Date = parseLocalDate(todayISO())
): { start: Date; end: Date } {
  const start = subDays(weekStart(reference), weeksAgo * 7);
  const friday = addDays(start, 6);
  const end = weeksAgo === 0 && friday > reference ? reference : friday;
  return { start, end };
}

export function isSubtopicDone(status: ProgressStatus): boolean {
  return status === "completed" || status === "mastered";
}

export function statusWeight(status: ProgressStatus): number {
  switch (status) {
    case "mastered":
      return 1;
    case "completed":
      return 1;
    case "in_progress":
      return 0;
    default:
      return 0;
  }
}

/** Progress: completed/mastered = 100%, in_progress and not_started = 0% */
export function calculateSubtopicProgress(subtopics: Subtopic[]): number {
  const active = subtopics.filter((s) => !s.archived);
  if (active.length === 0) return 0;
  const total = active.reduce((sum, s) => sum + statusWeight(s.status), 0);
  return Math.round((total / active.length) * 100);
}

/** @deprecated Use calculateSubtopicProgress or calculateTopicsProgress */
export function calculateProgress(subtopics: Subtopic[]): number {
  return calculateSubtopicProgress(subtopics);
}

export function getDateRange(
  period: "day" | "week" | "month" | "year",
  reference = new Date()
) {
  switch (period) {
    case "day":
      return { start: startOfDay(reference), end: endOfDay(reference) };
    case "week":
      return {
        start: startOfWeek(reference, { weekStartsOn: WEEK_STARTS_ON }),
        end: endOfWeek(reference, { weekStartsOn: WEEK_STARTS_ON }),
      };
    case "month":
      return { start: startOfMonth(reference), end: endOfMonth(reference) };
    case "year":
      return { start: startOfYear(reference), end: endOfYear(reference) };
  }
}

export function sessionInRange(
  sessionDate: string,
  start: Date,
  end: Date
): boolean {
  const d = parseISO(sessionDate);
  return d >= start && d <= end;
}

export function generateHeatmapData(
  sessions: { date: string; duration: number }[],
  days = 365
) {
  const end = new Date();
  const start = subDays(end, days - 1);
  const dayMap = new Map<string, number>();

  sessions.forEach((s) => {
    dayMap.set(s.date, (dayMap.get(s.date) || 0) + s.duration);
  });

  return eachDayOfInterval({ start, end }).map((day) => {
    const key = format(day, "yyyy-MM-dd");
    return {
      date: key,
      duration: dayMap.get(key) || 0,
      level: getHeatmapLevel(dayMap.get(key) || 0),
    };
  });
}

function getHeatmapLevel(duration: number): 0 | 1 | 2 | 3 | 4 {
  const hours = duration / 3600000;
  if (hours === 0) return 0;
  if (hours < 1) return 1;
  if (hours < 2) return 2;
  if (hours < 4) return 3;
  return 4;
}

export function calculateStreaks(dates: string[]): {
  current: number;
  longest: number;
  missedDays: number;
} {
  if (dates.length === 0) return { current: 0, longest: 0, missedDays: 0 };

  const uniqueDates = [...new Set(dates)].sort();
  const today = todayISO();
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  let longest = 0;
  let current = 0;
  let streak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = parseISO(uniqueDates[i - 1]);
    const curr = parseISO(uniqueDates[i]);
    if (differenceInDays(curr, prev) === 1) {
      streak++;
    } else {
      longest = Math.max(longest, streak);
      streak = 1;
    }
  }
  longest = Math.max(longest, streak);

  const lastDate = uniqueDates[uniqueDates.length - 1];
  if (lastDate === today || lastDate === yesterday) {
    current = 1;
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const prev = parseISO(uniqueDates[i]);
      const curr = parseISO(uniqueDates[i + 1]);
      if (differenceInDays(curr, prev) === 1) current++;
      else break;
    }
  }

  const totalDays = differenceInDays(parseISO(uniqueDates[uniqueDates.length - 1]), parseISO(uniqueDates[0])) + 1;
  const missedDays = Math.max(0, totalDays - uniqueDates.length);

  return { current, longest, missedDays };
}

export function getMomentumLevel(score: number): import("./types").MomentumLevel {
  if (score >= 85) return "elite";
  if (score >= 70) return "excellent";
  if (score >= 50) return "good";
  if (score >= 30) return "average";
  return "poor";
}

export function getMomentumColor(level: import("./types").MomentumLevel): string {
  const colors: Record<import("./types").MomentumLevel, string> = {
    poor: "#ef4444",
    average: "#f59e0b",
    good: "#3b82f6",
    excellent: "#8b5cf6",
    elite: "#10b981",
  };
  return colors[level];
}

export const STATUS_LABELS: Record<ProgressStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  mastered: "Mastered",
};

export const STATUS_COLORS: Record<ProgressStatus, string> = {
  not_started: "#ef4444",
  in_progress: "#facc15",
  completed: "#22c55e",
  mastered: "#3b82f6",
};

export const STATUS_BG: Record<ProgressStatus, string> = {
  not_started: "bg-red-500/10 border-red-500/20 text-red-400",
  in_progress: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  completed: "bg-green-500/10 border-green-500/20 text-green-400",
  mastered: "bg-blue-500/10 border-blue-500/20 text-blue-400",
};

export const DIFFICULTY_LABELS: Record<import("./types").Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  expert: "Expert",
};

export const DIFFICULTY_COLORS: Record<import("./types").Difficulty, string> = {
  easy: "#10b981",
  medium: "#3b82f6",
  hard: "#f59e0b",
  expert: "#ef4444",
};

export const TRACK_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
];
