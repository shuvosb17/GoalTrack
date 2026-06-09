"use client";

import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { RadarDimension } from "@/lib/types";

export function GrowthRadarChart({ data }: { data: RadarDimension[] }) {
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-muted-foreground">No growth data yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Study any track to populate your radar — progress and logged hours count toward each skill area.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadar cx="50%" cy="50%" outerRadius="72%" data={data}>
        <PolarGrid stroke="#3f3f46" />
        <PolarAngleAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 9 }} />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#71717a", fontSize: 9 }}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
          labelStyle={{ color: "#fafafa" }}
          formatter={(value) => [`${value ?? 0}%`, "Growth"]}
        />
        <Radar
          name="Growth"
          dataKey="value"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
