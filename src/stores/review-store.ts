import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReviewCatalogItem } from "@/lib/revision-catalog";

export type RevisionPhase = "review" | "rate";

export interface RevisionProgress {
  phase: RevisionPhase;
  step: number;
  ratingStep: number;
  startedAt: number;
}

interface ReviewStore {
  queue: ReviewCatalogItem[];
  progress: RevisionProgress | null;

  addToQueue: (item: ReviewCatalogItem) => void;
  removeFromQueue: (id: string) => void;
  refreshQueueFromCatalog: (catalog: ReviewCatalogItem[]) => void;
  startSession: () => void;
  setProgress: (progress: RevisionProgress) => void;
  finishSession: () => void;
}

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      queue: [],
      progress: null,

      addToQueue: (item) => {
        const { queue, progress } = get();
        if (progress) return;
        if (queue.some((q) => q.id === item.id)) return;
        set({ queue: [...queue, item] });
      },

      removeFromQueue: (id) => {
        const { progress } = get();
        if (progress) return;
        set({ queue: get().queue.filter((q) => q.id !== id) });
      },

      refreshQueueFromCatalog: (catalog) => {
        const byId = new Map(catalog.map((c) => [c.id, c]));
        set({
          queue: get().queue
            .map((q) => byId.get(q.id) ?? q)
            .filter((q) => byId.has(q.id)),
        });
      },

      startSession: () => {
        const { queue } = get();
        if (queue.length === 0) return;
        set({
          progress: {
            phase: "review",
            step: 0,
            ratingStep: 0,
            startedAt: Date.now(),
          },
        });
      },

      setProgress: (progress) => set({ progress }),

      finishSession: () => set({ queue: [], progress: null }),
    }),
    { name: "goaltrack-review" }
  )
);
