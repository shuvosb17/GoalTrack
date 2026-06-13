"use client";

import { useMemo, useState } from "react";
import {
  IconChartBar,
  IconClock,
  IconTarget,
  IconFlame,
  IconBulb,
  IconCode,
} from "@tabler/icons-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, ComposedChart, Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/shared/stat-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { ConsistencyCalendar } from "@/components/analytics/consistency-calendar";
import { InconsistencyTrackingPanel } from "@/components/analytics/inconsistency-tracking-panel";
import { LearningVelocityPanel } from "@/components/analytics/learning-velocity-panel";
import {
  useTracks, useAllSubtopics, useAllTopics, useSessions, useSettings, useSkipLogs,
} from "@/hooks/use-data";
import {
  getHoursByPeriod, getHoursByWeek, getFocusHeatmap,
  getEfficiencyScores, getCompletionTrendsDaily,
  getQualityByWeek, getProblemsByWeek,
  trimLeadingEmptyWeeks, trimLeadingEmptyProblemWeeks,
  getConsistencyCalendar, getAnalyticsKpis, getLearningVelocityWithDelta,
  getTopTopicsWithTrack, getActiveDistribution, getAnalyticsDiagnostics,
  CHART_TOOLTIP_STYLE, DEFAULT_YEAR_START, DEFAULT_YEAR_END,
} from "@/lib/analytics";
import { getDailyPaceTarget, getWeeklyConsistency } from "@/lib/metrics";
import { resolveTieredGoal, getWeeksUntilYearEnd, getHoursLoggedThisYear } from "@/lib/goals";
import { formatHours } from "@/lib/utils";
import { differenceInDays, parseISO } from "date-fns";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type WeekRange = "4" | "12" | "all";

function weekCountForRange(range: WeekRange, sessions: { date: string }[]): number {
  if (range === "4") return 4;
  if (range === "12") return 12;
  if (sessions.length === 0) return 12;
  const first = sessions.map((s) => s.date).sort()[0];
  const days = differenceInDays(new Date(), parseISO(first)) + 1;
  return Math.min(52, Math.max(4, Math.ceil(days / 7)));
}

function DeltaBadge({ delta, suffix = "" }: { delta: number; suffix?: string }) {
  if (delta === 0) return <span className="text-muted-foreground">same as prior</span>;
  const up = delta > 0;
  return (
    <span className={up ? "text-emerald-400" : "text-amber-400"}>
      {up ? "↑" : "↓"}
      {Math.abs(delta)}
      {suffix}
    </span>
  );
}

function InsightLine({ text }: { text: string }) {
  return (
    <p className="mt-3 flex items-start gap-2 border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-muted-foreground">
      <IconBulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400/80" stroke={1.5} />
      {text}
    </p>
  );
}

