import { v4 as uuid } from "uuid";
import { db } from "./db";
import { getTotalHours } from "./analytics";
import { calculateStreaks } from "./utils";
import type { Achievement, LearningSession, Subtopic, Module, Track } from "./types";
import { nowISO } from "./utils";

const HOUR_THRESHOLDS = [10, 50, 100, 500, 1000];
const STREAK_THRESHOLDS = [7, 30, 100];

export type AchievementCategory = "hours" | "streaks" | "completion" | "getting_started";

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  getting_started: "Getting Started",
  hours: "Hours Invested",
  streaks: "Streaks",
  completion: "Completion",
};

export const ACHIEVEMENT_CATEGORIES: Record<string, AchievementCategory> = {
  first_session: "getting_started",
  hours_10: "hours",
  hours_50: "hours",
  hours_100: "hours",
  hours_500: "hours",
  hours_1000: "hours",
  streak_7: "streaks",
  streak_30: "streaks",
  streak_100: "streaks",
  first_module: "completion",
  first_track: "completion",
  interview_ready: "completion",
};

/** Canonical low -> high ordering across all achievements. */
export const ACHIEVEMENT_ORDER: string[] = [
  "first_session",
  "hours_10",
  "hours_50",
  "hours_100",
  "hours_500",
  "hours_1000",
  "streak_7",
  "streak_30",
  "streak_100",
  "first_module",
  "first_track",
  "interview_ready",
];

/** Order of categories as race lanes (easiest first). */
export const ACHIEVEMENT_CATEGORY_ORDER: AchievementCategory[] = [
  "getting_started",
  "hours",
  "streaks",
  "completion",
];

/** Accent color per category, used for lane glows and fills. */
export const ACHIEVEMENT_CATEGORY_ACCENT: Record<AchievementCategory, string> = {
  getting_started: "#38bdf8",
  hours: "#a78bfa",
  streaks: "#fb923c",
  completion: "#34d399",
};

/** Position of an achievement within its category (low -> high), 0-based. */
export function getAchievementTierIndex(key: string): number {
  const category = getAchievementCategory(key);
  const withinCategory = ACHIEVEMENT_ORDER.filter(
    (k) => getAchievementCategory(k) === category
  );
  const idx = withinCategory.indexOf(key);
  return idx === -1 ? 0 : idx;
}

/** Global low -> high rank derived from unlocked count. */
export function getAchievementOrderIndex(key: string): number {
  const idx = ACHIEVEMENT_ORDER.indexOf(key);
  return idx === -1 ? ACHIEVEMENT_ORDER.length : idx;
}

export interface AchievementRankDef {
  name: string;
  icon: string;
  accent: string;
  minUnlocked: number;
}

/** Ordered ranks (low -> high). Thresholds spread across the 12 achievements. */
export const ACHIEVEMENT_RANKS: AchievementRankDef[] = [
  { name: "Rookie", icon: "🌱", accent: "#94a3b8", minUnlocked: 0 },
  { name: "Rising", icon: "⚡", accent: "#38bdf8", minUnlocked: 2 },
  { name: "Grinder", icon: "🔥", accent: "#a78bfa", minUnlocked: 5 },
  { name: "Elite", icon: "💎", accent: "#f472b6", minUnlocked: 8 },
  { name: "Legend", icon: "👑", accent: "#fbbf24", minUnlocked: 11 },
];

export interface AchievementRank {
  index: number;
  name: string;
  icon: string;
  accent: string;
  current: number;
  total: number;
  minUnlocked: number;
  nextThreshold: number | null;
  nextName: string | null;
  toNext: number;
  percentToNext: number;
  isMax: boolean;
}

export function getAchievementRank(unlockedCount: number, total: number): AchievementRank {
  let index = 0;
  for (let i = 0; i < ACHIEVEMENT_RANKS.length; i++) {
    if (unlockedCount >= ACHIEVEMENT_RANKS[i].minUnlocked) index = i;
  }
  const rank = ACHIEVEMENT_RANKS[index];
  const next = ACHIEVEMENT_RANKS[index + 1] ?? null;
  const isMax = next === null;

  const spanStart = rank.minUnlocked;
  const spanEnd = next ? next.minUnlocked : total;
  const span = Math.max(1, spanEnd - spanStart);
  const percentToNext = isMax
    ? 100
    : Math.min(100, Math.round(((unlockedCount - spanStart) / span) * 100));

  return {
    index,
    name: rank.name,
    icon: rank.icon,
    accent: rank.accent,
    current: unlockedCount,
    total,
    minUnlocked: rank.minUnlocked,
    nextThreshold: next ? next.minUnlocked : null,
    nextName: next ? next.name : null,
    toNext: next ? Math.max(0, next.minUnlocked - unlockedCount) : 0,
    percentToNext,
    isMax,
  };
}

