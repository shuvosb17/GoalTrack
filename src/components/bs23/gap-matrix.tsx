"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { Bs23ReadinessReport } from "@/lib/bs23/readiness";

const TOOLTIP = {
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: 8,
  fontSize: 12,
};

export function GapMatrixChart({ report }: { report: Bs23ReadinessReport }) {
  const data = report.gapMatrix.map((g) => ({
    x: g.weight,
    y: g.score,
    z: Math.max(1, g.weight),
    name: g.name,
    stageId: g.stageId,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            type="number"
            dataKey="x"
            name="Weight"
            tick={{ fill: "#8b8b93", fontSize: 11 }}
            label={{ value: "Exam weight →", position: "bottom", fill: "#71717a", fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Score"
            domain={[0, 100]}
            tick={{ fill: "#8b8b93", fontSize: 11 }}
            label={{ value: "Your score →", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 10 }}
          />
          <ZAxis type="number" dataKey="z" range={[40, 200]} />
          <Tooltip
            contentStyle={TOOLTIP}
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(v, _n, p) => {
              const payload = p as { payload?: { name?: string; y?: number } };
              return [`${payload.payload?.y ?? v}%`, payload.payload?.name ?? ""];
            }}
          />
          <Scatter data={data} fill="#8b5cf6" fillOpacity={0.75} />
        </ScatterChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Bottom-right = high weight, low score — what will fail you first.
      </p>
    </div>
  );
}
