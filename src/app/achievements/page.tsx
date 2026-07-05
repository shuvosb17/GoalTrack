"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { IconTrophy, IconTarget } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";
import { SectionHeading } from "@/components/shared/section-heading";
import { RankHero } from "@/components/achievements/rank-hero";
import { SprintLane, type SprintLaneItem } from "@/components/achievements/sprint-lane";
import {
  useAchievements, useMilestones, useSessions, useAllSubtopics, useAllModules, useTracks, useSettings,
} from "@/hooks/use-data";
import {
  checkAchievements,
  getAchievementProgress,
  getAchievementCategory,
  getAchievementOrderIndex,
  getGoalSprintSnapshot,
  getAllAchievementDefinitions,
  getHourCheckpointStep,
  ACHIEVEMENT_CATEGORY_LABELS,
  ACHIEVEMENT_CATEGORY_ORDER,
  ACHIEVEMENT_CATEGORY_ACCENT,
  parseHourThreshold,
} from "@/lib/achievements";
import type { Achievement } from "@/lib/types";
import { DEFAULT_YEAR_END, DEFAULT_YEAR_START } from "@/lib/analytics";
import { resolveTieredGoal } from "@/lib/goals";
import { format, parseISO } from "date-fns";

function sortLaneItems(a: SprintLaneItem, b: SprintLaneItem): number {
  const cat = getAchievementCategory(a.ach.key);
  if (cat === "hours") {
    return (parseHourThreshold(a.ach.key) ?? 0) - (parseHourThreshold(b.ach.key) ?? 0);
  }
  return getAchievementOrderIndex(a.ach.key) - getAchievementOrderIndex(b.ach.key);
}

export default function AchievementsPage() {
  const achievements = useAchievements();
  const milestones = useMilestones();
  const sessions = useSessions();
  const subtopics = useAllSubtopics();
  const modules = useAllModules();
  const tracks = useTracks();
  const settings = useSettings();

  const yearStart = settings?.yearStart ?? DEFAULT_YEAR_START;
  const yearEnd = settings?.yearEnd ?? DEFAULT_YEAR_END;
  const tiered = resolveTieredGoal(settings);

  useEffect(() => {
    checkAchievements(sessions, subtopics, modules, tracks, settings, yearStart, yearEnd);
  }, [sessions, subtopics, modules, tracks, settings, yearStart, yearEnd]);

  const sprint = useMemo(
    () => getGoalSprintSnapshot(sessions, settings, yearStart, yearEnd),
    [sessions, settings, yearStart, yearEnd]
  );

  const catalog = useMemo(() => getAllAchievementDefinitions(settings), [settings]);

  const withProgress = useMemo<SprintLaneItem[]>(() => {
    const byKey = new Map<string, Achievement>();
    for (const ach of achievements) {
      if (!byKey.has(ach.key)) byKey.set(ach.key, ach);
    }

    return catalog.map((def) => {
      const ach: Achievement = byKey.get(def.key) ?? {
        id: def.key,
        key: def.key,
        title: def.title,
        description: def.description,
        icon: def.icon,
      };
      return {
        ach,
        progress: getAchievementProgress(ach, sessions, subtopics, modules, tracks, settings, yearStart, yearEnd),
        unlocked: !!ach.unlockedAt,
      };
    });
  }, [catalog, achievements, sessions, subtopics, modules, tracks, settings, yearStart, yearEnd]);

  const unlocked = withProgress.filter((a) => a.unlocked);
  const locked = withProgress.filter((a) => !a.unlocked);
  const closestNext = [...locked].sort((a, b) => b.progress.percent - a.progress.percent)[0];

  const hourStep = getHourCheckpointStep();

  const lanes = useMemo(() => {
    return ACHIEVEMENT_CATEGORY_ORDER.map((cat) => {
      const items = withProgress
        .filter((item) => getAchievementCategory(item.ach.key) === cat)
        .sort(sortLaneItems);
      const subtitle =
        cat === "hours"
          ? `100h · 200h · 300h … every ${hourStep}h up to ${tiered.stretch}h stretch`
          : cat === "getting_started"
            ? "Early milestones before the hour sprint"
            : undefined;
      return { cat, items, subtitle };
    }).filter((lane) => lane.items.length > 0);
  }, [withProgress, tiered, hourStep]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-medium tracking-tight sm:text-3xl">
          <IconTrophy className="h-7 w-7 text-primary" stroke={1.5} /> Achievements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your sprint to {tiered.target}h — every session pushes you closer on the track.
        </p>
      </div>

      <RankHero sprint={sprint} unlockedCount={unlocked.length} totalAchievements={catalog.length} />

      {closestNext && (
        <div className="rounded-2xl border-[0.5px] border-violet-500/25 bg-violet-500/[0.05] p-4 sm:p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium text-violet-300">
            <IconTarget className="h-3.5 w-3.5" stroke={1.5} />
            Next checkpoint
          </p>
          <div className="flex items-center gap-4">
            <span className="text-3xl">{closestNext.ach.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">{closestNext.ach.title}</p>
                <span className="metric-value shrink-0 text-2xl tabular-nums text-violet-300">
                  {closestNext.progress.percent}%
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{closestNext.ach.description}</p>
              <div className="mt-3 flex items-center gap-3">
                <Progress value={closestNext.progress.percent} className="h-1.5 flex-1" />
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                  {closestNext.progress.current}
                  {closestNext.progress.unit ? ` ${closestNext.progress.unit}` : ""} / {closestNext.progress.target}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <SectionHeading>Race lanes</SectionHeading>
        <p className="-mt-3 mb-4 text-xs text-muted-foreground">
          Scroll each lane — low achievements on the left, higher tiers toward the finish line.
        </p>
        <div className="grid gap-5">
          {lanes.map(({ cat, items, subtitle }) => (
            <SprintLane
              key={cat}
              label={ACHIEVEMENT_CATEGORY_LABELS[cat]}
              accent={ACHIEVEMENT_CATEGORY_ACCENT[cat]}
              items={items}
              subtitle={subtitle}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionHeading>Recent unlocks</SectionHeading>
        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Milestones appear as you progress.</p>
        ) : (
          <div className="relative ml-3 space-y-6 pl-8">
            <div className="pointer-events-none absolute -left-px top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 to-transparent" />
            {milestones.map((ms, i) => (
              <motion.div
                key={ms.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative"
              >
                <div className="absolute -left-[calc(2rem+0.25rem)] top-4 h-2 w-2 rounded-full bg-violet-500 shadow-sm shadow-violet-500/40" />
                <div className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium">{ms.title}</h4>
                    <span className="text-xs text-muted-foreground">{format(parseISO(ms.date), "MMM d, yyyy")}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ms.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
