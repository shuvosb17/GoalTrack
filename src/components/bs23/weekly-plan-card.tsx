"use client";

import { CalendarDays } from "lucide-react";
import { Bs23Card } from "./bs23-card";
import type { Bs23WeeklyPlan } from "@/lib/bs23/plan";

export function WeeklyPlanCard({
  plan,
  capacitySource,
}: {
  plan: Bs23WeeklyPlan;
  capacitySource: string;
}) {
  return (
    <Bs23Card
      title="Next 7 days"
      subtitle={`${plan.plannedHours}h planned of ${plan.capacityHours}h capacity · from ${capacitySource}`}
      icon={CalendarDays}
      accent="#22c55e"
    >
      {plan.items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Log drills to generate a prioritized week.</p>
      ) : (
        <div className="space-y-2">
          {plan.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground">
                  {item.title}
                  <span className="ml-2 text-[10px] text-muted-foreground">Stage {item.stageId}</span>
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{item.action}</p>
              </div>
              <span className="shrink-0 text-sm tabular-nums text-foreground">{item.hours}h</span>
            </div>
          ))}
        </div>
      )}

      {plan.cutList.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-amber-300/80">What to cut</p>
          <ul className="mt-1.5 space-y-1">
            {plan.cutList.map((line) => (
              <li key={line} className="text-[12px] text-muted-foreground">
                · {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Bs23Card>
  );
}
