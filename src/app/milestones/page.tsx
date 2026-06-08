"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flag, Plus, Sparkles, Target, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGoalMilestones, useTracks, useAllModules, useAllTopics, useAllSubtopics,
} from "@/hooks/use-data";
import { buildAllGoalStats, deleteGoalMilestone } from "@/lib/goal-milestones";
import { GoalTimelineChart } from "@/components/milestones/goal-timeline-chart";
import { GoalMilestoneCard } from "@/components/milestones/goal-milestone-card";
import { GoalMilestoneDialog } from "@/components/milestones/goal-milestone-dialog";
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

  const summary = useMemo(() => {
    const active = stats.filter((s) => s.isActive);
    const ahead = stats.filter((s) => s.paceStatus === "ahead" || s.paceStatus === "completed").length;
    const avgProgress = stats.length
      ? Math.round(stats.reduce((sum, s) => sum + s.currentProgress, 0) / stats.length)
      : 0;
    const totalGained = stats.reduce((sum, s) => sum + s.progressGained, 0);
    return { active: active.length, ahead, avgProgress, totalGained, total: stats.length };
  }, [stats]);

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
      <div className="relative overflow-hidden rounded-2xl glass-card p-4 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/25 via-fuchsia-600/10 to-blue-600/20 pointer-events-none" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
                <Flag className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Goal Milestones</h1>
            </div>
            <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
              Break big tracks into focused chunks — pick a module or topic, set a 1–12 month window, and watch your progress climb.
              Progress and status stay live-synced with Tracks; scoped goals can show a different % than the full track.
            </p>
          </motion.div>
          <Button size="lg" onClick={openCreate} className="w-full sm:w-auto shadow-lg shadow-primary/25 gap-2">
            <Plus className="h-4 w-4" /> New Goal
          </Button>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 sm:mt-8">
          {[
            { label: "Active goals", value: summary.active, icon: Zap, color: "#8b5cf6" },
            { label: "On / ahead", value: summary.ahead, icon: TrendingUp, color: "#10b981" },
            { label: "Avg progress", value: `${summary.avgProgress}%`, icon: Target, color: "#3b82f6" },
            { label: "Progress gained", value: `+${summary.totalGained}%`, icon: Sparkles, color: "#f59e0b" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border/50 bg-secondary/30 p-3 sm:p-4 text-center backdrop-blur-sm">
              <item.icon className="h-4 w-4 mx-auto mb-2" style={{ color: item.color }} />
              <p className="text-xl sm:text-2xl font-bold">{item.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Progress vs Timeline</CardTitle>
          <p className="text-xs text-muted-foreground">Compare learning progress, time elapsed, and expected pace</p>
        </CardHeader>
        <CardContent>
          <GoalTimelineChart stats={stats} />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" /> Active Goals
        </h2>
        {activeGoals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Flag className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground mb-4">No active goals yet. Create one to start your next learning sprint.</p>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" /> Create your first goal
              </Button>
            </CardContent>
          </Card>
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
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Completed / Past</h2>
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
