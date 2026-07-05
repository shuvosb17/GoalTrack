"use client";

import { useEffect } from "react";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";
import { FocusWidget } from "@/components/timer/focus-widget";
import { SkipReasonPrompt } from "@/components/dashboard/skip-reason-prompt";
import { AchievementChecker } from "@/components/providers/achievement-checker";
import { AutoBackupProvider } from "@/components/providers/auto-backup";
import { ConfidencePromptProvider } from "@/components/providers/confidence-prompt-provider";
import { PrepQuizProvider } from "@/components/providers/prep-quiz-provider";
import { LeetcodeConfidenceProvider } from "@/components/providers/leetcode-confidence-provider";
import { InterviewReadinessChecker } from "@/components/providers/interview-readiness-checker";
import { seedDatabase, ensureLeetcodePrep, ensureInterviewReadyAchievement, ensureGoBackendPath, ensureGoBackendProjects } from "@/lib/seed";
import { ensureGitGithubSubtopics } from "@/lib/git-github-curriculum-sync";
import { repairMisattributedSessions } from "@/lib/session-repair";
import { useAppStore } from "@/stores/app-store";
import { Logo } from "./logo";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { initialized, setInitialized } = useAppStore();

  useEffect(() => {
    seedDatabase()
      .then(() => ensureLeetcodePrep())
      .then(() => ensureGoBackendPath())
      .then(() => ensureGoBackendProjects())
      .then(() => ensureGitGithubSubtopics())
      .then(() => ensureInterviewReadyAchievement())
      .then(() => repairMisattributedSessions())
      .then(() => setInitialized(true));
  }, [setInitialized]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-5">
          <Logo size="lg" className="justify-center animate-pulse" />
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading GoalTrack...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MobileHeader />
      <Sidebar />
      <main className="min-w-0 lg:ml-[17.5rem]">
        <div className="mx-auto max-w-[1600px] px-4 py-6 pt-[4.5rem] sm:px-6 sm:py-8 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>
      <FocusWidget />
      <SkipReasonPrompt />
      <AchievementChecker />
      <AutoBackupProvider />
      <ConfidencePromptProvider />
      <PrepQuizProvider />
      <LeetcodeConfidenceProvider />
      <InterviewReadinessChecker />
    </div>
  );
}
