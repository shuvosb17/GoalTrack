"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import type { GoalMilestoneStats } from "@/lib/types";

interface GoalTimelineChartProps {
  stats: GoalMilestoneStats[];
}

export function GoalTimelineChart({ stats }: GoalTimelineChartProps) {
  const data = stats.map((s) => ({
    name: s.goal.title.length > 18 ? `${s.goal.title.slice(0, 16)}…` : s.goal.title,
    learning: s.currentProgress,
    time: s.timeProgress,
    expected: s.expectedProgress,
    gained: s.progressGained,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        Add a goal to see your timeline chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 48)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
          labelStyle={{ color: "#fafafa" }}
          formatter={(value, name) => [`${value ?? 0}%`, name === "learning" ? "Progress" : name === "time" ? "Time elapsed" : "Expected"]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <ReferenceLine x={100} stroke="#f59e0b" strokeDasharray="4 4" />
        <Bar dataKey="learning" name="Progress" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={14} />
        <Bar dataKey="time" name="Time elapsed" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} opacity={0.7} />
        <Bar dataKey="expected" name="Expected" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} opacity={0.5} />
      </BarChart>
    </ResponsiveContainer>
  );
}
