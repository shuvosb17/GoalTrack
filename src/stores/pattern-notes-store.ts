import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PatternNotesStore {
  readSlugs: string[];
  markRead: (slug: string) => void;
  isRead: (slug: string) => boolean;
}

export const usePatternNotesStore = create<PatternNotesStore>()(
  persist(
    (set, get) => ({
      readSlugs: [],
      markRead: (slug) => {
        const { readSlugs } = get();
        if (readSlugs.includes(slug)) return;
        set({ readSlugs: [...readSlugs, slug] });
      },
      isRead: (slug) => get().readSlugs.includes(slug),
    }),
    { name: "goaltrack-pattern-notes" }
  )
);
