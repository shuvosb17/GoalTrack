"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  IconClock,
  IconFlame,
  IconBolt,
  IconCalendar,
  IconTrendingUp,
  IconStack2,
  IconTargetArrow,
  IconChartPie,
} from "@tabler/icons-react";
import { StatCard } from "@/components/shared/stat-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { ActivityHeatmap } from "@/components/shared/activity-heatmap";
import { TrackCard } from "@/components/dashboard/track-card";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { MomentumBreakdownPanel } from "@/components/dashboard/momentum-breakdown";
import { NextActionCard } from "@/components/dashboard/next-action-card";
import { TieredGoalPanel } from "@/components/dashboard/tiered-goal-panel";
import { GrowthRadarChart } from "@/components/charts/radar-chart";
import { ForecastChart } from "@/components/charts/forecast-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useTracks, useAllSubtopics, useAllModules, useAllTopics, useSessions, useSettings, useSkipLogs,
} from "@/hooks/use-data";
import { calculateStreaks, generateHeatmapData, todayISO } from "@/lib/utils";
import {
  getTotalHours, getTodayHours, getTrackProgress, getTrackRemainingCount, getGoalForecast,
  generateInsights, getRadarData, countCompletedItems,
  getDaysRemainingInYear, buildForecastChartData, DEFAULT_YEAR_START, DEFAULT_YEAR_END,
} from "@/lib/analytics";
import {
  getDailyPaceTarget, getWeeklyConsistency, getMomentumBreakdown,
  getTrackBalance, resolveNextUpItem, getNextUpHref,
} from "@/lib/metrics";
import { getTieredGoalProgress, getGoalReframeMessage, resolveTieredGoal } from "@/lib/goals";

function paceColor(needed: number, logged: number) {
  if (logged >= needed) return "#86efac";
  if (logged >= needed * 0.5) return "#fbbf24";
  return "#f87171";
}

