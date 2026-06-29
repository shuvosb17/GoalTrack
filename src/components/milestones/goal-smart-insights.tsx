"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, Lightbulb } from "lucide-react";
import type { GoalInsight } from "@/lib/goal-dashboard";
import { cn } from "@/lib/utils";

interface GoalSmartInsightsProps {
  insights: GoalInsight[];
}

export function GoalSmartInsights({ insights }: GoalSmartInsightsProps) {
  const [expanded, setExpanded] = useState(false);

  if (insights.length === 0) return null;

  const visible = expanded ? insights : insights.slice(0, 2);
  const hidden = insights.length - 2;

  return (
    <div
      className="rounded-xl border border-violet-500/15 px-4 py-3.5"
      style={{ backgroundColor: "#111113" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/15">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
        </span>
        <span className="text-sm font-medium text-foreground">Smart Insights</span>
        <span className="rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-300">
          {insights.length}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {visible.map((insight) => (
          <div
            key={insight.id}
            className="flex items-start gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground"
          >
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/80" />
            <span>{insight.text}</span>
          </div>
        ))}
      </div>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          {expanded ? "Show fewer" : `${hidden} more insights`}
        </button>
      )}
    </div>
  );
}
