"use client";

import type { ReactNode } from "react";
import type { LearningVelocityWithDelta } from "@/lib/analytics";
import type { WeeklyConsistency } from "@/lib/types/metrics";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  IconBulb,
  IconClock,
  IconBook,
  IconStack2,
  IconCalendarCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface LearningVelocityPanelProps {
  velocity: LearningVelocityWithDelta;
  consistency: WeeklyConsistency;
  hoursPerWeekNeeded: number;
  stretchGoalHours: number;
  footnote?: string;
}

function TrendBadge({
  current,
  prior,
  suffix = "",
}: {
  current: number;
  prior: number;
  suffix?: string;
}) {
  const delta = Math.round((current - prior) * 10) / 10;
  if (delta === 0) {
    return (
      <span className="text-[11px] text-muted-foreground">same as prior</span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={cn(
        "text-[11px] font-medium tabular-nums",
        up ? "text-emerald-400" : "text-amber-400"
      )}
    >
      {up ? "↑" : "↓"}
      {Math.abs(delta)}
      {suffix}
    </span>
  );
}

interface VelocityKpiCardProps {
  icon: typeof IconClock;
  label: string;
  value: string;
  sub: ReactNode;
  progress?: number;
  progressColor?: string;
  valueClassName?: string;
}

function VelocityKpiCard({
  icon: Icon,
  label,
  value,
  sub,
  progress,
  progressColor = "#8b5cf6",
  valueClassName,
}: VelocityKpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.04]">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] transition-colors group-hover:bg-white/[0.08]">
          <Icon className="h-4 w-4 text-muted-foreground" stroke={1.5} />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p
        className={cn(
          "metric-value text-2xl tabular-nums tracking-tight sm:text-3xl",
          valueClassName
        )}
      >
        {value}
      </p>
      <div className="mt-1.5">{sub}</div>
      {progress !== undefined && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              background: progressColor,
            }}
          />
        </div>
      )}
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
  const hoursProgress =
    hoursPerWeekNeeded > 0
      ? (velocity.hoursPerWeek / hoursPerWeekNeeded) * 100
      : 0;
  const consistencyProgress = (consistency.daysOnTarget / 7) * 100;

  return (
    <Card className="border-[0.5px] border-white/[0.08]">
      <CardContent className="pt-6">
        <SectionHeading className="mb-5">Learning Velocity</SectionHeading>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <VelocityKpiCard
            icon={IconClock}
            label="Hours / week"
            value={`${velocity.hoursPerWeek}h`}
            sub={
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <TrendBadge
                  current={velocity.hoursPerWeek}
                  prior={velocity.hoursPriorWeek}
                  suffix="h"
                />
                <span className="text-[11px] text-muted-foreground">
                  need {hoursPerWeekNeeded}h for {stretchGoalHours}h goal
                </span>
              </div>
            }
            progress={hoursProgress}
            progressColor="#534AB7"
          />

          <VelocityKpiCard
            icon={IconBook}
            label="Topics / week"
            value={String(velocity.topicsPerWeek)}
            sub={
              <TrendBadge
                current={velocity.topicsPerWeek}
                prior={velocity.topicsPriorWeek}
              />
            }
            progress={
              velocity.topicsPriorWeek > 0
                ? (velocity.topicsPerWeek / Math.max(velocity.topicsPriorWeek, 1)) * 100
                : velocity.topicsPerWeek > 0
                  ? 100
                  : 0
            }
            progressColor="#1D9E75"
          />

          <VelocityKpiCard
            icon={IconStack2}
            label="Modules / month"
            value={String(velocity.modulesPerMonth)}
            sub={
              <TrendBadge
                current={velocity.modulesPerMonth}
                prior={velocity.modulesPriorMonth}
              />
            }
            progress={
              velocity.modulesPriorMonth > 0
                ? (velocity.modulesPerMonth / Math.max(velocity.modulesPriorMonth, 1)) * 100
                : velocity.modulesPerMonth > 0
                  ? 100
                  : 0
            }
            progressColor="#378ADD"
          />

          <VelocityKpiCard
            icon={IconCalendarCheck}
            label="Consistency days"
            value={`${consistency.daysOnTarget}/7`}
            valueClassName="text-orange-400"
            sub={
              <span className="text-[11px] text-orange-400/90">
                target: {consistencyTarget}/7 days on pace
              </span>
            }
            progress={consistencyProgress}
            progressColor="#f97316"
          />
        </div>

        {footnote && (
          <p className="mt-4 flex items-start gap-2 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-muted-foreground">
            <IconBulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400/80" stroke={1.5} />
            {footnote}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
