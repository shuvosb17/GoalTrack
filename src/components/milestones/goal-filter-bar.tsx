"use client";

import { ArrowDownUp } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  GOAL_LIFECYCLE_TABS,
  GOAL_SORT_LABELS,
  type GoalLifecycleTab,
  type GoalSort,
} from "@/lib/goal-dashboard";
import { cn } from "@/lib/utils";

interface GoalFilterBarProps {
  lifecycleTab: GoalLifecycleTab;
  sort: GoalSort;
  counts: Record<GoalLifecycleTab, number>;
  onLifecycleChange: (tab: GoalLifecycleTab) => void;
  onSortChange: (sort: GoalSort) => void;
  shownCount: number;
}

export function GoalFilterBar({
  lifecycleTab,
  sort,
  counts,
  onLifecycleChange,
  onSortChange,
  shownCount,
}: GoalFilterBarProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] px-3.5 py-2.5"
      style={{ backgroundColor: "#111113" }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-white/[0.03] p-1"
          role="tablist"
          aria-label="Goal lifecycle"
        >
          {GOAL_LIFECYCLE_TABS.map((tab) => {
            const active = lifecycleTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onLifecycleChange(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-[#141416] text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={
                  active
                    ? { boxShadow: `inset 0 -2px 0 ${tab.color}` }
                    : undefined
                }
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: tab.color }}
                />
                {tab.label}
                <span
                  className="rounded px-1 py-0.5 font-mono text-[10px] tabular-nums"
                  style={{
                    color: active ? tab.color : undefined,
                    backgroundColor: active ? `${tab.color}18` : "rgba(255,255,255,0.04)",
                  }}
                >
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
        <Select value={sort} onValueChange={(v) => onSortChange(v as GoalSort)}>
          <SelectTrigger className="h-8 w-[140px] border-white/[0.08] bg-[#141416] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(GOAL_SORT_LABELS) as GoalSort[]).map((key) => (
              <SelectItem key={key} value={key}>
                {GOAL_SORT_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">{shownCount} shown</p>
    </div>
  );
}
