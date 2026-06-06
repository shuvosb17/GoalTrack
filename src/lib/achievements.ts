import { v4 as uuid } from "uuid";
import { db } from "./db";
import { getTotalHours } from "./analytics";
import { calculateStreaks } from "./utils";
import type { LearningSession, Subtopic, Module, Track } from "./types";
import { nowISO } from "./utils";

const HOUR_THRESHOLDS = [10, 50, 100, 500, 1000];
const STREAK_THRESHOLDS = [7, 30, 100];

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
