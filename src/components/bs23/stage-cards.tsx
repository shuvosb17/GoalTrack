"use client";

import { Lock, Unlock } from "lucide-react";
import type { Bs23StageScore } from "@/lib/bs23/readiness";
import { cn } from "@/lib/utils";

export function StageCards({ stages }: { stages: Bs23StageScore[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {stages.map((stage) => (
        <div
          key={stage.id}
          className={cn(
            "glass-card overflow-hidden rounded-xl p-4",
            stage.locked && "opacity-60"
          )}
          style={
            stage.met
              ? { borderColor: `${stage.accent}55`, boxShadow: `0 0 16px ${stage.accent}15` }
              : undefined
          }
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Stage {stage.order}
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{stage.shortName}</p>
            </div>
            {stage.locked ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Unlock className="h-4 w-4" style={{ color: stage.accent }} />
            )}
          </div>
          <p className="metric-value mt-3 text-3xl tabular-nums" style={{ color: stage.accent }}>
            {stage.readiness}%
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${stage.readiness}%`, background: stage.accent }}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Coverage {stage.coverage}% · Need {stage.threshold}% · Pass ~{stage.passProbability}%
          </p>
          <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
            Cumulative {stage.cumulativeProbability.toFixed(2)}%
          </p>
        </div>
      ))}
    </div>
  );
}
