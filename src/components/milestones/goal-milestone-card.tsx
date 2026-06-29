"use client";

import { Calendar, ChevronRight, Clock, Flag, TrendingDown, TrendingUp } from "lucide-react";
import type { GoalMilestoneStats } from "@/lib/types";
import { formatGoalDateRange } from "@/lib/goal-milestones";
import {
  formatProjectionLine,
  getCardAccentColor,
  getRiskPillColor,
  getRiskPillLabel,
  PACE_PILL_COLORS,
  PACE_PILL_LABELS,
} from "@/lib/goal-dashboard";
import { cn } from "@/lib/utils";

interface GoalMilestoneCardProps {
  stats: GoalMilestoneStats;
  onOpen: () => void;
}

function GoalRing({
  value,
  delta,
  color,
}: {
  value: number;
  delta: number;
  color: string;
}) {
  const size = 64;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, value)) / 100);

  return (
    <div className="relative h-16 w-[72px] shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-sm font-medium tabular-nums text-foreground">{value}%</span>
        <span
          className="font-mono text-[10px] tabular-nums"
          style={{ color: delta >= 0 ? "#22c55e" : "#ef4444" }}
        >
          {delta >= 0 ? "+" : ""}
          {delta}%
        </span>
      </div>
    </div>
  );
}

export function GoalMilestoneCard({ stats, onOpen }: GoalMilestoneCardProps) {
  const { goal, trackIcon, scopeLabel, paceStatus } = stats;
  const accent = getCardAccentColor(stats);
  const paceColor = PACE_PILL_COLORS[paceStatus];
  const riskColor = getRiskPillColor(stats);
  const checkpoints = goal.checkpoints ?? [];
  const checkpointsDone = checkpoints.filter((c) => c.done).length;
  const description = goal.notes?.trim() || scopeLabel;
  const PaceIcon = stats.paceDelta >= 0 ? TrendingUp : TrendingDown;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full overflow-hidden rounded-xl border border-white/[0.06] text-left transition-colors",
        "hover:border-white/[0.1] hover:bg-[#161618]"
      )}
      style={{ backgroundColor: "#141416" }}
    >
      <div className="flex">
        <div className="w-1 shrink-0" style={{ backgroundColor: accent }} />
        <div className="min-w-0 flex-1 p-3.5">
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
              style={{ color: paceColor, backgroundColor: `${paceColor}18` }}
            >
              <PaceIcon className="h-2.5 w-2.5" />
              {PACE_PILL_LABELS[paceStatus]}
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
              style={{ color: riskColor, backgroundColor: `${riskColor}18` }}
            >
              {getRiskPillLabel(stats)}
            </span>
          </div>

          <div className="mb-3 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] text-sm">
                  {trackIcon}
                </span>
                <h3 className="truncate text-sm font-semibold text-foreground">{goal.title}</h3>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
            </div>
            <GoalRing
              value={stats.currentProgress}
              delta={stats.paceDelta}
              color={accent}
            />
          </div>

          <div className="mb-3 rounded-lg border border-white/[0.05] bg-black/20 px-3 py-2.5">
            <div className="mb-2 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Actual vs expected</span>
              <span
                className="font-mono tabular-nums"
                style={{ color: stats.paceDelta >= 0 ? "#22c55e" : "#ef4444" }}
              >
                {stats.paceDelta >= 0 ? "+" : ""}
                {stats.paceDelta}%
              </span>
            </div>
            <div className="space-y-1.5">
              <div>
                <div className="mb-1 flex justify-between text-[9px] uppercase tracking-wide text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-mono tabular-nums text-foreground">{stats.currentProgress}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${stats.currentProgress}%`, backgroundColor: accent }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[9px] uppercase tracking-wide text-muted-foreground">
                  <span>Expected</span>
                  <span className="font-mono tabular-nums text-foreground">{stats.expectedProgress}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-white/25"
                    style={{ width: `${stats.expectedProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/[0.05] bg-black/20 px-2.5 py-2">
              <div className="mb-1 flex items-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                <Clock className="h-3 w-3" />
                Timeline
              </div>
              <p className="font-mono text-sm tabular-nums text-foreground">{stats.timeProgress}%</p>
              <p className="text-[10px] text-muted-foreground">
                {stats.paceStatus === "overdue"
                  ? "Overdue"
                  : `${stats.daysRemaining}d left`}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.05] bg-black/20 px-2.5 py-2">
              <div className="mb-1 flex items-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                <Flag className="h-3 w-3" />
                Milestones
              </div>
              <p className="font-mono text-sm tabular-nums text-foreground">
                {checkpoints.length > 0
                  ? `${checkpointsDone}/${checkpoints.length}`
                  : `${stats.topicsCompleted}/${stats.topicsTotal}`}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {checkpoints.length > 0 ? "checkpoints" : "topics done"}
              </p>
              {checkpoints.length > 0 && (
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{
                      width: `${checkpoints.length ? (checkpointsDone / checkpoints.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <p className="mb-3 text-[11px] text-muted-foreground">{formatProjectionLine(stats)}</p>

          <div className="flex items-center justify-between gap-2 border-t border-white/[0.05] pt-2.5">
            <span className="flex min-w-0 items-center gap-1 truncate text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {formatGoalDateRange(goal.startDate, goal.endDate).replace(" → ", " → ")}
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted-foreground">
              {goal.months} mo plan
              <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