export default function AnalyticsPage() {
  const tracks = useTracks();
  const subtopics = useAllSubtopics();
  const topics = useAllTopics();
  const sessions = useSessions();
  const settings = useSettings();
  const skipLogs = useSkipLogs();
  const [weekRange, setWeekRange] = useState<WeekRange>("4");

  const yearStart = settings?.yearStart ?? DEFAULT_YEAR_START;
  const yearEnd = settings?.yearEnd ?? DEFAULT_YEAR_END;
  const dailyGoal = settings?.dailyHourGoal ?? 3;
  const leetCodeLog = useMemo(() => settings?.leetCodeLog ?? [], [settings?.leetCodeLog]);
  const hasLeetCodeData = leetCodeLog.length > 0;

  const weekCount = useMemo(
    () => weekCountForRange(weekRange, sessions),
    [weekRange, sessions]
  );

  const pace = useMemo(
    () => getDailyPaceTarget(settings, sessions, yearStart, yearEnd),
    [settings, sessions, yearStart, yearEnd]
  );

  const consistencyDays = useMemo(
    () => getConsistencyCalendar(sessions, topics, skipLogs, dailyGoal, 84),
    [sessions, topics, skipLogs, dailyGoal]
  );

  const kpis = useMemo(
    () => getAnalyticsKpis(sessions, settings, leetCodeLog, pace),
    [sessions, settings, leetCodeLog, pace]
  );

  const dailyHours = useMemo(() => {
    const days = weekRange === "4" ? 28 : weekRange === "12" ? 90 : 180;
    return trimLeadingEmptyWeeks(getHoursByPeriod(sessions, days), (d) => d.hours > 0);
  }, [sessions, weekRange]);

  const weeklyData = useMemo(() => {
    const hours = trimLeadingEmptyWeeks(getHoursByWeek(sessions, weekCount), (d) => d.hours > 0);
    const quality = getQualityByWeek(sessions, weekCount);
    const offset = quality.length - hours.length;
    return hours.map((d, i) => ({
      ...d,
      quality: quality[offset + i]?.quality ?? null,
    }));
  }, [sessions, weekCount]);

  const problemsByWeek = useMemo(
    () => trimLeadingEmptyProblemWeeks(getProblemsByWeek(leetCodeLog, weekCount)),
    [leetCodeLog, weekCount]
  );

  const activeDistribution = useMemo(
    () => getActiveDistribution(sessions, tracks),
    [sessions, tracks]
  );
  const totalDistHours = useMemo(
    () => activeDistribution.reduce((s, d) => s + d.value, 0),
    [activeDistribution]
  );

  const heatmap = useMemo(() => getFocusHeatmap(sessions), [sessions]);
  const maxHeat = Math.max(...heatmap.flat(), 1);
  const peakInsight = kpis.peakFocusLabel;

  const topTopics = useMemo(
    () => getTopTopicsWithTrack(sessions, topics, tracks),
    [sessions, topics, tracks]
  );
  const velocity = useMemo(
    () => getLearningVelocityWithDelta(subtopics, sessions),
    [subtopics, sessions]
  );
  const weeklyConsistency = useMemo(
    () => getWeeklyConsistency(sessions, dailyGoal),
    [sessions, dailyGoal]
  );
  const tiered = useMemo(() => resolveTieredGoal(settings), [settings]);
  const hoursPerWeekNeeded = useMemo(() => {
    const logged = getHoursLoggedThisYear(sessions, yearStart, yearEnd);
    const weeks = getWeeksUntilYearEnd(yearEnd);
    const remaining = Math.max(0, tiered.stretch - logged);
    return Math.round(remaining / weeks);
  }, [sessions, yearStart, yearEnd, tiered.stretch]);
  const efficiency = useMemo(
    () => getEfficiencyScores(tracks, topics, subtopics, sessions).filter((e) => e.hours > 0),
    [tracks, topics, subtopics, sessions]
  );
  const maxEfficiency = Math.max(...efficiency.map((e) => e.efficiency), 1);

  const trendDays = weekRange === "4" ? 28 : weekRange === "12" ? 90 : 180;
  const trends = useMemo(
    () => getCompletionTrendsDaily(sessions, subtopics, trendDays),
    [sessions, subtopics, trendDays]
  );

  const diagnostics = useMemo(
    () =>
      getAnalyticsDiagnostics(
        sessions,
        tracks,
        topics,
        subtopics,
        skipLogs,
        dailyGoal,
        kpis,
        velocity,
        efficiency,
        consistencyDays
      ),
    [sessions, tracks, topics, subtopics, skipLogs, dailyGoal, kpis, velocity, efficiency, consistencyDays]
  );

  const hasQualityData = weeklyData.some((d) => d.quality !== null);
  const hasWeeklyHours = weeklyData.some((d) => d.hours > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-medium tracking-tight sm:text-3xl">
          <IconChartBar className="h-7 w-7 text-primary" stroke={1.5} /> Analytics
        </h1>
        <p className="mt-1 text-muted-foreground">Diagnostic view — what happened, and what to adjust</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="This week"
          value={`${kpis.hoursThisWeek}h`}
          subtitle={<DeltaBadge delta={kpis.hoursWeekDelta} suffix="h vs last" />}
          icon={IconClock}
          delay={0}
        />
        <StatCard
          title="Avg quality"
          value={kpis.avgQualityThisWeek !== null ? kpis.avgQualityThisWeek.toFixed(1) : "—"}
          subtitle={
            kpis.ratedSessionsThisWeek > 0
              ? `${kpis.ratedSessionsThisWeek} rated sessions`
              : "Rate sessions to unlock"
          }
          icon={IconTarget}
          delay={0.05}
        />
        <StatCard
          title="Problems"
          value={kpis.problemsThisWeek}
          subtitle="Solved this week"
          icon={IconCode}
          delay={0.1}
        />
        <StatCard
          title="Peak focus"
          value={peakInsight.includes(":") ? peakInsight.split(" ").slice(-1)[0] : "—"}
          subtitle={peakInsight.includes(":") ? peakInsight.replace(/s \d.*/, "s") : peakInsight}
          icon={IconFlame}
          valueClassName="text-xl sm:text-2xl"
          delay={0.15}
        />
        <StatCard
          title="Today pace"
          value={pace.onPace ? "On pace" : `${pace.hoursLeftToday}h left`}
          subtitle={pace.onPace ? `${pace.hoursLoggedToday}h logged` : `Need ${pace.hoursNeededToday}h today`}
          icon={IconTarget}
          valueColor={pace.onPace ? "#86efac" : pace.hoursLoggedToday >= pace.hoursNeededToday * 0.5 ? "#fbbf24" : "#f87171"}
          delay={0.2}
        />
      </div>

      {/* Consistency calendar */}
      <Card className="border-[0.5px] border-white/[0.08]">
        <CardContent className="pt-6">
          <SectionHeading>Study Consistency</SectionHeading>
          <ConsistencyCalendar days={consistencyDays} />
          <InsightLine text={diagnostics.consistency} />
        </CardContent>
      </Card>

      <Card className="border-[0.5px] border-white/[0.08]">
        <CardContent className="pt-6">
          <SectionHeading>Tracking</SectionHeading>
          <p className="mb-4 text-xs text-muted-foreground">
            History of missed study days and the reasons you logged.
          </p>
          <InconsistencyTrackingPanel skipLogs={skipLogs} />
        </CardContent>
      </Card>

      {/* Time Investment */}
      <Card className="border-[0.5px] border-white/[0.08]">
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionHeading className="mb-0 border-0 pb-0">Time Investment</SectionHeading>
            <Tabs value={weekRange} onValueChange={(v) => setWeekRange(v as WeekRange)}>
              <TabsList className="h-8">
                <TabsTrigger value="4" className="h-6 px-2.5 text-xs">4w</TabsTrigger>
                <TabsTrigger value="12" className="h-6 px-2.5 text-xs">12w</TabsTrigger>
                <TabsTrigger value="all" className="h-6 px-2.5 text-xs">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              {hasLeetCodeData && <TabsTrigger value="problems">Problems</TabsTrigger>}
              <TabsTrigger value="focus">Focus hours</TabsTrigger>
            </TabsList>

            <TabsContent value="daily">
              {dailyHours.every((d) => d.hours === 0) ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No daily data in this range. Log a session to see your rhythm.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dailyHours}>
                    <defs>
                      <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="hours" stroke="#8b5cf6" fill="url(#hoursGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </TabsContent>

            <TabsContent value="weekly">
              {!hasWeeklyHours ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No weekly data yet. Your first bar appears after you log hours this week.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                    {hasQualityData && (
                      <YAxis yAxisId="right" orientation="right" domain={[1, 3]} ticks={[1, 2, 3]} tick={{ fill: "#fbbf24", fontSize: 10 }} />
                    )}
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="hours" name="Hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    {hasQualityData && (
                      <Line yAxisId="right" type="monotone" dataKey="quality" name="Avg quality" stroke="#fbbf24" strokeWidth={2} connectNulls dot={{ r: 3, fill: "#fbbf24" }} />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
              {!hasQualityData && hasWeeklyHours && (
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Rate sessions after stopping to unlock the quality trend line.
                </p>
              )}
            </TabsContent>

            {hasLeetCodeData && (
              <TabsContent value="problems">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={problemsByWeek}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="easy" stackId="p" name="Easy" fill="#97C459" />
                    <Bar dataKey="medium" stackId="p" name="Medium" fill="#FAC775" />
                    <Bar dataKey="hard" stackId="p" name="Hard" fill="#f87171" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            )}

            <TabsContent value="focus">
              <p className="mb-3 text-xs text-muted-foreground">{peakInsight}</p>
              <div className="overflow-x-auto">
                <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `36px repeat(24, 1fr)` }}>
                  <div />
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} className="text-center text-[8px] text-muted-foreground">{h}</div>
                  ))}
                  {DAYS.map((day, di) => (
                    <div key={day} className="contents">
                      <div className="pr-1 text-right text-[10px] text-muted-foreground">{day}</div>
                      {heatmap[di].map((val, hi) => (
                        <div
                          key={`${di}-${hi}`}
                          className="h-3.5 w-3.5 rounded-sm"
                          style={{ background: val > 0 ? `rgba(139, 92, 246, ${0.15 + (val / maxHeat) * 0.85})` : "#27272a" }}
                          title={`${day} ${hi}:00 — ${(val / 3600000).toFixed(1)}h`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <InsightLine text={diagnostics.timeInvestment} />
        </CardContent>
      </Card>

      {/* Distribution + Efficiency */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[0.5px] border-white/[0.08]">
          <CardContent className="pt-6">
            <SectionHeading>Time Distribution</SectionHeading>
            {activeDistribution.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No track time logged yet.</p>
            ) : (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={activeDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {activeDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: number) => formatHours(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="metric-value text-2xl tabular-nums">{(totalDistHours / 3600000).toFixed(0)}h</p>
                    <p className="text-[10px] text-muted-foreground">total</p>
                  </div>
                </div>
                <div className="mt-2 space-y-1.5">
                  {activeDistribution.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                      <span className="min-w-0 flex-1 truncate">{d.name}</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full" style={{ width: `${d.percentage}%`, background: d.color }} />
                      </div>
                      <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{d.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <InsightLine text={diagnostics.distribution} />
          </CardContent>
        </Card>

        <Card className="border-[0.5px] border-white/[0.08]">
          <CardContent className="pt-6">
            <SectionHeading>Efficiency (ROI)</SectionHeading>
            <p className="mb-3 text-[11px] text-muted-foreground">
              (progress × avg quality) ÷ hours — higher = more completion per hour invested
            </p>
            {efficiency.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Log hours on a track to see ROI.</p>
            ) : (
              <div className="space-y-3">
                {efficiency.map((e) => (
                  <div key={e.name} className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: e.color }} />
                      <span className="min-w-0 flex-1 truncate">{e.name}</span>
                      <span className="text-[10px] text-muted-foreground">{e.progress}% · {e.hours.toFixed(0)}h</span>
                      <span className="w-10 text-right font-mono text-xs tabular-nums">{e.efficiency.toFixed(1)}</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-violet-500/80 transition-all"
                        style={{ width: `${(e.efficiency / maxEfficiency) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <InsightLine text={diagnostics.efficiency} />
          </CardContent>
        </Card>
      </div>

      {/* Velocity + Top Topics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LearningVelocityPanel
          velocity={velocity}
          consistency={weeklyConsistency}
          hoursPerWeekNeeded={hoursPerWeekNeeded}
          stretchGoalHours={tiered.stretch}
          footnote={diagnostics.velocity}
        />

        <Card className="border-[0.5px] border-white/[0.08]">
          <CardContent className="pt-6">
            <SectionHeading>Most Studied Topics</SectionHeading>
            {topTopics.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No topic-level time logged yet.</p>
            ) : (
              <div className="space-y-2.5">
                {topTopics.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-2">
                    <span className="w-4 text-[10px] text-muted-foreground">{i + 1}</span>
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: t.trackColor }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{t.name}</p>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full" style={{ width: `${(t.hours / topTopics[0].hours) * 100}%`, background: t.trackColor }} />
                      </div>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{t.hours.toFixed(1)}h</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Completion Trends */}
      <Card className="border-[0.5px] border-white/[0.08]">
        <CardContent className="pt-6">
          <SectionHeading>Completion Trends</SectionHeading>
          {trends.every((t) => t.hours === 0 && t.completed === 0) ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Completion trends appear once you finish topics and log hours over multiple weeks.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" allowDecimals={false} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(value: number, name: string) => [
                    name === "Hours" ? `${Number(value).toFixed(1)}h` : value,
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2, fill: "#8b5cf6" }} name="Hours" />
                <Line yAxisId="right" type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ r: 2, fill: "#10b981" }} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
