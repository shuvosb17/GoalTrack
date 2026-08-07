"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Bs23StageScore } from "@/lib/bs23/readiness";

const TOOLTIP = {
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: 8,
  fontSize: 12,
};

export function StageRadarPanel({ stage }: { stage: Bs23StageScore }) {
  const data = stage.competencies.map((c) => ({
    subject: c.name.length > 14 ? `${c.name.slice(0, 12)}…` : c.name,
    score: c.score,
    threshold: c.threshold,
    full: 100,
  }));

  if (data.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-xs font-medium text-foreground">{stage.name}</p>
        <p className="text-sm tabular-nums text-muted-foreground">
          {stage.readiness}% / {stage.threshold}%
          {stage.locked && " · locked"}
        </p>
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#8b8b93", fontSize: 9 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP} />
            <Radar
              name="You"
              dataKey="score"
              stroke={stage.accent}
              fill={stage.accent}
              fillOpacity={0.35}
            />
            <Radar
              name="Need"
              dataKey="threshold"
              stroke="#71717a"
              fill="#71717a"
              fillOpacity={0.08}
              strokeDasharray="4 4"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
