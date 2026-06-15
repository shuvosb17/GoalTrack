import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReviewCatalogItem } from "@/lib/revision-catalog";

export type RevisionPhase = "review" | "rate";

export interface RevisionProgress {
  itemId: string;
  phase: RevisionPhase;
  startedAt: number;
}

interface ReviewStore {
  queue: ReviewCatalogItem[];
  progress: RevisionProgress | null;

  addToQueue: (item: ReviewCatalogItem) => void;
  removeFromQueue: (id: string) => void;
  refreshQueueFromCatalog: (catalog: ReviewCatalogItem[]) => void;
  startSession: (itemId: string) => void;
  setProgress: (progress: RevisionProgress) => void;
  finishSession: () => void;
}

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      queue: [],
      progress: null,

      addToQueue: (item) => {
        const { queue } = get();
        if (queue.some((q) => q.id === item.id)) return;
        set({ queue: [...queue, item] });
      },

      removeFromQueue: (id) => {
        const { progress, queue } = get();
        if (progress?.itemId === id) return;
        set({ queue: queue.filter((q) => q.id !== id) });
      },

      refreshQueueFromCatalog: (catalog) => {
        const byId = new Map(catalog.map((c) => [c.id, c]));
        set({
          queue: get().queue
            .map((q) => byId.get(q.id) ?? q)
            .filter((q) => byId.has(q.id)),
        });
      },

      startSession: (itemId) => {
        const { queue, progress } = get();
        if (progress) return;
        if (!queue.some((q) => q.id === itemId)) return;
        set({
          progress: {
            itemId,
            phase: "review",
            startedAt: Date.now(),
          },
        });
      },

      setProgress: (progress) => set({ progress }),

      finishSession: () => {
        const { progress, queue } = get();
        if (!progress) {
          set({ progress: null });
          return;
        }
        set({
          queue: queue.filter((q) => q.id !== progress.itemId),
          progress: null,
        });
      },
    }),
    {
      name: "goaltrack-review",
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as {
          queue?: ReviewCatalogItem[];
          progress?: RevisionProgress & { step?: number; ratingStep?: number };
        };
        if (version < 2 && state.progress && !state.progress.itemId) {
          return { ...state, progress: null };
        }
        return state as ReviewStore;
      },
    }
  )
);
