"use client";

import { useEffect } from "react";
import { Sidebar } from "./sidebar";
import { FocusWidget } from "@/components/timer/focus-widget";
import { AchievementChecker } from "@/components/providers/achievement-checker";
import { AutoBackupProvider } from "@/components/providers/auto-backup";
import { seedDatabase } from "@/lib/seed";
import { useAppStore } from "@/stores/app-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { initialized, setInitialized } = useAppStore();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  useEffect(() => {
    seedDatabase().then(() => setInitialized(true));
  }, [setInitialized]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Initializing Growth OS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className={sidebarOpen ? "ml-64" : ""}>
        <div className="p-8 max-w-[1600px] mx-auto">{children}</div>
      </main>
      <FocusWidget />
      <AchievementChecker />
      <AutoBackupProvider />
    </div>
  );
}
