"use client";

import type { ReactNode } from "react";
import type { LearningVelocityWithDelta } from "@/lib/analytics";
import type { WeeklyConsistency } from "@/lib/types/metrics";
import { cn } from "@/lib/utils";

interface LearningVelocityPanelProps {
  velocity: LearningVelocityWithDelta;
  consistency: WeeklyConsistency;
  hoursPerWeekNeeded: number;
  stretchGoalHours: number;
  footnote?: string;
}

function TrendLine({
  current,
  prior,
  period,
}: {
  current: number;
  prior: number;
  period: string;
}) {
  const delta = Math.round((current - prior) * 10) / 10;
  if (delta === 0) {
    return <p className="text-xs text-muted-foreground/80">same as {period}</p>;
  }
  const up = delta > 0;
  return (
    <p className="text-xs">
      <span className={up ? "text-emerald-400" : "text-amber-400/90"}>
        {up ? "↑" : "↓"} from {prior}
      </span>
      <span className="text-muted-foreground/70"> {period}</span>
    </p>
  );
}

function VelocityRow({
  value,
  label,
  sub,
  valueClassName,
  isLast,
}: {
  value: ReactNode;
  label: string;
  sub: ReactNode;
  valueClassName?: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-5 text-center",
        !isLast && "border-b border-white/[0.06]"
      )}
    >
      <p className={cn("metric-value text-3xl tabular-nums tracking-tight sm:text-4xl", valueClassName)}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      <div className="mt-1.5">{sub}</div>
    </div>
  );
}

export function LearningVelocityPanel({
  velocity,
  consistency,
  hoursPerWeekNeeded,
  stretchGoalHours,
  footnote,
}: LearningVelocityPanelProps) {
  const consistencyTarget = 5;

  return (
    <div className="relative overflow-hidden rounded-xl border-[0.5px] border-white/[0.08] bg-gradient-to-b from-[#14141c] to-[#0c0c12]">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/[0.07] via-transparent to-blue-600/[0.05] pointer-events-none" />

      <div className="relative border-b border-white/[0.06] px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-violet-300/90">
            Learning Velocity
          </p>
          <span className="rounded-full border-[0.5px] border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300/80">
            live trends
          </span>
        </div>
      </div>

      <div className="relative divide-y divide-white/[0.06]">
        <VelocityRow
          value={velocity.topicsPerWeek}
          label="Topics / week"
          sub={<TrendLine current={velocity.topicsPerWeek} prior={velocity.topicsPriorWeek} period="last week" />}
        />
        <VelocityRow
          value={velocity.modulesPerMonth}
          label="Modules / month"
          sub={<TrendLine current={velocity.modulesPerMonth} prior={velocity.modulesPriorMonth} period="last month" />}
        />
        <VelocityRow
          value={`${velocity.hoursPerWeek}h`}
          label="Hours / week"
          sub={
            <p className="text-xs text-muted-foreground/80">
              need {hoursPerWeekNeeded}h/wk for {stretchGoalHours}h goal
            </p>
          }
        />
        <VelocityRow
          value={`${consistency.daysOnTarget}/7`}
          label="Consistency days"
          valueClassName="text-orange-400"
          sub={
            <p className="text-xs text-orange-400/90">
              target: {consistencyTarget}/7 days
            </p>
          }
          isLast
        />
      </div>

      {footnote && (
        <p className="relative border-t border-white/[0.06] px-4 py-3 text-[11px] italic leading-relaxed text-muted-foreground/70 sm:px-5">
          {footnote}
        </p>
      )}
    </div>
  );
}
