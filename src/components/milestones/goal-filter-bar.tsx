"use client";

import { ArrowDownUp, SlidersHorizontal } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  GOAL_FILTER_LABELS,
  GOAL_SORT_LABELS,
  type GoalFilter,
  type GoalSort,
} from "@/lib/goal-dashboard";

interface GoalFilterBarProps {
  filter: GoalFilter;
  sort: GoalSort;
  onFilterChange: (filter: GoalFilter) => void;
  onSortChange: (sort: GoalSort) => void;
  shownCount: number;
}

export function GoalFilterBar({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  shownCount,
}: GoalFilterBarProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] px-3.5 py-2.5"
      style={{ backgroundColor: "#111113" }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={(v) => onFilterChange(v as GoalFilter)}>
          <SelectTrigger className="h-8 w-[140px] border-white/[0.08] bg-[#141416] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(GOAL_FILTER_LABELS) as GoalFilter[]).map((key) => (
              <SelectItem key={key} value={key}>
                {GOAL_FILTER_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
