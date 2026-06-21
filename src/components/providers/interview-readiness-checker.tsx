"use client";

import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { useLeetcodeProblems, useAchievements } from "@/hooks/use-data";
import { isInterviewReady } from "@/lib/interview-readiness-check";
import { db } from "@/lib/db";
import { useAppStore } from "@/stores/app-store";
import { nowISO } from "@/lib/utils";

export function InterviewReadinessChecker() {
  const problems = useLeetcodeProblems();
  const achievements = useAchievements();
  const triggerCelebration = useAppStore((s) => s.triggerCelebration);

  useEffect(() => {
    if (problems.length === 0) return;
    if (!isInterviewReady(problems)) return;

    const ach = achievements.find((a) => a.key === "interview_ready" && !a.unlockedAt);
    if (!ach) return;

    void (async () => {
      await db.achievements.update(ach.id, { unlockedAt: nowISO() });
      await db.milestones.add({
        id: uuid(),
        type: "achievement",
        title: ach.title,
        description: ach.description,
        date: nowISO(),
      });
      triggerCelebration(ach.id);
    })();
  }, [problems, achievements, triggerCelebration]);

  return null;
}
