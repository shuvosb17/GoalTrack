"use client";

import { CircleAlert, Layers, PauseCircle, TrendingUp } from "lucide-react";
import { CoachCard, CoachEmptyLine } from "./coach-card";
import type { Bottleneck } from "@/lib/go-coach-advice";

const SEVERITY_COLOR: Record<Bottleneck["severity"], string> = {
  high: "#ef4444",
  medium: "#eab308",
  low: "#3b82f6",
};

const KIND_ICON = {
  stalled: PauseCircle,
  wip: Layers,
  near_miss: TrendingUp,
} as const;

const KIND_LABEL = {
  stalled: "Stalled",
  wip: "Too much open",
  near_miss: "Almost there",
} as const;

export function BottleneckList({ bottlenecks }: { bottlenecks: Bottleneck[] }) {
  const highCount = bottlenecks.filter((b) => b.severity === "high").length;

  return (
    <CoachCard
      title="Bottlenecks"
      subtitle={
        bottlenecks.length === 0
          ? "Nothing is blocking your throughput right now."
          : `${bottlenecks.length} thing${bottlenecks.length === 1 ? "" : "s"} slowing you down${highCount > 0 ? `, ${highCount} needing attention this week` : ""}.`
      }
      icon={CircleAlert}
      accent={highCount > 0 ? "#ef4444" : "#3b82f6"}
    >
      {bottlenecks.length === 0 ? (
        <CoachEmptyLine>
          No stalled modules, no work-in-progress overload. Keep the current focus.
        </CoachEmptyLine>
      ) : (
        <div className="space-y-2">
          {bottlenecks.map((item) => {
            const Icon = KIND_ICON[item.kind];
            const color = SEVERITY_COLOR[item.severity];
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3"
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${color}1f` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-medium text-foreground">{item.title}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
                      style={{ background: `${color}1f`, color }}
                    >
                      {KIND_LABEL[item.kind]}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CoachCard>
  );
}
