"use client";

import { Activity, AlertTriangle, Target, TrendingUp } from "lucide-react";

interface GoalSummaryStatsProps {
  active: number;
  ahead: number;
  atRisk: number;
  avgProgress: number;
}

const CARDS = [
  {
    key: "active",
    label: "Active Goals",
    sub: "Currently in progress",
    icon: Target,
    color: "#a855f7",
    getValue: (s: GoalSummaryStatsProps) => String(s.active),
  },
  {
    key: "ahead",
    label: "On Track / Ahead",
    sub: "Meeting or exceeding pace",
    icon: TrendingUp,
    color: "#22c55e",
    getValue: (s: GoalSummaryStatsProps) => String(s.ahead),
  },
  {
    key: "risk",
    label: "At Risk",
    sub: "Behind schedule",
    icon: AlertTriangle,
    color: "#eab308",
    getValue: (s: GoalSummaryStatsProps) => String(s.atRisk),
  },
  {
    key: "avg",
    label: "Average Progress",
    sub: "Across all active goals",
    icon: Activity,
    color: "#3b82f6",
    getValue: (s: GoalSummaryStatsProps) => `${s.avgProgress}%`,
  },
] as const;

export function GoalSummaryStats(props: GoalSummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="rounded-xl border border-white/[0.06] px-3.5 py-3"
            style={{ backgroundColor: "#141416" }}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-foreground">
                  {card.getValue(props)}
                </p>
              </div>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06]"
                style={{ backgroundColor: `${card.color}12` }}
              >
                <Icon className="h-4 w-4" style={{ color: card.color }} />
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
