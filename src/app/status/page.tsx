"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, Loader2, Sparkles, Circle,
  ChevronRight, BookmarkCheck,
} from "lucide-react";
import { IconActivity, IconAlertTriangle, IconCalendarEvent } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  useTracks, useAllModules, useAllTopics, useAllSubtopics, useGoalMilestones,
} from "@/hooks/use-data";
import {
  getStatusTimeline, getGlobalStatusCounts, getUrgencyAlerts,
  getTodaySnapshot, ALL_STATUSES,
} from "@/lib/status";
import { cn, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import type { ProgressStatus } from "@/lib/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusTimelineCard } from "@/components/status/status-timeline-card";
import { updateTopicStatus, updateSubtopicStatus } from "@/lib/crud";
import { buildReviewDueSnapshot } from "@/lib/revision-catalog";
import { ReviewSessionPanel } from "@/components/status/review-session-panel";
import { TopicConfidenceDialog } from "@/components/tracks/topic-confidence-dialog";

const STATUS_ICONS: Record<ProgressStatus, typeof Circle> = {
  not_started: Circle,
  in_progress: Loader2,
  completed: CheckCircle2,
  mastered: Sparkles,
};

const PULSE_STATUSES: ProgressStatus[] = ["in_progress", "completed", "mastered"];

const ALERT_STYLES = {
  critical: { bar: "#ef4444", bg: "bg-red-500/[0.06]", border: "border-red-500/20", text: "text-red-400" },
  warning: { bar: "#f59e0b", bg: "bg-amber-500/[0.06]", border: "border-amber-500/20", text: "text-amber-400" },
  info: { bar: "#3b82f6", bg: "bg-blue-500/[0.06]", border: "border-blue-500/20", text: "text-blue-400" },
} as const;

type Filter = ProgressStatus | "all" | "review";

function StatusChip({
  status,
  count,
  compact,
}: {
  status: ProgressStatus;
  count: number;
  compact?: boolean;
}) {
  const Icon = STATUS_ICONS[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border-[0.5px] border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium"
      style={{ color: STATUS_COLORS[status] }}
    >
      <Icon className={cn("shrink-0", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
      {count}
      {!compact && <span className="opacity-70">{STATUS_LABELS[status]}</span>}
    </span>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 glass-card rounded-xl" />}>
      <StatusContent />
    </Suspense>
  );
}

function StatusContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const tracks = useTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const subtopics = useAllSubtopics();
  const goalMilestones = useGoalMilestones();
  const [statusFilter, setStatusFilter] = useState<Filter>(initialTab === "review" ? "review" : "all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [reviewDialog, setReviewDialog] = useState<{ id: string; name: string } | null>(null);

  const globalCounts = useMemo(() => getGlobalStatusCounts(topics, subtopics), [topics, subtopics]);
  const alerts = useMemo(
    () => getUrgencyAlerts(topics, subtopics, modules, tracks),
    [topics, subtopics, modules, tracks]
  );

  const pulseTotal = useMemo(
    () => PULSE_STATUSES.reduce((sum, s) => sum + globalCounts[s], 0),
    [globalCounts]
  );

  const timeline = useMemo(() => {
    let days = getStatusTimeline(topics, subtopics, modules, tracks, statusFilter === "review" ? "all" : statusFilter);
    if (trackFilter !== "all") {
      days = days
        .map((day) => ({
          ...day,
          topics: day.topics.filter((t) => t.trackId === trackFilter),
          counts: (() => {
            const c = { not_started: 0, in_progress: 0, completed: 0, mastered: 0 };
            day.topics.filter((t) => t.trackId === trackFilter).forEach((e) => c[e.displayStatus]++);
            return c;
          })(),
        }))
        .filter((day) => day.topics.length > 0);
    }
    return days;
  }, [topics, subtopics, modules, tracks, statusFilter, trackFilter]);

  const todaySnap = useMemo(
    () => getTodaySnapshot(getStatusTimeline(topics, subtopics, modules, tracks, "all")),
    [topics, subtopics, modules, tracks]
  );

  const reviewSnapshot = useMemo(
    () => buildReviewDueSnapshot(tracks, modules, topics, subtopics),
    [tracks, modules, topics, subtopics]
  );
  const reviewCount = reviewSnapshot.dueCount;
  const criticalCount = alerts.filter((a) => a.level === "critical").length;

  const handleEntryStatusChange = (
    entry: { focalSubtopic?: { id: string; dueDate?: string }; topic: { id: string } },
    next: ProgressStatus
  ) => {
    if (entry.focalSubtopic) {
      updateSubtopicStatus(entry.focalSubtopic.id, next, entry.focalSubtopic.dueDate);
    } else {
      updateTopicStatus(entry.topic.id, next);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header + Status Pulse */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-medium tracking-tight sm:text-3xl">
              <IconActivity className="h-7 w-7 text-primary" stroke={1.5} /> Status
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your learning status organized by date — track every milestone
            </p>
          </div>
          <Link href="/tracks">
            <Button variant="outline" className="border-[0.5px] border-white/[0.08]">Update in Tracks</Button>
          </Link>
        </div>

        <Card className="border-[0.5px] border-white/[0.08] overflow-hidden">
          <CardContent className="pt-6 pb-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status pulse</p>
              {todaySnap && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <IconCalendarEvent className="h-3.5 w-3.5 text-violet-400/80" stroke={1.5} />
                  <span className="text-[11px] text-muted-foreground">Today:</span>
                  {ALL_STATUSES.filter((s) => todaySnap.counts[s] > 0).map((s) => (
                    <StatusChip key={s} status={s} count={todaySnap.counts[s]} compact />
                  ))}
                </div>
              )}
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-white/[0.04]">
              {PULSE_STATUSES.map((status) => {
                const count = globalCounts[status];
                const pct = pulseTotal > 0 ? (count / pulseTotal) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={status}
                    className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                    style={{ width: `${pct}%`, background: STATUS_COLORS[status] }}
                    title={`${STATUS_LABELS[status]}: ${count}`}
                  />
                );
              })}
              {pulseTotal === 0 && (
                <div className="h-full w-full rounded-full bg-zinc-700/40" />
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {PULSE_STATUSES.map((status) => (
                <span key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                  {STATUS_LABELS[status]}
                  <span className="metric-value tabular-nums text-foreground">{globalCounts[status]}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status overview tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {ALL_STATUSES.map((status) => {
          const Icon = STATUS_ICONS[status];
          const count = globalCounts[status];
          const active = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(active ? "all" : status)}
              className={cn(
                "relative overflow-hidden rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-4 text-left transition-all hover:bg-white/[0.04]",
                active && "ring-1 ring-primary/40 bg-white/[0.04]"
              )}
            >
              <div
                className="absolute inset-x-0 top-0 h-0.5"
                style={{ background: STATUS_COLORS[status] }}
              />
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4" style={{ color: STATUS_COLORS[status] }} />
                <span className="metric-value text-2xl tabular-nums sm:text-3xl">{count}</span>
              </div>
              <p className="mt-2 text-[11px] font-medium text-muted-foreground">{STATUS_LABELS[status]}</p>
            </button>
          );
        })}
      </div>

      {/* Needs attention */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-[0.5px] border-white/[0.08]">
              <CardContent className="pt-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <SectionHeading icon={IconAlertTriangle} className="mb-0 flex-1 border-0 pb-0">
                    Needs attention
                  </SectionHeading>
                  {criticalCount > 0 && (
                    <Badge variant="destructive" className="text-[10px]">{criticalCount} critical</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {alerts.slice(0, 6).map((alert, i) => {
                    const style = ALERT_STYLES[alert.level];
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link
                          href={`/tracks?track=${topics.find((t) => t.id === alert.topicId)?.trackId ?? ""}&topic=${alert.topicId}`}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border-[0.5px] p-3 text-sm transition-colors hover:bg-white/[0.04]",
                            style.bg,
                            style.border
                          )}
                        >
                          <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: style.bar }} />
                          <AlertTriangle className={cn("h-4 w-4 shrink-0", style.text)} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{alert.subtopicName ?? alert.topicName}</p>
                            <p className="text-xs text-muted-foreground">
                              {alert.subtopicName
                                ? `${alert.trackName} → ${alert.topicName} · ${alert.message}`
                                : `${alert.trackName} · ${alert.message}`}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as Filter)}>
          <TabsList className="h-9 border-[0.5px] border-white/[0.08] bg-white/[0.02]">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {ALL_STATUSES.filter((s) => s !== "not_started").map((s) => (
              <TabsTrigger key={s} value={s} className="text-xs">{STATUS_LABELS[s]}</TabsTrigger>
            ))}
            <TabsTrigger value="review" className="gap-1.5 text-xs">
              <BookmarkCheck className="h-3.5 w-3.5" />
              Review
              {reviewCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500/80 px-1 text-[9px] font-medium text-white">
                  {reviewCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {statusFilter !== "review" && (
        <Select value={trackFilter} onValueChange={setTrackFilter}>
          <SelectTrigger className="h-9 w-[180px] border-[0.5px] border-white/[0.08] bg-white/[0.02]">
            <SelectValue placeholder="All Tracks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tracks</SelectItem>
            {tracks.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.icon} {t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        )}
      </div>

      {/* Due for Review */}
      {statusFilter === "review" ? (
        <ReviewSessionPanel
          tracks={tracks}
          modules={modules}
          topics={topics}
          subtopics={subtopics}
        />
      ) : timeline.length === 0 ? (
        <Card className="border-[0.5px] border-dashed border-white/[0.08]">
          <CardContent className="py-16 text-center">
            <IconActivity className="mx-auto mb-4 h-12 w-12 text-muted-foreground/25" stroke={1.25} />
            <h3 className="text-lg font-medium">No status activity yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Update topic statuses in Tracks to build your timeline.</p>
            <Link href="/tracks"><Button className="mt-6">Go to Tracks</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="relative ml-3 space-y-8 pl-8">
          <div className="pointer-events-none absolute -left-px top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/60 via-violet-500/20 to-transparent" />

          {timeline.map((day, di) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: di * 0.05 }}
              className="relative"
            >
              <div className="absolute -left-[calc(2rem+0.3125rem)] top-7 h-2.5 w-2.5 rounded-full border-2 border-background bg-violet-500 shadow-md shadow-violet-500/40" />

              <div className="overflow-hidden rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3.5">
                  <h3 className="text-sm font-semibold">{day.label}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_STATUSES.map((status) =>
                      day.counts[status] > 0 ? (
                        <StatusChip key={status} status={status} count={day.counts[status]} />
                      ) : null
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 p-4">
                  {day.topics.map((entry) => (
                    <StatusTimelineCard
                      key={`${entry.topic.id}-${entry.focalSubtopic?.id ?? "topic"}`}
                      entry={entry}
                      goalMilestones={goalMilestones}
                      onReview={(id, name) => setReviewDialog({ id, name })}
                      onStatusChange={handleEntryStatusChange}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <TopicConfidenceDialog
        open={!!reviewDialog}
        onOpenChange={() => setReviewDialog(null)}
        entityId={reviewDialog?.id ?? null}
        entityName={reviewDialog?.name ?? ""}
        mode="review"
      />
    </div>
  );
}
