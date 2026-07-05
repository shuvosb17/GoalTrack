"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { IconTrophy, IconTarget } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";
import { SectionHeading } from "@/components/shared/section-heading";
import { RankHero } from "@/components/achievements/rank-hero";
import { SprintLane, type SprintLaneItem } from "@/components/achievements/sprint-lane";
import {
  useAchievements, useMilestones, useSessions, useAllSubtopics, useAllModules, useTracks,
} from "@/hooks/use-data";
import {
  checkAchievements,
  getAchievementProgress,
  getAchievementCategory,
  getAchievementOrderIndex,
  getAchievementRank,
  ACHIEVEMENT_CATEGORY_LABELS,
  ACHIEVEMENT_CATEGORY_ORDER,
  ACHIEVEMENT_CATEGORY_ACCENT,
} from "@/lib/achievements";
import { format, parseISO } from "date-fns";

export default function AchievementsPage() {
  const achievements = useAchievements();
  const milestones = useMilestones();
  const sessions = useSessions();
  const subtopics = useAllSubtopics();
  const modules = useAllModules();
  const tracks = useTracks();

  useEffect(() => {
    checkAchievements(sessions, subtopics, modules, tracks);
  }, [sessions, subtopics, modules, tracks]);

  const withProgress = useMemo<SprintLaneItem[]>(
    () =>
      achievements.map((ach) => ({
        ach,
        progress: getAchievementProgress(ach, sessions, subtopics, modules, tracks),
        unlocked: !!ach.unlockedAt,
      })),
    [achievements, sessions, subtopics, modules, tracks]
  );

  const unlocked = withProgress.filter((a) => a.unlocked);
  const locked = withProgress.filter((a) => !a.unlocked);
  const closestNext = [...locked].sort((a, b) => b.progress.percent - a.progress.percent)[0];

  const completionPct = achievements.length
    ? Math.round((unlocked.length / achievements.length) * 100)
    : 0;

  const rank = getAchievementRank(unlocked.length, achievements.length);

  const lanes = useMemo(() => {
    return ACHIEVEMENT_CATEGORY_ORDER.map((cat) => {
      const items = withProgress
        .filter((item) => getAchievementCategory(item.ach.key) === cat)
        .sort((a, b) => getAchievementOrderIndex(a.ach.key) - getAchievementOrderIndex(b.ach.key));
      return { cat, items };
    }).filter((lane) => lane.items.length > 0);
  }, [withProgress]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-medium tracking-tight sm:text-3xl">
          <IconTrophy className="h-7 w-7 text-primary" stroke={1.5} /> Achievements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sprint from rookie to legend — every session moves you down the track.
        </p>
      </div>

      <RankHero
        rank={rank}
        unlockedCount={unlocked.length}
        total={achievements.length}
        completionPct={completionPct}
      />

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
        <div className="grid gap-4">
          {lanes.map(({ cat, items }) => (
            <SprintLane
              key={cat}
              label={ACHIEVEMENT_CATEGORY_LABELS[cat]}
              accent={ACHIEVEMENT_CATEGORY_ACCENT[cat]}
              items={items}
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
