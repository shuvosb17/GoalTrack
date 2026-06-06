"use client";

import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import type { RadarDimension } from "@/lib/types";

export function GrowthRadarChart({ data }: { data: RadarDimension[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadar data={data}>
        <PolarGrid stroke="#27272a" />
        <PolarAngleAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
        <Radar
          name="Growth"
          dataKey="value"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
