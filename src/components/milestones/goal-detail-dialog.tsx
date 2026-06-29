"use client";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, Flag, Clock, Target } from "lucide-react";
import type { GoalMilestoneStats } from "@/lib/types";
import { formatGoalDateRange } from "@/lib/goal-milestones";
import {
  formatProjectionLine,
  getRiskPillColor,
  getRiskPillLabel,
  PACE_PILL_COLORS,
  PACE_PILL_LABELS,
} from "@/lib/goal-dashboard";

interface GoalDetailDialogProps {
  stats: GoalMilestoneStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalDetailDialog({
  stats,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: GoalDetailDialogProps) {
  if (!stats) return null;

  const { goal, trackIcon, scopeLabel, paceStatus } = stats;
  const checkpoints = goal.checkpoints ?? [];
  const checkpointsDone = checkpoints.filter((c) => c.done).length;
  const paceColor = PACE_PILL_COLORS[paceStatus];
  const riskColor = getRiskPillColor(stats);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.08] bg-[#111113] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left">
            <span className="text-xl">{trackIcon}</span>
            <span className="truncate">{goal.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span
              className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase"
              style={{ color: paceColor, backgroundColor: `${paceColor}18` }}
            >
              {PACE_PILL_LABELS[paceStatus]}
            </span>
            <span
              className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase"
              style={{ color: riskColor, backgroundColor: `${riskColor}18` }}
            >
              {getRiskPillLabel(stats)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{goal.notes?.trim() || scopeLabel}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-white/[0.06] bg-[#141416] p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Progress</p>
              <p className="mt-1 font-mono text-2xl tabular-nums">{stats.currentProgress}%</p>
              <p className="text-xs text-muted-foreground">Expected {stats.expectedProgress}%</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-[#141416] p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Pace delta</p>
              <p
                className="mt-1 font-mono text-2xl tabular-nums"
                style={{ color: stats.paceDelta >= 0 ? "#22c55e" : "#ef4444" }}
              >
                {stats.paceDelta >= 0 ? "+" : ""}
                {stats.paceDelta}%
              </p>
              <p className="text-xs text-muted-foreground">vs expected</p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-white/[0.06] bg-[#141416] p-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {stats.timeProgress}% elapsed · {stats.daysRemaining}d remaining
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              {stats.topicsCompleted}/{stats.topicsTotal} topics complete
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flag className="h-3.5 w-3.5" />
              {checkpoints.length > 0
                ? `${checkpointsDone}/${checkpoints.length} checkpoints`
                : "No checkpoints defined"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatGoalDateRange(goal.startDate, goal.endDate)}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{formatProjectionLine(stats)}</p>

          {goal.notes && (
            <div className="rounded-lg border border-white/[0.06] bg-[#141416] p-3 text-sm text-muted-foreground">
              {goal.notes}
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            Last updated {new Date(goal.updatedAt).toLocaleString()}
          </p>

          <div className="flex gap-2 pt-2">
            <Button className="flex-1 gap-2" onClick={onEdit}>
              <Pencil className="h-4 w-4" /> Edit goal
            </Button>
            <Button variant="outline" className="gap-2 border-red-500/30 text-red-400" onClick={onDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
