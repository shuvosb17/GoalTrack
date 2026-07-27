"use client";

import { CalendarDays, Lock } from "lucide-react";
import { CoachCard, CoachEmptyLine } from "./coach-card";
import type { WeeklyPlan } from "@/lib/go-coach-advice";

interface NextSevenDaysCardProps {
  plan: WeeklyPlan;
  /** Where the weekly capacity number came from, shown so the plan is auditable. */
  capacitySource: string;
}

export function NextSevenDaysCard({ plan, capacitySource }: NextSevenDaysCardProps) {
  const fillPercent =
    plan.capacityHours > 0
      ? Math.min(100, Math.round((plan.plannedHours / plan.capacityHours) * 100))
      : 0;

  return (
    <CoachCard
      title="Next 7 days"
      subtitle={`${plan.plannedHours}h planned against ${plan.capacityHours}h of capacity — ${capacitySource}.`}
      icon={CalendarDays}
      accent="#8b5cf6"
      action={
        <div className="w-36">
          <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
            <span>Week filled</span>
            <span className="tabular-nums">{fillPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>
      }
    >
      {plan.items.length === 0 ? (
        <CoachEmptyLine>
          Nothing left to schedule — every remaining topic is already complete.
        </CoachEmptyLine>
      ) : (
        <ol className="space-y-2">
          {plan.items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-[11px] font-medium text-violet-300">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-medium text-foreground">{item.topicName}</p>
                  {item.blocksChecklist && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-300">
                      <Lock className="h-2.5 w-2.5" />
                      Unblocks checklist
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {item.moduleName}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {item.reason}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[13px] font-medium tabular-nums text-foreground">
                  {item.estimatedHours}h
                </p>
                <p className="text-[11px] tabular-nums text-muted-foreground">
                  {item.subtopicsRemaining} subtopic{item.subtopicsRemaining === 1 ? "" : "s"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {plan.capacitySpare && plan.items.length > 0 && (
        <p className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3.5 py-2.5 text-[13px] text-muted-foreground">
          You have {Math.round((plan.capacityHours - plan.plannedHours) * 10) / 10}h spare this
          week. Spend it on review debt or a flagship project rather than opening a new module.
        </p>
      )}
    </CoachCard>
  );
}
