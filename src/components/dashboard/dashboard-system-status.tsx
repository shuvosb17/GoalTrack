"use client";

import { HaStatusStrip, type HaStatusItem } from "@/components/shared/ha-status-strip";
import { HaProgressBar } from "@/components/shared/ha-progress-bar";
import type { MomentumBreakdown } from "@/lib/types/metrics";

interface DashboardSystemStatusProps {
  items: HaStatusItem[];
  momentum: MomentumBreakdown;
  completedModules: number;
  completedSubtopics: number;
}

export function DashboardSystemStatus({
  items,
  momentum,
  completedModules,
  completedSubtopics,
}: DashboardSystemStatusProps) {
  return (
    <div className="space-y-3">
      <HaStatusStrip items={items} />

      <div className="ha-entity-tile p-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Momentum score
        </p>
        <p className="mt-1 text-3xl font-medium tabular-nums text-[#e2d9ff]">
          {momentum.total}
          <span className="ml-1 text-sm text-muted-foreground">/ 100</span>
        </p>
        <HaProgressBar value={momentum.total} max={100} color="#8b5cf6" className="mt-3" />
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {momentum.dragMessage}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="ha-entity-tile p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Modules</p>
          <p className="mt-1 text-xl font-medium tabular-nums">{completedModules}</p>
          <p className="text-[11px] text-muted-foreground">completed</p>
        </div>
        <div className="ha-entity-tile p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Subtopics</p>
          <p className="mt-1 text-xl font-medium tabular-nums">{completedSubtopics}</p>
          <p className="text-[11px] text-muted-foreground">completed</p>
        </div>
      </div>
    </div>
  );
}
