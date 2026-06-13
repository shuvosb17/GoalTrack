"use client";

import { motion } from "framer-motion";
import { Calendar, Pencil, Trash2, TrendingUp, Clock, Target, RefreshCw, Check, Circle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "@/components/shared/circular-progress";
import { GoalScopeSyncPanel } from "@/components/milestones/goal-scope-sync-panel";
import type { GoalMilestoneStats, Module, Subtopic, Topic } from "@/lib/types";
import {
  formatGoalDateRange,
  PACE_COLORS,
  PACE_LABELS,
  projectGoalFinish,
  getGoalRisk,
  formatProjectedFinish,
  toggleGoalCheckpoint,
  RISK_COLORS,
  RISK_LABELS,
} from "@/lib/goal-milestones";
import { cn } from "@/lib/utils";

interface GoalMilestoneCardProps {
  stats: GoalMilestoneStats;
  index: number;
  topics: Topic[];
  subtopics: Subtopic[];
  modules: Module[];
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalMilestoneCard({ stats, index, topics, subtopics, modules, onEdit, onDelete }: GoalMilestoneCardProps) {
  const { goal, trackColor, trackIcon, scopeLabel, paceStatus } = stats;
  const projection = projectGoalFinish(stats);
  const risk = getGoalRisk(stats);
  const checkpoints = goal.checkpoints ?? [];
  const checkpointsDone = checkpoints.filter((c) => c.done).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group relative overflow-hidden rounded-2xl border-[0.5px] border-border/50 glass-card"
    >
      {risk !== "on_track" && paceStatus !== "completed" && (
        <div
          className="absolute top-0 right-0 z-10 flex items-center gap-1 rounded-bl-xl px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide"
          style={{ background: `${RISK_COLORS[risk]}18`, color: RISK_COLORS[risk], borderLeft: `1px solid ${RISK_COLORS[risk]}33`, borderBottom: `1px solid ${RISK_COLORS[risk]}33` }}
        >
          <AlertTriangle className="h-3 w-3" />
          {RISK_LABELS[risk]}
        </div>
      )}

      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${trackColor}35 0%, transparent 55%)` }}
      />
      <div className="relative p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 pr-16">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xl">{trackIcon}</span>
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{ borderColor: `${PACE_COLORS[paceStatus]}55`, color: PACE_COLORS[paceStatus] }}
              >
                {PACE_LABELS[paceStatus]}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">{goal.months} mo</Badge>
            </div>
            <h3 className="font-semibold text-lg leading-tight truncate">{goal.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">{scopeLabel}</p>
            <p className="text-[10px] text-emerald-400/90 mt-1 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Live sync · {stats.topicsCompleted}/{stats.topicsTotal} topics
              {stats.scopeType !== "track" && ` · track ${stats.trackWideProgress}%`}
            </p>
          </div>
          <CircularProgress
            value={stats.currentProgress}
            size={72}
            strokeWidth={6}
            color={trackColor}
            sublabel={`+${stats.progressGained}%`}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Target className="h-3 w-3" /> Learning progress
            </span>
            <span className="font-mono font-medium">{stats.currentProgress}%</span>
          </div>
          <Progress value={stats.currentProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" /> Time elapsed
            </span>
            <span className="font-mono">{stats.timeProgress}% · {stats.daysRemaining}d left</span>
          </div>
          <Progress value={stats.timeProgress} className="h-1.5 opacity-70" />
        </div>

        <div className="rounded-lg border-[0.5px] border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] text-muted-foreground">
          <span className={cn(projection.onTimeProjection ? "text-emerald-400/90" : "text-amber-400/90")}>
            {formatProjectedFinish(projection)}
          </span>
        </div>

        {checkpoints.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Checkpoints</span>
              <span className="font-mono">{checkpointsDone}/{checkpoints.length}</span>
            </div>
            <div className="space-y-1">
              {checkpoints.map((cp) => (
                <button
                  key={cp.id}
                  type="button"
                  onClick={() => toggleGoalCheckpoint(goal.id, cp.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-secondary/40",
                    cp.done && "opacity-60"
                  )}
                >
                  {cp.done ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className={cn(cp.done && "line-through")}>{cp.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatGoalDateRange(goal.startDate, goal.endDate)}
          </span>
          <span className="flex items-center gap-1" style={{ color: stats.paceDelta >= 0 ? "#10b981" : "#f59e0b" }}>
            <TrendingUp className="h-3 w-3" />
            {stats.paceDelta >= 0 ? "+" : ""}{stats.paceDelta}% vs expected
          </span>
        </div>

        <GoalScopeSyncPanel stats={stats} topics={topics} subtopics={subtopics} modules={modules} />

        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pt-1">
          <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={onEdit}>
            <Pencil className="h-3 w-3" /> Edit
          </Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
