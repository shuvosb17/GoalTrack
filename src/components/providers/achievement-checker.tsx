"use client";

import { useEffect } from "react";
import { useSessions, useAllSubtopics, useAllModules, useTracks, useSettings } from "@/hooks/use-data";
import { checkAchievements } from "@/lib/achievements";
import { DEFAULT_YEAR_END, DEFAULT_YEAR_START } from "@/lib/analytics";

export function AchievementChecker() {
  const sessions = useSessions();
  const subtopics = useAllSubtopics();
  const modules = useAllModules();
  const tracks = useTracks();
  const settings = useSettings();
  const yearStart = settings?.yearStart ?? DEFAULT_YEAR_START;
  const yearEnd = settings?.yearEnd ?? DEFAULT_YEAR_END;

  useEffect(() => {
    checkAchievements(sessions, subtopics, modules, tracks, settings, yearStart, yearEnd);
  }, [sessions, subtopics, modules, tracks, settings, yearStart, yearEnd]);

  return null;
}
