"use client";

import { useMemo, useRef } from "react";
import { Download, Share2 } from "lucide-react";
import { IconReportAnalytics, IconBulb } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  useTracks, useAllSubtopics, useAllModules, useAllTopics, useSessions, useSettings,
} from "@/hooks/use-data";
import { buildAnnualReport, buildReviewNarrative } from "@/lib/review";

export default function AnnualReviewPage() {
  const reportRef = useRef<HTMLDivElement>(null);
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
  const maxMonthHours = Math.max(...report.monthlyHours.map((m) => m.hours), 1);

  const handleExport = () => {
    const data = {
      window: report.window,
      generatedAt: new Date().toISOString(),
      totalHours: report.totalHours,
      totalSessions: report.totalSessions,
      completed: report.completed,
      streaks: report.streaks,
      monthlyHours: report.monthlyHours,
      topTrack: report.topTrack,
      topTopics: report.topTopics,
      insights: report.insights,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goaltrack-review-${report.window.yearStart}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-medium tracking-tight sm:text-3xl">
            <IconReportAnalytics className="h-7 w-7 text-primary" stroke={1.5} /> Annual Review
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{report.window.label}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 border-[0.5px] border-white/[0.08]">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-[0.5px] border-white/[0.08]"
            onClick={() => navigator.share?.({ title: `GoalTrack Review`, text: narrative.join(" ") })}
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Total hours", value: `${report.totalHours.toFixed(0)}h` },
            { label: "Sessions", value: report.totalSessions },
            { label: "Avg session", value: `${(report.avgSession * 60).toFixed(0)}m` },
            { label: "Longest streak", value: `${report.streaks.longest}d` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-3 sm:p-4 text-center">
              <p className="metric-value text-2xl tabular-nums sm:text-3xl">{item.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <Card className="border-[0.5px] border-white/[0.08]">
          <CardContent className="pt-6">
            <SectionHeading>Your story</SectionHeading>
            <div className="space-y-3">
              {narrative.map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-[0.5px] border-white/[0.08]">
            <CardContent className="pt-6">
              <SectionHeading>Highlights</SectionHeading>
              <div className="space-y-3 text-sm">
                {[
                  ["Topics completed", report.completed.completedTopics],
                  ["Modules completed", report.completed.completedModules],
                  ["Best month", report.bestMonth?.month ?? "—"],
                  ["Best week", `${report.bestWeekHours.toFixed(0)}h`],
                  ["Top track", report.topTrack?.name ?? "—"],
                  ["Top topic", report.topTopics[0]?.name ?? "—"],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[0.5px] border-white/[0.08]">
            <CardContent className="pt-6">
              <SectionHeading>Monthly breakdown</SectionHeading>
              <div className="space-y-2">
                {report.monthlyHours.map((m) => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="w-24 truncate text-[10px] text-muted-foreground">{m.month.replace(/ \d{4}$/, "")}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-violet-500/80"
                        style={{ width: `${(m.hours / maxMonthHours) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-[10px] tabular-nums">{m.hours.toFixed(0)}h</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {report.insights.length > 0 && (
          <Card className="border-[0.5px] border-white/[0.08]">
            <CardContent className="pt-6">
              <SectionHeading icon={IconBulb}>Key insights</SectionHeading>
              <div className="space-y-2">
                {report.insights.map((insight) => (
                  <div key={insight.id} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="shrink-0 capitalize text-[10px]">{insight.type}</Badge>
                    <p className="text-muted-foreground">{insight.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
