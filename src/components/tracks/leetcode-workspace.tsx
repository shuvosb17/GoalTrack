"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Target } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LeetCodePanel } from "@/components/tracks/leetcode-panel";
import { PatternNotesPanel } from "@/components/tracks/pattern-notes/pattern-notes-panel";
import { getGuideSlugForPractice } from "@/lib/pattern-notes/catalog";
import { isValidSlug } from "@/lib/pattern-notes/loader";

interface LeetCodeWorkspaceProps {
  leetcodeTrackId: string;
}

export function LeetCodeWorkspace({ leetcodeTrackId }: LeetCodeWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const guideParam = searchParams.get("guide");
  const tabParam = searchParams.get("tab");

  const [tab, setTab] = useState<"guide" | "practice">(
    tabParam === "practice" || (!guideParam && tabParam !== "guide") ? "practice" : "guide"
  );
  const [highlightPattern, setHighlightPattern] = useState<string | null>(null);

  const updateUrl = useCallback(
    (nextTab: "guide" | "practice", guide?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("track", leetcodeTrackId);
      params.set("tab", nextTab);
      if (nextTab === "guide" && guide) {
        params.set("guide", guide);
      } else if (nextTab === "practice") {
        params.delete("guide");
      }
      router.replace(`/tracks?${params.toString()}`, { scroll: false });
    },
    [leetcodeTrackId, router, searchParams]
  );

  useEffect(() => {
    if (guideParam && isValidSlug(guideParam)) {
      setTab("guide");
    }
  }, [guideParam]);

  const handleTabChange = (value: string) => {
    const next = value as "guide" | "practice";
    setTab(next);
    updateUrl(next, guideParam ?? undefined);
  };

  const handleGuideChange = (slug: string) => {
    setTab("guide");
    updateUrl("guide", slug);
  };

  const handleOpenPractice = (practicePattern: string) => {
    setHighlightPattern(practicePattern);
    setTab("practice");
    updateUrl("practice");
    setTimeout(() => {
      const el = document.querySelector(`[data-pattern="${CSS.escape(practicePattern)}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleReadGuide = (practicePattern: string) => {
    const slug = getGuideSlugForPractice(practicePattern);
    if (slug) handleGuideChange(slug);
  };

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="h-auto gap-1">
          <TabsTrigger value="guide" className="gap-1.5 text-xs sm:text-sm">
            <BookOpen className="h-3.5 w-3.5" />
            Pattern Guide
          </TabsTrigger>
          <TabsTrigger value="practice" className="gap-1.5 text-xs sm:text-sm">
            <Target className="h-3.5 w-3.5" />
            Pattern Practice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="mt-4">
          <PatternNotesPanel
            guideSlug={guideParam ?? undefined}
            onGuideChange={handleGuideChange}
            onOpenPractice={handleOpenPractice}
          />
        </TabsContent>

        <TabsContent value="practice" className="mt-4">
          <LeetCodePanel
            highlightPattern={highlightPattern}
            onReadGuide={handleReadGuide}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
