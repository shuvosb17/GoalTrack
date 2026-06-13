"use client";

import type { MomentumBreakdown } from "@/lib/types/metrics";
import { cn } from "@/lib/utils";

const BARS: { key: keyof Pick<MomentumBreakdown, "consistency" | "volume" | "velocity" | "balance">; label: string }[] = [
  { key: "consistency", label: "Consistency" },
  { key: "volume", label: "Volume" },
  { key: "velocity", label: "Velocity" },
  { key: "balance", label: "Balance" },
];

function barColor(score: number) {
  if (score < 10) return "bg-red-500";
  if (score <= 18) return "bg-amber-500";
  return "bg-emerald-500";
}

export function MomentumBreakdownPanel({ breakdown }: { breakdown: MomentumBreakdown }) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <p className="text-xs text-muted-foreground">Momentum Breakdown</p>
        <p className="metric-value text-2xl tabular-nums">{breakdown.total}<span className="text-sm text-muted-foreground">/100</span></p>
      </div>
      <div className="space-y-2">
        {BARS.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{label}</span>
              <span className="tabular-nums">{breakdown[key]}/25</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={cn("h-full rounded-full transition-all", barColor(breakdown[key]))}
                style={{ width: `${(breakdown[key] / 25) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{breakdown.dragMessage}</p>
    </div>
  );
}
