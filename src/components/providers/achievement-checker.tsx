"use client";

import { useEffect } from "react";
import { useSessions, useAllSubtopics, useAllModules, useTracks } from "@/hooks/use-data";
import { checkAchievements } from "@/lib/achievements";

export function AchievementChecker() {
  const sessions = useSessions();
  const subtopics = useAllSubtopics();
  const modules = useAllModules();
  const tracks = useTracks();

  useEffect(() => {
    if (sessions.length > 0) {
      checkAchievements(sessions, subtopics, modules, tracks);
    }
  }, [sessions.length, subtopics, modules, tracks, sessions]);

  return null;
}
