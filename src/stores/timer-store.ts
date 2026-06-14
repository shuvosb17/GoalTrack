import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import { db } from "@/lib/db";
import type { TimerState, HierarchyPath, LearningSession } from "@/lib/types";
import { nowISO, todayISO } from "@/lib/utils";

interface TimerStore extends TimerState {
  tick: number;
  pendingQualitySessionId: string | null;
  start: (path: HierarchyPath, label: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<string | null>;
  clearQualityPrompt: () => void;
  reset: () => void;
  getElapsedMs: () => number;
}

const initialState: TimerState & { tick: number; pendingQualitySessionId: string | null } = {
  isRunning: false,
  isPaused: false,
  accumulatedMs: 0,
  tick: 0,
  pendingQualitySessionId: null,
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      start: (path, label) => {
        set({
          isRunning: true,
          isPaused: false,
          startedAt: Date.now(),
          accumulatedMs: 0,
          pausedAt: undefined,
          // Reset the full hierarchy so stale ids from a prior timer don't leak in
          trackId: path.trackId,
          moduleId: path.moduleId,
          topicId: path.topicId,
          subtopicId: path.subtopicId,
          activityLabel: label,
        });
      },

      pause: () => {
        const { isRunning, isPaused, startedAt, accumulatedMs } = get();
        if (!isRunning || isPaused || !startedAt) return;
        const elapsed = accumulatedMs + (Date.now() - startedAt);
        set({ isPaused: true, pausedAt: Date.now(), accumulatedMs: elapsed, startedAt: undefined });
      },

      resume: () => {
        const { isPaused } = get();
        if (!isPaused) return;
        set({ isPaused: false, isRunning: true, startedAt: Date.now(), pausedAt: undefined });
      },

      stop: async () => {
        const state = get();
        const duration = get().getElapsedMs();
        if (duration < 1000 || !state.trackId) {
          set({ ...initialState });
          return null;
        }

        const now = new Date();
        const session: LearningSession = {
          id: uuid(),
          trackId: state.trackId,
          startTime: new Date(now.getTime() - duration).toISOString(),
          endTime: now.toISOString(),
          duration,
          date: todayISO(),
          manual: false,
          createdAt: nowISO(),
        };
        if (state.moduleId) session.moduleId = state.moduleId;
        if (state.topicId) session.topicId = state.topicId;
        if (state.subtopicId) session.subtopicId = state.subtopicId;

        await db.sessions.add(session);
        set({ ...initialState, pendingQualitySessionId: session.id });
        return session.id;
      },

      clearQualityPrompt: () => set({ pendingQualitySessionId: null }),

      reset: () => set({ ...initialState }),

      getElapsedMs: () => {
        const { isRunning, isPaused, startedAt, accumulatedMs, tick } = get();
        void tick;
        if (!isRunning) return accumulatedMs;
        if (isPaused) return accumulatedMs;
        if (!startedAt) return accumulatedMs;
        return accumulatedMs + (Date.now() - startedAt);
      },
    }),
    { name: "growth-os-timer" }
  )
);
