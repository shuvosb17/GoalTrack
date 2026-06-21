"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { TierReadinessPoint, CumulativeSolvedPoint } from "@/lib/leetcode-readiness";

const ACCENT = "#534AB7";

interface LeetcodeReadinessChartsProps {
  tierData: TierReadinessPoint[];
  cumulativeData: CumulativeSolvedPoint[];
}

export function LeetcodeReadinessCharts({ tierData, cumulativeData }: LeetcodeReadinessChartsProps) {
  const hasTierData = tierData.some((d) => d.value > 0);
  const hasCumulative = cumulativeData.length > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.02] p-3">
        <h4 className="mb-2 text-xs font-medium text-muted-foreground">Readiness by tier</h4>
        {!hasTierData ? (
          <div className="flex h-[220px] flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm text-muted-foreground">No problems solved yet</p>
            <p className="text-xs text-muted-foreground">Check off problems to see your tier balance</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={tierData}>
              <PolarGrid stroke="#3f3f46" />
              <PolarAngleAxis dataKey="tier" tick={{ fill: "#a1a1aa", fontSize: 9 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "#71717a", fontSize: 9 }}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
                labelStyle={{ color: "#fafafa" }}
                formatter={(value) => [`${value ?? 0}%`, "Readiness"]}
              />
              <Radar
                name="Readiness"
                dataKey="value"
                stroke={ACCENT}
                fill={ACCENT}
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.02] p-3">
        <h4 className="mb-2 text-xs font-medium text-muted-foreground">Cumulative solved</h4>
        {!hasCumulative ? (
          <div className="flex h-[220px] flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm text-muted-foreground">No solve history yet</p>
            <p className="text-xs text-muted-foreground">Your momentum chart appears after the first check-off</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={cumulativeData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#71717a", fontSize: 9 }}
                tickFormatter={(v) => String(v).slice(5)}
              />
              <YAxis tick={{ fill: "#71717a", fontSize: 9 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
                labelStyle={{ color: "#fafafa" }}
                formatter={(value) => [value ?? 0, "Solved"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={ACCENT}
                strokeWidth={2}
                dot={{ fill: ACCENT, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
