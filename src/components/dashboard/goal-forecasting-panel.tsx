"use client";

import { useMemo } from "react";
import { IconAlertTriangle, IconAntennaBars4, IconAntennaBars2, IconAntennaBars5 } from "@tabler/icons-react";
import type { TierGoalProgress } from "@/lib/types/metrics";
import type { PaceCheckSummary, TrajectoryPoint } from "@/lib/goal-forecast-ui";
import {
  TIER_FORECAST_COLORS,
  paceBadgeStyles,
  formatHours,
  getTrajectoryYMax,
} from "@/lib/goal-forecast-ui";
import { format, parseISO } from "date-fns";
import { todayISO } from "@/lib/utils";

interface GoalForecastingPanelProps {
  paceCheck: PaceCheckSummary;
  tiers: TierGoalProgress[];
  trajectory: TrajectoryPoint[];
  projectedHours: number;
  yearStart: string;
  yearEnd: string;
}

function PaceSignal({ percent }: { percent: number }) {
  const { color, background } = paceBadgeStyles(percent);
  const Icon =
    percent >= 90 ? IconAntennaBars5 : percent >= 70 ? IconAntennaBars4 : IconAntennaBars2;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      style={{ color, backgroundColor: background }}
    >
      <Icon size={13} stroke={2.5} />
      {percent}% pace
    </span>
  );
}

function PaceCheckAlert({ pace }: { pace: PaceCheckSummary }) {
  return (
    <div
      className="flex gap-3 rounded-lg border border-amber-500/15 bg-amber-500/[0.06] px-4 py-3"
      style={{ borderLeftWidth: 3, borderLeftColor: "#eab308" }}
    >
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
        <IconAlertTriangle size={14} className="text-amber-400" />
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Pace Check</p>
        {pace.onTrackTarget ? (
          <p className="text-sm leading-relaxed text-foreground/90">
            At your current pace of{" "}
            <strong className="font-semibold text-foreground">{pace.weeklyPace} h/wk</strong>, you&apos;re on track
            to log roughly{" "}
            <strong className="font-semibold text-foreground">{formatHours(pace.projectedHours)}h</strong> by{" "}
            {pace.yearEndLabel} — meeting your Target goal.
          </p>
        ) : pace.onTrackMinimum ? (
          <p className="text-sm leading-relaxed text-foreground/90">
            At your current pace of{" "}
            <strong className="font-semibold text-foreground">{pace.weeklyPace} h/wk</strong>, you&apos;ll log roughly{" "}
            <strong className="font-semibold text-foreground">{formatHours(pace.projectedHours)}h</strong> by{" "}
            {pace.yearEndLabel} — securing Minimum. Add{" "}
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-semibold text-emerald-300">
              +{pace.extraPerWeekForTarget} h/wk
            </span>{" "}
            to reach Target.
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-foreground/90">
            At your current pace of{" "}
            <strong className="font-semibold text-foreground">{pace.weeklyPace} h/wk</strong>, you&apos;ll log roughly{" "}
            <strong className="font-semibold text-foreground">{formatHours(pace.projectedHours)}h</strong> by{" "}
            {pace.yearEndLabel} —{" "}
            <span className="rounded bg-red-500/20 px-1.5 py-0.5 font-semibold text-red-300">
              {formatHours(pace.shortOfMinimum)}h short
            </span>{" "}
            of Minimum. Add{" "}
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-semibold text-emerald-300">
              +{pace.extraPerWeekForMinimum} h/wk
            </span>{" "}
            to secure Minimum, or{" "}
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-semibold text-emerald-300">
              +{pace.extraPerWeekForTarget} h/wk
            </span>{" "}
            to reach Target.
          </p>
        )}
      </div>
    </div>
  );
}

