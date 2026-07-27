"use client";

import { useState } from "react";
import { Coins, Zap } from "lucide-react";
import { CoachCard, CoachEmptyLine } from "./coach-card";
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

function BudgetRow({ mod, showThreshold }: { mod: ModuleBudget; showThreshold: boolean }) {
  const phaseColor = PHASE_COLORS[mod.phaseId];
  const hours = showThreshold ? mod.hoursToThreshold : mod.hoursRemaining;
  const subtopics = showThreshold ? mod.subtopicsToThreshold : mod.subtopicsRemaining;

  return (
    <div className="flex items-center gap-3 border-b border-white/[0.04] px-3 py-2.5 last:border-b-0">
      <span
        className="flex h-6 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-medium tabular-nums"
        style={{ background: `${phaseColor}1f`, color: phaseColor }}
        title={`Phase ${mod.phaseId}`}
      >
        M{mod.moduleNumber}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-foreground">{moduleLabel(mod.name)}</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1 w-20 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full"
              style={{ width: `${mod.percent}%`, background: phaseColor }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {mod.doneCount}/{mod.totalCount}
            {showThreshold && mod.thresholdPercent != null && (
              <> · needs {mod.thresholdPercent}%</>
            )}
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[13px] font-medium tabular-nums text-foreground">{hours}h</p>
        <p className="text-[11px] tabular-nums text-muted-foreground">
          {subtopics} left · {mod.hoursPerSubtopic}h ea
        </p>
      </div>
    </div>
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
          ? `Estimated at ${report.hoursPerSubtopic}h per subtopic until you have more completion history.`
          : `Costed from the ${report.totalGoHoursLogged}h you've actually logged — about ${report.hoursPerSubtopic}h per subtopic.`
      }
      icon={Coins}
      accent="#f59e0b"
      action={
        <div className="flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5 text-[11px]">
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
                "rounded-md px-2.5 py-1 transition-colors",
                view === tab.id
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
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
            win — {quickest.hoursToThreshold}h clears its {quickest.thresholdPercent}% threshold and
            unblocks {quickest.blockingChecklistIds.length} checklist item
            {quickest.blockingChecklistIds.length === 1 ? "" : "s"}.
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
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
          {rows.map((mod) => (
            <BudgetRow key={mod.moduleId} mod={mod} showThreshold={view === "wins"} />
          ))}
        </div>
      )}

      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        {report.byPhase.map((phase) => (
          <div
            key={phase.id}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
          >
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Phase {phase.id} · {phase.percent}%
            </p>
            <p
              className="mt-0.5 text-sm font-medium tabular-nums"
              style={{ color: PHASE_COLORS[phase.id] }}
            >
              {phase.remaining.hours}h left
            </p>
            <p className="text-[11px] text-muted-foreground">
              {phase.remaining.subtopics} subtopics
            </p>
          </div>
        ))}
      </div>
    </CoachCard>
  );
}
