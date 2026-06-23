"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadPatternArticle, getDefaultSlug, isValidSlug } from "@/lib/pattern-notes/loader";
import type { PatternNoteArticle } from "@/lib/pattern-notes/types";
import { PatternNotesSidebar } from "./pattern-notes-sidebar";
import { PatternNotesReader } from "./pattern-notes-reader";
import { cn } from "@/lib/utils";

interface PatternNotesPanelProps {
  guideSlug?: string;
  onGuideChange: (slug: string) => void;
  onOpenPractice?: (practicePattern: string) => void;
}

export function PatternNotesPanel({
  guideSlug,
  onGuideChange,
  onOpenPractice,
}: PatternNotesPanelProps) {
  const activeSlug = guideSlug && isValidSlug(guideSlug) ? guideSlug : getDefaultSlug();
  const [article, setArticle] = useState<PatternNoteArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void loadPatternArticle(activeSlug).then((a) => {
      if (!cancelled) {
        setArticle(a);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeSlug]);

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="border-b border-white/[0.06] px-4 py-3 lg:hidden">
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-2 text-xs"
          onClick={() => setMobileNav(true)}
        >
          <Menu className="h-3.5 w-3.5" />
          Browse patterns
        </Button>
      </div>

      {mobileNav && (
        <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={() => setMobileNav(false)}>
          <div
            className="absolute left-0 top-0 h-full w-72 bg-zinc-900 p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <PatternNotesSidebar
              mobile
              activeSlug={activeSlug}
              onSelect={onGuideChange}
              onClose={() => setMobileNav(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-h-[480px]" data-notes-scroll>
        <div className="hidden lg:block p-4">
          <PatternNotesSidebar activeSlug={activeSlug} onSelect={onGuideChange} />
        </div>
        <div className={cn("min-w-0 flex-1 p-4 lg:p-6", loading && "animate-pulse")}>
          {loading ? (
            <div className="h-96 rounded-lg bg-white/[0.03]" />
          ) : article ? (
            <PatternNotesReader article={article} onOpenPractice={onOpenPractice} />
          ) : (
            <p className="text-sm text-muted-foreground">Pattern not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
