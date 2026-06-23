"use client";

import { useEffect, useRef } from "react";
import { ExternalLink, BookOpen, Check } from "lucide-react";
import type { PatternNoteArticle } from "@/lib/pattern-notes/types";
import { NoteBlockRenderer, extractHeadings } from "./blocks/note-block-renderer";
import { PatternNotesToc } from "./pattern-notes-toc";
import { Button } from "@/components/ui/button";
import { usePatternNotesStore } from "@/stores/pattern-notes-store";

interface PatternNotesReaderProps {
  article: PatternNoteArticle;
  onOpenPractice?: (practicePattern: string) => void;
}

export function PatternNotesReader({ article, onOpenPractice }: PatternNotesReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markRead = usePatternNotesStore((s) => s.markRead);
  const isRead = usePatternNotesStore((s) => s.isRead);
  const headings = extractHeadings(article.blocks);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight - scrollTop - clientHeight < 80) {
        markRead(article.meta.slug);
      }
    };

    const parent = el.closest("[data-notes-scroll]") ?? window;
    if (parent === window) {
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }
    parent.addEventListener("scroll", onScroll);
    return () => parent.removeEventListener("scroll", onScroll);
  }, [article.meta.slug, markRead]);

  return (
    <div className="flex min-w-0 flex-1 gap-8">
      <article ref={containerRef} className="min-w-0 max-w-3xl flex-1 space-y-4">
        <header className="space-y-2 border-b border-white/[0.06] pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{article.meta.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{article.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.meta.linkedPracticePattern && onOpenPractice && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => onOpenPractice(article.meta.linkedPracticePattern!)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in Practice
                </Button>
              )}
              {!isRead(article.meta.slug) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => markRead(article.meta.slug)}
                >
                  <Check className="h-3.5 w-3.5" />
                  Mark read
                </Button>
              ) : (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <Check className="h-3.5 w-3.5" /> Read
                </span>
              )}
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            ~{article.meta.estimatedReadMin} min read
          </p>
        </header>

        <div className="space-y-4 pb-12">
          {article.blocks.map((block, i) => (
            <NoteBlockRenderer key={`${block.type}-${i}`} block={block} />
          ))}
        </div>
      </article>
      <PatternNotesToc items={headings} />
    </div>
  );
}
