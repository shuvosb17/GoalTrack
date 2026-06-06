import { create } from "zustand";
import type { Insight } from "@/lib/types";

interface AppStore {
  initialized: boolean;
  setInitialized: (v: boolean) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  insights: Insight[];
  setInsights: (insights: Insight[]) => void;
  celebrationAchievement: string | null;
  triggerCelebration: (achievementId: string) => void;
  clearCelebration: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  initialized: false,
  setInitialized: (v) => set({ initialized: v }),
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  insights: [],
  setInsights: (insights) => set({ insights }),
  celebrationAchievement: null,
  triggerCelebration: (achievementId) => set({ celebrationAchievement: achievementId }),
  clearCelebration: () => set({ celebrationAchievement: null }),
}));
