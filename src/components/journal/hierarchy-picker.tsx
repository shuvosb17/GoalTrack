"use client";

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Track, Module, Topic, Subtopic, JournalEntry, LearningSession } from "@/lib/types";

export interface JournalHierarchy {
  trackId: string;
  moduleId: string;
  topicId: string;
  subtopicId: string;
}

interface HierarchyPickerProps {
  value: JournalHierarchy;
  onChange: (value: JournalHierarchy) => void;
  tracks: Track[];
  modules: Module[];
  topics: Topic[];
  subtopics: Subtopic[];
}

function byOrder<T extends { order: number; name: string }>(a: T, b: T) {
  return a.order - b.order || a.name.localeCompare(b.name);
}

export function HierarchyPicker({ value, onChange, tracks, modules, topics, subtopics }: HierarchyPickerProps) {
  const trackModules = modules
    .filter((m) => m.trackId === value.trackId && !m.archived)
    .sort(byOrder);
  const moduleTopics = topics
    .filter((t) => t.moduleId === value.moduleId && !t.archived)
    .sort(byOrder);
  const topicSubs = subtopics
    .filter((s) => s.topicId === value.topicId && !s.archived)
    .sort(byOrder);
  const sortedTracks = [...tracks].sort(byOrder);

  const update = (patch: Partial<JournalHierarchy>) => {
    const next = { ...value, ...patch };
    if (patch.trackId !== undefined) {
      next.moduleId = "";
      next.topicId = "";
      next.subtopicId = "";
    }
    if (patch.moduleId !== undefined) {
      next.topicId = "";
      next.subtopicId = "";
    }
    if (patch.topicId !== undefined) {
      next.subtopicId = "";
    }
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Track</label>
        <Select value={value.trackId || "none"} onValueChange={(v) => update({ trackId: v === "none" ? "" : v })}>
          <SelectTrigger><SelectValue placeholder="Select track" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No track</SelectItem>
            {sortedTracks.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.icon} {t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Module</label>
        <Select
          value={value.moduleId || "none"}
          onValueChange={(v) => update({ moduleId: v === "none" ? "" : v })}
          disabled={!value.trackId}
        >
          <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No module</SelectItem>
            {trackModules.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Topic</label>
        <Select
          value={value.topicId || "none"}
          onValueChange={(v) => update({ topicId: v === "none" ? "" : v })}
          disabled={!value.moduleId}
        >
          <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No topic</SelectItem>
            {moduleTopics.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Subtopic</label>
        <Select
          value={value.subtopicId || "none"}
          onValueChange={(v) => update({ subtopicId: v === "none" ? "" : v })}
          disabled={!value.topicId}
        >
          <SelectTrigger><SelectValue placeholder="Select subtopic" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No subtopic</SelectItem>
            {topicSubs.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function getHierarchyPath(
  entry: Pick<JournalEntry, "trackId" | "moduleId" | "topicId" | "subtopicId">,
  tracks: Track[],
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[]
): { label: string; track?: Track } | null {
  if (!entry.trackId) return null;
  const track = tracks.find((t) => t.id === entry.trackId);
  const mod = entry.moduleId ? modules.find((m) => m.id === entry.moduleId) : undefined;
  const topic = entry.topicId ? topics.find((t) => t.id === entry.topicId) : undefined;
  const sub = entry.subtopicId ? subtopics.find((s) => s.id === entry.subtopicId) : undefined;
  const parts = [track?.name, mod?.name, topic?.name, sub?.name].filter(Boolean);
  if (parts.length === 0) return null;
  return { label: parts.join(" → "), track };
}

export function matchSessionsForJournal(
  sessions: LearningSession[],
  date: string,
  hierarchy: JournalHierarchy
) {
  return sessions.filter((s) => {
    if (s.date !== date) return false;
    if (hierarchy.subtopicId) return s.subtopicId === hierarchy.subtopicId;
    if (hierarchy.topicId) return s.topicId === hierarchy.topicId;
    if (hierarchy.moduleId) return s.moduleId === hierarchy.moduleId;
    if (hierarchy.trackId) return s.trackId === hierarchy.trackId;
    return true;
  });
}
