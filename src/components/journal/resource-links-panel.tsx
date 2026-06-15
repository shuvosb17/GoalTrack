"use client";

import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { IconLink } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  HierarchyPicker,
  getHierarchyPath,
  type JournalHierarchy,
} from "@/components/journal/hierarchy-picker";
import { useJournalLinks } from "@/hooks/use-data";
import { db } from "@/lib/db";
import { nowISO } from "@/lib/utils";
import {
  buildLinkPayload,
  getLevelLabel,
  getLinkDepth,
  getLinkDomain,
  getLinkFavicon,
  getLinkPathLabel,
  linkVisibleForScope,
  normalizeUrl,
  suggestLinkTitle,
} from "@/lib/journal-links";
import type { JournalLink, Module, Subtopic, Topic, Track } from "@/lib/types";
import { cn } from "@/lib/utils";

const EMPTY_HIERARCHY: JournalHierarchy = {
  trackId: "",
  moduleId: "",
  topicId: "",
  subtopicId: "",
};

interface ResourceLinksPanelProps {
  tracks: Track[];
  modules: Module[];
  topics: Topic[];
  subtopics: Subtopic[];
}

export function ResourceLinksPanel({
  tracks,
  modules,
  topics,
  subtopics,
}: ResourceLinksPanelProps) {
  const links = useJournalLinks();
  const [hierarchy, setHierarchy] = useState<JournalHierarchy>({ ...EMPTY_HIERARCHY });
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const activeTrack = tracks.find((t) => t.id === hierarchy.trackId);
  const accent = activeTrack?.color ?? "#8b5cf6";

  const pathPreview = useMemo(() => {
    if (!hierarchy.trackId) return null;
    return getHierarchyPath(
      {
        trackId: hierarchy.trackId,
        moduleId: hierarchy.moduleId || undefined,
        topicId: hierarchy.topicId || undefined,
        subtopicId: hierarchy.subtopicId || undefined,
      },
      tracks,
      modules,
      topics,
      subtopics
    );
  }, [hierarchy, tracks, modules, topics, subtopics]);

  const visibleLinks = useMemo(() => {
    return links
      .filter((link) => linkVisibleForScope(link, hierarchy))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [links, hierarchy]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text.trim());
        setError("");
        if (!titleInput) setTitleInput(suggestLinkTitle(text));
      }
    } catch {
      setError("Could not read clipboard — paste manually with Ctrl+V");
    }
  };

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    setError("");
    if (!titleInput && value.trim()) {
      const normalized = normalizeUrl(value);
      if (normalized) setTitleInput(suggestLinkTitle(normalized));
    }
  };

  const handleAdd = async () => {
    if (!hierarchy.trackId) {
      setError("Select at least a track to pin this link");
      return;
    }
    const normalized = normalizeUrl(urlInput);
    if (!normalized) {
      setError("Enter a valid URL (e.g. https://youtube.com/watch?v=…)");
      return;
    }

    const payload = buildLinkPayload(hierarchy, normalized, titleInput);
    const now = nowISO();
    await db.journalLinks.add({
      id: uuid(),
      ...payload,
      createdAt: now,
      updatedAt: now,
    });

    setUrlInput("");
    setTitleInput("");
    setError("");
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  const handleCopy = async (link: JournalLink) => {
    await navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <SectionHeading icon={IconLink}>Resource links</SectionHeading>
          <p className="mt-1 text-sm text-muted-foreground">
            Pin lectures, docs, and references to any spot in your learning path.
          </p>
        </div>
        <Badge variant="outline" className="border-white/[0.1] text-[10px] tabular-nums">
          {links.length} saved
        </Badge>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border-[0.5px] border-white/[0.1] bg-white/[0.02]"
        style={{ boxShadow: `inset 0 1px 0 ${accent}33` }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 0% 0%, ${accent}44, transparent 55%), radial-gradient(ellipse 60% 50% at 100% 0%, #22d3ee22, transparent 50%)`,
          }}
        />

        <div className="relative grid gap-6 p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg border-[0.5px] border-white/[0.12] bg-white/[0.04]"
                style={{ color: accent }}
              >
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Pin a link</p>
                <p className="text-[11px] text-muted-foreground">
                  Choose where it belongs, then paste the URL
                </p>
              </div>
            </div>

            <div className="rounded-xl border-[0.5px] border-white/[0.08] bg-black/20 p-4 backdrop-blur-sm">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Learning path
              </p>
              <HierarchyPicker
                value={hierarchy}
                onChange={setHierarchy}
                tracks={tracks}
                modules={modules}
                topics={topics}
                subtopics={subtopics}
              />
              {pathPreview && (
                <p className="mt-3 truncate text-[11px] text-muted-foreground" title={pathPreview.label}>
                  Pinning to: <span className="text-foreground/90">{pathPreview.label}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                URL
              </label>
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={urlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleAdd();
                    }}
                    placeholder="https://…"
                    className="border-white/[0.1] bg-white/[0.04] pl-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 border-white/[0.1] bg-white/[0.03]"
                  onClick={() => void handlePaste()}
                >
                  Paste
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Label (optional)
              </label>
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. Lecture recording"
                className="border-white/[0.1] bg-white/[0.04]"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button
              className="mt-auto w-full gap-2"
              size="lg"
              onClick={() => void handleAdd()}
              style={{
                background: `linear-gradient(135deg, ${accent}cc, ${accent}88)`,
              }}
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" /> Saved
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" /> Save link
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {hierarchy.trackId && (
        <p className="text-[11px] text-muted-foreground">
          Showing links for{" "}
          <span className="text-foreground/80">{pathPreview?.label ?? activeTrack?.name}</span>
          {hierarchy.moduleId || hierarchy.topicId || hierarchy.subtopicId
            ? " and parent levels"
            : ""}
        </p>
      )}

      {visibleLinks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.08] py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-[0.5px] border-white/[0.08] bg-white/[0.03]">
            <Link2 className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <h3 className="text-base font-medium">No links pinned yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Save YouTube lectures, GitHub repos, docs, or Notion pages right where you need them.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibleLinks.map((link, i) => {
              const track = tracks.find((t) => t.id === link.trackId);
              const color = track?.color ?? "#8b5cf6";
              const displayTitle = link.title || suggestLinkTitle(link.url);
              const domain = getLinkDomain(link.url);
              const depth = getLinkDepth(link);
              const pathLabel = getLinkPathLabel(link, tracks, modules, topics, subtopics);

              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-4 transition-all duration-200",
                    "hover:border-white/[0.16] hover:bg-white/[0.04] hover:shadow-lg hover:shadow-black/20"
                  )}
                  style={{ borderTopWidth: 2, borderTopColor: color }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${color}18, transparent 70%)`,
                    }}
                  />

                  <div className="relative flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.04]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getLinkFavicon(link.url)}
                        alt=""
                        className="h-5 w-5 rounded-sm"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-foreground">
                        {displayTitle}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{domain}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="border-white/[0.08] text-[9px] font-normal"
                      style={{ color, borderColor: `${color}44` }}
                    >
                      {getLevelLabel(depth)}
                    </Badge>
                    <span className="truncate text-[10px] text-muted-foreground" title={pathLabel}>
                      {pathLabel}
                    </span>
                  </div>

                  <div className="relative mt-3 flex gap-1 border-t border-white/[0.06] pt-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 flex-1 gap-1 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        void handleCopy(link);
                      }}
                    >
                      {copiedId === link.id ? (
                        <>
                          <Check className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        void db.journalLinks.delete(link.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.a>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
