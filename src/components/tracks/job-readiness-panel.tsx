"use client";

import { useMemo } from "react";
import { Briefcase, Sparkles } from "lucide-react";
import { useAllModules, useAllSubtopics, useAllTopics, useTracks } from "@/hooks/use-data";
import { buildJobReadinessReport } from "@/lib/job-readiness";
import { JobReadinessCharts } from "@/components/tracks/job-readiness-charts";

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
  const accent = report.readyToApply ? "#22c55e" : "#eab308";

  return (
    <section className="glass-card overflow-hidden rounded-xl">
      <div
        className="border-b border-white/[0.06] px-[18px] py-4"
        style={{
          background: `linear-gradient(135deg, ${accent}14 0%, transparent 55%)`,
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
              <Briefcase className="h-4 w-4 text-emerald-400" />
              Job Readiness — Go Backend Path
              <Sparkles className="h-3.5 w-3.5 text-yellow-400/80" />
            </h2>
            <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{report.summary}</p>
          </div>
          <div
            className="rounded-lg px-3 py-2 text-right"
            style={{
              background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
              border: `0.5px solid ${accent}55`,
            }}
          >
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
            <p className="text-sm font-medium" style={{ color: accent }}>
              {report.headline}
            </p>
            <p className="text-[11px] tabular-nums text-muted-foreground">
              Phase {report.currentPhase} · {report.goBackendModuleCount} modules tracked
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-[18px]">
        <JobReadinessCharts report={report} />

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              What to do next
            </h3>
            <ol className="space-y-2.5">
              {report.nextSteps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
                    style={{ background: `${accent}22`, color: accent }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {currentPhase && (
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: `${accent}33`,
                background: `linear-gradient(160deg, ${accent}10, transparent)`,
              }}
            >
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Current phase goal
              </h3>
              <p className="mb-1 text-sm font-medium" style={{ color: accent }}>
                Phase {currentPhase.id}: {currentPhase.name}
              </p>
              <p className="text-[12px] leading-relaxed text-muted-foreground">{currentPhase.goal}</p>
              <p className="mt-3 text-[11px] text-muted-foreground">{currentPhase.timeline}</p>
            </div>
          )}
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Module breakdown ({report.goBackendModuleCount} Go path modules)
          </summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {report.phases.flatMap((phase) =>
              phase.modules.map((mod) => (
                <div
                  key={mod.moduleId}
                  className="rounded-md border border-border/30 px-2.5 py-2 text-[12px]"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-muted-foreground">
                      M{mod.moduleNumber} · {mod.name.replace(/^Module \d+: /, "")}
                    </span>
                    <span className="shrink-0 tabular-nums text-foreground">{mod.percent}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-emerald-500/80 transition-all duration-700"
                      style={{ width: `${mod.percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">
                    {mod.doneCount}/{mod.totalCount} subtopics
                  </p>
                </div>
              ))
            )}
          </div>
        </details>
      </div>
    </section>
  );
}
