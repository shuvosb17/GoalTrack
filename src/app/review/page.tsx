"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  Download, Share2, FileText, TrendingUp, TrendingDown, Minus,
  Sparkles, ShieldAlert, Target,
} from "lucide-react";
import {
  IconReportAnalytics, IconCalendarStats, IconWaveSine, IconHourglassHigh,
  IconLifebuoy, IconTargetArrow,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { AnnualLearningCurve } from "@/components/review/annual-learning-curve";
import {
  useTracks, useAllSubtopics, useAllModules, useAllTopics, useSessions, useSettings,
} from "@/hooks/use-data";
import { buildAnnualReport, buildReviewNarrative } from "@/lib/review";
import {
  buildLearningCurve, getLearningCurveSummary, buildYearChapters,
  buildRhythmProfile, buildDepthProfile, buildGapRecovery, buildYearLevers,
  buildPrintableReportHtml, MOMENTUM_COLORS,
  type YearLever,
} from "@/lib/annual-review";
import { cn } from "@/lib/utils";

const LEVER_STYLES: Record<YearLever["tone"], { color: string; bg: string; border: string; label: string; icon: typeof Sparkles }> = {
  win: { color: "#34d399", bg: "rgba(52,211,153,0.07)", border: "rgba(52,211,153,0.25)", label: "Working", icon: Sparkles },
  opportunity: { color: "#60a5fa", bg: "rgba(96,165,250,0.07)", border: "rgba(96,165,250,0.25)", label: "Opportunity", icon: Target },
  risk: { color: "#f87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.25)", label: "Watch out", icon: ShieldAlert },
};

function ChapterStatusIcon({ status }: { status: "up" | "flat" | "down" | "upcoming" }) {
  if (status === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (status === "down") return <TrendingDown className="h-3.5 w-3.5 text-amber-400" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function AnnualReviewPage() {
  const tracks = useTracks();
  const subtopics = useAllSubtopics();
  const modules = useAllModules();
  const topics = useAllTopics();
  const sessions = useSessions();
  const settings = useSettings();

  const report = useMemo(
    () => buildAnnualReport(sessions, subtopics, modules, topics, tracks, settings),
    [sessions, subtopics, modules, topics, tracks, settings]
  );
  const narrative = useMemo(() => buildReviewNarrative(report), [report]);

  const { yearStart, yearEnd } = report.window;
  const curve = useMemo(() => buildLearningCurve(sessions, yearStart, yearEnd), [sessions, yearStart, yearEnd]);
  const curveSummary = useMemo(() => getLearningCurveSummary(curve), [curve]);
  const chapters = useMemo(() => buildYearChapters(sessions, tracks, yearStart, yearEnd), [sessions, tracks, yearStart, yearEnd]);
  const rhythm = useMemo(() => buildRhythmProfile(sessions, yearStart, yearEnd), [sessions, yearStart, yearEnd]);
  const depth = useMemo(() => buildDepthProfile(sessions, yearStart, yearEnd), [sessions, yearStart, yearEnd]);
  const gaps = useMemo(() => buildGapRecovery(sessions, yearStart, yearEnd), [sessions, yearStart, yearEnd]);
  const levers = useMemo(
    () => buildYearLevers(rhythm, depth, gaps, curveSummary),
    [rhythm, depth, gaps, curveSummary]
  );

  const maxRhythmHours = Math.max(...rhythm.days.map((d) => d.hours), 1);

  const handleExportPdf = () => {
    const html = buildPrintableReportHtml({
      report, curve, summary: curveSummary, chapters, rhythm, depth, gaps, levers, narrative,
    });
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  };

  const handleExportJson = () => {
    const data = {
      window: report.window,
      generatedAt: new Date().toISOString(),
      totals: {
        hours: report.totalHours,
        sessions: report.totalSessions,
        activeDays: gaps.activeDays,
        coveragePct: gaps.coveragePct,
        longestStreak: report.streaks.longest,
      },
      learningCurve: curve,
      curveSummary,
      chapters,
      rhythm,
      depth,
      gapsAndRecovery: gaps,
      levers,
      narrative,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goaltrack-annual-review-${yearStart}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpis = [
    { label: "Total hours", value: `${report.totalHours.toFixed(0)}h`, hint: `${report.totalSessions} sessions` },
    { label: "Active days", value: gaps.activeDays, hint: `${gaps.coveragePct}% of the year so far` },
    { label: "Deep-work share", value: `${depth.deepShare}%`, hint: "hours from 90m+ sessions" },
    { label: "Curve shape", value: curveSummary.shape, hint: curveSummary.peakMonth ? `peak: ${curveSummary.peakMonth.label}` : "no peak yet", small: true },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-medium tracking-tight sm:text-3xl">
            <IconReportAnalytics className="h-7 w-7 text-primary" stroke={1.5} /> Annual Review
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.window.label} · the year in retrospect — rhythm, depth, and momentum
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExportPdf} size="sm" className="gap-2">
            <FileText className="h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJson} className="gap-2 border-[0.5px] border-white/[0.08]">
            <Download className="h-4 w-4" /> JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-[0.5px] border-white/[0.08]"
            onClick={() => navigator.share?.({ title: "GoalTrack Annual Review", text: narrative.join(" ") })}
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.label} className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] px-4 py-3.5">
            <p className={cn("metric-value tabular-nums", "small" in item && item.small ? "text-lg capitalize sm:text-xl" : "text-2xl sm:text-3xl")}>
              {item.value}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground/80">{item.hint}</p>
          </div>
        ))}
      </div>

      <AnnualLearningCurve points={curve} />

      <Card className="border-[0.5px] border-white/[0.08]">
        <CardContent className="pt-6">
          <SectionHeading icon={IconCalendarStats}>Chapters of the year</SectionHeading>
          <p className="-mt-2 mb-4 text-xs text-muted-foreground">
            The window split into three-month arcs — how each chapter compared to the one before.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {chapters.map((c) => (
              <div
                key={c.key}
                className={cn(
                  "rounded-xl border-[0.5px] p-4",
                  c.status === "upcoming"
                    ? "border-dashed border-white/[0.08] opacity-60"
                    : "border-white/[0.08] bg-white/[0.02]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{c.label}</p>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ChapterStatusIcon status={c.status} />
                    {c.deltaVsPrevPct !== null && c.status !== "upcoming" && (
                      <span className={c.deltaVsPrevPct >= 0 ? "text-emerald-400" : "text-amber-400"}>
                        {c.deltaVsPrevPct > 0 ? "+" : ""}{c.deltaVsPrevPct}%
                      </span>
                    )}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.monthsLabel}</p>
                {c.status === "upcoming" ? (
                  <p className="mt-3 text-sm text-muted-foreground">Not written yet.</p>
                ) : (
                  <>
                    <p className="mt-2 font-mono text-2xl tabular-nums">{c.hours.toFixed(0)}h</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {c.sessions} sessions · {c.activeDays} active days · {c.avgPerActiveDay}h/day
                    </p>
                    {c.topTrackName && (
                      <p className="mt-2 truncate text-[11px] text-muted-foreground">
                        Focus: <span className="text-foreground/90">{c.topTrackName}</span>
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[0.5px] border-white/[0.08]">
          <CardContent className="pt-6">
            <SectionHeading icon={IconWaveSine}>Weekly rhythm</SectionHeading>
            <p className="-mt-2 mb-4 text-xs text-muted-foreground">
              Where your hours actually land across the week, over the whole year.
            </p>
            <div className="space-y-2">
              {rhythm.days.map((d) => {
                const isPeak = rhythm.peak?.label === d.label;
                return (
                  <div key={d.label} className="flex items-center gap-3">
                    <span className={cn("w-9 text-[11px]", isPeak ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {d.label}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(d.hours / maxRhythmHours) * 100}%`,
                          backgroundColor: isPeak ? "#a78bfa" : "rgba(167,139,250,0.45)",
                        }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                      {d.hours.toFixed(1)}h
                    </span>
                    <span className="w-9 text-right font-mono text-[10px] tabular-nums text-muted-foreground/70">
                      {d.share}%
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 border-t border-white/[0.06] pt-3 text-xs text-muted-foreground">
              {rhythm.peak
                ? <>Peak: <span className="text-foreground">{rhythm.peak.label}</span> ({rhythm.peak.share}%) · weekends carry {rhythm.weekendShare}% of the year.</>
                : "Log sessions to reveal your weekly pattern."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[0.5px] border-white/[0.08]">
          <CardContent className="pt-6">
            <SectionHeading icon={IconHourglassHigh}>Session depth</SectionHeading>
            <p className="-mt-2 mb-4 text-xs text-muted-foreground">
              How the year&apos;s hours divide between quick touches, focused blocks, and deep sessions.
            </p>
            {depth.totalSessions === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions logged in this window yet.</p>
            ) : (
              <>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  {depth.buckets.map((b, i) => (
                    <div
                      key={b.key}
                      className="h-full"
                      style={{
                        width: `${b.hoursShare}%`,
                        backgroundColor: ["#52525b", "#60a5fa", "#a78bfa"][i],
                      }}
                      title={`${b.label}: ${b.hoursShare}%`}
                    />
                  ))}
                </div>
                <div className="mt-4 space-y-2.5">
                  {depth.buckets.map((b, i) => (
                    <div key={b.key} className="flex items-center gap-3 text-sm">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: ["#52525b", "#60a5fa", "#a78bfa"][i] }}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {b.label} <span className="text-xs text-muted-foreground">({b.rangeLabel})</span>
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {b.count} × · {b.hours.toFixed(0)}h · {b.hoursShare}%
                      </span>
                    </div>
                  ))}
                </div>
                {depth.longestSession && (
                  <p className="mt-4 border-t border-white/[0.06] pt-3 text-xs text-muted-foreground">
                    Longest single session: <span className="text-foreground">{depth.longestSession.hours.toFixed(1)}h</span>{" "}
                    on {format(parseISO(depth.longestSession.date), "MMM d, yyyy")}.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-[0.5px] border-white/[0.08]">
        <CardContent className="pt-6">
          <SectionHeading icon={IconLifebuoy}>Gaps &amp; recovery</SectionHeading>
          <p className="-mt-2 mb-4 text-xs text-muted-foreground">
            Every learner takes breaks — what matters is how fast you come back.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <p className="font-mono text-2xl tabular-nums">{gaps.breaks.length}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">Breaks of 3+ days</p>
            </div>
            <div className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <p className="font-mono text-2xl tabular-nums">{gaps.longestGap ? `${gaps.longestGap.days}d` : "—"}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">Longest gap</p>
              {gaps.longestGap && (
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  {format(parseISO(gaps.longestGap.from), "MMM d")} → {format(parseISO(gaps.longestGap.to), "MMM d")}
                </p>
              )}
            </div>
            <div className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <p className="font-mono text-2xl tabular-nums">{gaps.avgHoursPerActiveDay}h</p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">Avg on active days</p>
            </div>
            <div className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <p className="font-mono text-2xl tabular-nums">{gaps.recoveryPct !== null ? `${gaps.recoveryPct}%` : "—"}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">First-day-back intensity</p>
              <p className="mt-1 text-[10px] text-muted-foreground/70">vs a normal active day</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[0.5px] border-white/[0.08]">
        <CardContent className="pt-6">
          <SectionHeading icon={IconTargetArrow}>Levers for next year</SectionHeading>
          <p className="-mt-2 mb-4 text-xs text-muted-foreground">
            The few changes this year&apos;s data says would move the curve the most.
          </p>
          {levers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keep logging sessions — personalized levers appear as the year accumulates data.
            </p>
          ) : (
            <div className="space-y-2.5">
              {levers.map((lever) => {
                const style = LEVER_STYLES[lever.tone];
                const Icon = style.icon;
                return (
                  <div
                    key={lever.id}
                    className="flex gap-3 rounded-xl border p-3.5"
                    style={{ borderColor: style.border, backgroundColor: style.bg }}
                  >
                    <div
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${style.color}1a` }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: style.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {lever.title}
                        <span
                          className="ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                          style={{ color: style.color, backgroundColor: `${style.color}1a` }}
                        >
                          {style.label}
                        </span>
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{lever.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[0.5px] border-white/[0.08]">
        <CardContent className="pt-6">
          <SectionHeading>Your story</SectionHeading>
          <div className="space-y-3">
            {narrative.map((line, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">{line}</p>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3 text-[11px] text-muted-foreground">
            <span>Momentum by month:</span>
            {curve.filter((p) => !p.isFuture).map((p) => (
              <span key={p.monthKey} className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: MOMENTUM_COLORS[p.momentum] }} />
                {p.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
