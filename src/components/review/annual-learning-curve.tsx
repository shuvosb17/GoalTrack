"use client";

import { useMemo, useState } from "react";
import type { LearningCurvePoint } from "@/lib/annual-review";
import { MOMENTUM_COLORS, MOMENTUM_LABELS } from "@/lib/annual-review";

const W = 820;
const H = 300;
const PAD = { top: 30, right: 52, bottom: 44, left: 46 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

interface AnnualLearningCurveProps {
  points: LearningCurvePoint[];
}

export function AnnualLearningCurve({ points }: AnnualLearningCurveProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const elapsed = points.filter((p) => !p.isFuture);
  const cumMax = Math.max(...points.map((p) => p.cumulativeHours), 1);
  const monthMax = Math.max(...points.map((p) => p.hours), 1);

  const slotW = PLOT_W / Math.max(1, points.length);
  const xCenter = (i: number) => PAD.left + slotW * i + slotW / 2;
  const yCum = (v: number) => PAD.top + PLOT_H - (v / (cumMax * 1.08)) * PLOT_H;
  // Bars occupy the lower half of the plot so the cumulative line stays readable.
  const barH = (v: number) => (v / monthMax) * (PLOT_H * 0.42);

  const linePath =
    elapsed.length === 0
      ? ""
      : elapsed
          .map((p, i) => `${i === 0 ? "M" : "L"} ${xCenter(points.indexOf(p))} ${yCum(p.cumulativeHours)}`)
          .join(" ");

  const areaPath =
    elapsed.length === 0
      ? ""
      : `${linePath} L ${xCenter(points.indexOf(elapsed[elapsed.length - 1]))} ${PAD.top + PLOT_H} L ${xCenter(points.indexOf(elapsed[0]))} ${PAD.top + PLOT_H} Z`;

  const yTicks = useMemo(() => {
    const step = cumMax <= 40 ? 10 : cumMax <= 100 ? 25 : cumMax <= 400 ? 100 : 250;
    const ticks: number[] = [];
    for (let v = 0; v <= cumMax * 1.08; v += step) ticks.push(v);
    return ticks;
  }, [cumMax]);

  const lastElapsed = elapsed[elapsed.length - 1];
  const hoveredPoint = hovered !== null ? points[hovered] : null;

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06]" style={{ backgroundColor: "#0a0a0b" }}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Learning Curve — Cumulative Hours
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="inline-block h-px w-4 bg-violet-400" /> Cumulative
          </span>
          {(["accelerating", "steady", "slowing", "idle"] as const).map((m) => (
            <span key={m} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: MOMENTUM_COLORS[m] }} />
              {MOMENTUM_LABELS[m]}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Annual learning curve">
          <defs>
            <linearGradient id="annual-curve-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={PAD.left}
                y1={yCum(tick)}
                x2={PAD.left + PLOT_W}
                y2={yCum(tick)}
                stroke="rgba(255,255,255,0.05)"
              />
              <text x={PAD.left - 8} y={yCum(tick) + 3} textAnchor="end" fill="#71717a" fontSize={10}>
                {Math.round(tick)}
              </text>
            </g>
          ))}

          {points.map((p, i) => {
            const bh = p.isFuture ? 0 : barH(p.hours);
            return (
              <g
                key={p.monthKey}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <rect
                  x={PAD.left + slotW * i}
                  y={PAD.top}
                  width={slotW}
                  height={PLOT_H}
                  fill={hovered === i ? "rgba(255,255,255,0.03)" : "transparent"}
                />
                <rect
                  x={xCenter(i) - Math.min(14, slotW * 0.28)}
                  y={PAD.top + PLOT_H - bh}
                  width={Math.min(28, slotW * 0.56)}
                  height={Math.max(bh, p.isFuture ? 0 : 2)}
                  rx={2}
                  fill={MOMENTUM_COLORS[p.momentum]}
                  fillOpacity={p.isFuture ? 0.15 : 0.85}
                />
                <text x={xCenter(i)} y={H - 22} textAnchor="middle" fill="#71717a" fontSize={10}>
                  {p.label}
                </text>
                {!p.isFuture && p.hours > 0 && (
                  <text
                    x={xCenter(i)}
                    y={PAD.top + PLOT_H - bh - 5}
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize={8.5}
                  >
                    {p.hours >= 10 ? Math.round(p.hours) : p.hours.toFixed(1)}h
                  </text>
                )}
              </g>
            );
          })}

          {areaPath && <path d={areaPath} fill="url(#annual-curve-fill)" pointerEvents="none" />}
          {linePath && (
            <path d={linePath} fill="none" stroke="#a78bfa" strokeWidth={2} pointerEvents="none" />
          )}

          {elapsed.map((p) => (
            <circle
              key={`dot-${p.monthKey}`}
              cx={xCenter(points.indexOf(p))}
              cy={yCum(p.cumulativeHours)}
              r={hovered === points.indexOf(p) ? 4.5 : 3}
              fill="#a78bfa"
              stroke="#0a0a0b"
              strokeWidth={1.5}
              pointerEvents="none"
            />
          ))}

          {lastElapsed && (
            <text
              x={Math.min(xCenter(points.indexOf(lastElapsed)) + 10, W - 4)}
              y={yCum(lastElapsed.cumulativeHours) + 3}
              fill="#c4b5fd"
              fontSize={10}
              fontWeight={600}
            >
              {Math.round(lastElapsed.cumulativeHours)}h
            </text>
          )}
        </svg>

        {hoveredPoint && !hoveredPoint.isFuture && (
          <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-lg border border-white/[0.1] bg-[#141418] px-3 py-2 text-xs shadow-xl">
            <p className="font-medium text-foreground">{hoveredPoint.label}</p>
            <p className="mt-0.5 text-muted-foreground">
              {hoveredPoint.hours.toFixed(1)}h this month · {hoveredPoint.cumulativeHours.toFixed(0)}h total
            </p>
            <p className="text-muted-foreground">
              {hoveredPoint.activeDays} active day{hoveredPoint.activeDays === 1 ? "" : "s"} ·{" "}
              <span style={{ color: MOMENTUM_COLORS[hoveredPoint.momentum] }}>
                {MOMENTUM_LABELS[hoveredPoint.momentum]}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
