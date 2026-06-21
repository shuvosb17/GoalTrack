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
