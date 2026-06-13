"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import { IconBulb } from "@tabler/icons-react";
import type { PaceQuadrantPoint } from "@/lib/goal-milestones";
import { PACE_COLORS, PACE_LABELS, RISK_LABELS } from "@/lib/goal-milestones";

interface PaceQuadrantChartProps {
  points: PaceQuadrantPoint[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PaceQuadrantPoint }[];
}) {
  if (!active || !payload?.[0]) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-[#14141c] px-3 py-2.5 shadow-xl text-xs space-y-1.5 max-w-[220px]">
      <p className="font-medium text-foreground flex items-center gap-1.5">
        <span>{p.trackIcon}</span>
        <span className="truncate">{p.title}</span>
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
        <span>Time elapsed</span>
        <span className="font-mono text-foreground text-right">{p.timeProgress}%</span>
        <span>Progress</span>
        <span className="font-mono text-foreground text-right">{p.progressNormalized}%</span>
        <span>Pace</span>
        <span className="text-right" style={{ color: PACE_COLORS[p.paceStatus] }}>
          {PACE_LABELS[p.paceStatus]}
        </span>
        <span>Risk</span>
        <span className="text-right">{RISK_LABELS[p.risk]}</span>
      </div>
    </div>
  );
}

export function PaceQuadrantChart({ points }: PaceQuadrantChartProps) {
  if (points.length === 0) {
    return (
      <div className="flex h-[320px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <p>Add active goals to see where you sit on the pace map.</p>
        <p className="text-xs opacity-70">Above the diagonal = ahead · below = behind</p>
      </div>
    );
  }

  const behindCount = points.filter((p) => p.paceStatus === "behind").length;
  const aheadCount = points.filter((p) => p.paceStatus === "ahead").length;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border-[0.5px] border-white/[0.08] bg-gradient-to-b from-[#14141c] to-[#0c0c12]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/[0.05] via-transparent to-emerald-600/[0.04] pointer-events-none" />
        <div className="relative px-2 pt-2 pb-1">
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 12, right: 24, bottom: 28, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                type="number"
                dataKey="timeProgress"
                domain={[0, 100]}
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#3f3f46" }}
              >
                <Label value="Time elapsed %" offset={-8} position="insideBottom" fill="#a1a1aa" fontSize={11} />
              </XAxis>
              <YAxis
                type="number"
                dataKey="progressNormalized"
                domain={[0, 100]}
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#3f3f46" }}
                width={36}
              >
                <Label
                  value="Progress %"
                  angle={-90}
                  position="insideLeft"
                  fill="#a1a1aa"
                  fontSize={11}
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <ReferenceLine
                segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
                stroke="#52525b"
                strokeDasharray="6 4"
                strokeWidth={1.5}
              />
              <ReferenceLine x={50} stroke="#27272a" strokeDasharray="2 4" />
              <ReferenceLine y={50} stroke="#27272a" strokeDasharray="2 4" />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "#52525b" }} />
              <Scatter
                data={points}
                shape={(props: unknown) => {
                  const { cx = 0, cy = 0, payload } = props as { cx?: number; cy?: number; payload?: PaceQuadrantPoint };
                  if (!payload) return <g />;
                  const color = PACE_COLORS[payload.paceStatus];
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={10} fill={color} fillOpacity={0.15} />
                      <circle cx={cx} cy={cy} r={6} fill={color} stroke="#0c0c12" strokeWidth={1.5} />
                    </g>
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 px-4 pb-3 text-[10px] text-muted-foreground">
          {(["ahead", "on_track", "behind"] as const).map((status) => (
            <span key={status} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: PACE_COLORS[status] }} />
              {PACE_LABELS[status]}
            </span>
          ))}
          <span className="text-white/20">|</span>
          <span className="opacity-70">— on-pace line</span>
        </div>
      </div>

      {(behindCount > 0 || aheadCount > 0) && (
        <p className="flex items-start gap-2 text-xs text-muted-foreground px-1">
          <IconBulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400/80" stroke={1.5} />
          {behindCount > 0 && aheadCount > 0
            ? `${behindCount} goal${behindCount === 1 ? "" : "s"} below the pace line — ${aheadCount} ahead. Focus catch-up on the lagging ones first.`
            : behindCount > 0
              ? `${behindCount} goal${behindCount === 1 ? " is" : "s are"} below the pace line. Consider extending the timeline or increasing weekly effort.`
              : `All active goals are at or above pace — ${aheadCount} ahead of schedule.`}
        </p>
      )}
    </div>
  );
}
