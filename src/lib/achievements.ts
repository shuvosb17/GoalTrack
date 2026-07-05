import { v4 as uuid } from "uuid";
import { db } from "./db";
import { getTotalHours, DEFAULT_YEAR_END, DEFAULT_YEAR_START } from "./analytics";
import { getHoursLoggedThisYear, resolveTieredGoal } from "./goals";
import { calculateStreaks } from "./utils";
import type { Achievement, AppSettings, LearningSession, Subtopic, Module, Track } from "./types";
import type { TieredGoal } from "./types/metrics";
import { nowISO } from "./utils";
import { format, parseISO } from "date-fns";

const STREAK_THRESHOLDS = [7, 30, 100];

const GOAL_TIER_COLORS = {
  warmup: "#94a3b8",
  quarter: "#38bdf8",
  half: "#60a5fa",
  minimum: "#34d399",
  target: "#a78bfa",
  stretch: "#fbbf24",
} as const;

export type GoalHourTier = keyof typeof GOAL_TIER_COLORS;

export interface GoalHourCheckpoint {
  key: string;
  threshold: number;
  title: string;
  description: string;
  icon: string;
  tier: GoalHourTier;
}

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

/** Canonical low -> high ordering; hour keys are resolved from current goals at runtime. */
export const ACHIEVEMENT_ORDER_BASE: string[] = [
  "first_session",
  "streak_7",
  "streak_30",
  "streak_100",
  "first_module",
  "first_track",
  "interview_ready",
];

const HOUR_CHECKPOINT_STEP = 100;

export function parseHourThreshold(key: string): number | null {
  if (!key.startsWith("hours_")) return null;
  const n = parseInt(key.split("_")[1] ?? "", 10);
  return Number.isFinite(n) ? n : null;
}

export function getGoalHourCheckpoints(settings: AppSettings | null | undefined): GoalHourCheckpoint[] {
  const tiered = resolveTieredGoal(settings);
  const { minimum, target, stretch } = tiered;

  const thresholds = new Set<number>([10, minimum, target, stretch]);
  for (let h = HOUR_CHECKPOINT_STEP; h <= stretch; h += HOUR_CHECKPOINT_STEP) {
    thresholds.add(h);
  }

  return [...thresholds]
    .filter((t) => t > 0)
    .sort((a, b) => a - b)
    .map((threshold) => {
      let tier: GoalHourTier = "quarter";
      let title = `${threshold}h`;
      let description = `Log ${threshold} hours toward this year's goal`;
      let icon = "⏱️";

      if (threshold === 10) {
        tier = "warmup";
        title = "First 10 Hours";
        description = "Log your first 10 hours toward this year's goal";
        icon = "🏃";
      } else if (threshold === minimum) {
        tier = "minimum";
        title = `${minimum}h Minimum`;
        description = `Hit your minimum goal of ${minimum} hours`;
        icon = "🎯";
      } else if (threshold === target) {
        tier = "target";
        title = `${target}h Target`;
        description = `Reach your target goal of ${target} hours`;
        icon = "🏆";
      } else if (threshold === stretch) {
        tier = "stretch";
        title = `${stretch}h Stretch`;
        description = `Achieve your stretch goal of ${stretch} hours`;
        icon = "👑";
      }

      return {
        key: `hours_${threshold}`,
        threshold,
        tier,
        title,
        description,
        icon,
      };
    });
}

export function getCanonicalHourKeys(settings: AppSettings | null | undefined): Set<string> {
  return new Set(getGoalHourCheckpoints(settings).map((c) => c.key));
}

export function getHourCheckpointStep(): number {
  return HOUR_CHECKPOINT_STEP;
}

export function getAchievementOrder(settings?: AppSettings | null): string[] {
  const hourKeys = getGoalHourCheckpoints(settings).map((c) => c.key);
  return ["first_session", ...hourKeys, "streak_7", "streak_30", "streak_100", "first_module", "first_track", "interview_ready"];
}

/** @deprecated Use getAchievementOrder(settings) for full list including goal hour keys. */
export const ACHIEVEMENT_ORDER: string[] = getAchievementOrder();

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
export function getAchievementTierIndex(key: string, settings?: AppSettings | null): number {
  const category = getAchievementCategory(key);
  if (category === "hours") {
    const hourKeys = getGoalHourCheckpoints(settings).map((c) => c.key);
    const idx = hourKeys.indexOf(key);
    return idx === -1 ? parseHourThreshold(key) ?? 0 : idx;
  }
  const withinCategory = getAchievementOrder(settings).filter(
    (k) => getAchievementCategory(k) === category
  );
  const idx = withinCategory.indexOf(key);
  return idx === -1 ? 0 : idx;
}

