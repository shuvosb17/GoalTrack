"use client";

import { useCallback, useMemo } from "react";
import { addDays, format } from "date-fns";
import { Compass } from "lucide-react";
import {
  useAllModules,
  useAllSubtopics,
  useAllTopics,
  useSessions,
  useSettings,
  useTracks,
} from "@/hooks/use-data";
import { db } from "@/lib/db";
import { buildJobReadinessReport } from "@/lib/job-readiness";
import { buildGoCoachReport } from "@/lib/go-coach";
import {
  buildNextSevenDays,
  buildRetentionDebt,
  buildWeeklyReport,
  detectBottlenecks,
  diagnosePace,
  daysUntil,
} from "@/lib/go-coach-advice";
import { getMomentumBreakdown } from "@/lib/metrics";
import { DEFAULT_YEAR_END, DEFAULT_YEAR_START } from "@/lib/analytics";
import { parseLocalDate } from "@/lib/utils";
import { CoachForecastCard } from "@/components/coach/coach-forecast-card";
import { CoachStatusStrip } from "@/components/coach/coach-status-strip";
import { ModuleBudgetTable } from "@/components/coach/module-budget-table";
import { PaceDiagnosisCard } from "@/components/coach/pace-diagnosis-card";
import { BottleneckList } from "@/components/coach/bottleneck-list";
import { NextSevenDaysCard } from "@/components/coach/next-seven-days-card";
import { ScenarioSimulator } from "@/components/coach/scenario-simulator";
import { WeeklyReportCard } from "@/components/coach/weekly-report-card";
import { RetentionDebtCard } from "@/components/coach/retention-debt-card";

/** Used when the user has not picked a target apply date yet. */
const DEFAULT_TARGET_OFFSET_DAYS = 180;

