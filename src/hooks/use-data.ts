"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export function useTracks() {
  return useLiveQuery(() => db.tracks.orderBy("order").filter((t) => !t.archived).toArray(), []) ?? [];
}

export function useAllTracks() {
  return useLiveQuery(() => db.tracks.orderBy("order").toArray(), []) ?? [];
}

export function useModules(trackId?: string) {
  return useLiveQuery(
    () => trackId
      ? db.modules.where("trackId").equals(trackId).filter((m) => !m.archived).sortBy("order")
      : db.modules.filter((m) => !m.archived).sortBy("order"),
    [trackId]
  ) ?? [];
}

export function useTopics(moduleId?: string) {
  return useLiveQuery(
    () => moduleId
      ? db.topics.where("moduleId").equals(moduleId).filter((t) => !t.archived).sortBy("order")
      : db.topics.filter((t) => !t.archived).sortBy("order"),
    [moduleId]
  ) ?? [];
}

export function useSubtopics(topicId?: string) {
  return useLiveQuery(
    () => topicId
      ? db.subtopics.where("topicId").equals(topicId).filter((s) => !s.archived).sortBy("order")
      : db.subtopics.filter((s) => !s.archived).sortBy("order"),
    [topicId]
  ) ?? [];
}

export function useAllSubtopics() {
  return useLiveQuery(() => db.subtopics.orderBy("order").toArray(), []) ?? [];
}

export function useAllModules() {
  return useLiveQuery(() => db.modules.toArray(), []) ?? [];
}

export function useAllTopics() {
  return useLiveQuery(() => db.topics.toArray(), []) ?? [];
}

export function useSessions() {
  return useLiveQuery(() => db.sessions.toArray(), []) ?? [];
}

export function useJournal() {
  return useLiveQuery(() => db.journal.orderBy("date").reverse().toArray(), []) ?? [];
}

export function useJournalLinks() {
  return useLiveQuery(() => db.journalLinks.orderBy("createdAt").reverse().toArray(), []) ?? [];
}

export function useAchievements() {
  return useLiveQuery(() => db.achievements.toArray(), []) ?? [];
}

export function useMilestones() {
  return useLiveQuery(() => db.milestones.orderBy("date").reverse().toArray(), []) ?? [];
}

export function useGoalMilestones() {
  return useLiveQuery(() => db.goalMilestones.orderBy("order").toArray(), []) ?? [];
}

export function useTrackEstimates() {
  return useLiveQuery(() => db.trackEstimates.toArray(), []) ?? [];
}

export function useSettings() {
  return useLiveQuery(() => db.settings.get("default"), []) ?? null;
}

export function useSkipLogs() {
  return useLiveQuery(() => db.skipLogs.toArray(), []) ?? [];
}