function TierProgressRow({ tier }: { tier: TierGoalProgress }) {
  const colors = TIER_FORECAST_COLORS[tier.tier];
  const fillPercent = tier.hours > 0 ? Math.min(100, (tier.loggedHours / tier.hours) * 100) : 0;

  return (
    <div className="grid grid-cols-[minmax(7rem,8.5rem)_1fr_minmax(7.5rem,8.5rem)] items-center gap-3 sm:gap-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${colors.icon}22` }}
        >
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colors.icon }} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{tier.label}</p>
          <p className="text-[11px] text-muted-foreground">{formatHours(tier.hours)}h</p>
        </div>
      </div>

      <div className="relative h-2 min-w-0 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${fillPercent}%`,
            backgroundColor: colors.bar,
            boxShadow: `0 0 8px ${colors.bar}55`,
          }}
        />
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <p className="whitespace-nowrap font-mono text-sm leading-none tabular-nums">
          <span className="font-semibold text-foreground">{formatHours(tier.loggedHours)}</span>
          <span className="text-muted-foreground"> / {formatHours(tier.hours)}h</span>
        </p>
        <PaceSignal percent={tier.percentOnTrack} />
      </div>
    </div>
  );
}

const W = 800;
const H = 300;
const PAD = { top: 32, right: 132, bottom: 52, left: 44 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function TrajectoryChart({
  points,
  projectedHours,
  stretchHours,
  minimumHours,
  targetHours,
}: {
  points: TrajectoryPoint[];
  projectedHours: number;
  stretchHours: number;
  minimumHours: number;
  targetHours: number;
}) {
  const yMax = useMemo(() => getTrajectoryYMax(points, projectedHours, stretchHours), [points, projectedHours, stretchHours]);
  const todayLabel = format(parseISO(todayISO()), "MMM d, yyyy");

  const xAt = (i: number) => PAD.left + (i / Math.max(1, points.length - 1)) * PLOT_W;
  const yAt = (v: number) => PAD.top + PLOT_H - (v / yMax) * PLOT_H;

  const todayIndex = points.findIndex((p) => p.isToday);
  const todayX = todayIndex >= 0 ? xAt(todayIndex) : null;

  const linePath = (key: keyof Pick<TrajectoryPoint, "actual" | "currentPace" | "reqMinimum" | "reqTarget" | "reqStretch">, fromToday = false) => {
    const segments: string[] = [];
    points.forEach((p, i) => {
      const val = p[key];
      if (val === undefined) return;
      if (fromToday && todayIndex >= 0 && i < todayIndex) return;
      segments.push(`${segments.length === 0 ? "M" : "L"} ${xAt(i)} ${yAt(val)}`);
    });
    return segments.join(" ");
  };

  const actualPath = linePath("actual");
  const currentPacePath = todayIndex >= 0 ? linePath("currentPace", true) : linePath("currentPace");
  const reqMinPath = linePath("reqMinimum");
  const reqTargetPath = linePath("reqTarget");
  const reqStretchPath = linePath("reqStretch");

  const yTicks = useMemo(() => {
    const step = yMax <= 1000 ? 500 : 500;
    const ticks: number[] = [];
    for (let v = 0; v <= yMax; v += step) ticks.push(v);
    return ticks;
  }, [yMax]);

  const lastPoint = points[points.length - 1];
  const endX = xAt(points.length - 1);

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06]" style={{ backgroundColor: "#0a0a0b" }}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Projected Trajectory
        </p>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 text-[10px] text-muted-foreground sm:gap-x-4">
          {[
            { swatch: "bg-white", label: "Actual", dashed: false },
            { swatch: "border-t border-dotted border-zinc-400", label: "Current pace", dashed: true },
            { swatch: "border-t border-dashed border-emerald-400", label: "Req. Min", dashed: true },
            { swatch: "border-t border-dashed border-violet-400", label: "Req. Target", dashed: true },
            { swatch: "border-t border-dashed border-blue-400", label: "Req. Stretch", dashed: true },
          ].map(({ swatch, label, dashed }) => (
            <span key={label} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span className={`inline-block h-px w-4 ${dashed ? swatch : `bg-white`}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Projected trajectory chart">
        <defs>
          <linearGradient id="trajectory-actual-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line
              x1={PAD.left}
              y1={yAt(tick)}
              x2={PAD.left + PLOT_W}
              y2={yAt(tick)}
              stroke="rgba(255,255,255,0.06)"
            />
            <text x={PAD.left - 8} y={yAt(tick) + 3} textAnchor="end" fill="#71717a" fontSize={10}>
              {tick}
            </text>
          </g>
        ))}

        {points.map((p, i) => (
          <line
            key={`x-grid-${p.label}`}
            x1={xAt(i)}
            y1={PAD.top}
            x2={xAt(i)}
            y2={PAD.top + PLOT_H}
            stroke="rgba(255,255,255,0.04)"
          />
        ))}

        {todayX !== null && (
          <line
            x1={todayX}
            y1={PAD.top}
            x2={todayX}
            y2={PAD.top + PLOT_H}
            stroke="rgba(255,255,255,0.35)"
            strokeDasharray="4 4"
          />
        )}

        {actualPath && (
          <>
            <path
              d={`${actualPath} L ${todayIndex >= 0 ? todayX : xAt(points.length - 1)} ${yAt(0)} L ${xAt(0)} ${yAt(0)} Z`}
              fill="url(#trajectory-actual-fill)"
            />
            <path d={actualPath} fill="none" stroke="#ffffff" strokeWidth={2} />
          </>
        )}

        {todayIndex >= 0 && points[todayIndex].actual !== undefined && (
          <circle
            cx={todayX!}
            cy={yAt(points[todayIndex].actual!)}
            r={4}
            fill="#ffffff"
            stroke="#0a0a0b"
            strokeWidth={2}
          />
        )}

        {currentPacePath && (
          <path
            d={currentPacePath}
            fill="none"
            stroke="#a1a1aa"
            strokeWidth={1.5}
            strokeDasharray="2 4"
          />
        )}
        {reqMinPath && (
          <path d={reqMinPath} fill="none" stroke="#10b981" strokeWidth={1.5} strokeDasharray="6 4" />
        )}
        {reqTargetPath && (
          <path d={reqTargetPath} fill="none" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="6 4" />
        )}
        {reqStretchPath && (
          <path d={reqStretchPath} fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="6 4" />
        )}

        {points.map((p, i) => (
          <text
            key={`x-label-${p.label}`}
            x={xAt(i)}
            y={H - 20}
            textAnchor="middle"
            fill="#71717a"
            fontSize={10}
          >
            {p.label}
          </text>
        ))}

        {lastPoint && (
          <>
            {(
              [
                lastPoint.currentPace !== undefined
                  ? {
                      y: yAt(lastPoint.currentPace),
                      fill: "#a1a1aa",
                      label: `${formatHours(lastPoint.currentPace)}h at current pace`,
                    }
                  : null,
                {
                  y: yAt(lastPoint.reqMinimum),
                  fill: "#10b981",
                  label: `${formatHours(minimumHours)}h`,
                  dot: true,
                },
                {
                  y: yAt(lastPoint.reqTarget),
                  fill: "#8b5cf6",
                  label: `${formatHours(targetHours)}h`,
                  dot: true,
                },
                {
                  y: yAt(lastPoint.reqStretch),
                  fill: "#3b82f6",
                  label: `${formatHours(stretchHours)}h`,
                  dot: true,
                },
              ].filter(Boolean) as { y: number; fill: string; label: string; dot?: boolean }[]
            ).map(({ y, fill, label, dot }) => (
              <g key={label}>
                {dot && <circle cx={endX} cy={y} r={3} fill={fill} />}
                <text x={endX + 8} y={y + 4} fill={fill} fontSize={10}>
                  {label}
                </text>
              </g>
            ))}
          </>
        )}

        {todayX !== null && (
          <text x={todayX} y={H - 8} textAnchor="middle" fill="#a1a1aa" fontSize={9}>
            Today — {todayLabel}
          </text>
        )}
      </svg>
    </div>
  );
}

export function GoalForecastingPanel({
  paceCheck,
  tiers,
  trajectory,
  projectedHours,
  yearStart,
  yearEnd,
}: GoalForecastingPanelProps) {
  const periodLabel = `${format(parseISO(yearStart), "MMM")} – ${format(parseISO(yearEnd), "MMM yyyy")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">Goal Forecasting</h3>
        <span className="text-xs text-muted-foreground">{periodLabel}</span>
      </div>

      <PaceCheckAlert pace={paceCheck} />

      <div className="space-y-4">
        {tiers.map((tier) => (
          <TierProgressRow key={tier.tier} tier={tier} />
        ))}
      </div>

      <TrajectoryChart
        points={trajectory}
        projectedHours={projectedHours}
        stretchHours={paceCheck.stretchHours}
        minimumHours={paceCheck.minimumHours}
        targetHours={paceCheck.targetHours}
      />
    </div>
  );
}