export interface AchievementProgress {
  current: number;
  target: number;
  percent: number;
  unit: string;
}

export function getAchievementProgress(
  achievement: Achievement,
  sessions: LearningSession[],
  subtopics: Subtopic[],
  modules: Module[],
  tracks: Track[]
): AchievementProgress {
  const totalHours = getTotalHours(sessions) / 3600000;
  const streaks = calculateStreaks(sessions.map((s) => s.date));
  const key = achievement.key;

  if (key === "first_session") {
    const current = sessions.length >= 1 ? 1 : 0;
    return { current, target: 1, percent: current * 100, unit: "session" };
  }
  if (key.startsWith("hours_")) {
    const target = parseInt(key.split("_")[1] ?? "0", 10);
    return {
      current: Math.round(totalHours * 10) / 10,
      target,
      percent: Math.min(100, Math.round((totalHours / target) * 100)),
      unit: "h",
    };
  }
  if (key.startsWith("streak_")) {
    const target = parseInt(key.split("_")[1] ?? "0", 10);
    return {
      current: streaks.longest,
      target,
      percent: Math.min(100, Math.round((streaks.longest / target) * 100)),
      unit: "days",
    };
  }
  if (key === "first_module") {
    const done = modules.filter((m) => {
      const subs = subtopics.filter((s) => s.moduleId === m.id && !s.archived);
      return subs.length > 0 && subs.every((s) => s.status === "completed" || s.status === "mastered");
    }).length;
    return { current: done >= 1 ? 1 : 0, target: 1, percent: done >= 1 ? 100 : 0, unit: "module" };
  }
  if (key === "first_track") {
    const done = tracks.filter((t) => {
      const subs = subtopics.filter((s) => s.trackId === t.id && !s.archived);
      return subs.length > 0 && subs.every((s) => s.status === "completed" || s.status === "mastered");
    }).length;
    return { current: done >= 1 ? 1 : 0, target: 1, percent: done >= 1 ? 100 : 0, unit: "track" };
  }
  if (key === "interview_ready") {
    const unlocked = achievement.unlockedAt ? 1 : 0;
    return { current: unlocked, target: 1, percent: unlocked * 100, unit: "milestone" };
  }
  return { current: 0, target: 1, percent: 0, unit: "" };
}

export function getAchievementCategory(key: string): AchievementCategory {
  return ACHIEVEMENT_CATEGORIES[key] ?? "getting_started";
}

export async function checkAchievements(
  sessions: LearningSession[],
  subtopics: Subtopic[],
  modules: Module[],
  tracks: Track[]
) {
  const achievements = await db.achievements.toArray();
  const totalHours = getTotalHours(sessions) / 3600000;
  const streaks = calculateStreaks(sessions.map((s) => s.date));
  const newlyUnlocked: string[] = [];

  const unlock = async (key: string) => {
    const ach = achievements.find((a) => a.key === key && !a.unlockedAt);
    if (ach) {
      await db.achievements.update(ach.id, { unlockedAt: nowISO() });
      await db.milestones.add({
        id: uuid(),
        type: "achievement",
        title: ach.title,
        description: ach.description,
        date: nowISO(),
      });
      newlyUnlocked.push(ach.id);
    }
  };

  if (sessions.length >= 1) await unlock("first_session");

  for (const threshold of HOUR_THRESHOLDS) {
    if (totalHours >= threshold) await unlock(`hours_${threshold}`);
  }

  for (const threshold of STREAK_THRESHOLDS) {
    if (streaks.longest >= threshold) await unlock(`streak_${threshold}`);
  }

  const completedModules = modules.filter((m) => {
    const subs = subtopics.filter((s) => s.moduleId === m.id && !s.archived);
    return subs.length > 0 && subs.every((s) => s.status === "completed" || s.status === "mastered");
  });
  if (completedModules.length >= 1) await unlock("first_module");

  const completedTracks = tracks.filter((t) => {
    const subs = subtopics.filter((s) => s.trackId === t.id && !s.archived);
    return subs.length > 0 && subs.every((s) => s.status === "completed" || s.status === "mastered");
  });
  if (completedTracks.length >= 1) await unlock("first_track");

  for (const threshold of HOUR_THRESHOLDS) {
    if (totalHours >= threshold) {
      const existing = await db.milestones.where("title").equals(`${threshold} Hours`).count();
      if (existing === 0) {
        await db.milestones.add({
          id: uuid(), type: "hours", title: `${threshold} Hours`, description: `Invested ${threshold} hours of learning`,
          date: nowISO(), value: threshold,
        });
      }
    }
  }

  return newlyUnlocked;
}
