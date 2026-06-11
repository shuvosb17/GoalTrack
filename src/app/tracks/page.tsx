"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { HierarchyTree } from "@/components/tracks/hierarchy-tree";
import { TrackEstimationPanel } from "@/components/tracks/track-estimation-panel";
import { useTracks, useAllModules, useAllTopics, useAllSubtopics } from "@/hooks/use-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

function TracksContent() {
  const searchParams = useSearchParams();
  const initialTrack = searchParams.get("track") || undefined;
  const [selectedTrack, setSelectedTrack] = useState<string | undefined>(initialTrack);

  const tracks = useTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const subtopics = useAllSubtopics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:gap-3 sm:text-3xl">
          <BookOpen className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" /> Learning Tracks
        </h1>
        <p className="text-muted-foreground mt-1">Manage your hierarchical learning structure</p>
      </div>

      <Tabs value={selectedTrack || "all"} onValueChange={(v) => setSelectedTrack(v === "all" ? undefined : v)}>
        <TabsList className="h-auto w-full max-w-full flex-wrap justify-start gap-1 overflow-x-auto">
          <TabsTrigger value="all">All Tracks</TabsTrigger>
          {tracks.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>{t.icon} {t.name}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <HierarchyTree
        tracks={tracks}
        modules={modules.filter((m) => !m.archived)}
        topics={topics.filter((t) => !t.archived)}
        subtopics={subtopics}
        selectedTrackId={selectedTrack}
      />

      <TrackEstimationPanel filterTrackId={selectedTrack} />
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
