"use client";

import { useMemo } from "react";
import { Briefcase, CheckCircle2, Circle, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAllModules, useAllSubtopics, useAllTopics, useTracks } from "@/hooks/use-data";
import { buildJobReadinessReport, type JobPhaseId } from "@/lib/job-readiness";
import { cn } from "@/lib/utils";

const PHASE_COLORS: Record<JobPhaseId, string> = {
  A: "#22c55e",
  B: "#eab308",
  C: "#3b82f6",
  D: "#94a3b8",
};

interface JobReadinessPanelProps {
  trackId?: string;
}

export function JobReadinessPanel({ trackId }: JobReadinessPanelProps) {
  const tracks = useTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const subtopics = useAllSubtopics();

  const devTrack = useMemo(
    () => tracks.find((t) => (trackId ? t.id === trackId : t.name === "Development")),
    [tracks, trackId]
  );

  const report = useMemo(() => {
    if (!devTrack) return null;
    const trackModules = modules.filter((m) => m.trackId === devTrack.id);
    const trackTopics = topics.filter((t) => t.trackId === devTrack.id);
    const trackSubtopics = subtopics.filter((s) => s.trackId === devTrack.id);
    return buildJobReadinessReport(trackModules, trackTopics, trackSubtopics);
  }, [devTrack, modules, topics, subtopics]);

  if (!report) return null;

  const currentPhase = report.phases.find((p) => p.id === report.currentPhase);

  return (
    <section className="glass-card space-y-5 rounded-xl p-[18px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
            <Briefcase className="h-4 w-4 text-emerald-400" />
            Job Readiness — Go Backend Path
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{report.summary}</p>
        </div>
        <div
          className="rounded-lg px-3 py-2 text-right"
          style={{
            background: report.readyToApply
              ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))"
              : "linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.04))",
            border: `0.5px solid ${report.readyToApply ? "rgba(34,197,94,0.35)" : "rgba(234,179,8,0.3)"}`,
          }}
        >
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="text-sm font-medium" style={{ color: report.readyToApply ? "#86efac" : "#fde047" }}>
            {report.headline}
          </p>
          <p className="text-[11px] tabular-nums text-muted-foreground">
            Apply checklist {report.employabilityPercent}%
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {report.phases.map((phase) => (
          <div
            key={phase.id}
            className={cn(
              "rounded-lg border p-3",
              phase.id === report.currentPhase
                ? "border-white/15 bg-white/[0.04]"
                : "border-border/40 bg-secondary/10"
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-medium">
                Phase {phase.id}: {phase.name}
              </p>
              {phase.id === report.currentPhase && (
                <span className="text-[10px] text-muted-foreground">current</span>
              )}
            </div>
            <p className="mb-2 text-[10px] text-muted-foreground">{phase.timeline}</p>
            <div className="mb-1 flex items-center justify-between text-[11px] tabular-nums">
              <span style={{ color: PHASE_COLORS[phase.id] }}>{phase.percent}%</span>
              <span className="text-muted-foreground">{phase.modules.length} modules</span>
            </div>
            <Progress value={phase.percent} className="h-1.5" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            Minimum employable checklist
          </h3>
          <ul className="space-y-2">
            {report.checklist.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm">
                {item.met ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className={cn(item.met ? "text-foreground" : "text-muted-foreground")}>{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.progressLabel}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            What to do next
          </h3>
          <ol className="space-y-2">
            {report.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="shrink-0 font-medium text-foreground">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {currentPhase && (
            <p className="mt-4 rounded-md border border-border/40 bg-secondary/10 p-3 text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground">Phase {currentPhase.id} goal: </span>
              {currentPhase.goal}
            </p>
          )}
        </div>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
          Module breakdown ({report.goBackendModuleCount} Go path modules)
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {report.phases.flatMap((phase) =>
            phase.modules.map((mod) => (
              <div
                key={mod.moduleId}
                className="flex items-center justify-between gap-2 rounded-md border border-border/30 px-2.5 py-1.5 text-[12px]"
              >
                <span className="min-w-0 truncate text-muted-foreground">
                  M{mod.moduleNumber} · {mod.name.replace(/^Module \d+: /, "")}
                </span>
                <span className="shrink-0 tabular-nums text-foreground">
                  {mod.doneCount}/{mod.totalCount} ({mod.percent}%)
                </span>
              </div>
            ))
          )}
        </div>
      </details>
    </section>
  );
}
