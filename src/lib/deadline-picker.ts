import {
  addDays,
  differenceInCalendarDays,
  format,
  getDay,
} from "date-fns";
import { parseLocalDate, todayISO } from "./utils";

export type DeadlineUrgency = "far" | "soon" | "urgent";

export interface QuickPickOption {
  id: string;
  label: string;
  resolve: (today: Date) => Date;
}

export const QUICK_PICKS: QuickPickOption[] = [
  { id: "today", label: "Today", resolve: (today) => today },
  { id: "tomorrow", label: "Tomorrow", resolve: (today) => addDays(today, 1) },
  { id: "in-3", label: "In 3 days", resolve: (today) => addDays(today, 3) },
  {
    id: "friday",
    label: "This Friday",
    resolve: (today) => {
      const day = getDay(today);
      const add = (5 - day + 7) % 7 || 7;
      return addDays(today, add);
    },
  },
  { id: "next-week", label: "Next week", resolve: (today) => addDays(today, 7) },
];

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDeadlineDisplay(dateKey: string): string {
  const d = parseLocalDate(dateKey);
  return format(d, "MM/dd/yyyy");
}

export function formatDeadlineWeekdayShort(dateKey: string): string {
  return format(parseLocalDate(dateKey), "EEE");
}

export function formatDeadlineLong(dateKey: string): string {
  return format(parseLocalDate(dateKey), "EEEE, MMMM d");
}

export function getDeadlineDaysFromToday(dateKey: string, todayKey = todayISO()): number {
  return differenceInCalendarDays(parseLocalDate(dateKey), parseLocalDate(todayKey));
}

export function getDeadlineUrgency(diff: number): DeadlineUrgency {
  if (diff <= 1) return "urgent";
  if (diff <= 4) return "soon";
  return "far";
}

export function urgencyColor(urgency: DeadlineUrgency): string {
  if (urgency === "urgent") return "var(--deadline-red, #ff6868)";
  if (urgency === "soon") return "var(--deadline-amber, #f5b942)";
  return "var(--deadline-teal, #2dd9c3)";
}

export function urgencyRingRatio(diff: number): number {
  return Math.max(0, Math.min(1, diff / 14));
}

export function getDeadlineStatus(diff: number): {
  main: string;
  emoji: string;
  urgency: DeadlineUrgency;
} {
  if (diff < 0) {
    const n = Math.abs(diff);
    return {
      main: `Overdue by ${n} day${n === 1 ? "" : "s"}`,
      emoji: "⚠️",
      urgency: "urgent",
    };
  }
  if (diff === 0) {
    return { main: "Due today", emoji: "🔥", urgency: "urgent" };
  }
  if (diff === 1) {
    return { main: "Due tomorrow", emoji: "⏰", urgency: "urgent" };
  }
  return {
    main: `Due in ${diff} days`,
    emoji: "📅",
    urgency: getDeadlineUrgency(diff),
  };
}

export function matchingQuickPickId(dateKey: string, todayKey = todayISO()): string | null {
  const today = parseLocalDate(todayKey);
  for (const pick of QUICK_PICKS) {
    if (toDateKey(pick.resolve(today)) === dateKey) return pick.id;
  }
  return null;
}

export function isPastDeadlineDay(date: Date, todayKey = todayISO()): boolean {
  return differenceInCalendarDays(date, parseLocalDate(todayKey)) < 0;
}

export function lightenAccent(hex: string, amount = 40): string {
  if (!hex.startsWith("#") || hex.length !== 7) return "#8478e8";
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
