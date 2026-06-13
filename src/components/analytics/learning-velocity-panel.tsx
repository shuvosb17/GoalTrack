"use client";

import type { LearningVelocityWithDelta } from "@/lib/analytics";
import type { WeeklyConsistency } from "@/lib/types/metrics";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { IconBulb } from "@tabler/icons-react";

interface LearningVelocityPanelProps {
  velocity: LearningVelocityWithDelta;
  consistency: WeeklyConsistency;
  hoursPerWeekNeeded: number;
  stretchGoalHours: number;
  footnote?: string;
}

const ROW_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

function TrendSub({ current, prior, period }: { current: number; prior: number; period: string }) {
  const delta = Math.round((current - prior) * 10) / 10;
  if (delta === 0) return <span className="text-[10px] text-muted-foreground">same as {period}</span>;
  const up = delta > 0;
  return (
    <span className={`text-[10px] ${up ? "text-emerald-400" : "text-amber-400/90"}`}>
      {up ? "↑" : "↓"} from {prior} {period}
    </span>
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

  const rows = [
    {
      label: "Topics / week",
      value: `${velocity.topicsPerWeek}`,
      sub: <TrendSub current={velocity.topicsPerWeek} prior={velocity.topicsPriorWeek} period="last week" />,
      barPct: Math.min(100, (velocity.topicsPerWeek / Math.max(velocity.topicsPerWeek, velocity.topicsPriorWeek, 1)) * 100),
      color: ROW_COLORS[0],
    },
    {
      label: "Modules / month",
      value: `${velocity.modulesPerMonth}`,
      sub: <TrendSub current={velocity.modulesPerMonth} prior={velocity.modulesPriorMonth} period="last month" />,
      barPct: Math.min(100, (velocity.modulesPerMonth / Math.max(velocity.modulesPerMonth, velocity.modulesPriorMonth, 1)) * 100),
      color: ROW_COLORS[1],
    },
    {
      label: "Hours / week",
      value: `${velocity.hoursPerWeek}h`,
      sub: (
        <span className="text-[10px] text-muted-foreground">
          need {hoursPerWeekNeeded}h/wk for {stretchGoalHours}h goal
        </span>
      ),
      barPct: Math.min(100, (velocity.hoursPerWeek / Math.max(hoursPerWeekNeeded, velocity.hoursPerWeek, 1)) * 100),
      color: ROW_COLORS[2],
    },
    {
      label: "Consistency days",
      value: `${consistency.daysOnTarget}/7`,
      sub: <span className="text-[10px] text-orange-400/90">target: {consistencyTarget}/7 days</span>,
      barPct: Math.min(100, (consistency.daysOnTarget / 7) * 100),
      color: ROW_COLORS[3],
    },
  ];

  return (
    <Card className="border-[0.5px] border-white/[0.08]">
      <CardContent className="pt-6">
        <SectionHeading>Learning Velocity</SectionHeading>
        <div className="space-y-2.5">
          {rows.map((row, i) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="w-4 text-[10px] text-muted-foreground">{i + 1}</span>
              <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: row.color }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{row.label}</p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${row.barPct}%`, background: row.color }}
                  />
                </div>
                <div className="mt-0.5">{row.sub}</div>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">{row.value}</span>
            </div>
          ))}
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
