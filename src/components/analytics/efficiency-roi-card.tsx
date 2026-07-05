"use client";

import { useMemo } from "react";
import type { EfficiencyRow } from "@/lib/analytics-card-insights";
import { AnalyticsMetricCard, monoClass } from "./analytics-metric-card";
import { cn } from "@/lib/utils";

interface EfficiencyRoiCardProps {
  rows: EfficiencyRow[];
  insight: string;
}

export function EfficiencyRoiCard({ rows, insight }: EfficiencyRoiCardProps) {
  const sorted = useMemo(
    () => [...rows].filter((r) => r.hours > 0).sort((a, b) => b.roi - a.roi),
    [rows]
  );

  const maxRoi = useMemo(
    () => Math.max(...sorted.map((r) => r.roi), 0.01),
    [sorted]
  );

  if (sorted.length === 0) {
    return (
      <AnalyticsMetricCard
        title="Efficiency (ROI)"
        subtitle="Completion per hour invested"
        insight={insight}
      >
        <p className="py-10 text-center text-sm text-[#9A9AA5]">Log hours on a track to see ROI.</p>
      </AnalyticsMetricCard>
    );
  }

  return (
    <AnalyticsMetricCard
      title="Efficiency (ROI)"
      subtitle="Completion per hour invested"
      insight={insight}
    >
      <p className="mb-4 text-[11px] leading-relaxed text-[#65656F]">
        (progress × avg quality) ÷ hours — higher means more output per hour spent
      </p>

      <ul className="space-y-4">
        {sorted.map((row) => {
          const barWidth = Math.max(4, Math.round((row.roi / maxRoi) * 100));
          return (
            <li key={row.name}>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-[#EDEDF0]">{row.name}</span>
                <span className={cn(monoClass(), "shrink-0 text-[10px] text-[#9A9AA5]")}>
                  {row.percentage}% · {row.hours.toFixed(0)}h
                </span>
                <span
                  className={cn(
                    monoClass(),
                    "w-10 shrink-0 text-right text-xs font-semibold text-[#EDEDF0]"
                  )}
                >
                  {row.roi.toFixed(1)}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#15151c]">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: row.color,
                    opacity: 0.85,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </AnalyticsMetricCard>
  );
}
