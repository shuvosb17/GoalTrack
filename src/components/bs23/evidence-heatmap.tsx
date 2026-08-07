"use client";

import type { Bs23ReadinessReport } from "@/lib/bs23/readiness";
import { cn } from "@/lib/utils";

function heatClass(count: number, max: number): string {
  if (count <= 0) return "bg-zinc-800/80";
  const ratio = count / Math.max(max, 1);
  if (ratio >= 0.75) return "bg-violet-500/90";
  if (ratio >= 0.5) return "bg-violet-500/65";
  if (ratio >= 0.25) return "bg-violet-500/40";
  return "bg-violet-500/25";
}

export function EvidenceHeatmap({ report }: { report: Bs23ReadinessReport }) {
  const max = Math.max(...report.evidenceHeatmap.map((w) => w.count), 1);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {report.evidenceHeatmap.map((w) => (
          <div key={w.week} className="flex flex-col items-center gap-1">
            <div
              className={cn("h-8 w-10 rounded-md border border-white/[0.04]", heatClass(w.count, max))}
              title={`${w.week}: ${w.count} drills`}
            />
            <span className="text-[9px] text-muted-foreground">{w.week}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Each box = topics ticked + drills logged that week.
      </p>
    </div>
  );
}