/** Global low -> high rank derived from unlocked count (legacy badge stat). */
export function getAchievementOrderIndex(key: string, settings?: AppSettings | null): number {
  const order = getAchievementOrder(settings);
  const idx = order.indexOf(key);
  return idx === -1 ? order.length : idx;
}

function resolveYearHours(
  sessions: LearningSession[],
  settings?: AppSettings | null,
  yearStart?: string,
  yearEnd?: string
): number {
  if (yearStart && yearEnd) {
    return getHoursLoggedThisYear(sessions, yearStart, yearEnd);
  }
  return getTotalHours(sessions) / 3600000;
}

export interface AchievementRankDef {
  name: string;
  icon: string;
  accent: string;
  minUnlocked: number;
}

/** Ordered ranks aligned to goal tiers (hours logged this year). */
export const ACHIEVEMENT_RANKS: AchievementRankDef[] = [
  { name: "Rookie", icon: "🌱", accent: "#94a3b8", minUnlocked: 0 },
  { name: "Rising", icon: "⚡", accent: "#38bdf8", minUnlocked: 10 },
  { name: "Grinder", icon: "🔥", accent: "#34d399", minUnlocked: -1 },
  { name: "Elite", icon: "💎", accent: "#a78bfa", minUnlocked: -2 },
  { name: "Legend", icon: "👑", accent: "#fbbf24", minUnlocked: -3 },
];

export interface GoalSprintCheckpoint {
  label: string;
  hours: number;
  percent: number;
  reached: boolean;
  tier: GoalHourTier | "rank";
  color: string;
  isGoalTier?: boolean;
}

export interface GoalSprintSnapshot {
  tiered: TieredGoal;
  loggedHours: number;
  yearEndLabel: string;
  runnerPercent: number;
  targetPercent: number;
  minimumPercent: number;
  activeTierLabel: string;
  hoursToTarget: number;
  checkpoints: GoalSprintCheckpoint[];
  rank: AchievementRank;
}

function goalRankThresholds(tiered: TieredGoal): number[] {
  return [0, 10, tiered.minimum, tiered.target, tiered.stretch];
}

export function getGoalSprintRank(loggedHours: number, tiered: TieredGoal): AchievementRank {
  const thresholds = goalRankThresholds(tiered);
  let index = 0;
  for (let i = 0; i < ACHIEVEMENT_RANKS.length; i++) {
    const minHours = thresholds[i] ?? 0;
    if (loggedHours >= minHours) index = i;
  }
  const rank = ACHIEVEMENT_RANKS[index];
  const next = ACHIEVEMENT_RANKS[index + 1] ?? null;
  const spanStart = thresholds[index] ?? 0;
  const spanEnd = next ? thresholds[index + 1] ?? tiered.stretch : tiered.stretch;
  const span = Math.max(1, spanEnd - spanStart);
  const isMax = next === null;
  const percentToNext = isMax
    ? 100
    : Math.min(100, Math.round(((loggedHours - spanStart) / span) * 100));

  return {
    index,
    name: rank.name,
    icon: rank.icon,
    accent: rank.accent,
    current: Math.round(loggedHours),
    total: tiered.stretch,
    minUnlocked: spanStart,
    nextThreshold: isMax ? null : spanEnd,
    nextName: next?.name ?? null,
    toNext: isMax ? 0 : Math.max(0, Math.round(spanEnd - loggedHours)),
    percentToNext,
    isMax,
  };
}

export function getGoalSprintSnapshot(
  sessions: LearningSession[],
  settings: AppSettings | null | undefined,
  yearStart: string,
  yearEnd: string
): GoalSprintSnapshot {
  const tiered = resolveTieredGoal(settings);
  const loggedHours = Math.round(getHoursLoggedThisYear(sessions, yearStart, yearEnd) * 10) / 10;
  const stretch = Math.max(1, tiered.stretch);
  const runnerPercent = Math.min(100, Math.round((loggedHours / stretch) * 100));
  const targetPercent = Math.min(100, Math.round((loggedHours / Math.max(1, tiered.target)) * 100));
  const minimumPercent = Math.min(100, Math.round((loggedHours / Math.max(1, tiered.minimum)) * 100));

  let activeTierLabel = "Building momentum";
  if (loggedHours >= tiered.stretch) activeTierLabel = "Stretch goal reached";
  else if (loggedHours >= tiered.target) activeTierLabel = "On Target — pushing to Stretch";
  else if (loggedHours >= tiered.minimum) activeTierLabel = "Minimum secured — racing to Target";
  else activeTierLabel = "Sprinting toward Minimum";

  const hourCheckpoints = getGoalHourCheckpoints(settings);
  const checkpoints: GoalSprintCheckpoint[] = hourCheckpoints.map((cp) => ({
    label: cp.tier === "minimum" ? "Min" : cp.tier === "target" ? "Target" : cp.tier === "stretch" ? "Stretch" : `${cp.threshold}h`,
    hours: cp.threshold,
    percent: Math.min(100, (cp.threshold / stretch) * 100),
    reached: loggedHours >= cp.threshold,
    tier: cp.tier,
    color: GOAL_TIER_COLORS[cp.tier],
    isGoalTier: cp.tier === "minimum" || cp.tier === "target" || cp.tier === "stretch",
  }));

  return {
    tiered,
    loggedHours,
    yearEndLabel: format(parseISO(yearEnd), "MMM yyyy"),
    runnerPercent,
    targetPercent,
    minimumPercent,
    activeTierLabel,
    hoursToTarget: Math.max(0, Math.round((tiered.target - loggedHours) * 10) / 10),
    checkpoints,
    rank: getGoalSprintRank(loggedHours, tiered),
  };
}