export default function DashboardPage() {
  const tracks = useTracks();
  const subtopics = useAllSubtopics();
  const modules = useAllModules();
  const topics = useAllTopics();
  const sessions = useSessions();
  const settings = useSettings();
  const skipLogs = useSkipLogs();

  const tiered = resolveTieredGoal(settings);
  const yearStart = settings?.yearStart ?? DEFAULT_YEAR_START;
  const yearEnd = settings?.yearEnd ?? DEFAULT_YEAR_END;
  const dailyGoal = settings?.dailyHourGoal ?? 3;

  const totalHours = useMemo(() => getTotalHours(sessions) / 3600000, [sessions]);
  const todayHours = useMemo(() => getTodayHours(sessions) / 3600000, [sessions]);
  const streaks = useMemo(() => calculateStreaks(sessions.map((s) => s.date)), [sessions]);
  const heatmapData = useMemo(() => generateHeatmapData(sessions), [sessions]);
  const pace = useMemo(() => getDailyPaceTarget(settings, sessions, yearStart, yearEnd), [settings, sessions, yearStart, yearEnd]);
  const weeklyConsistency = useMemo(() => getWeeklyConsistency(sessions, dailyGoal), [sessions, dailyGoal]);
  const momentum = useMemo(
    () => getMomentumBreakdown(sessions, topics, subtopics, tracks, settings, yearStart, yearEnd),
    [sessions, topics, subtopics, tracks, settings, yearStart, yearEnd]
  );
  const forecast = useMemo(
    () => getGoalForecast(sessions, topics, subtopics, tiered.stretch, yearStart, yearEnd),
    [sessions, topics, subtopics, tiered.stretch, yearStart, yearEnd]
  );
  const tierProgress = useMemo(
    () => getTieredGoalProgress(sessions, settings, yearStart, yearEnd, forecast.projectedHours),
    [sessions, settings, yearStart, yearEnd, forecast.projectedHours]
  );
  const reframeMessage = useMemo(
    () => getGoalReframeMessage(sessions, settings, yearStart, yearEnd, forecast.projectedHours),
    [sessions, settings, yearStart, yearEnd, forecast.projectedHours]
  );
  const insights = useMemo(
    () => generateInsights(tracks, modules, topics, subtopics, sessions, streaks.current, tiered.stretch, yearStart, yearEnd, settings, skipLogs),
    [tracks, modules, topics, subtopics, sessions, streaks, tiered.stretch, yearStart, yearEnd, settings, skipLogs]
  );
  const radarData = useMemo(() => getRadarData(tracks, modules, topics, subtopics, sessions), [tracks, modules, topics, subtopics, sessions]);
  const completed = useMemo(() => countCompletedItems(subtopics, modules, topics), [subtopics, modules, topics]);
  const daysRemaining = useMemo(() => getDaysRemainingInYear(yearEnd), [yearEnd]);
  const trackHealth = useMemo(() => getTrackBalance(tracks, sessions, settings), [tracks, sessions, settings]);

  const forecastChartData = useMemo(
    () => buildForecastChartData(sessions, yearStart, yearEnd),
    [sessions, yearStart, yearEnd]
  );

  const trackStats = useMemo(() => {
    const healthMap = new Map(trackHealth.map((h) => [h.trackId, h]));
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
      const nextUp = resolveNextUpItem(track, modules, topics, subtopics);
      const leetCodeStats = settings?.leetCodeStats;
      const leetCodeLabel = track.name === "LeetCode" && leetCodeStats
        ? `${leetCodeStats.easy}E · ${leetCodeStats.medium}M · ${leetCodeStats.hard}H`
        : undefined;
      return {
        track,
        progress: progress.percentage,
        hours,
        remaining,
        streak: trackStreak,
        currentFocus: focusTopic,
        health: healthMap.get(track.id),
        nextUp,
        nextUpHref: nextUp ? getNextUpHref(nextUp, track.id) : undefined,
        leetCodeLabel,
      };
    });
  }, [tracks, modules, subtopics, sessions, topics, trackHealth, settings]);

  const consistencyDelta = weeklyConsistency.daysOnTarget - weeklyConsistency.lastWeekDays;
  const consistencyDeltaLabel = consistencyDelta >= 0 ? `↑${consistencyDelta}` : `↓${Math.abs(consistencyDelta)}`;

  // Recommend acting on the most-neglected track that still has a "next up" item.
  const recommendedAction = useMemo(() => {
    const candidates = trackStats
      .filter((ts) => ts.nextUp && ts.nextUpHref)
      .sort((a, b) => (b.health?.daysSinceStudied ?? 0) - (a.health?.daysSinceStudied ?? 0));
    const pick = candidates[0];
    return pick?.nextUp && pick.nextUpHref
      ? { trackName: pick.track.name, label: pick.nextUp.label, href: pick.nextUpHref }
      : undefined;
  }, [trackStats]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Welcome to GoalTrack — your personal learning command center</p>
      </motion.div>

      {/* Row 0 — What to do right now */}
      <NextActionCard
        hoursLeftToday={pace.hoursLeftToday}
        onPace={pace.onPace}
        momentum={momentum}
        action={recommendedAction}
      />

      {/* Row 1 — Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Need today"
          value={`${pace.hoursNeededToday}h`}
          subtitle={`${pace.hoursLoggedToday}h done · ${pace.hoursLeftToday}h left`}
          icon={IconTargetArrow}
          valueColor={paceColor(pace.hoursNeededToday, pace.hoursLoggedToday)}
          delay={0}
        />
        <StatCard
          title="Today's Hours"
          value={`${todayHours.toFixed(1)}h`}
          subtitle={`${totalHours.toFixed(0)}h total invested`}
          icon={IconClock}
          gradient="linear-gradient(135deg, #8b5cf6, #3b82f6)"
          valueClassName="text-4xl sm:text-5xl"
          delay={0.05}
        />
        <StatCard
          title="Current Streak"
          value={`${streaks.current} days`}
          subtitle={`Best: ${streaks.longest} days`}
          icon={IconFlame}
          gradient="linear-gradient(135deg, #f59e0b, #ef4444)"
          delay={0.1}
        />
        <StatCard
          title="Weekly Consistency"
          value={`${weeklyConsistency.daysOnTarget}/${weeklyConsistency.totalDays}`}
          subtitle={`${consistencyDeltaLabel} vs last week`}
          icon={IconChartPie}
          delay={0.15}
        />
        <StatCard title="Longest Streak" value={`${streaks.longest} days`} subtitle={`${streaks.missedDays} missed days`} icon={IconBolt} delay={0.2} />
        <StatCard title="Days Remaining" value={daysRemaining} subtitle="Until Dec 2026" icon={IconCalendar} gradient="linear-gradient(135deg, #ec4899, #8b5cf6)" delay={0.25} />
      </div>

      {/* Row 2 — Growth Overview */}
      <Card>
        <CardHeader className="border-b border-white/[0.06] pb-2">
          <CardTitle className="flex items-center gap-2">
            <IconTrendingUp className="h-4 w-4 opacity-70" stroke={1.5} /> Growth Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
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
                <p className="metric-value text-3xl tabular-nums">{weeklyConsistency.daysOnTarget}/7</p>
                <p className="mt-1 text-xs text-muted-foreground">Days on Target</p>
              </div>
              <div className="text-center">
                <p className="metric-value text-3xl tabular-nums">{pace.weeksRemaining}</p>
                <p className="mt-1 text-xs text-muted-foreground">Weeks Left</p>
              </div>
            </div>
            <MomentumBreakdownPanel breakdown={momentum} />
          </div>
        </CardContent>
      </Card>

      {/* Row 3 — Track Overview */}
      <div>
        <SectionHeading icon={IconStack2}>Track Overview</SectionHeading>
        <div className="grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {trackStats.map((ts, i) => (
            <div key={ts.track.id} className="h-full">
              <TrackCard {...ts} delay={i * 0.05} />
            </div>
          ))}
        </div>
      </div>

      {/* Row 4 — Smart Insights */}
      <Card>
        <CardContent className="pt-6">
          <InsightsPanel insights={insights} />
        </CardContent>
      </Card>

      {/* Row 5 — Learning Activity */}
      <Card>
        <CardContent className="pt-6">
          <ActivityHeatmap data={heatmapData} />
        </CardContent>
      </Card>

      {/* Row 6 — Goal Forecasting */}
      <Card>
        <CardHeader className="border-b border-white/[0.06] pb-2">
          <CardTitle>
            Goal Forecasting{" "}
            <span className="text-xs font-normal text-muted-foreground/80">Jun – Dec 2026</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <TieredGoalPanel tiers={tierProgress} reframeMessage={reframeMessage} />
          <ForecastChart
            data={forecastChartData}
            tierGoals={[
              { value: tiered.minimum, label: "Min", color: "#34d399" },
              { value: tiered.target, label: "Target", color: "#a78bfa" },
              { value: tiered.stretch, label: "Stretch", color: "#38bdf8" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Row 7 — Growth Radar */}
      <Card>
        <CardHeader className="border-b border-white/[0.06] pb-2">
          <CardTitle>Growth Radar</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <GrowthRadarChart data={radarData} />
        </CardContent>
      </Card>
    </div>
  );
}
