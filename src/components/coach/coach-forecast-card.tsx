"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { CalendarClock, Target } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Input } from "@/components/ui/input";
import { CoachCard, CoachStat } from "./coach-card";
import { buildBurndownSeries, type GoCoachReport, type PaceVerdict } from "@/lib/go-coach";
import { parseLocalDate } from "@/lib/utils";

const VERDICT_COLOR: Record<PaceVerdict, string> = {
  ahead: "#22c55e",
  on_track: "#3b82f6",
  behind: "#eab308",
  critical: "#ef4444",
};

const TOOLTIP_STYLE = {
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: 8,
  fontSize: 12,
};

interface CoachForecastCardProps {
  report: GoCoachReport;
  targetDate: string;
  onTargetDateChange: (value: string) => void;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return format(parseLocalDate(value), "MMM d, yyyy");
}

export function CoachForecastCard({
  report,
  targetDate,
  onTargetDateChange,
}: CoachForecastCardProps) {
  const series = useMemo(() => buildBurndownSeries(report), [report]);
  const plan = report.targetPlan;
  const accent = plan ? VERDICT_COLOR[plan.verdict] : "#8b5cf6";

  const etaLabel =
    report.toApplyReady.hours <= 0
      ? "Checklist cleared"
      : report.expected.date === report.conservative.date
        ? formatDate(report.expected.date)
        : report.conservative.date == null
          ? "No pace yet"
          : `${formatDate(report.expected.date)} → ${formatDate(report.conservative.date)}`;

  const etaHint =
    report.toApplyReady.hours <= 0
      ? "Every apply-checklist threshold is met."
      : report.conservative.date == null
        ? "Log Go sessions to generate a forecast."
        : "Expected uses your recent pace; conservative adds a 25% review buffer at your slower pace.";

  return (
    <CoachCard
      title="Time to apply-ready"
      subtitle={`${report.toApplyReady.hours}h of checklist work left across ${report.blockingModules.length} module${report.blockingModules.length === 1 ? "" : "s"} · ${report.toFullPath.hours}h to finish the whole path.`}
      icon={CalendarClock}
      accent={accent}
      action={
        <div className="flex items-end gap-2">
          <div>
            <label
              htmlFor="coach-target-date"
              className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              Target apply date
            </label>
            <Input
              id="coach-target-date"
              type="date"
              value={targetDate}
              onChange={(e) => onTargetDateChange(e.target.value)}
              className="h-9 w-[10.5rem] text-[13px]"
            />
          </div>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CoachStat label="Projected apply-ready" value={etaLabel} hint={etaHint} />
        <CoachStat
          label="Required pace"
          value={plan ? `${plan.requiredHoursPerWeek}h/wk` : "Set a date"}
          hint={
            plan
              ? plan.overdue
                ? "Target date has passed — this is the full remaining load."
                : `${plan.weeksUntilTarget} weeks left · ${plan.requiredSubtopicsPerWeek} subtopics/wk`
              : "Pick a target apply date to get a required pace."
          }
          color={plan ? accent : undefined}
        />
        <CoachStat
          label="Your actual pace"
          value={`${Math.round(report.recentVelocity.hoursPerWeek * 10) / 10}h/wk`}
          hint={`${report.recentVelocity.subtopicsCompleted} subtopics in the last 4 weeks · 12-wk avg ${Math.round(report.baselineVelocity.hoursPerWeek * 10) / 10}h/wk`}
        />
        <CoachStat
          label={plan ? "Weekly gap" : "Cost basis"}
          value={
            plan
              ? plan.gapHoursPerWeek > 0
                ? `+${plan.gapHoursPerWeek}h needed`
                : `${Math.abs(plan.gapHoursPerWeek)}h spare`
              : `${report.hoursPerSubtopic}h / subtopic`
          }
          hint={
            plan
              ? plan.gapHoursPerWeek > 0
                ? `Add ${Math.round((plan.gapHoursPerWeek / 7) * 10) / 10}h/day to close it.`
                : "You're producing more than the target date requires."
              : report.hoursPerSubtopicIsEstimate
                ? "Mostly the beginner baseline — it recalibrates from your own logs as you complete more."
                : `Blend of the ${report.totalGoHoursLogged}h you logged and the beginner baseline, weighted by difficulty.`
          }
          color={plan && plan.gapHoursPerWeek > 0 ? accent : undefined}
        />
      </div>

      {series.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Checklist hours burndown
          </p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="coachBurndown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#8b8b93", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fill: "#8b8b93", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  unit="h"
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "#e4e4e7" }}
                  formatter={(value, name) => [
                    value == null ? "—" : `${value}h left`,
                    String(name),
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "#8b8b93" }} />
                <Area
                  type="monotone"
                  dataKey="projected"
                  name="At your pace"
                  stroke={accent}
                  strokeWidth={2}
                  fill="url(#coachBurndown)"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="required"
                  name="Pace needed for target"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Target className="h-3 w-3" />
            {plan
              ? "Where the dashed line sits below the filled area, you are behind the pace your target date needs."
              : "Set a target apply date to overlay the required pace."}
          </p>
        </div>
      )}
    </CoachCard>
  );
}
