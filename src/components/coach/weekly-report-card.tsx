"use client";

import { ClipboardCheck, TrendingDown, TrendingUp } from "lucide-react";
import { CoachCard } from "./coach-card";
import type { WeeklyReport } from "@/lib/go-coach-advice";

const GRADE_COLOR: Record<WeeklyReport["grade"], string> = {
  A: "#22c55e",
  B: "#84cc16",
  C: "#eab308",
  D: "#f97316",
  F: "#ef4444",
};

function DeltaRow({
  label,
  current,
  prior,
  delta,
  unit,
}: {
  label: string;
  current: number;
  prior: number;
  delta: number;
  unit: string;
}) {
  const improved = delta >= 0;
  const Icon = improved ? TrendingUp : TrendingDown;
  const color = improved ? "#22c55e" : "#ef4444";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-lg font-medium tabular-nums text-foreground">
          {current}
          {unit}
        </p>
        <span
          className="flex items-center gap-0.5 text-[11px] tabular-nums"
          style={{ color }}
        >
          <Icon className="h-3 w-3" />
          {improved ? "+" : ""}
          {delta}
          {unit}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
        prior week {prior}
        {unit}
      </p>
    </div>
  );
}

export function WeeklyReportCard({ report }: { report: WeeklyReport }) {
  const accent = GRADE_COLOR[report.grade];

  return (
    <CoachCard
      title="Weekly report card"
      subtitle={report.summary}
      icon={ClipboardCheck}
      accent={accent}
      action={
        <div
          className="flex h-14 w-14 flex-col items-center justify-center rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
            border: `0.5px solid ${accent}55`,
          }}
        >
          <span className="text-2xl font-medium leading-none" style={{ color: accent }}>
            {report.grade}
          </span>
          <span className="mt-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
            {report.targetAttainment == null ? "grade" : `${report.targetAttainment}%`}
          </span>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DeltaRow
          label="Hours logged"
          current={report.hoursThisWeek}
          prior={report.hoursPriorWeek}
          delta={report.hoursDelta}
          unit="h"
        />
        <DeltaRow
          label="Subtopics finished"
          current={report.subtopicsThisWeek}
          prior={report.subtopicsPriorWeek}
          delta={report.subtopicsDelta}
          unit=""
        />
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Active days</p>
          <p className="mt-1 text-lg font-medium tabular-nums text-foreground">
            {report.activeDays}/7
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">days with a Go session</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Modules touched
          </p>
          <p className="mt-1 text-lg font-medium tabular-nums text-foreground">
            {report.modulesTouched}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {report.modulesTouched > 3 ? "attention is split" : "focused"}
          </p>
        </div>
      </div>

      <p
        className="mt-3 rounded-xl px-3.5 py-3 text-[13px] leading-relaxed text-muted-foreground"
        style={{ background: `${accent}0f`, border: `0.5px solid ${accent}33` }}
      >
        <span className="text-foreground">Next week: </span>
        {report.correctiveAction}
      </p>
    </CoachCard>
  );
}
