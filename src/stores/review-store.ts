import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReviewCatalogItem } from "@/lib/revision-catalog";

export type RevisionPhase = "review" | "rate";

export interface RevisionProgress {
  itemId: string;
  phase: RevisionPhase;
  startedAt: number;
}

export interface ReviewBackupState {
  queue: ReviewCatalogItem[];
  progress: RevisionProgress | null;
  dismissedIds: string[];
}

interface ReviewStore extends ReviewBackupState {
  addToQueue: (item: ReviewCatalogItem) => void;
  removeFromQueue: (id: string) => void;
  refreshQueueFromCatalog: (catalog: ReviewCatalogItem[]) => void;
  syncDueReviewsToQueue: (dueItems: ReviewCatalogItem[]) => void;
  reconcileReviewQueue: (catalog: ReviewCatalogItem[], dueItems: ReviewCatalogItem[]) => void;
  restoreFromBackup: (state: ReviewBackupState) => void;
  startSession: (itemId: string) => void;
  setProgress: (progress: RevisionProgress) => void;
  finishSession: () => void;
}

export function getReviewStateForBackup(): ReviewBackupState {
  const { queue, progress, dismissedIds } = useReviewStore.getState();
  return { queue, progress, dismissedIds };
}

export function restoreReviewStateFromBackup(state: Partial<ReviewBackupState>) {
  useReviewStore.getState().restoreFromBackup({
    queue: state.queue ?? [],
    progress: state.progress ?? null,
    dismissedIds: state.dismissedIds ?? [],
  });
}

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      queue: [],
      progress: null,
      dismissedIds: [],

      addToQueue: (item) => {
        const { queue, dismissedIds } = get();
        if (queue.some((q) => q.id === item.id)) return;
        set({
          queue: [...queue, item],
          dismissedIds: dismissedIds.filter((id) => id !== item.id),
        });
      },

      removeFromQueue: (id) => {
        const { progress, queue, dismissedIds } = get();
        if (progress?.itemId === id) return;
        set({
          queue: queue.filter((q) => q.id !== id),
          dismissedIds: dismissedIds.includes(id) ? dismissedIds : [...dismissedIds, id],
        });
      },

      refreshQueueFromCatalog: (catalog) => {
        const byId = new Map(catalog.map((c) => [c.id, c]));
        set({
          queue: get().queue
            .map((q) => byId.get(q.id) ?? q)
            .filter((q) => byId.has(q.id)),
        });
      },

      syncDueReviewsToQueue: (dueItems) => {
        if (dueItems.length === 0) return;
        const { queue, dismissedIds } = get();
        const dismissed = new Set(dismissedIds);
        const existing = new Set(queue.map((q) => q.id));
        const toAdd = dueItems.filter((item) => !existing.has(item.id) && !dismissed.has(item.id));
        if (toAdd.length === 0) return;
        set({ queue: [...queue, ...toAdd] });
      },

      reconcileReviewQueue: (catalog, dueItems) => {
        const byId = new Map(catalog.map((c) => [c.id, c]));
        const { queue, dismissedIds } = get();
        const dueIdSet = new Set(dueItems.map((d) => d.id));
        const nextDismissed = dismissedIds.filter((id) => dueIdSet.has(id));

        const refreshed = queue
          .map((q) => byId.get(q.id) ?? q)
          .filter((q) => byId.has(q.id));

        const dismissed = new Set(nextDismissed);
        const existing = new Set(refreshed.map((q) => q.id));
        const toAdd = dueItems.filter((item) => !existing.has(item.id) && !dismissed.has(item.id));
        const next = toAdd.length > 0 ? [...refreshed, ...toAdd] : refreshed;

        const queueChanged =
          next.length !== queue.length ||
          next.some((item, i) => item.id !== queue[i]?.id || item.confidence !== queue[i]?.confidence);
        const dismissedChanged = nextDismissed.length !== dismissedIds.length;

        if (queueChanged || dismissedChanged) {
          set({ queue: next, dismissedIds: nextDismissed });
        }
      },

      restoreFromBackup: (state) => {
        set({
          queue: state.queue,
          progress: state.progress,
          dismissedIds: state.dismissedIds ?? [],
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
      version: 3,
      migrate: (persisted, version) => {
        const state = persisted as {
          queue?: ReviewCatalogItem[];
          progress?: RevisionProgress & { step?: number; ratingStep?: number };
          dismissedIds?: string[];
        };
        if (version < 2 && state.progress && !state.progress.itemId) {
          return { ...state, progress: null, dismissedIds: state.dismissedIds ?? [] };
        }
        if (version < 3) {
          return { ...state, dismissedIds: state.dismissedIds ?? [] };
        }
        return state as ReviewStore;
      },
    }
  )
);
