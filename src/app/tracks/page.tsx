"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, BookmarkCheck } from "lucide-react";
import { HierarchyTree } from "@/components/tracks/hierarchy-tree";
import { TrackEstimationPanel } from "@/components/tracks/track-estimation-panel";
import { LeetCodeWorkspace } from "@/components/tracks/leetcode-workspace";
import { useTracks, useAllModules, useAllTopics, useAllSubtopics } from "@/hooks/use-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { buildReviewDueSnapshot } from "@/lib/revision-catalog";
import { useReviewStore } from "@/stores/review-store";

function TracksContent() {
  const searchParams = useSearchParams();
  const initialTrack = searchParams.get("track") || undefined;
  const [selectedTrack, setSelectedTrack] = useState<string | undefined>(initialTrack);

  const tracks = useTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const subtopics = useAllSubtopics();

  const reviewSnapshot = useMemo(
    () => buildReviewDueSnapshot(tracks, modules, topics, subtopics),
    [tracks, modules, topics, subtopics]
  );
  const reviewDueCount = reviewSnapshot.dueCount;

  const leetcodeTrack = useMemo(() => tracks.find((t) => t.name === "LeetCode"), [tracks]);
  const isLeetcodeView = leetcodeTrack != null && selectedTrack === leetcodeTrack.id;

  const hierarchyTracks = useMemo(() => {
    if (selectedTrack) return tracks.filter((t) => t.id === selectedTrack);
    return tracks;
  }, [tracks, selectedTrack]);

  useEffect(() => {
    useReviewStore
      .getState()
      .reconcileReviewQueue(reviewSnapshot.catalog, reviewSnapshot.dueItems);
  }, [reviewSnapshot]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:gap-3 sm:text-3xl">
          <BookOpen className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" /> Learning Tracks
        </h1>
        <p className="text-muted-foreground mt-1">Manage your hierarchical learning structure</p>
      </div>

      {reviewDueCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-[0.5px] border-violet-500/25 bg-violet-500/[0.06] px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <BookmarkCheck className="h-4 w-4 text-violet-400" />
            <span>
              <span className="font-medium text-violet-200">{reviewDueCount} item{reviewDueCount === 1 ? "" : "s"}</span>
              <span className="text-muted-foreground"> due for spaced review — open Review on Status</span>
            </span>
          </div>
          <Link href="/status?tab=review">
            <Button size="sm" variant="outline" className="h-8 border-violet-500/30 text-xs">
              Open Review
            </Button>
          </Link>
        </div>
      )}

      <Tabs value={selectedTrack || "all"} onValueChange={(v) => setSelectedTrack(v === "all" ? undefined : v)}>
        <TabsList className="h-auto w-full max-w-full flex-wrap justify-start gap-1 overflow-x-auto">
          <TabsTrigger value="all">All Tracks</TabsTrigger>
          {tracks.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>{t.icon} {t.name}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {hierarchyTracks.length > 0 && (
        <HierarchyTree
          tracks={hierarchyTracks}
          modules={modules}
          topics={topics}
          subtopics={subtopics}
          selectedTrackId={selectedTrack}
        />
      )}

      <TrackEstimationPanel filterTrackId={selectedTrack} />

      {isLeetcodeView && leetcodeTrack && (
        <LeetCodeWorkspace leetcodeTrackId={leetcodeTrack.id} />
      )}
    </div>
  );
}

export default function TracksPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 glass-card rounded-xl" />}>
      <TracksContent />
    </Suspense>
  );
}
