"use client";

import { useMemo } from "react";
import type { TimeDistributionTrack } from "@/lib/analytics-card-insights";
import { AnalyticsMetricCard, monoClass } from "./analytics-metric-card";
import { cn } from "@/lib/utils";

const DONUT_SIZE = 140;
const CX = DONUT_SIZE / 2;
const CY = DONUT_SIZE / 2;
const R = 52;
const STROKE = 18;
const GAP_PX = 4;

function formatHours(h: number): string {
  const rounded = Math.round(h * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
}

function DonutChart({ tracks, totalHours }: { tracks: TimeDistributionTrack[]; totalHours: number }) {
  const segments = useMemo(() => {
    const total = tracks.reduce((s, t) => s + t.hours, 0);
    if (total <= 0) return [];

    const circumference = 2 * Math.PI * R;
    let rotation = 0;

    return tracks.map((track) => {
      const fraction = track.hours / total;
      const segmentLength = fraction * circumference;
      const dash = Math.max(0, segmentLength - GAP_PX);
      const offset = -rotation + circumference * 0.25;
      rotation += segmentLength;

      return { ...track, dash, circumference, offset };
    });
  }, [tracks]);

  return (
    <div className="relative shrink-0" style={{ width: DONUT_SIZE, height: DONUT_SIZE }}>
      <svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
        {segments.map((seg) => (
          <circle
            key={seg.name}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth={STROKE}
            strokeDasharray={`${seg.dash} ${seg.circumference - seg.dash}`}
            strokeDashoffset={seg.offset}
            strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: `${CX}px ${CY}px` }}
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className={cn(monoClass(), "text-[21px] font-medium leading-none text-[#EDEDF0]")}>
          {formatHours(totalHours)}h
        </p>
        <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.14em] text-[#65656F]">
          total
        </p>
      </div>
    </div>
  );
}

interface TimeDistributionCardProps {
  tracks: TimeDistributionTrack[];
  insight: string;
}

export function TimeDistributionCard({ tracks, insight }: TimeDistributionCardProps) {
  const sorted = useMemo(
    () => [...tracks].sort((a, b) => b.hours - a.hours),
    [tracks]
  );
  const totalHours = useMemo(
    () => sorted.reduce((s, t) => s + t.hours, 0),
    [sorted]
  );

  if (sorted.length === 0) {
    return (
      <AnalyticsMetricCard
        title="Time distribution"
        subtitle="Where your hours went this period"
        insight={insight}
      >
        <p className="py-10 text-center text-sm text-[#9A9AA5]">No track time logged yet.</p>
      </AnalyticsMetricCard>
    );
  }

  return (
    <AnalyticsMetricCard
      title="Time distribution"
      subtitle="Where your hours went this period"
      insight={insight}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <DonutChart tracks={sorted} totalHours={totalHours} />

        <ul className="min-w-0 flex-1 space-y-2.5">
          {sorted.map((track) => (
            <li key={track.name} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-2.5 gap-y-0">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: track.color }}
              />
              <span className="truncate text-sm text-[#EDEDF0]">{track.name}</span>
              <span className={cn(monoClass(), "text-xs text-[#9A9AA5]")}>
                {formatHours(track.hours)}h
              </span>
              <span className={cn(monoClass(), "w-9 text-right text-xs text-[#EDEDF0]")}>
                {track.percentage}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AnalyticsMetricCard>
  );
}
