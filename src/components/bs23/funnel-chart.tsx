"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Bs23StageScore } from "@/lib/bs23/readiness";

const TOOLTIP = {
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: 8,
  fontSize: 12,
};

export function FunnelChart({ stages }: { stages: Bs23StageScore[] }) {
  const data = stages.map((s) => ({
    name: s.shortName,
    passPct: s.passProbability,
    cumulative: s.cumulativeProbability,
    readiness: s.readiness,
    locked: s.locked,
    accent: s.accent,
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: "#8b8b93", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: "#8b8b93", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={TOOLTIP}
            formatter={(value, name) => [
              `${value}%`,
              name === "cumulative" ? "Cumulative offer path" : "Stage pass chance",
            ]}
          />
          <Bar dataKey="passPct" name="passPct" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.locked ? "#3f3f46" : entry.accent} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Cumulative offer probability after all stages:{" "}
        <span className="font-medium text-foreground">
          {stages[stages.length - 1]?.cumulativeProbability.toFixed(2)}%
        </span>
      </p>
    </div>
  );
}
