"use client";

import { useCallback, useMemo } from "react";
import { format } from "date-fns";
import { BookOpen, Target } from "lucide-react";
import {
  useBs23Drills,
  useBs23TopicProgress,
  useCsReviewItems,
  useLeetcodeProblems,
  useMockRoundSessions,
  usePrepQuizAttempts,
  useSessions,
  useSettings,
  useTracks,
} from "@/hooks/use-data";
import { db } from "@/lib/db";
import { buildBs23ReadinessReport } from "@/lib/bs23/readiness";
import { buildBs23Verdict } from "@/lib/bs23/verdict";
import { buildBs23WeeklyPlan } from "@/lib/bs23/plan";
import { parseLocalDate } from "@/lib/utils";
import type { Bs23DeclaredStack } from "@/lib/types";
import { VerdictBanner } from "@/components/bs23/verdict-banner";
import { StageCards } from "@/components/bs23/stage-cards";
import { SettingsStrip, defaultBs23Settings } from "@/components/bs23/settings-strip";
import { DrillLoggerDialog } from "@/components/bs23/drill-logger-dialog";
import { WeeklyPlanCard } from "@/components/bs23/weekly-plan-card";
import { TopicChecklist } from "@/components/bs23/topic-checklist";
import { Bs23Card, Bs23Stat } from "@/components/bs23/bs23-card";
import { FunnelChart } from "@/components/bs23/funnel-chart";
import { SyllabusProgressChart } from "@/components/bs23/syllabus-progress-chart";
import { StageRadarPanel } from "@/components/bs23/stage-radar";
import { BurndownChart } from "@/components/bs23/burndown-chart";
import { EvidenceHeatmap } from "@/components/bs23/evidence-heatmap";
import { GapMatrixChart } from "@/components/bs23/gap-matrix";
import {
  BarChart3,
  Filter,
  Flame,
  Grid3X3,
  Layers,
  ListChecks,
} from "lucide-react";

