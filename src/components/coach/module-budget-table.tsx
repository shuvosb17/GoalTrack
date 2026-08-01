"use client";

import { useState } from "react";
import { Coins, Zap } from "lucide-react";
import { CoachCard, CoachEmptyLine } from "./coach-card";
import { HaEntityTile } from "@/components/shared/ha-entity-tile";
import { HaProgressBar } from "@/components/shared/ha-progress-bar";
import type { GoCoachReport, ModuleBudget } from "@/lib/go-coach";
import type { JobPhaseId } from "@/lib/job-readiness";
import { cn } from "@/lib/utils";

const PHASE_COLORS: Record<JobPhaseId, string> = {
  A: "#22c55e",
  B: "#eab308",
  C: "#3b82f6",
  D: "#94a3b8",
};

type BudgetView = "wins" | "all";

function moduleLabel(name: string): string {
  return name.replace(/^Module \d+:\s*/, "");
}

function moduleTileState(mod: ModuleBudget, showThreshold: boolean): "default" | "warn" | "critical" {
  if (mod.daysSinceLastSession != null && mod.daysSinceLastSession >= 14 && mod.inProgress) {
    return "critical";
  }
  if (showThreshold && mod.subtopicsToThreshold > 0 && mod.subtopicsToThreshold <= 2) {
    return "warn";
  }
  return "default";
}

function ModuleBudgetTile({
  mod,
  showThreshold,
}: {
  mod: ModuleBudget;
  showThreshold: boolean;
}) {
  const phaseColor = PHASE_COLORS[mod.phaseId];
  const hours = showThreshold ? mod.hoursToThreshold : mod.hoursRemaining;
  const subtopics = showThreshold ? mod.subtopicsToThreshold : mod.subtopicsRemaining;
  const state = moduleTileState(mod, showThreshold);

  return (
    <HaEntityTile
      label={`M${mod.moduleNumber} · Phase ${mod.phaseId}`}
      value={`${hours}h`}
      hint={`${moduleLabel(mod.name)} · ${subtopics} subtopic${subtopics === 1 ? "" : "s"} left`}
      accent={phaseColor}
      state={state}
      progress={{ value: mod.percent, max: 100, color: phaseColor }}
      footer={
        showThreshold && mod.thresholdPercent != null ? (
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Checklist needs {mod.thresholdPercent}% · now {mod.percent}%
          </p>
        ) : undefined
      }
    />
  );
}

export function ModuleBudgetTable({ report }: { report: GoCoachReport }) {
  const [view, setView] = useState<BudgetView>("wins");

  const rows =
    view === "wins"
      ? report.cheapestWins
      : report.moduleBudgets
          .filter((m) => m.subtopicsRemaining > 0)
          .sort((a, b) => a.hoursRemaining - b.hoursRemaining);

  const quickest = report.cheapestWins[0];

  return (
    <CoachCard
      title="Module effort budget"
      subtitle={
        report.hoursPerSubtopicIsEstimate
          ? `About ${report.hoursPerSubtopic}h per remaining subtopic (difficulty-weighted baseline).`
          : `About ${report.hoursPerSubtopic}h per remaining subtopic from your logged pace.`
      }
      icon={Coins}
      accent="#f59e0b"
      action={
        <div className="ha-segmented text-[11px]">
          {(
            [
              { id: "wins" as const, label: "Cheapest wins" },
              { id: "all" as const, label: "All remaining" },
            ]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={cn(
                "ha-segmented-btn",
                view === tab.id && "ha-segmented-btn-active text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      }
    >
      {view === "wins" && quickest && (
        <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-3.5 py-2.5">
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-[13px] text-muted-foreground">
            <span className="text-foreground">{quickest.name}</span> is your cheapest checklist
            win — {quickest.hoursToThreshold}h clears its {quickest.thresholdPercent}% threshold.
          </p>
        </div>
      )}

      {rows.length === 0 ? (
        <CoachEmptyLine>
          {view === "wins"
            ? "No modules are gating the apply checklist — every threshold is met."
            : "Nothing left to do on the Go path."}
        </CoachEmptyLine>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((mod) => (
            <ModuleBudgetTile key={mod.moduleId} mod={mod} showThreshold={view === "wins"} />
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {report.byPhase.map((phase) => (
          <div key={phase.id} className="ha-entity-tile p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Phase {phase.id} · {phase.percent}% done
            </p>
            <p
              className="mt-1 text-lg font-medium tabular-nums"
              style={{ color: PHASE_COLORS[phase.id] }}
            >
              {phase.remaining.hours}h left
            </p>
            <HaProgressBar
              value={phase.percent}
              color={PHASE_COLORS[phase.id]}
              className="mt-2"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {phase.remaining.subtopics} subtopics remaining
            </p>
          </div>
        ))}
      </div>
    </CoachCard>
  );
}
