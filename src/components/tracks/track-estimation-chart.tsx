"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { TrackEstimationPoint } from "@/lib/types";

interface TrackEstimationChartProps {
  data: TrackEstimationPoint[];
  color: string;
}

export function TrackEstimationChart({ data, color }: TrackEstimationChartProps) {
  const gradId = `est-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={160}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 9 }} interval="preserveStartEnd" />
        <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 9 }} width={28} />
        <Tooltip
          contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }}
          formatter={(value, name) => [
            `${value ?? 0}%`,
            name === "target" ? "Plan" : name === "actual" ? "Actual" : "Forecast",
          ]}
        />
        <ReferenceLine y={100} stroke="#52525b" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="target" stroke="#71717a" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="target" />
        <Area type="monotone" dataKey="actual" stroke={color} fill={`url(#${gradId})`} strokeWidth={2.5} connectNulls={false} name="actual" />
        <Line type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 4" dot={false} name="projected" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
