"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, Loader2, Sparkles, Circle,
  BookmarkCheck,
} from "lucide-react";
import { IconActivity } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useTracks, useAllModules, useAllTopics, useAllSubtopics, useGoalMilestones,
} from "@/hooks/use-data";
import {
  getStatusTimeline, getGlobalStatusCounts, getUrgencyAlerts,
  ALL_STATUSES,
} from "@/lib/status";
import { cn, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import type { ProgressStatus } from "@/lib/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusSummaryHeader } from "@/components/status/status-summary-header";
import { StatusTimelineCard } from "@/components/status/status-timeline-card";
import { countStatusActivitySince } from "@/lib/status-summary";
import { updateTopicStatus, updateSubtopicStatus } from "@/lib/crud";
import { buildReviewDueSnapshot } from "@/lib/revision-catalog";
import { NeedsAttentionPanel } from "@/components/status/needs-attention-panel";
import { ReviewSessionPanel } from "@/components/status/review-session-panel";
import { TopicConfidenceDialog } from "@/components/tracks/topic-confidence-dialog";

const STATUS_ICONS: Record<ProgressStatus, typeof Circle> = {
  not_started: Circle,
  in_progress: Loader2,
  completed: CheckCircle2,
  mastered: Sparkles,
};

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
  const statusActivityThisWeek = useMemo(
    () => countStatusActivitySince(topics, subtopics, modules, tracks, 7),
    [topics, subtopics, modules, tracks]
  );
  const alerts = useMemo(
    () => getUrgencyAlerts(topics, subtopics, modules, tracks),
    [topics, subtopics, modules, tracks]
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
      <StatusSummaryHeader
        counts={globalCounts}
        statusFilter={statusFilter}
        onStatusFilter={(status) => setStatusFilter(status)}
        statusActivityThisWeek={statusActivityThisWeek}
      />

      <NeedsAttentionPanel
        alerts={alerts}
        topics={topics}
        modules={modules}
        subtopics={subtopics}
        criticalCount={criticalCount}
      />

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
