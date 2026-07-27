"use client";

import { Activity, AlertTriangle, ArrowRight } from "lucide-react";
import { CoachCard } from "./coach-card";
import type { PaceDiagnosis } from "@/lib/go-coach-advice";
import type { GoCoachReport } from "@/lib/go-coach";

const TONE_ACCENT: Record<PaceDiagnosis["tone"], string> = {
  positive: "#22c55e",
  neutral: "#3b82f6",
  warning: "#eab308",
  critical: "#ef4444",
};

interface PaceDiagnosisCardProps {
  diagnosis: PaceDiagnosis;
  report: GoCoachReport;
}

export function PaceDiagnosisCard({ diagnosis, report }: PaceDiagnosisCardProps) {
  const accent = TONE_ACCENT[diagnosis.tone];
  const trend =
    report.recentVelocity.hoursPerWeek - report.baselineVelocity.hoursPerWeek;

  return (
    <CoachCard
      title="Pace verdict"
      icon={Activity}
      accent={accent}
      action={
        <div
          className="rounded-lg px-3 py-1.5 text-right"
          style={{
            background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
            border: `0.5px solid ${accent}55`,
          }}
        >
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="text-sm font-medium" style={{ color: accent }}>
            {diagnosis.label}
          </p>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-foreground">{diagnosis.headline}</p>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Biggest drag
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
              {diagnosis.dragCause}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Do this instead
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
              {diagnosis.correction}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniStat label="4-wk hours" value={`${round(report.recentVelocity.hoursPerWeek)}h/wk`} />
        <MiniStat label="12-wk hours" value={`${round(report.baselineVelocity.hoursPerWeek)}h/wk`} />
        <MiniStat
          label="Trend"
          value={`${trend >= 0 ? "+" : ""}${round(trend)}h/wk`}
          color={trend >= 0 ? "#22c55e" : "#eab308"}
        />
        <MiniStat
          label="4-wk subtopics"
          value={`${round(report.recentVelocity.subtopicsPerWeek)}/wk`}
        />
      </div>
    </CoachCard>
  );
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className="mt-0.5 text-sm font-medium tabular-nums text-foreground"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