export async function ensureGoalHourAchievements(settings: AppSettings | null | undefined): Promise<void> {
  const checkpoints = getGoalHourCheckpoints(settings);
  const validKeys = new Set(checkpoints.map((c) => c.key));
  let all = await db.achievements.toArray();

  const hourGroups = new Map<string, typeof all>();
  for (const a of all) {
    if (!a.key.startsWith("hours_")) continue;
    const group = hourGroups.get(a.key) ?? [];
    group.push(a);
    hourGroups.set(a.key, group);
  }

  for (const [, group] of hourGroups) {
    if (group.length <= 1) continue;
    const keeper = group.find((a) => a.unlockedAt) ?? group[0];
    for (const a of group) {
      if (a.id === keeper.id) continue;
      if (a.unlockedAt && !keeper.unlockedAt) {
        await db.achievements.update(keeper.id, { unlockedAt: a.unlockedAt });
      }
      await db.achievements.delete(a.id);
    }
  }

  all = await db.achievements.toArray();

  for (const cp of checkpoints) {
    const existing = all.find((a) => a.key === cp.key);
    if (existing) {
      await db.achievements.update(existing.id, {
        title: cp.title,
        description: cp.description,
        icon: cp.icon,
      });
    } else {
      await db.achievements.add({
        id: uuid(),
        key: cp.key,
        title: cp.title,
        description: cp.description,
        icon: cp.icon,
      });
    }
  }

  const refreshed = await db.achievements.toArray();

  for (const a of all) {
    if (!a.key.startsWith("hours_") || validKeys.has(a.key)) continue;

    const threshold = parseHourThreshold(a.key);
    const canonical =
      threshold !== null
        ? checkpoints.find((c) => c.threshold === threshold)
        : undefined;

    if (a.unlockedAt && canonical) {
      const target = refreshed.find((x) => x.key === canonical.key);
      if (target && !target.unlockedAt) {
        await db.achievements.update(target.id, { unlockedAt: a.unlockedAt });
      }
    }

    await db.achievements.delete(a.id);
  }
}

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
  tracks: Track[],
  settings?: AppSettings | null,
  yearStart?: string,
  yearEnd?: string
): AchievementProgress {
  const yearHours = resolveYearHours(sessions, settings, yearStart, yearEnd);
  const streaks = calculateStreaks(sessions.map((s) => s.date));
  const key = achievement.key;

  if (key === "first_session") {
    const current = sessions.length >= 1 ? 1 : 0;
    return { current, target: 1, percent: current * 100, unit: "session" };
  }
  if (key.startsWith("hours_")) {
    const target = parseHourThreshold(key) ?? 0;
    const current = Math.round(yearHours * 10) / 10;
    return {
      current,
      target,
      percent: target > 0 ? Math.min(100, Math.round((yearHours / target) * 100)) : 0,
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
  if (key.startsWith("hours_")) return "hours";
  return ACHIEVEMENT_CATEGORIES[key] ?? "getting_started";
}

export async function checkAchievements(
  sessions: LearningSession[],
  subtopics: Subtopic[],
  modules: Module[],
  tracks: Track[],
  settings?: AppSettings | null,
  yearStart: string = DEFAULT_YEAR_START,
  yearEnd: string = DEFAULT_YEAR_END
) {
  await ensureGoalHourAchievements(settings);
  const achievements = await db.achievements.toArray();
  const yearHours = getHoursLoggedThisYear(sessions, yearStart, yearEnd);
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

  for (const cp of getGoalHourCheckpoints(settings)) {
    if (yearHours >= cp.threshold) await unlock(cp.key);
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

  for (const cp of getGoalHourCheckpoints(settings)) {
    if (yearHours >= cp.threshold) {
      const existing = await db.milestones.where("title").equals(cp.title).count();
      if (existing === 0) {
        await db.milestones.add({
          id: uuid(),
          type: "hours",
          title: cp.title,
          description: cp.description,
          date: nowISO(),
          value: cp.threshold,
        });
      }
    }
  }

  return newlyUnlocked;
}
