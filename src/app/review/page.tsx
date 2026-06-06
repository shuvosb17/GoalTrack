"use client";

import { useMemo, useRef } from "react";
import { format, parseISO, getMonth, getWeek } from "date-fns";
import { FileText, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useTracks, useAllSubtopics, useAllModules, useAllTopics, useSessions, useSettings,
} from "@/hooks/use-data";
import {
  getTotalHours, countCompletedItems, getTopTopics, withPercentages, getHoursByTrack,
} from "@/lib/analytics";
import { calculateStreaks } from "@/lib/utils";
import { generateInsights } from "@/lib/analytics";

export default function AnnualReviewPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const tracks = useTracks();
  const subtopics = useAllSubtopics();
  const modules = useAllModules();
  const topics = useAllTopics();
  const sessions = useSessions();
  const settings = useSettings();
  const year = new Date().getFullYear();

  const report = useMemo(() => {
    const totalHours = getTotalHours(sessions) / 3600000;
    const totalSessions = sessions.length;
    const avgSession = totalSessions > 0 ? totalHours / totalSessions : 0;
    const completed = countCompletedItems(subtopics, modules, topics);
    const streaks = calculateStreaks(sessions.map((s) => s.date));
    const distribution = withPercentages(getHoursByTrack(sessions, tracks));
    const topTrack = distribution.sort((a, b) => b.value - a.value)[0];
    const topTopics = getTopTopics(sessions, topics, 5);
    const insights = generateInsights(tracks, modules, topics, subtopics, sessions, streaks.current, settings?.yearlyHourGoal ?? 1000);

    const monthlyHours = Array.from({ length: 12 }, (_, m) => {
      const monthSessions = sessions.filter((s) => getMonth(parseISO(s.date)) === m);
      return { month: format(new Date(year, m, 1), "MMMM"), hours: monthSessions.reduce((sum, s) => sum + s.duration, 0) / 3600000 };
    });
    const bestMonth = monthlyHours.sort((a, b) => b.hours - a.hours)[0];

    const weeklyHours = new Map<number, number>();
    sessions.forEach((s) => {
      const week = getWeek(parseISO(s.date));
      weeklyHours.set(week, (weeklyHours.get(week) || 0) + s.duration);
    });
    const bestWeekEntry = [...weeklyHours.entries()].sort((a, b) => b[1] - a[1])[0];

    return {
      totalHours, totalSessions, avgSession, completed, streaks, topTrack, topTopics,
      bestMonth, bestWeekHours: (bestWeekEntry?.[1] || 0) / 3600000, insights, monthlyHours,
    };
  }, [sessions, subtopics, modules, topics, tracks, settings, year]);

  const handleExport = () => {
    const data = {
      year,
      generatedAt: new Date().toISOString(),
      ...report,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `growth-os-review-${year}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const narrative = [
    `In ${year}, you invested ${report.totalHours.toFixed(0)} hours across ${report.totalSessions} learning sessions.`,
    report.topTrack ? `Your primary focus was ${report.topTrack.name}, accounting for ${report.topTrack.percentage}% of your study time.` : "",
    `You completed ${report.completed.completedSubtopics} subtopics, ${report.completed.completedTopics} topics, and ${report.completed.completedModules} modules.`,
    report.streaks.longest > 0 ? `Your longest learning streak reached ${report.streaks.longest} consecutive days — a testament to your consistency.` : "",
    report.bestMonth ? `Your most productive month was ${report.bestMonth.month} with ${report.bestMonth.hours.toFixed(0)} hours of focused learning.` : "",
    report.topTopics[0] ? `You spent the most time mastering ${report.topTopics[0].name} (${report.topTopics[0].hours.toFixed(0)} hours).` : "",
    "Keep pushing forward — every hour invested compounds into expertise.",
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" /> Annual Review {year}
          </h1>
          <p className="text-muted-foreground mt-1">Your year in learning</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4" /> Export</Button>
          <Button variant="outline" onClick={() => navigator.share?.({ title: `Growth OS ${year} Review`, text: narrative.join(" ") })}><Share2 className="h-4 w-4" /> Share</Button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-6">
        <Card className="gradient-border">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              {year} Learning Report
            </h2>
            <p className="text-muted-foreground mt-2">Personal Growth Operating System</p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{report.totalHours.toFixed(0)}h</p><p className="text-xs text-muted-foreground">Total Hours</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{report.totalSessions}</p><p className="text-xs text-muted-foreground">Sessions</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{(report.avgSession * 60).toFixed(0)}m</p><p className="text-xs text-muted-foreground">Avg Session</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{report.streaks.longest}</p><p className="text-xs text-muted-foreground">Longest Streak</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Your Story</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {narrative.map((line, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">{line}</p>
            ))}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Highlights</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Topics Completed</span><span className="font-medium">{report.completed.completedTopics}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Modules Completed</span><span className="font-medium">{report.completed.completedModules}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Best Month</span><span className="font-medium">{report.bestMonth?.month || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Best Week</span><span className="font-medium">{report.bestWeekHours.toFixed(0)}h</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Top Track</span><span className="font-medium">{report.topTrack?.name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Top Topic</span><span className="font-medium">{report.topTopics[0]?.name || "—"}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Monthly Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {report.monthlyHours.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">{m.month.slice(0, 3)}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(m.hours / (report.bestMonth?.hours || 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs font-mono w-10 text-right">{m.hours.toFixed(0)}h</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Key Insights</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {report.insights.map((insight) => (
              <div key={insight.id} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="shrink-0 capitalize">{insight.type}</Badge>
                <p>{insight.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
