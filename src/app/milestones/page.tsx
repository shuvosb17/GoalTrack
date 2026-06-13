"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flag, Plus, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import { IconChartDots3, IconTarget } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGoalMilestones, useTracks, useAllModules, useAllTopics, useAllSubtopics,
} from "@/hooks/use-data";
import {
  buildAllGoalStats,
  buildPaceQuadrantData,
  deleteGoalMilestone,
  getGoalRisk,
  RISK_COLORS,
} from "@/lib/goal-milestones";
import { PaceQuadrantChart } from "@/components/milestones/pace-quadrant-chart";
import { GoalMilestoneCard } from "@/components/milestones/goal-milestone-card";
import { GoalMilestoneDialog } from "@/components/milestones/goal-milestone-dialog";
import { SuggestedMilestones } from "@/components/milestones/suggested-milestones";
import { SectionHeading } from "@/components/shared/section-heading";
import type { GoalMilestone } from "@/lib/types";

export default function MilestonesPage() {
  const goals = useGoalMilestones();
  const tracks = useTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const subtopics = useAllSubtopics();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GoalMilestone | null>(null);

  const stats = useMemo(
    () => buildAllGoalStats(goals, tracks, modules, topics, subtopics),
    [goals, tracks, modules, topics, subtopics]
  );

  const quadrantPoints = useMemo(() => buildPaceQuadrantData(stats), [stats]);

  const summary = useMemo(() => {
    const active = stats.filter((s) => s.isActive);
    const ahead = stats.filter((s) => s.paceStatus === "ahead" || s.paceStatus === "completed").length;
    const atRisk = stats.filter((s) => {
      const risk = getGoalRisk(s);
      return risk === "at_risk" || risk === "critical";
    }).length;
    const avgProgress = stats.length
      ? Math.round(stats.reduce((sum, s) => sum + s.currentProgress, 0) / stats.length)
      : 0;
    const totalGained = stats.reduce((sum, s) => sum + s.progressGained, 0);
    return { active: active.length, ahead, atRisk, avgProgress, totalGained, total: stats.length };
  }, [stats]);

  const needsAttention = useMemo(
    () => stats.filter((s) => {
      const risk = getGoalRisk(s);
      return s.isActive && (risk === "at_risk" || risk === "critical" || s.paceStatus === "behind");
    }),
    [stats]
  );

  const activeGoals = stats.filter((s) => s.paceStatus !== "completed" && s.paceStatus !== "overdue");
  const completedGoals = stats.filter((s) => s.paceStatus === "completed" || s.paceStatus === "overdue");

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (goal: GoalMilestone) => {
    setEditing(goal);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete goal "${title}"?`)) return;
    await deleteGoalMilestone(id);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2.5 mb-1">
            <Flag className="h-6 w-6 text-violet-400" strokeWidth={1.75} />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Goal Milestones</h1>
          </div>
          <p className="text-muted-foreground max-w-xl text-sm">
            Set focused learning windows and see at a glance whether you are ahead or behind the pace line.
          </p>
        </motion.div>
        <Button size="lg" onClick={openCreate} className="w-full sm:w-auto gap-2">
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active goals", value: summary.active, icon: Zap, color: "#8b5cf6" },
          { label: "On / ahead", value: summary.ahead, icon: TrendingUp, color: "#10b981" },
          { label: "At risk", value: summary.atRisk, icon: AlertTriangle, color: RISK_COLORS.at_risk },
          { label: "Avg progress", value: `${summary.avgProgress}%`, icon: IconTarget, color: "#3b82f6" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-3 sm:p-4 text-center">
            <item.icon className="h-4 w-4 mx-auto mb-2" style={{ color: item.color }} />
            <p className="metric-value text-2xl sm:text-3xl tabular-nums">{item.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {needsAttention.length > 0 && (
        <div className="rounded-xl border-[0.5px] border-amber-500/25 bg-amber-500/[0.04] p-4">
          <p className="text-xs font-medium text-amber-400/90 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Needs attention ({needsAttention.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {needsAttention.map((s) => (
              <button
                key={s.goal.id}
                type="button"
                onClick={() => openEdit(s.goal)}
                className="rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.03] px-3 py-2 text-left text-xs hover:bg-white/[0.06] transition-colors"
              >
                <span className="mr-1.5">{s.trackIcon}</span>
                <span className="font-medium">{s.goal.title}</span>
                <span className="text-muted-foreground ml-2">{s.paceDelta >= 0 ? "+" : ""}{s.paceDelta}% vs expected</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionHeading icon={IconChartDots3}>Pace map</SectionHeading>
        <PaceQuadrantChart points={quadrantPoints} />
      </div>

      <div>
        <SectionHeading icon={IconTarget}>Active goals</SectionHeading>
        {activeGoals.length === 0 ? (
          <div className="space-y-4">
            <SuggestedMilestones tracks={tracks} modules={modules} topics={topics} subtopics={subtopics} />
            <Card className="border-dashed border-[0.5px]">
              <CardContent className="py-12 text-center">
                <Flag className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground mb-4">No active goals yet. Create one to start your next learning sprint.</p>
                <Button onClick={openCreate} className="gap-2">
                  <Plus className="h-4 w-4" /> Create your first goal
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeGoals.map((s, i) => (
              <GoalMilestoneCard
                key={s.goal.id}
                stats={s}
                index={i}
                topics={topics}
                subtopics={subtopics}
                modules={modules}
                onEdit={() => openEdit(s.goal)}
                onDelete={() => handleDelete(s.goal.id, s.goal.title)}
              />
            ))}
          </div>
        )}
      </div>

      {completedGoals.length > 0 && (
        <div>
          <SectionHeading className="text-muted-foreground">Completed / past</SectionHeading>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {completedGoals.map((s, i) => (
              <GoalMilestoneCard
                key={s.goal.id}
                stats={s}
                index={i}
                topics={topics}
                subtopics={subtopics}
                modules={modules}
                onEdit={() => openEdit(s.goal)}
                onDelete={() => handleDelete(s.goal.id, s.goal.title)}
              />
            ))}
          </div>
        </div>
      )}

      <GoalMilestoneDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tracks={tracks}
        modules={modules}
        topics={topics}
        subtopics={subtopics}
        editing={editing}
      />
    </div>
  );
}
