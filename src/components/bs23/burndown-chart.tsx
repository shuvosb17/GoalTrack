"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Bs23ReadinessReport } from "@/lib/bs23/readiness";

const TOOLTIP = {
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: 8,
  fontSize: 12,
};

export function BurndownChart({ report }: { report: Bs23ReadinessReport }) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={report.burndown} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="bs23Burndown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="week" tick={{ fill: "#8b8b93", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={20} />
          <YAxis tick={{ fill: "#8b8b93", fontSize: 11 }} tickLine={false} axisLine={false} unit="h" />
          <Tooltip contentStyle={TOOLTIP} formatter={(v) => [`${v}h`, ""]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine x={report.burndown[Math.min(Math.ceil(report.weeksToMcq), report.burndown.length - 1)]?.week} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "MCQ", fill: "#ef4444", fontSize: 10 }} />
          <Area type="monotone" dataKey="projected" name="At your pace" stroke="#8b5cf6" fill="url(#bs23Burndown)" strokeWidth={2} />
          <Line type="monotone" dataKey="required" name="Required" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
