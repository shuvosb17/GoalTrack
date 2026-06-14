"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookmarkCheck,
  LayoutGrid,
  ListMusic,
  Play,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Module, Subtopic, Topic, Track } from "@/lib/types";
import {
  buildRevisionCatalog,
  countCompletedByTrack,
  isRateableReviewItem,
} from "@/lib/revision-catalog";
import { ConfidenceDots, ConfidenceLegend } from "@/components/status/confidence-dots";
import { RevisionQuizDialog } from "@/components/status/revision-quiz-dialog";
import { TopicConfidenceDialog } from "@/components/tracks/topic-confidence-dialog";
import { useReviewStore } from "@/stores/review-store";
import { cn } from "@/lib/utils";

interface ReviewSessionPanelProps {
  tracks: Track[];
  modules: Module[];
  topics: Topic[];
  subtopics: Subtopic[];
}

export function ReviewSessionPanel({
  tracks,
  modules,
  topics,
  subtopics,
}: ReviewSessionPanelProps) {
  const catalog = useMemo(
    () => buildRevisionCatalog(tracks, modules, topics, subtopics),
    [tracks, modules, topics, subtopics]
  );

  const queue = useReviewStore((s) => s.queue);
  const progress = useReviewStore((s) => s.progress);
  const addToQueue = useReviewStore((s) => s.addToQueue);
  const removeFromQueue = useReviewStore((s) => s.removeFromQueue);
  const refreshQueueFromCatalog = useReviewStore((s) => s.refreshQueueFromCatalog);
  const startSession = useReviewStore((s) => s.startSession);

  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [quizOpen, setQuizOpen] = useState(false);
  const [resumedSession, setResumedSession] = useState(false);
  const [rateTarget, setRateTarget] = useState<{
    entityType: "topic" | "subtopic";
    entityId: string;
    name: string;
    parentTopicName?: string;
  } | null>(null);

  const sessionActive = progress !== null;
  const queueLocked = sessionActive;

  useEffect(() => {
    refreshQueueFromCatalog(catalog);
  }, [catalog, refreshQueueFromCatalog]);

  useEffect(() => {
    if (!resumedSession && sessionActive && queue.length > 0) {
      setQuizOpen(true);
      setResumedSession(true);
    }
  }, [resumedSession, sessionActive, queue.length]);

  const completedByTrack = useMemo(() => countCompletedByTrack(catalog), [catalog]);

  const tracksWithItems = useMemo(() => {
    return tracks
      .filter((t) => (completedByTrack.get(t.id) ?? 0) > 0)
      .sort((a, b) => a.order - b.order);
  }, [tracks, completedByTrack]);

  const selectedTrackId =
    activeTrackId && tracksWithItems.some((t) => t.id === activeTrackId)
      ? activeTrackId
      : tracksWithItems[0]?.id ?? null;

  const activeTrack = tracks.find((t) => t.id === selectedTrackId);

  const trackItems = useMemo(() => {
    if (!selectedTrackId) return [];
    const q = search.trim().toLowerCase();
    return catalog
      .filter((item) => item.trackId === selectedTrackId)
      .filter((item) => !q || item.name.toLowerCase().includes(q))
      .sort((a, b) => a.confidence - b.confidence || a.name.localeCompare(b.name));
  }, [catalog, selectedTrackId, search]);

  const queueIds = useMemo(() => new Set(queue.map((q) => q.id)), [queue]);

  const handleStartOrContinue = () => {
    if (sessionActive) {
      setQuizOpen(true);
    } else {
      startSession();
      setQuizOpen(true);
    }
  };

  const topicCountInTrack = selectedTrackId
    ? (completedByTrack.get(selectedTrackId) ?? 0)
    : 0;

  if (catalog.length === 0) {
    return (
      <Card className="border-[0.5px] border-dashed border-white/[0.08]">
        <CardContent className="py-16 text-center">
          <BookmarkCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground/25" />
          <h3 className="text-lg font-medium">No completed topics yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Finish topics in Tracks, rate your confidence, and they&apos;ll appear here for revision — lowest confidence first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-[0.5px] border-white/[0.08]">
        <CardContent className="pt-6 pb-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium tracking-tight">Review</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick completed topics you want to revise · low confidence items shown first
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.02] px-3 py-2">
              <div className="text-right">
                <p className="text-lg font-medium tabular-nums leading-none">{queue.length}</p>
                <p className="text-[10px] text-muted-foreground">in queue</p>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <ListMusic className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {sessionActive && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-500/25 bg-violet-500/[0.06] px-4 py-3">
              <p className="text-sm text-violet-200">
                Revision session in progress — queue saved until you rate retention
              </p>
              <Button size="sm" variant="secondary" onClick={() => setQuizOpen(true)}>
                Continue session
              </Button>
            </div>
          )}

          <div className="mb-6 flex flex-wrap gap-2">
            {tracksWithItems.map((track) => {
              const count = completedByTrack.get(track.id) ?? 0;
              const active = track.id === selectedTrackId;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => {
                    setActiveTrackId(track.id);
                    setSearch("");
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                    active
                      ? "border-white/[0.2] bg-white/[0.06] text-foreground"
                      : "border-white/[0.08] bg-transparent text-muted-foreground hover:border-white/[0.14] hover:text-foreground"
                  )}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: track.color }}
                  />
                  {track.name}
                  <span className="tabular-nums opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="min-w-0 rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.015] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {activeTrack?.name ?? "Track"}
                  <span className="font-normal text-muted-foreground"> · completed items</span>
                </p>
                <span className="text-xs text-muted-foreground">
                  {topicCountInTrack} item{topicCountInTrack === 1 ? "" : "s"}
                </span>
              </div>

              <ConfidenceLegend />

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search topics…"
                  className="h-9 border-white/[0.08] bg-white/[0.03] pl-9 text-sm"
                  disabled={queueLocked}
                />
              </div>

              <div className="mt-3 max-h-[420px] space-y-1.5 overflow-y-auto pr-0.5">
                {trackItems.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {search ? "No topics match your search." : "No completed topics in this track."}
                  </p>
                ) : (
                  trackItems.map((item) => {
                    const inQueue = queueIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={queueLocked ? -1 : 0}
                        onClick={() => !queueLocked && addToQueue(item)}
                        onKeyDown={(e) => {
                          if (queueLocked) return;
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            addToQueue(item);
                          }
                        }}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg border-[0.5px] border-transparent px-2.5 py-2.5 transition-all duration-200",
                          !queueLocked && "cursor-pointer hover:border-white/[0.08] hover:bg-white/[0.04]",
                          inQueue && "opacity-50",
                          queueLocked && "pointer-events-none opacity-40"
                        )}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-[0.5px] border-white/[0.08] bg-white/[0.03]">
                          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.kind === "subtopic" && item.parentTopicName
                              ? `${item.parentTopicName} · subtopic`
                              : item.kind}
                          </p>
                        </div>
                        <button
                          type="button"
                          title={isRateableReviewItem(item) ? "Rate confidence" : undefined}
                          disabled={!isRateableReviewItem(item) || queueLocked}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.kind === "subtopic" && item.subtopicId) {
                              setRateTarget({
                                entityType: "subtopic",
                                entityId: item.subtopicId,
                                name: item.name,
                                parentTopicName: item.parentTopicName,
                              });
                            } else if (item.kind === "topic" && item.topicId) {
                              setRateTarget({
                                entityType: "topic",
                                entityId: item.topicId,
                                name: item.name,
                              });
                            }
                          }}
                          className={cn(
                            "shrink-0 rounded p-0.5 transition-opacity",
                            isRateableReviewItem(item) && !queueLocked && "cursor-pointer hover:opacity-80"
                          )}
                        >
                          <ConfidenceDots confidence={item.confidence} />
                        </button>
                        <button
                          type="button"
                          disabled={inQueue || queueLocked}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToQueue(item);
                          }}
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-[0.5px] border-white/[0.1] bg-white/[0.03] text-muted-foreground transition-colors",
                            "hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-foreground",
                            "disabled:pointer-events-none disabled:opacity-40"
                          )}
                          aria-label={`Add ${item.name} to queue`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex min-h-[320px] flex-col rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.015] p-4 lg:min-h-0">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Review queue</p>
                <span className="text-xs text-muted-foreground">
                  {queue.length === 0 ? "empty" : `${queue.length} item${queue.length === 1 ? "" : "s"}`}
                </span>
              </div>

              {queue.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                  <ListMusic className="mb-4 h-12 w-12 text-muted-foreground/20" />
                  <p className="max-w-[240px] text-sm text-muted-foreground">
                    Add topics from any track to build your review session
                  </p>
                </div>
              ) : (
                <div className="mb-4 max-h-[340px] flex-1 space-y-2 overflow-y-auto pr-0.5">
                  {queue.map((item, i) => (
                    <div
                      key={`${item.id}-${i}`}
                      className="flex items-center gap-3 rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.02] px-3 py-2.5"
                    >
                      <span className="w-4 shrink-0 text-center text-[11px] tabular-nums text-muted-foreground">
                        {i + 1}
                      </span>
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: item.trackColor }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.kind === "subtopic" && item.parentTopicName
                            ? `${item.trackName} · ${item.parentTopicName}`
                            : `${item.trackName} · ${item.kind}`}
                        </p>
                      </div>
                      <ConfidenceDots confidence={item.confidence} />
                      {!queueLocked && (
                        <button
                          type="button"
                          onClick={() => removeFromQueue(item.id)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                          aria-label={`Remove ${item.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button
                className="mt-auto w-full gap-2"
                disabled={queue.length === 0}
                onClick={handleStartOrContinue}
              >
                <Play className="h-4 w-4" />
                {sessionActive ? "Continue revision session" : "Start revision session"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RevisionQuizDialog open={quizOpen} onOpenChange={setQuizOpen} />

      <TopicConfidenceDialog
        open={!!rateTarget}
        onOpenChange={(open) => {
          if (!open) setRateTarget(null);
        }}
        entityType={rateTarget?.entityType ?? "topic"}
        entityId={rateTarget?.entityId ?? null}
        entityName={rateTarget?.name ?? ""}
        parentTopicName={rateTarget?.parentTopicName}
        mode="complete"
      />
    </>
  );
}
