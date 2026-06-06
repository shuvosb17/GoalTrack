import type { LearningSession, Subtopic, HierarchyPath } from "./types";

export function getSubtopicLoggedMs(subtopicId: string, sessions: LearningSession[]): number {
  return sessions
    .filter((s) => s.subtopicId === subtopicId)
    .reduce((sum, s) => sum + s.duration, 0);
}

/** Topic time = sum of all its subtopics' logged time */
export function getTopicLoggedMs(
  topicId: string,
  subtopics: Subtopic[],
  sessions: LearningSession[]
): number {
  const subIds = new Set(
    subtopics.filter((s) => s.topicId === topicId && !s.archived).map((s) => s.id)
  );
  return sessions
    .filter((s) => s.subtopicId && subIds.has(s.subtopicId))
    .reduce((sum, s) => sum + s.duration, 0);
}

export function getModuleLoggedMs(
  moduleId: string,
  subtopics: Subtopic[],
  sessions: LearningSession[]
): number {
  const subIds = new Set(
    subtopics.filter((s) => s.moduleId === moduleId && !s.archived).map((s) => s.id)
  );
  return sessions
    .filter((s) => s.subtopicId && subIds.has(s.subtopicId))
    .reduce((sum, s) => sum + s.duration, 0);
}

export function getTrackLoggedMs(trackId: string, sessions: LearningSession[]): number {
  return sessions
    .filter((s) => s.trackId === trackId)
    .reduce((sum, s) => sum + s.duration, 0);
}

export function isTimerActiveForPath(
  store: {
    isRunning: boolean;
    isPaused: boolean;
    trackId?: string;
    moduleId?: string;
    topicId?: string;
    subtopicId?: string;
  },
  path: HierarchyPath
): boolean {
  if (!store.isRunning && !store.isPaused) return false;
  if (store.trackId !== path.trackId) return false;

  if (path.subtopicId) {
    return store.subtopicId === path.subtopicId;
  }
  if (path.topicId) {
    return store.topicId === path.topicId && !store.subtopicId;
  }
  if (path.moduleId) {
    return store.moduleId === path.moduleId && !store.topicId && !store.subtopicId;
  }
  return !store.moduleId && !store.topicId && !store.subtopicId;
}
