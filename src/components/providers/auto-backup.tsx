"use client";

import { useEffect } from "react";
import { saveAutoBackup } from "@/lib/auto-backup";
import { useSessions, useAllSubtopics } from "@/hooks/use-data";

export function AutoBackupProvider() {
  const sessions = useSessions();
  const subtopics = useAllSubtopics();

  useEffect(() => {
    const save = () => { saveAutoBackup(); };
    const interval = setInterval(save, 45000);
    window.addEventListener("beforeunload", save);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", save);
    };
  }, []);

  useEffect(() => {
    if (sessions.length > 0 || subtopics.some((s) => s.status !== "not_started")) {
      saveAutoBackup();
    }
  }, [sessions.length, subtopics]);

  return null;
}
