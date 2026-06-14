import type { LearningSession, Module, Subtopic, Topic, Track } from "./types";

export type StudyAttributionLevel = "topic" | "module" | "track";

export interface SessionStudyAttribution {
  level: StudyAttributionLevel;
  id: string;
  name: string;
  trackId: string;
}

export interface TopStudyItem {
  id: string;
  name: string;
  hours: number;
  trackId: string;
  trackColor: string;
  trackName: string;
  trackIcon: string;
  level: StudyAttributionLevel;
}

function topicFromSession(
  session: LearningSession,
  subtopics: Subtopic[],
  topicById: Map<string, Topic>
): Topic | undefined {
  if (session.subtopicId) {
    const sub = subtopics.find((s) => s.id === session.subtopicId);
    if (sub) return topicById.get(sub.topicId);
  }
  if (session.topicId) return topicById.get(session.topicId);
  return undefined;
}

/** Resolve where a session's hours belong — status and completion do not affect this. */
export function getSessionStudyAttribution(
  session: LearningSession,
  topics: Topic[],
  modules: Module[],
  tracks: Track[],
  subtopics: Subtopic[]
): SessionStudyAttribution | null {
  if (session.duration <= 0) return null;

  const topicById = new Map(topics.map((t) => [t.id, t]));
  const moduleById = new Map(modules.map((m) => [m.id, m]));
  const trackById = new Map(tracks.map((t) => [t.id, t]));

  const trackId = session.trackId;
  const topic = topicFromSession(session, subtopics, topicById);

  if (topic && (!trackId || topic.trackId === trackId)) {
    return { level: "topic", id: topic.id, name: topic.name, trackId: topic.trackId };
  }

  const mod = session.moduleId ? moduleById.get(session.moduleId) : undefined;
  if (mod && (!trackId || mod.trackId === trackId)) {
    return { level: "module", id: mod.id, name: mod.name, trackId: mod.trackId };
  }

  const resolvedTrackId = trackId ?? topic?.trackId ?? mod?.trackId;
  if (resolvedTrackId) {
    const track = trackById.get(resolvedTrackId);
    if (track) {
      return { level: "track", id: track.id, name: track.name, trackId: track.id };
    }
  }

  return null;
}

export function aggregateStudyHours(
  sessions: LearningSession[],
  topics: Topic[],
  modules: Module[],
  tracks: Track[],
  subtopics: Subtopic[]
): TopStudyItem[] {
  const trackById = new Map(tracks.map((t) => [t.id, t]));
  const buckets = new Map<string, { attr: SessionStudyAttribution; hoursMs: number }>();

  sessions.forEach((session) => {
    const attr = getSessionStudyAttribution(session, topics, modules, tracks, subtopics);
    if (!attr) return;

    const key = `${attr.level}:${attr.id}`;
    const existing = buckets.get(key);
    if (existing) existing.hoursMs += session.duration;
    else buckets.set(key, { attr, hoursMs: session.duration });
  });

  return [...buckets.values()]
    .sort((a, b) => b.hoursMs - a.hoursMs)
    .map(({ attr, hoursMs }) => {
      const track = trackById.get(attr.trackId);
      return {
        id: `${attr.level}:${attr.id}`,
        name: attr.name,
        hours: hoursMs / 3600000,
        trackId: attr.trackId,
        trackColor: track?.color ?? "#8b5cf6",
        trackName: track?.name ?? "",
        trackIcon: track?.icon ?? "📚",
        level: attr.level,
      };
    });
}
