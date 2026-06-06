"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { HierarchyTree } from "@/components/tracks/hierarchy-tree";
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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" /> Learning Tracks
        </h1>
        <p className="text-muted-foreground mt-1">Manage your hierarchical learning structure</p>
      </div>

      <Tabs value={selectedTrack || "all"} onValueChange={(v) => setSelectedTrack(v === "all" ? undefined : v)}>
        <TabsList>
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
