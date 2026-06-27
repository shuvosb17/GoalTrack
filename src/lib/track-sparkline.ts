import { format, subDays } from "date-fns";
import type { LearningSession } from "./types";
import { todayISO } from "./utils";

/** Last 7 calendar days of study hours (index 0 = oldest, 6 = today). */
export function getTrackLast7DayHours(
  trackId: string,
  sessions: LearningSession[]
): number[] {
  const today = todayISO();
  const days = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(today), 6 - i), "yyyy-MM-dd")
  );

  return days.map((date) => {
    const ms = sessions
      .filter((s) => s.trackId === trackId && s.date === date)
      .reduce((sum, s) => sum + s.duration, 0);
    return ms / 3600000;
  });
}

export const TRACK_ROW_ACCENTS: Record<string, string> = {
  "CS Fundamentals": "#5DCAA5",
  LeetCode: "#378ADD",
  Development: "#B4B2A9",
  "System Design": "#7F77DD",
  Academic: "#F0997B",
};

export function getTrackAccentColor(trackName: string, fallback: string): string {
  return TRACK_ROW_ACCENTS[trackName] ?? fallback;
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
