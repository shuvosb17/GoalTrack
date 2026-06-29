"use client";

import { useMemo, useState } from "react";
import type { PaceQuadrantPoint } from "@/lib/goal-milestones";
import { PACE_PILL_COLORS } from "@/lib/goal-dashboard";

interface PaceMapChartProps {
  points: PaceQuadrantPoint[];
  onGoalClick?: (id: string) => void;
}

const W = 720;
const H = 320;
const PAD = { top: 24, right: 28, bottom: 40, left: 44 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function xScale(v: number) {
  return PAD.left + (v / 100) * PLOT_W;
}

function yScale(v: number) {
  return PAD.top + PLOT_H - (v / 100) * PLOT_H;
}

export function PaceMapChart({ points, onGoalClick }: PaceMapChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredPoint = points.find((p) => p.id === hovered);

  const counts = useMemo(
    () => ({
      ahead: points.filter((p) => p.paceStatus === "ahead").length,
      on_track: points.filter((p) => p.paceStatus === "on_track").length,
      behind: points.filter((p) => p.paceStatus === "behind").length,
    }),
    [points]
  );

  if (points.length === 0) {
    return (
      <div
        className="flex h-[320px] flex-col items-center justify-center rounded-xl border border-white/[0.06] text-sm text-muted-foreground"
        style={{ backgroundColor: "#111113" }}
      >
        <p>Add goals to see them on the pace map.</p>
        <p className="mt-1 text-xs opacity-70">Above the diagonal = ahead · below = behind</p>
      </div>
    );
  }

  const diagX1 = xScale(0);
  const diagY1 = yScale(0);
  const diagX2 = xScale(100);
  const diagY2 = yScale(100);

  return (
    <div
      className="overflow-hidden rounded-xl border border-white/[0.06]"
      style={{ backgroundColor: "#111113" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Pace Map</p>
          <p className="text-xs text-muted-foreground">
            Progress plotted against time elapsed. The diagonal is the planned pace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
            {counts.ahead} ahead
          </span>
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-amber-400">
            {counts.on_track} on track
          </span>
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-red-400">
            {counts.behind} behind
          </span>
        </div>
      </div>

      <div className="relative px-2 pb-3 pt-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Pace map">
          <defs>
            <linearGradient id="pace-diag" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Behind zone */}
          <polygon
            points={`${diagX1},${diagY1} ${diagX2},${diagY2} ${diagX2},${yScale(0)} ${diagX1},${yScale(0)}`}
            fill="#ef4444"
            fillOpacity={0.03}
          />
          {/* Ahead zone */}
          <polygon
            points={`${diagX1},${diagY1} ${diagX2},${diagY2} ${xScale(0)},${yScale(100)} ${xScale(0)},${diagY1}`}
            fill="#22c55e"
            fillOpacity={0.03}
          />

          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={`grid-${tick}`}>
              <line
                x1={xScale(tick)}
                y1={PAD.top}
                x2={xScale(tick)}
                y2={PAD.top + PLOT_H}
                stroke="rgba(255,255,255,0.05)"
              />
              <line
                x1={PAD.left}
                y1={yScale(tick)}
                x2={PAD.left + PLOT_W}
                y2={yScale(tick)}
                stroke="rgba(255,255,255,0.05)"
              />
              <text
                x={PAD.left - 8}
                y={yScale(tick) + 3}
                textAnchor="end"
                fill="#71717a"
                fontSize={9}
              >
                {tick}%
              </text>
            </g>
          ))}

          <text
            x={PAD.left + PLOT_W / 2}
            y={H - 8}
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize={10}
          >
            Time elapsed
          </text>
          <text
            x={14}
            y={PAD.top + PLOT_H / 2}
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize={10}
            transform={`rotate(-90 14 ${PAD.top + PLOT_H / 2})`}
          >
            Progress
          </text>

          <line
            x1={diagX1}
            y1={diagY1}
            x2={diagX2}
            y2={diagY2}
            stroke="url(#pace-diag)"
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
          <text x={diagX2 - 4} y={diagY2 - 6} textAnchor="end" fill="#71717a" fontSize={9}>
            planned pace
          </text>

          <text x={PAD.left + 8} y={PAD.top + 12} fill="#22c55e" fontSize={8} opacity={0.7}>
            AHEAD
          </text>
          <text
            x={PAD.left + PLOT_W - 8}
            y={PAD.top + PLOT_H - 6}
            textAnchor="end"
            fill="#ef4444"
            fontSize={8}
            opacity={0.7}
          >
            BEHIND
          </text>

          {points.map((p) => {
            const cx = xScale(p.timeProgress);
            const cy = yScale(p.progressNormalized);
            const color = PACE_PILL_COLORS[p.paceStatus] ?? p.trackColor;
            const active = hovered === p.id;
            return (
              <g
                key={p.id}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onGoalClick?.(p.id)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={active ? 16 : 14}
                  fill={color}
                  fillOpacity={0.08}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={active ? 13 : 11}
                  fill="#0a0a0a"
                  stroke={color}
                  strokeWidth={active ? 2 : 1.5}
                />
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  fontSize={11}
                >
                  {p.trackIcon}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div
            className="pointer-events-none absolute right-4 top-4 z-10 max-w-[220px] rounded-lg border border-white/[0.08] px-3 py-2.5 text-xs shadow-lg"
            style={{ backgroundColor: "#1a1a1c" }}
          >
            <p className="font-medium text-foreground">
              {hoveredPoint.trackIcon} {hoveredPoint.title}
            </p>
            <div className="mt-1.5 space-y-0.5 text-muted-foreground">
              <p>
                Actual:{" "}
                <span className="font-mono text-foreground">{hoveredPoint.currentProgress}%</span>
              </p>
              <p>
                Expected:{" "}
                <span className="font-mono text-foreground">{hoveredPoint.expectedProgress}%</span>
              </p>
              <p>
                Delta:{" "}
                <span
                  className="font-mono"
                  style={{
                    color:
                      hoveredPoint.paceDelta >= 0 ? "#22c55e" : "#ef4444",
                  }}
                >
                  {hoveredPoint.paceDelta >= 0 ? "+" : ""}
                  {hoveredPoint.paceDelta}%
                </span>
              </p>
              <p>
                Days left:{" "}
                <span className="font-mono text-foreground">{hoveredPoint.daysRemaining}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
