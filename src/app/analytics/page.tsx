"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useTracks, useAllSubtopics, useAllTopics, useSessions,
} from "@/hooks/use-data";
import {
  getHoursByPeriod, withPercentages, getHoursByTrack, getFocusHeatmap,
  getTopTopics, getLearningVelocity, getEfficiencyScores, getCompletionTrends,
} from "@/lib/analytics";
import { formatHours } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalyticsPage() {
  const tracks = useTracks();
  const subtopics = useAllSubtopics();
  const topics = useAllTopics();
  const sessions = useSessions();

  const distribution = useMemo(() => withPercentages(getHoursByTrack(sessions, tracks)), [sessions, tracks]);
  const dailyHours = useMemo(() => getHoursByPeriod(sessions, 30), [sessions]);
  const weeklyHours = useMemo(() => getHoursByPeriod(sessions, 12 * 7).filter((_, i) => i % 7 === 0), [sessions]);
  const heatmap = useMemo(() => getFocusHeatmap(sessions), [sessions]);
  const topTopics = useMemo(() => getTopTopics(sessions, topics), [sessions, topics]);
  const velocity = useMemo(() => getLearningVelocity(subtopics, sessions), [subtopics, sessions]);
  const efficiency = useMemo(() => getEfficiencyScores(tracks, topics, subtopics, sessions), [tracks, topics, subtopics, sessions]);
  const trends = useMemo(() => getCompletionTrends(sessions, subtopics, 12), [sessions, subtopics]);

  const maxHeat = Math.max(...heatmap.flat(), 1);
  const peakInsight = useMemo(() => {
    let maxVal = 0, maxDay = 0, maxHour = 0;
    heatmap.forEach((row, d) => row.forEach((v, h) => { if (v > maxVal) { maxVal = v; maxDay = d; maxHour = h; } }));
    if (maxVal === 0) return "No focus data yet. Start tracking to discover your peak hours.";
    return `Peak focus: ${DAYS[maxDay]}s at ${maxHour}:00–${maxHour + 1}:00`;
  }, [heatmap]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" /> Analytics
        </h1>
        <p className="text-muted-foreground mt-1">Deep insights into your learning patterns</p>
      </div>

      {/* Time Investment */}
      <Card>
        <CardHeader><CardTitle>Time Investment</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">Daily (30d)</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <ResponsiveContainer width="100%" height={250}>
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
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="hours" stroke="#8b5cf6" fill="url(#hoursGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="weekly">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                  <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Distribution */}
        <Card>
          <CardHeader><CardTitle>Time Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {distribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
                  formatter={(value: number) => formatHours(value)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {distribution.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="flex-1 truncate">{d.name}</span>
                  <span className="text-muted-foreground">{d.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Focus Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Focus Heatmap</CardTitle>
            <p className="text-xs text-muted-foreground">{peakInsight}</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `40px repeat(24, 1fr)` }}>
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="text-[8px] text-muted-foreground text-center">{h}</div>
                ))}
                {DAYS.map((day, di) => (
                  <>
                    <div key={`label-${di}`} className="text-[10px] text-muted-foreground pr-2 text-right">{day}</div>
                    {heatmap[di].map((val, hi) => (
                      <div
                        key={`${di}-${hi}`}
                        className="w-4 h-4 rounded-sm"
                        style={{ background: val > 0 ? `rgba(139, 92, 246, ${0.15 + (val / maxHeat) * 0.85})` : "#27272a" }}
                        title={`${day} ${hi}:00 — ${(val / 3600000).toFixed(1)}h`}
                      />
                    ))}
                  </>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Topics + Velocity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Most Studied Topics</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">No topic data yet.</p>
            ) : topTopics.map((t, i) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.name}</p>
                  <div className="h-1.5 bg-secondary rounded-full mt-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(t.hours / (topTopics[0]?.hours || 1)) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-mono">{t.hours.toFixed(0)}h</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Learning Velocity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 glass rounded-lg">
              <p className="text-3xl font-bold">{velocity.topicsPerWeek}</p>
              <p className="text-xs text-muted-foreground">Topics / Week</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <p className="text-3xl font-bold">{velocity.modulesPerMonth}</p>
              <p className="text-xs text-muted-foreground">Modules / Month</p>
            </div>
            <div className="text-center p-4 glass rounded-lg">
              <p className="text-3xl font-bold">{velocity.hoursPerWeek.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">Hours / Week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Efficiency (ROI)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {efficiency.map((e) => (
              <div key={e.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                <span className="text-sm flex-1 truncate">{e.name}</span>
                <span className="text-xs text-muted-foreground">{e.progress}% / {e.hours.toFixed(0)}h</span>
                <span className="text-sm font-mono font-bold">{e.efficiency.toFixed(1)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Completion Trends */}
      <Card>
        <CardHeader><CardTitle>Completion Trends</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="week" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
              <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Hours" />
              <Line yAxisId="right" type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={false} name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