export default function CoachPage() {
  const settings = useSettings();
  const drills = useBs23Drills();
  const topicProgress = useBs23TopicProgress();
  const leetcodeProblems = useLeetcodeProblems();
  const csReviewItems = useCsReviewItems();
  const prepQuizAttempts = usePrepQuizAttempts();
  const mockRoundSessions = useMockRoundSessions();
  const sessions = useSessions();
  const tracks = useTracks();

  const bs23Settings = defaultBs23Settings(settings);

  const report = useMemo(
    () =>
      buildBs23ReadinessReport({
        drills,
        topicProgress,
        leetcodeProblems,
        csReviewItems,
        prepQuizAttempts,
        mockRoundSessions,
        sessions,
        tracks,
        settings: settings
          ? {
              ...settings,
              bs23McqDate: bs23Settings.mcqDate,
              bs23DayLongDate: bs23Settings.dayLongDate,
              bs23DeclaredStack: bs23Settings.declaredStack,
              bs23WeeklyHours: bs23Settings.weeklyHours,
            }
          : null,
      }),
    [
      drills,
      topicProgress,
      leetcodeProblems,
      csReviewItems,
      prepQuizAttempts,
      mockRoundSessions,
      sessions,
      tracks,
      settings,
      bs23Settings.mcqDate,
      bs23Settings.dayLongDate,
      bs23Settings.declaredStack,
      bs23Settings.weeklyHours,
    ]
  );

  const verdict = useMemo(() => buildBs23Verdict(report), [report]);

  const plannedHours =
    settings?.bs23WeeklyHours ?? report.weeklyHoursRequired ?? bs23Settings.weeklyHours;

  const weeklyPlan = useMemo(
    () => buildBs23WeeklyPlan(report, plannedHours),
    [report, plannedHours]
  );

  const capacitySource = settings?.bs23WeeklyHours
    ? "your saved weekly plan"
    : "the pace your MCQ date requires";

  const saveSettings = useCallback(
    async (patch: Partial<{
      bs23McqDate: string;
      bs23DayLongDate: string;
      bs23DeclaredStack: Bs23DeclaredStack;
      bs23WeeklyHours: number;
    }>) => {
      if (!settings) return;
      await db.settings.put({ ...settings, ...patch });
    },
    [settings]
  );

  const focusStages = report.stages.filter((s) => !s.locked && !s.met).slice(0, 2);
  const radarStages = focusStages.length > 0 ? focusStages : report.stages.slice(0, 2);
  const syllabusPct = Math.round((report.totalTopicsDone / Math.max(report.totalTopics, 1)) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Brain Station 23 · Star Coder 2026
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-medium tracking-tight text-foreground sm:text-[28px]">
            <Target className="h-6 w-6 text-violet-400" strokeWidth={1.5} />
            Star Coder Prep
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">
            Work through the ordered topic checklist — ticking topics drives readiness. Logged drills
            add up to +25% proof bonus. Stages gate forward progress.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DrillLoggerDialog />
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">MCQ target</p>
            <p className="text-sm font-medium text-foreground">
              {format(parseLocalDate(report.mcqDate), "MMM d, yyyy")}
            </p>
            <p className="text-[11px] tabular-nums text-muted-foreground">
              {report.daysToMcq > 0
                ? `${report.daysToMcq} days · ${report.weeksToMcq.toFixed(0)} weeks`
                : "Target date passed"}
            </p>
          </div>
        </div>
      </div>

      <SettingsStrip
        mcqDate={bs23Settings.mcqDate}
        dayLongDate={bs23Settings.dayLongDate}
        declaredStack={bs23Settings.declaredStack}
        weeklyHours={bs23Settings.weeklyHours}
        onMcqDateChange={(v) => saveSettings({ bs23McqDate: v })}
        onDayLongDateChange={(v) => saveSettings({ bs23DayLongDate: v })}
        onStackChange={(v) => saveSettings({ bs23DeclaredStack: v })}
        onWeeklyHoursChange={(v) => saveSettings({ bs23WeeklyHours: v })}
      />

      <VerdictBanner verdict={verdict} />

      <StageCards stages={report.stages} />

      <Bs23Card
        title="Topic checklist"
        subtitle={`${report.totalTopicsDone}/${report.totalTopics} topics done (${syllabusPct}%) — work in order, tick when genuinely complete`}
        icon={ListChecks}
        accent="#8b5cf6"
      >
        <TopicChecklist
          topicProgress={topicProgress}
          syllabusProgress={report.syllabusProgress}
        />
      </Bs23Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Bs23Stat
          label="Syllabus coverage"
          value={`${syllabusPct}%`}
          hint={`${report.totalTopicsDone}/${report.totalTopics} topics ticked`}
        />
        <Bs23Stat
          label="Drills logged"
          value={String(report.totalDrillsLogged)}
          hint="Proof bonus up to +25%"
        />
        <Bs23Stat
          label="Actual pace"
          value={`${report.weeklyHoursActual}h/wk`}
          hint={`Need ${report.weeklyHoursRequired}h/wk for MCQ`}
          color={report.weeklyHoursActual < report.weeklyHoursRequired ? "#f97316" : undefined}
        />
        <Bs23Stat
          label="Stage 2 readiness"
          value={`${report.stages.find((s) => s.id === "S2")?.readiness ?? 0}%`}
          hint="Online MCQ gate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Bs23Card
          title="Syllabus progress"
          subtitle="Coverage by stage — tick topics to fill each bar"
          icon={BookOpen}
          accent="#6366f1"
        >
          <SyllabusProgressChart syllabusProgress={report.syllabusProgress} />
        </Bs23Card>

        <Bs23Card
          title="Selection funnel"
          subtitle="Stage pass probability × cumulative offer path"
          icon={Filter}
          accent="#8b5cf6"
        >
          <FunnelChart stages={report.stages} />
        </Bs23Card>
      </div>

      <Bs23Card
        title="Readiness burndown"
        subtitle="Required weekly hours vs your actual pace to MCQ"
        icon={BarChart3}
        accent="#6366f1"
      >
        <BurndownChart report={report} />
      </Bs23Card>

      <Bs23Card
        title="Competency radar"
        subtitle="Current stage focus — score vs required threshold"
        icon={Layers}
        accent="#a855f7"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {radarStages.map((stage) => (
            <StageRadarPanel key={stage.id} stage={stage} />
          ))}
        </div>
      </Bs23Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Bs23Card
          title="Activity heatmap"
          subtitle={`${report.evidenceHeatmap.length}-week log — topics ticked + drills logged`}
          icon={Flame}
          accent="#f97316"
        >
          <EvidenceHeatmap report={report} />
        </Bs23Card>

        <Bs23Card
          title="Gap matrix"
          subtitle="High weight + low score = what fails you first"
          icon={Grid3X3}
          accent="#ef4444"
        >
          <GapMatrixChart report={report} />
        </Bs23Card>
      </div>

      <WeeklyPlanCard plan={weeklyPlan} capacitySource={capacitySource} />
    </div>
  );
}
