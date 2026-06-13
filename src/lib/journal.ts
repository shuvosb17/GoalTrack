import { format, isAfter, parseISO, subDays } from "date-fns";
import type { JournalEntry, LearningSession } from "./types";
import { calculateStreaks, todayISO } from "./utils";

export interface JournalStats {
  total: number;
  thisWeek: number;
  withTrack: number;
  streak: number;
}

export function getJournalStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  return calculateStreaks(entries.map((e) => e.date)).current;
}

export function getJournalStats(entries: JournalEntry[]): JournalStats {
  const weekAgo = subDays(new Date(), 7);
  return {
    total: entries.length,
    thisWeek: entries.filter((e) => isAfter(parseISO(e.date), weekAgo)).length,
    withTrack: entries.filter((e) => e.trackId).length,
    streak: getJournalStreak(entries),
  };
}

/** Study days with sessions but no journal entry (most recent first). */
export function getUnjournaledStudyDays(
  sessions: LearningSession[],
  entries: JournalEntry[],
  maxDays = 14
): string[] {
  const journaled = new Set(entries.map((e) => e.date));
  const today = todayISO();
  const sessionDates = [...new Set(sessions.map((s) => s.date))]
    .filter((d) => d <= today && !journaled.has(d))
    .sort((a, b) => b.localeCompare(a));
  return sessionDates.slice(0, maxDays);
}

export function groupEntriesByMonth(
  entries: JournalEntry[]
): { key: string; label: string; entries: JournalEntry[] }[] {
  const map = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const key = entry.date.slice(0, 7);
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, group]) => ({
      key,
      label: format(parseISO(`${key}-01`), "MMMM yyyy"),
      entries: group.sort((a, b) => b.date.localeCompare(a.date)),
    }));
}
