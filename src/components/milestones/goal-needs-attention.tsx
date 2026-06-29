"use client";

import { AlertTriangle, ChevronRight } from "lucide-react";
import type { GoalMilestoneStats } from "@/lib/types";

interface GoalNeedsAttentionProps {
  goals: GoalMilestoneStats[];
  onOpen: (id: string) => void;
}

export function GoalNeedsAttention({ goals, onOpen }: GoalNeedsAttentionProps) {
  if (goals.length === 0) return null;

  return (
    <div
      className="rounded-xl border border-white/[0.06] px-4 py-3.5"
      style={{ backgroundColor: "#111113" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          Needs Attention
        </div>
        <span className="rounded-full bg-red-500/12 px-2 py-0.5 text-[11px] font-medium text-red-400">
          {goals.length}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((stats) => (
          <button
            key={stats.goal.id}
            type="button"
            onClick={() => onOpen(stats.goal.id)}
            className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#141416] px-3 py-2.5 text-left transition-colors hover:border-white/[0.1]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] text-base">
              {stats.trackIcon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{stats.goal.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {stats.paceDelta >= 0
                  ? `${stats.paceDelta}% ahead of expected`
                  : `${Math.abs(stats.paceDelta)}% behind expected`}
              </p>
            </div>
            <span
              className="shrink-0 font-mono text-sm tabular-nums"
              style={{ color: stats.paceDelta >= 0 ? "#22c55e" : "#ef4444" }}
            >
              {stats.paceDelta >= 0 ? "+" : ""}
              {stats.paceDelta}%
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
