"use client";

import Link from "next/link";
import {
  CheckCircle2, Loader2, Sparkles, CircleDashed, TrendingUp,
} from "lucide-react";
import { IconActivity } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn, STATUS_LABELS } from "@/lib/utils";
import type { ProgressStatus } from "@/lib/types";
import { StatusDonutRing } from "./status-donut-ring";

const HEADER_ICON = "#7F77DD";
const TREND_GREEN = "#97C459";

const STATUS_VISUAL: Record<
  ProgressStatus,
  { color: string; Icon: typeof Loader2 }
> = {
  not_started: { color: "#71717a", Icon: CircleDashed },
  in_progress: { color: "#FAC775", Icon: Loader2 },
  completed: { color: "#378ADD", Icon: CheckCircle2 },
  mastered: { color: "#7F77DD", Icon: Sparkles },
};

interface StatusSummaryHeaderProps {
  counts: Record<ProgressStatus, number>;
  statusFilter: ProgressStatus | "all" | "review";
  onStatusFilter: (status: ProgressStatus | "all") => void;
  topicsAddedThisWeek: number;
}

function pct(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0;
}

export function StatusSummaryHeader({
  counts,
  statusFilter,
  onStatusFilter,
  topicsAddedThisWeek,
}: StatusSummaryHeaderProps) {
  const totalItems =
    counts.not_started +
    counts.in_progress +
    counts.completed +
    counts.mastered;

  const startedCount =
    counts.in_progress + counts.completed + counts.mastered;
  const startedPercent =
    totalItems > 0 ? Math.round((startedCount / totalItems) * 100) : 0;

  const legendStatuses: ProgressStatus[] = [
    "completed",
    "in_progress",
    "not_started",
    ...(counts.mastered > 0 ? (["mastered"] as const) : []),
  ];

  const tileStatuses: ProgressStatus[] = [
    "in_progress",
    "completed",
    "not_started",
    ...(counts.mastered > 0 ? (["mastered"] as const) : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-medium tracking-tight text-foreground">
            <IconActivity className="h-6 w-6 shrink-0" stroke={1.5} style={{ color: HEADER_ICON }} />
            Status
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Your learning status, organized by date
          </p>
        </div>
        <Link href="/tracks">
          <Button
            variant="ghost"
            className="h-9 border-[0.5px] border-white/[0.08] bg-transparent hover:bg-white/[0.04]"
          >
            Update in tracks
          </Button>
        </Link>
      </div>

      <div
        className="flex flex-col gap-5 rounded-xl px-5 py-[18px] sm:flex-row sm:items-center"
        style={{ backgroundColor: "#15151a" }}
      >
        <StatusDonutRing
          counts={{
            completed: counts.completed,
            in_progress: counts.in_progress,
            mastered: counts.mastered,
          }}
          totalItems={totalItems}
          startedPercent={startedPercent}
        />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">
              {totalItems} total items
            </span>
            {topicsAddedThisWeek > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium"
                style={{ color: TREND_GREEN }}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                +{topicsAddedThisWeek} this week
              </span>
            )}
          </div>

          <div className="flex h-2 w-full overflow-hidden rounded" style={{ borderRadius: 4 }}>
            {counts.completed > 0 && (
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${pct(counts.completed, totalItems)}%`,
                  backgroundColor: STATUS_VISUAL.completed.color,
                }}
              />
            )}
            {counts.in_progress > 0 && (
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${pct(counts.in_progress, totalItems)}%`,
                  backgroundColor: STATUS_VISUAL.in_progress.color,
                }}
              />
            )}
            {counts.mastered > 0 && (
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${pct(counts.mastered, totalItems)}%`,
                  backgroundColor: STATUS_VISUAL.mastered.color,
                }}
              />
            )}
            <div className="min-w-0 flex-1 bg-white/[0.06]" />
          </div>

          <div className="flex flex-wrap gap-x-3.5 gap-y-1">
            {legendStatuses.map((status) => {
              const { color } = STATUS_VISUAL[status];
              return (
                <span
                  key={status}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {STATUS_LABELS[status]}{" "}
                  <span className="tabular-nums text-foreground">{counts[status]}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-3",
          counts.mastered > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"
        )}
      >
        {tileStatuses.map((status) => {
          const { color, Icon } = STATUS_VISUAL[status];
          const active = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => onStatusFilter(active ? "all" : status)}
              className={cn(
                "rounded-xl border-[0.5px] border-white/[0.06] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.03]",
                active && "ring-1 ring-primary/40 bg-white/[0.04]"
              )}
              style={{ backgroundColor: "#15151a" }}
            >
              <div className="flex items-center justify-between gap-2">
                <Icon
                  className={cn("h-4 w-4 shrink-0", status === "in_progress" && "animate-spin")}
                  style={{ color }}
                />
                <span className="font-mono text-[22px] font-medium tabular-nums text-foreground">
                  {counts[status]}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                {STATUS_LABELS[status]}
              </p>
            </button>
          );
        })}
      </div>

      {counts.mastered === 0 && (
        <p className="text-[11px] text-muted-foreground">
          Mastered (0) hidden until you have at least one mastered item.
        </p>
      )}
    </div>
  );
}
