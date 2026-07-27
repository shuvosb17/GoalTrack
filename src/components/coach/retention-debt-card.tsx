"use client";

import Link from "next/link";
import { BrainCircuit, TriangleAlert } from "lucide-react";
import { CoachCard, CoachEmptyLine } from "./coach-card";
import type { RetentionDebt } from "@/lib/go-coach-advice";

export function RetentionDebtCard({ debt }: { debt: RetentionDebt }) {
  const accent = debt.inflatedReadiness ? "#ef4444" : debt.totalDue > 0 ? "#eab308" : "#22c55e";

  return (
    <CoachCard
      title="Review debt & confidence"
      subtitle={debt.message}
      icon={BrainCircuit}
      accent={accent}
      action={
        <Link
          href="/status"
          className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] text-foreground transition-colors hover:bg-white/[0.08]"
        >
          Open status board
        </Link>
      }
    >
      {debt.inflatedReadiness && (
        <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3.5 py-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Your readiness percentage counts these as done, but you rated them shaky or they are
            overdue for review. Clear the debt before you treat the checklist as trustworthy.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Subtopics due" value={debt.subtopicsDue} />
        <Stat label="Topics due" value={debt.topicsDue} />
        <Stat
          label="Low confidence"
          value={debt.lowConfidenceCount}
          hint="rated 1–2, never re-reviewed"
        />
      </div>

      <div className="mt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Shakiest completions
        </p>
        {debt.lowConfidenceItems.length === 0 ? (
          <CoachEmptyLine>
            Nothing rated below 3 confidence. Your completed Go work is holding.
          </CoachEmptyLine>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
            {debt.lowConfidenceItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 border-b border-white/[0.04] px-3.5 py-2.5 last:border-b-0"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-medium tabular-nums"
                  style={{
                    background: item.rating === 1 ? "#ef44441f" : "#eab3081f",
                    color: item.rating === 1 ? "#f87171" : "#facc15",
                  }}
                >
                  {item.rating}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-foreground">{item.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{item.moduleName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CoachCard>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-medium tabular-nums text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
