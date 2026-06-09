"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ForecastChartProps {
  data: { label: string; actual?: number; projected: number }[];
  goal: number;
}

export function ForecastChart({ data, goal }: ForecastChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
        <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} />
        <Tooltip
          contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
          labelStyle={{ color: "#fafafa" }}
        />
        <ReferenceLine y={goal} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "Goal", fill: "#f59e0b", fontSize: 10 }} />
        <Area type="monotone" dataKey="actual" stroke="#8b5cf6" fill="url(#colorActual)" strokeWidth={2} connectNulls={false} />
        <Area type="monotone" dataKey="projected" stroke="#3b82f6" fill="url(#colorProjected)" strokeWidth={2} strokeDasharray="5 5" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
