"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  IconClock,
  IconTarget,
  IconFlame,
  IconBolt,
  IconBook,
  IconCalendar,
  IconTrendingUp,
  IconStack2,
} from "@tabler/icons-react";
import { StatCard } from "@/components/shared/stat-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { ActivityHeatmap } from "@/components/shared/activity-heatmap";
import { TrackCard } from "@/components/dashboard/track-card";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { GrowthRadarChart } from "@/components/charts/radar-chart";
import { ForecastChart } from "@/components/charts/forecast-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useTracks, useAllSubtopics, useAllModules, useAllTopics, useSessions, useSettings,
} from "@/hooks/use-data";
import { calculateStreaks, generateHeatmapData, getMomentumColor, todayISO } from "@/lib/utils";
import {
  getGlobalProgress, getTotalHours, getTodayHours, getTrackProgress, getTrackRemainingCount, getGoalForecast,
  calculateMomentumScore, generateInsights, getRadarData, countCompletedItems,
  getDaysRemainingInYear, buildForecastChartData, DEFAULT_YEAR_START, DEFAULT_YEAR_END,
} from "@/lib/analytics";

export default function DashboardPage() {
  const tracks = useTracks();
  const subtopics = useAllSubtopics();
  const modules = useAllModules();
  const topics = useAllTopics();
  const sessions = useSessions();
  const settings = useSettings();

  const yearlyGoal = settings?.yearlyHourGoal ?? 1000;
  const yearStart = settings?.yearStart ?? DEFAULT_YEAR_START;
  const yearEnd = settings?.yearEnd ?? DEFAULT_YEAR_END;

  const globalProgress = useMemo(() => getGlobalProgress(topics, subtopics), [topics, subtopics]);
  const totalHours = useMemo(() => getTotalHours(sessions) / 3600000, [sessions]);
  const todayHours = useMemo(() => getTodayHours(sessions) / 3600000, [sessions]);
  const streaks = useMemo(() => calculateStreaks(sessions.map((s) => s.date)), [sessions]);
  const heatmapData = useMemo(() => generateHeatmapData(sessions), [sessions]);
  const momentum = useMemo(() => calculateMomentumScore(sessions, topics, subtopics, streaks.current, yearlyGoal), [sessions, topics, subtopics, streaks, yearlyGoal]);
  const forecast = useMemo(
    () => getGoalForecast(sessions, topics, subtopics, yearlyGoal, yearStart, yearEnd),
    [sessions, topics, subtopics, yearlyGoal, yearStart, yearEnd]
  );
  const insights = useMemo(
    () => generateInsights(tracks, modules, topics, subtopics, sessions, streaks.current, yearlyGoal, yearStart, yearEnd),
    [tracks, modules, topics, subtopics, sessions, streaks, yearlyGoal, yearStart, yearEnd]
  );
  const radarData = useMemo(() => getRadarData(tracks, modules, topics, subtopics, sessions), [tracks, modules, topics, subtopics, sessions]);
  const completed = useMemo(() => countCompletedItems(subtopics, modules, topics), [subtopics, modules, topics]);
  const daysRemaining = useMemo(() => getDaysRemainingInYear(yearEnd), [yearEnd]);

  const forecastChartData = useMemo(
    () => buildForecastChartData(sessions, yearStart, yearEnd),
    [sessions, yearStart, yearEnd]
  );

  const trackStats = useMemo(() => {
    return tracks.map((track) => {
      const progress = getTrackProgress(track.id, topics, subtopics, modules);
      const today = todayISO();
      const hours = sessions
        .filter((s) => s.trackId === track.id && s.date === today)
        .reduce((sum, s) => sum + s.duration, 0) / 3600000;
      const remaining = getTrackRemainingCount(track.id, topics, subtopics);
      const inProgress = subtopics.find((s) => s.trackId === track.id && s.status === "in_progress");
      const focusTopic = inProgress ? topics.find((t) => t.id === inProgress.topicId)?.name : undefined;
      const trackDates = sessions.filter((s) => s.trackId === track.id).map((s) => s.date);
      const trackStreak = calculateStreaks(trackDates).current;
      return { track, progress: progress.percentage, hours, remaining, streak: trackStreak, currentFocus: focusTopic };
    });
  }, [tracks, modules, subtopics, sessions, topics]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Welcome to GoalTrack — your personal learning command center</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Today's Hours"
          value={`${todayHours.toFixed(1)}h`}
          subtitle={`${totalHours.toFixed(0)}h total invested`}
          icon={IconClock}
          gradient="linear-gradient(135deg, #8b5cf6, #3b82f6)"
          valueClassName="text-4xl sm:text-5xl"
          delay={0}
        />
        <StatCard title="Overall Progress" value={`${globalProgress.percentage}%`} subtitle={`${completed.completedTopics} topics completed`} icon={IconTarget} gradient="linear-gradient(135deg, #10b981, #06b6d4)" delay={0.05} />
        <StatCard title="Current Streak" value={`${streaks.current} days`} subtitle={`Best: ${streaks.longest} days`} icon={IconFlame} gradient="linear-gradient(135deg, #f59e0b, #ef4444)" delay={0.1} />
        <StatCard title="Longest Streak" value={`${streaks.longest} days`} subtitle={`${streaks.missedDays} missed days`} icon={IconBolt} delay={0.15} />
        <StatCard title="Active Goals" value={tracks.length} subtitle={`${yearlyGoal}h yearly target`} icon={IconBook} delay={0.2} />
        <StatCard title="Days Remaining" value={daysRemaining} subtitle="Until Dec 2026" icon={IconCalendar} gradient="linear-gradient(135deg, #ec4899, #8b5cf6)" delay={0.25} />
      </div>

      <Card>
        <CardHeader className="border-b border-white/[0.06] pb-4">
          <CardTitle className="flex items-center gap-2">
            <IconTrendingUp className="h-4 w-4 opacity-70" stroke={1.5} /> Growth Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-7">
            <div className="text-center">
              <p className="metric-value text-3xl tabular-nums">{totalHours.toFixed(0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Hours Invested</p>
            </div>
            <div className="text-center">
              <p className="metric-value text-3xl tabular-nums">{completed.completedModules}</p>
              <p className="mt-1 text-xs text-muted-foreground">Modules Done</p>
            </div>
            <div className="text-center">
              <p className="metric-value text-3xl tabular-nums">{completed.completedTopics}</p>
              <p className="mt-1 text-xs text-muted-foreground">Topics Done</p>
            </div>
            <div className="text-center">
              <p className="metric-value text-3xl tabular-nums">{completed.completedSubtopics}</p>
              <p className="mt-1 text-xs text-muted-foreground">Subtopics Done</p>
            </div>
            <div className="text-center">
              <p className="metric-value text-3xl tabular-nums">{globalProgress.percentage}%</p>
              <p className="mt-1 text-xs text-muted-foreground">Completion</p>
            </div>
            <div className="text-center">
              <p className="metric-value text-3xl capitalize tabular-nums" style={{ color: getMomentumColor(momentum.level) }}>
                {momentum.level}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Momentum</p>
            </div>
            <div className="text-center">
              <p className="metric-value text-3xl tabular-nums">{momentum.score}</p>
              <p className="mt-1 text-xs text-muted-foreground">Score / 100</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <SectionHeading icon={IconStack2}>Track Overview</SectionHeading>
        <div className="grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {trackStats.map((ts, i) => (
            <TrackCard key={ts.track.id} {...ts} delay={i * 0.05} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <ActivityHeatmap data={heatmapData} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <InsightsPanel insights={insights} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-white/[0.06] pb-4">
            <CardTitle>
              Goal Forecasting{" "}
              <span className="text-xs font-normal text-muted-foreground/80">Jun – Dec 2026</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ForecastChart data={forecastChartData} goal={yearlyGoal} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="glass rounded-[10px] p-3 text-center">
                <p className="metric-value text-lg tabular-nums">{forecast.projectedHours}h</p>
                <p className="text-xs text-muted-foreground">Projected Yearly Hours</p>
              </div>
              <div className="glass rounded-[10px] p-3 text-center">
                <p className="metric-value text-lg tabular-nums">{forecast.successProbability}%</p>
                <p className="text-xs text-muted-foreground">Success Probability</p>
              </div>
              <div className="glass rounded-[10px] p-3 text-center">
                <p className="metric-value text-lg tabular-nums">{forecast.estimatedCompletionDate}</p>
                <p className="text-xs text-muted-foreground">Est. Completion</p>
              </div>
              <div className="glass rounded-[10px] p-3 text-center">
                <p className="metric-value text-lg tabular-nums">{forecast.confidence}%</p>
                <p className="text-xs text-muted-foreground">Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-white/[0.06] pb-4">
            <CardTitle>Growth Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <GrowthRadarChart data={radarData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
