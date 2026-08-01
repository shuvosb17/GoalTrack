"use client";

import { format } from "date-fns";
import { HaEntityTile } from "@/components/shared/ha-entity-tile";
import { HaStatusStrip } from "@/components/shared/ha-status-strip";
import type { GoCoachReport, PaceVerdict } from "@/lib/go-coach";
import type { JobReadinessReport } from "@/lib/job-readiness";
import type { RetentionDebt } from "@/lib/go-coach-advice";
import { parseLocalDate } from "@/lib/utils";

const VERDICT_COLOR: Record<PaceVerdict, string> = {
  ahead: "#22c55e",
  on_track: "#3b82f6",
  behind: "#eab308",
  critical: "#ef4444",
};

const VERDICT_STATE: Record<PaceVerdict, "default" | "active" | "warn" | "critical"> = {
  ahead: "active",
  on_track: "default",
  behind: "warn",
  critical: "critical",
};

interface CoachStatusStripProps {
  report: GoCoachReport;
  readiness: JobReadinessReport;
  retention: RetentionDebt;
  targetDate: string;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return format(parseLocalDate(value), "MMM d, yyyy");
}

export function CoachStatusStrip({
  report,
  readiness,
  retention,
  targetDate,
}: CoachStatusStripProps) {
  const plan = report.targetPlan;
  const verdict = plan?.verdict ?? "on_track";
  const accent = VERDICT_COLOR[verdict];

  const etaLabel =
    report.toApplyReady.hours <= 0
      ? "Ready"
      : report.conservative.date == null
        ? "No pace"
        : formatDate(report.conservative.date);

  return (
    <div className="space-y-3">
      <HaStatusStrip
        items={[
          { id: "target", label: "Target apply", value: format(parseLocalDate(targetDate), "MMM d, yyyy") },
          {
            id: "required",
            label: "Required pace",
            value: plan ? `${plan.requiredHoursPerWeek}h/wk` : "—",
            accent: plan && plan.gapHoursPerWeek > 0 ? "#ef4444" : undefined,
          },
          {
            id: "actual",
            label: "Your pace",
            value: `${Math.round(report.recentVelocity.hoursPerWeek * 10) / 10}h/wk`,
          },
          {
            id: "phase",
            label: "Phase",
            value: `${readiness.currentPhase} · ${readiness.employabilityPercent}%`,
            accent: "#8b5cf6",
          },
          {
            id: "review",
            label: "Review debt",
            value: retention.totalDue + retention.lowConfidenceCount,
            accent: retention.inflatedReadiness ? "#ef4444" : undefined,
          },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <HaEntityTile
          label="Apply-ready ETA"
          value={etaLabel}
          hint={
            report.toApplyReady.hours <= 0
              ? "Checklist cleared"
              : `${report.toApplyReady.hours}h checklist work left`
          }
          accent={accent}
          state={VERDICT_STATE[verdict]}
        />
        <HaEntityTile
          label="Weekly gap"
          value={
            plan
              ? plan.gapHoursPerWeek > 0
                ? `+${plan.gapHoursPerWeek}h`
                : `${Math.abs(plan.gapHoursPerWeek)}h spare`
              : "—"
          }
          hint={plan ? `${plan.requiredSubtopicsPerWeek} subtopics/wk needed` : "Set target date"}
          accent={plan && plan.gapHoursPerWeek > 0 ? "#ef4444" : "#22c55e"}
          state={plan && plan.gapHoursPerWeek > 0 ? "warn" : "default"}
        />
        <HaEntityTile
          label="Checklist work"
          value={`${report.toApplyReady.hours}h`}
          hint={`${report.blockingModules.length} module${report.blockingModules.length === 1 ? "" : "s"} gating apply`}
          accent="#f59e0b"
          progress={{
            value: readiness.employabilityPercent,
            max: 100,
            color: "#f59e0b",
          }}
        />
        <HaEntityTile
          label="Full path left"
          value={`${report.toFullPath.hours}h`}
          hint={`${report.toFullPath.subtopics} subtopics · ${report.hoursPerSubtopic}h avg`}
          accent="#8b5cf6"
        />
      </div>
    </div>
  );
}
