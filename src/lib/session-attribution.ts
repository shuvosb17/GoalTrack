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
  moduleId?: string;
  moduleName?: string;
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

/** Study Tracker ranked list — topics, modules, and track-level logs. */
export function aggregateStudyTrackerHours(
  sessions: LearningSession[],
  topics: Topic[],
  modules: Module[],
  tracks: Track[],
  subtopics: Subtopic[]
): TopStudyItem[] {
  return aggregateStudyHours(sessions, topics, modules, tracks, subtopics);
}

/** Per-track hours using the same attribution rules as Study Tracker. */
export function getAttributedHoursByTrack(
  sessions: LearningSession[],
  tracks: Track[],
  topics: Topic[],
  modules: Module[],
  subtopics: Subtopic[]
): { name: string; value: number; color: string }[] {
  const msByTrack = new Map(tracks.map((t) => [t.id, 0]));
  aggregateStudyHours(sessions, topics, modules, tracks, subtopics).forEach((item) => {
    msByTrack.set(item.trackId, (msByTrack.get(item.trackId) ?? 0) + item.hours * 3600000);
  });
  return tracks.map((t) => ({
    name: t.name,
    value: msByTrack.get(t.id) ?? 0,
    color: t.color,
  }));
}

export function aggregateStudyHours(
  sessions: LearningSession[],
  topics: Topic[],
  modules: Module[],
  tracks: Track[],
  subtopics: Subtopic[]
): TopStudyItem[] {
  const trackById = new Map(tracks.map((t) => [t.id, t]));
  const topicById = new Map(topics.map((t) => [t.id, t]));
  const moduleById = new Map(modules.map((m) => [m.id, m]));
  const buckets = new Map<string, { attr: SessionStudyAttribution; hoursMs: number }>();

  sessions.forEach((session) => {
    let attr = getSessionStudyAttribution(session, topics, modules, tracks, subtopics);
    if (!attr && session.duration > 0 && session.trackId) {
      const track = trackById.get(session.trackId);
      if (track) {
        attr = { level: "track", id: track.id, name: track.name, trackId: track.id };
      }
    }
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
      const topic = attr.level === "topic" ? topicById.get(attr.id) : undefined;
      const mod =
        attr.level === "module"
          ? moduleById.get(attr.id)
          : topic
            ? moduleById.get(topic.moduleId)
            : undefined;

      return {
        id: `${attr.level}:${attr.id}`,
        name: attr.name,
        hours: hoursMs / 3600000,
        trackId: attr.trackId,
        trackColor: track?.color ?? "#8b5cf6",
        trackName: track?.name ?? "",
        trackIcon: track?.icon ?? "📚",
        moduleId: mod?.id,
        moduleName: mod?.name,
        level: attr.level,
      };
    });
}
