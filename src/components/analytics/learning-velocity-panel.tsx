"use client";

import type { ReactNode } from "react";
import type { LearningVelocityWithDelta } from "@/lib/analytics";
import type { WeeklyConsistency } from "@/lib/types/metrics";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { IconBulb } from "@tabler/icons-react";
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
    <Card className="border-[0.5px] border-white/[0.08]">
      <CardContent className="pt-6">
        <SectionHeading>Learning Velocity</SectionHeading>
        <div className="divide-y divide-white/[0.06]">
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
          <p className="mt-3 flex items-start gap-2 border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-muted-foreground">
            <IconBulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400/80" stroke={1.5} />
            {footnote}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
