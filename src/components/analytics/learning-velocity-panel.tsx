"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { LearningVelocityMode, LearningVelocityWithDelta } from "@/lib/analytics";
import { getVelocityInsight, LEARNING_VELOCITY_MODE_KEY } from "@/lib/analytics";
import type { WeeklyConsistency } from "@/lib/types/metrics";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  IconBulb,
  IconClock,
  IconBook,
  IconStack2,
  IconCalendarCheck,
  IconFlame,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface LearningVelocityPanelProps {
  velocity: LearningVelocityWithDelta;
  consistency: WeeklyConsistency;
  hoursPerWeekNeeded: number;
  stretchGoalHours: number;
  streakDays: number;
  last7StudyPattern: boolean[];
  last7PacePattern: boolean[];
}

function loadVelocityMode(): LearningVelocityMode {
  if (typeof window === "undefined") return "daily";
  try {
    const stored = localStorage.getItem(LEARNING_VELOCITY_MODE_KEY);
    return stored === "weekly" ? "weekly" : "daily";
  } catch {
    return "daily";
  }
}

function formatDelta(delta: number, decimals = 0, suffix = ""): string {
  const rounded = decimals > 0 ? Math.round(delta * 10) / 10 : Math.round(delta);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}${suffix}`;
}

function TrendChip({
  current,
  prior,
  suffix = "",
  decimals = 0,
}: {
  current: number;
  prior: number;
  suffix?: string;
  decimals?: number;
}) {
  const delta = decimals > 0 ? Math.round((current - prior) * 10) / 10 : current - prior;
  if (delta === 0) {
    return (
      <span className="inline-flex items-center rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        —
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
        up ? "bg-emerald-500/12 text-emerald-400" : "bg-amber-500/12 text-amber-400"
      )}
    >
      {up ? (
        <IconArrowUpRight className="h-3 w-3" stroke={2} />
      ) : (
        <IconArrowDownRight className="h-3 w-3" stroke={2} />
      )}
      {formatDelta(delta, decimals, suffix)}
    </span>
  );
}

function MiniSparkline({ values, color = "#8b5cf6" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-[22px] items-end gap-[3px]">
      {values.map((v, i) => {
        const h = Math.max(3, Math.round((v / max) * 22));
        const isLast = i === values.length - 1;
        return (
          <div
            key={i}
            className="w-[5px] rounded-[2px] transition-all duration-300"
            style={{
              height: h,
              background: color,
              opacity: isLast ? 1 : 0.45,
            }}
          />
        );
      })}
    </div>
  );
}

function DayDots({ pattern }: { pattern: boolean[] }) {
  return (
    <div className="flex gap-[3px]">
      {pattern.map((on, i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-2 rounded-full border border-white/[0.14]",
            on ? "border-primary bg-primary" : "bg-transparent"
          )}
        />
      ))}
    </div>
  );
}

interface CompactKpiCardProps {
  icon: typeof IconClock;
  label: string;
  value: string;
  footerLeft: ReactNode;
  footerRight: ReactNode;
  valueClassName?: string;
}

function CompactKpiCard({
  icon: Icon,
  label,
  value,
  footerLeft,
  footerRight,
  valueClassName,
}: CompactKpiCardProps) {
  return (
    <div className="group rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.14] hover:bg-white/[0.04]">
      <div className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary/80" stroke={1.5} />
      </div>
      <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "metric-value mt-0.5 text-xl leading-none tabular-nums tracking-tight",
          valueClassName
        )}
      >
        {value}
      </p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0 shrink">{footerLeft}</div>
        <div className="shrink-0">{footerRight}</div>
      </div>
    </div>
  );
}

function VelocityModeToggle({
  mode,
  onChange,
}: {
  mode: LearningVelocityMode;
  onChange: (mode: LearningVelocityMode) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.02] p-0.5">
      {(["daily", "weekly"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
            mode === option
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function LearningVelocityPanel({
  velocity,
  consistency,
  hoursPerWeekNeeded,
  stretchGoalHours,
  streakDays,
  last7StudyPattern,
  last7PacePattern,
}: LearningVelocityPanelProps) {
  const [mode, setMode] = useState<LearningVelocityMode>("daily");

  useEffect(() => {
    setMode(loadVelocityMode());
  }, []);

  const setModeAndPersist = (next: LearningVelocityMode) => {
    setMode(next);
    try {
      localStorage.setItem(LEARNING_VELOCITY_MODE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const consistencyTarget = 6;
  const isDaily = mode === "daily";
  const insight = getVelocityInsight(mode, velocity);
  const sparks = isDaily ? velocity.dailySparks : velocity.weeklySparks;
  const activeDays = last7PacePattern.filter(Boolean).length;

  return (
    <Card className="border-[0.5px] border-white/[0.08]">
      <CardContent className="pt-5 pb-5">
        <div className="mb-3.5 flex flex-wrap items-start justify-between gap-2">
          <div>
            <SectionHeading className="mb-0.5 text-base">Learning Velocity</SectionHeading>
            <p className="text-[11px] text-muted-foreground">
              {isDaily ? "Today vs yesterday" : "This week vs last week"}
            </p>
          </div>
          <VelocityModeToggle mode={mode} onChange={setModeAndPersist} />
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {isDaily ? (
            <>
              <CompactKpiCard
                icon={IconClock}
                label="Hours / day"
                value={`${velocity.hoursPerDay}h`}
                footerLeft={
                  <TrendChip
                    current={velocity.hoursPerDay}
                    prior={velocity.hoursPriorDay}
                    suffix="h"
                    decimals={1}
                  />
                }
                footerRight={<MiniSparkline values={sparks.hours} color="#8b5cf6" />}
              />
              <CompactKpiCard
                icon={IconBook}
                label="Topics / day"
                value={String(velocity.topicsPerDay)}
                footerLeft={
                  <TrendChip
                    current={velocity.topicsPerDay}
                    prior={velocity.topicsPriorDay}
                  />
                }
                footerRight={<MiniSparkline values={sparks.topics} color="#1D9E75" />}
              />
              <CompactKpiCard
                icon={IconStack2}
                label="Modules / day"
                value={String(velocity.modulesPerDay)}
                footerLeft={
                  <TrendChip
                    current={velocity.modulesPerDay}
                    prior={velocity.modulesPriorDay}
                  />
                }
                footerRight={<MiniSparkline values={sparks.modules} color="#378ADD" />}
              />
              <CompactKpiCard
                icon={IconFlame}
                label="Streak"
                value={`${streakDays} days`}
                valueClassName="text-orange-400"
                footerLeft={
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    {streakDays > 0 ? `${streakDays}-day streak` : "Start today"}
                  </span>
                }
                footerRight={<DayDots pattern={last7StudyPattern} />}
              />
            </>
          ) : (
            <>
              <CompactKpiCard
                icon={IconClock}
                label="Hours / week"
                value={`${velocity.hoursPerWeek}h`}
                footerLeft={
                  <TrendChip
                    current={velocity.hoursPerWeek}
                    prior={velocity.hoursPriorWeek}
                    suffix="h"
                    decimals={1}
                  />
                }
                footerRight={<MiniSparkline values={sparks.hours} color="#8b5cf6" />}
              />
              <CompactKpiCard
                icon={IconBook}
                label="Topics / week"
                value={String(velocity.topicsPerWeek)}
                footerLeft={
                  <TrendChip
                    current={velocity.topicsPerWeek}
                    prior={velocity.topicsPriorWeek}
                  />
                }
                footerRight={<MiniSparkline values={sparks.topics} color="#1D9E75" />}
              />
              <CompactKpiCard
                icon={IconStack2}
                label="Modules / month"
                value={String(velocity.modulesPerMonth)}
                footerLeft={
                  <TrendChip
                    current={velocity.modulesPerMonth}
                    prior={velocity.modulesPriorMonth}
                  />
                }
                footerRight={<MiniSparkline values={sparks.modules} color="#378ADD" />}
              />
              <CompactKpiCard
                icon={IconCalendarCheck}
                label="Consistency days"
                value={`${consistency.daysOnTarget} / 7`}
                valueClassName="text-orange-400"
                footerLeft={
                  <span className="text-[10px] leading-tight text-orange-400/90">
                    {activeDays}/7 active · target {consistencyTarget}/7
                  </span>
                }
                footerRight={<DayDots pattern={last7PacePattern} />}
              />
            </>
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border-[0.5px] border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
          <IconBulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400/80" stroke={1.5} />
          <p className="text-[11px] leading-relaxed text-muted-foreground">{insight}</p>
        </div>

        {!isDaily && hoursPerWeekNeeded > 0 && (
          <p className="mt-2 text-[10px] text-muted-foreground/80">
            Need {hoursPerWeekNeeded}h/week for {stretchGoalHours}h stretch goal.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