export default function CoachPage() {
  const tracks = useTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const subtopics = useAllSubtopics();
  const sessions = useSessions();
  const settings = useSettings();

  const devTrack = useMemo(() => tracks.find((t) => t.name === "Development"), [tracks]);

  const scoped = useMemo(() => {
    if (!devTrack) return null;
    return {
      modules: modules.filter((m) => m.trackId === devTrack.id),
      topics: topics.filter((t) => t.trackId === devTrack.id),
      subtopics: subtopics.filter((s) => s.trackId === devTrack.id),
      sessions: sessions.filter((s) => s.trackId === devTrack.id),
    };
  }, [devTrack, modules, topics, subtopics, sessions]);

  const readiness = useMemo(() => {
    if (!scoped) return null;
    return buildJobReadinessReport(scoped.modules, scoped.topics, scoped.subtopics);
  }, [scoped]);

  const targetDate =
    settings?.goCoachTargetDate ??
    format(addDays(new Date(), DEFAULT_TARGET_OFFSET_DAYS), "yyyy-MM-dd");

  const report = useMemo(() => {
    if (!scoped || !readiness) return null;
    return buildGoCoachReport({
      modules: scoped.modules,
      topics: scoped.topics,
      subtopics: scoped.subtopics,
      sessions: scoped.sessions,
      readiness,
      targetDate,
    });
  }, [scoped, readiness, targetDate]);

  const momentum = useMemo(
    () =>
      getMomentumBreakdown(
        sessions,
        topics,
        subtopics,
        tracks,
        settings,
        settings?.yearStart ?? DEFAULT_YEAR_START,
        settings?.yearEnd ?? DEFAULT_YEAR_END
      ),
    [sessions, topics, subtopics, tracks, settings]
  );

  const bottlenecks = useMemo(() => (report ? detectBottlenecks(report) : []), [report]);

  const diagnosis = useMemo(
    () => (report ? diagnosePace(report, momentum, bottlenecks) : null),
    [report, momentum, bottlenecks]
  );

  // The simulator's committed value wins; otherwise plan against the required
  // pace, falling back to what you're actually managing today.
  const plannedHoursPerWeek =
    settings?.goCoachPlannedHoursPerWeek ??
    (report?.targetPlan?.requiredHoursPerWeek ||
      Math.max(report?.recentVelocity.hoursPerWeek ?? 0, 5));

  const capacitySource = settings?.goCoachPlannedHoursPerWeek
    ? "your saved weekly plan"
    : report?.targetPlan
      ? "the pace your target date requires"
      : "your recent average";

  const weeklyPlan = useMemo(() => {
    if (!report || !readiness || !scoped) return null;
    return buildNextSevenDays(
      report,
      readiness,
      scoped.topics,
      scoped.subtopics,
      plannedHoursPerWeek
    );
  }, [report, readiness, scoped, plannedHoursPerWeek]);

  const weeklyReport = useMemo(() => {
    if (!report || !scoped) return null;
    return buildWeeklyReport(
      scoped.modules,
      scoped.topics,
      scoped.subtopics,
      scoped.sessions,
      report
    );
  }, [report, scoped]);

  const retention = useMemo(() => {
    if (!scoped || !readiness) return null;
    return buildRetentionDebt(
      scoped.modules,
      scoped.topics,
      scoped.subtopics,
      readiness.employabilityPercent
    );
  }, [scoped, readiness]);

  const saveTargetDate = useCallback(
    async (value: string) => {
      if (!settings || !value) return;
      await db.settings.put({ ...settings, goCoachTargetDate: value });
    },
    [settings]
  );

  const savePlannedHours = useCallback(
    async (hoursPerWeek: number) => {
      if (!settings) return;
      await db.settings.put({ ...settings, goCoachPlannedHoursPerWeek: hoursPerWeek });
    },
    [settings]
  );

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          Development · Go Backend
        </div>
        <h1 className="flex items-center gap-2 text-2xl font-medium tracking-tight text-foreground sm:text-[28px]">
          <Compass className="h-6 w-6 text-violet-400" strokeWidth={1.5} />
          Coach
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">
          Job Readiness tells you where you are. Coach tells you when you&apos;ll get there, what
          it costs in hours, and what to change this week.
        </p>
      </div>
      {report && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-right">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Target apply date
          </p>
          <p className="text-sm font-medium text-foreground">
            {format(parseLocalDate(targetDate), "MMM d, yyyy")}
          </p>
          <p className="text-[11px] tabular-nums text-muted-foreground">
            {(() => {
              const days = daysUntil(targetDate);
              if (days > 0) return `${days} days away`;
              if (days === 0) return "Today";
              return `${Math.abs(days)} days overdue`;
            })()}
          </p>
        </div>
      )}
    </div>
  );

  if (!devTrack || !readiness || !report || !diagnosis || !weeklyPlan || !weeklyReport || !retention) {
    return (
      <div className="space-y-6">
        {header}
        <div className="glass-card rounded-xl px-6 py-16 text-center">
          <Compass className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-foreground">No Go Backend path found</p>
          <p className="mx-auto mt-1.5 max-w-md text-[13px] text-muted-foreground">
            Coach reads the <span className="text-foreground">Development</span> track&apos;s{" "}
            <span className="text-foreground">Module N:</span> curriculum. Once those modules exist
            and you have logged a few sessions, forecasts appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}

      <CoachStatusStrip
        report={report}
        readiness={readiness}
        retention={retention}
        targetDate={targetDate}
      />

      <CoachForecastCard
        report={report}
        targetDate={targetDate}
        onTargetDateChange={saveTargetDate}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <PaceDiagnosisCard diagnosis={diagnosis} report={report} />
        <BottleneckList bottlenecks={bottlenecks} />
      </div>

      <NextSevenDaysCard plan={weeklyPlan} capacitySource={capacitySource} />

      <ModuleBudgetTable report={report} />

      <ScenarioSimulator
        report={report}
        initialHoursPerDay={Math.max(0.5, Math.round((plannedHoursPerWeek / 5) * 2) / 2)}
        initialDaysPerWeek={5}
        onCommit={savePlannedHours}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WeeklyReportCard report={weeklyReport} />
        <RetentionDebtCard debt={retention} />
      </div>
    </div>
  );
}
