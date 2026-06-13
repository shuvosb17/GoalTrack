"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { IconTrophy, IconTarget } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  useAchievements, useMilestones, useSessions, useAllSubtopics, useAllModules, useTracks,
} from "@/hooks/use-data";
import {
  checkAchievements,
  getAchievementProgress,
  getAchievementCategory,
  ACHIEVEMENT_CATEGORY_LABELS,
  type AchievementCategory,
} from "@/lib/achievements";
import { format, parseISO } from "date-fns";
import type { Achievement } from "@/lib/types";

const CATEGORY_ORDER: AchievementCategory[] = ["getting_started", "hours", "streaks", "completion"];

function AchievementCard({
  ach,
  progress,
  unlocked,
  index,
}: {
  ach: Achievement;
  progress: ReturnType<typeof getAchievementProgress>;
  unlocked: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card
        className={
          unlocked
            ? "border-[0.5px] border-violet-500/30 bg-violet-500/[0.06]"
            : "border-[0.5px] border-white/[0.08] bg-white/[0.02] opacity-90"
        }
      >
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-3">
            {unlocked ? (
              <span className="text-3xl">{ach.icon}</span>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04]">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">{ach.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{ach.description}</p>
              {!unlocked && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{progress.current}{progress.unit ? ` ${progress.unit}` : ""} / {progress.target}</span>
                    <span>{progress.percent}%</span>
                  </div>
                  <Progress value={progress.percent} className="h-1" />
                </div>
              )}
              {unlocked && ach.unlockedAt && (
                <Badge variant="outline" className="mt-2 text-[10px] border-emerald-500/30 text-emerald-400">
                  Unlocked {format(parseISO(ach.unlockedAt), "MMM d, yyyy")}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

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

  const withProgress = useMemo(
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
  const latestUnlock = [...unlocked]
    .filter((a) => a.ach.unlockedAt)
    .sort((a, b) => (b.ach.unlockedAt ?? "").localeCompare(a.ach.unlockedAt ?? ""))[0];

  const byCategory = useMemo(() => {
    const map = new Map<AchievementCategory, typeof withProgress>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const item of withProgress) {
      const cat = getAchievementCategory(item.ach.key);
      map.get(cat)?.push(item);
    }
    return CATEGORY_ORDER.map((cat) => ({ cat, items: map.get(cat) ?? [] })).filter((g) => g.items.length > 0);
  }, [withProgress]);

  const completionPct = achievements.length
    ? Math.round((unlocked.length / achievements.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-medium tracking-tight sm:text-3xl">
          <IconTrophy className="h-7 w-7 text-primary" stroke={1.5} /> Achievements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Milestones unlocked from your learning activity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Unlocked", value: `${unlocked.length}/${achievements.length}` },
          { label: "Completion", value: `${completionPct}%` },
          {
            label: "Latest unlock",
            value: latestUnlock?.ach.title.split(" ")[0] ?? "—",
          },
          {
            label: "Closest next",
            value: closestNext ? `${closestNext.progress.percent}%` : "—",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-3 sm:p-4 text-center">
            <p className="metric-value truncate text-xl tabular-nums sm:text-2xl">{item.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {closestNext && (
        <div className="rounded-xl border-[0.5px] border-violet-500/25 bg-violet-500/[0.05] p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-300">
            <IconTarget className="h-3.5 w-3.5" stroke={1.5} />
            Closest to unlocking
          </p>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{closestNext.ach.title}</p>
              <p className="text-xs text-muted-foreground">{closestNext.ach.description}</p>
            </div>
            <span className="metric-value text-2xl tabular-nums text-violet-300">{closestNext.progress.percent}%</span>
          </div>
          <Progress value={closestNext.progress.percent} className="mt-2 h-1.5" />
        </div>
      )}

      {byCategory.map(({ cat, items }) => (
        <div key={cat}>
          <SectionHeading>{ACHIEVEMENT_CATEGORY_LABELS[cat]}</SectionHeading>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map(({ ach, progress, unlocked }, i) => (
              <AchievementCard key={ach.id} ach={ach} progress={progress} unlocked={unlocked} index={i} />
            ))}
          </div>
        </div>
      ))}

      <div>
        <SectionHeading>Milestone timeline</SectionHeading>
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
