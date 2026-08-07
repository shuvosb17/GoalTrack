"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BS23_STAGES } from "@/lib/bs23/stages";
import type { Bs23StageCoverageSummary } from "@/lib/bs23/syllabus";

const TOOLTIP = {
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: 8,
  fontSize: 12,
};

export function SyllabusProgressChart({
  syllabusProgress,
}: {
  syllabusProgress: Bs23StageCoverageSummary[];
}) {
  const data = BS23_STAGES.map((stage) => {
    const summary = syllabusProgress.find((s) => s.stageId === stage.id);
    const coverage = summary?.coverage ?? 0;
    const done = coverage;
    const remaining = Math.max(0, 100 - coverage);
    return {
      name: stage.shortName,
      done,
      remaining,
      accent: stage.accent,
      topicsDone: summary?.competencies.reduce((s, c) => s + c.completedTopics, 0) ?? 0,
      topicsTotal: summary?.competencies.reduce((s, c) => s + c.totalTopics, 0) ?? 0,
    };
  });

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#8b8b93", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            unit="%"
          />
          <YAxis
            type="category"
            dataKey="name"
            width={72}
            tick={{ fill: "#8b8b93", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP}
            formatter={(value, name, props) => {
              const payload = props.payload as { topicsDone?: number; topicsTotal?: number };
              if (name === "done") {
                return [
                  `${value}% (${payload.topicsDone}/${payload.topicsTotal} topics)`,
                  "Coverage",
                ];
              }
              return [`${value}%`, "Remaining"];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="done" name="Coverage" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
          <Bar
            dataKey="remaining"
            name="Remaining"
            stackId="a"
            fill="#3f3f46"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Tick topics in the checklist — coverage drives stage readiness. Drills add up to +25% proof bonus.
      </p>
    </div>
  );
}
