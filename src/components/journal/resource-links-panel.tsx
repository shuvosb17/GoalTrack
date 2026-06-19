"use client";

import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Link2,
  Pencil,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { IconLink } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  getLinkGroupKey,
  getLinkPathLabel,
  hierarchyFromLink,
  linkMatchesSearch,
  normalizeUrl,
  suggestLinkTitle,
  UNCATEGORIZED_GROUP_KEY,
} from "@/lib/journal-links";
import type { JournalLink, Module, Subtopic, Topic, Track } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRIMARY_ACCENT = "#534AB7";
const UNCATEGORIZED_COLOR = "#71717a";

const EMPTY_HIERARCHY: JournalHierarchy = {
  trackId: "",
  moduleId: "",
  topicId: "",
  subtopicId: "",
};

type TrackFilter = "all" | string;

interface ResourceLinksPanelProps {
  tracks: Track[];
  modules: Module[];
  topics: Topic[];
  subtopics: Subtopic[];
}

interface LinkGroup {
  key: string;
  name: string;
  color: string;
  links: JournalLink[];
}

function byOrder<T extends { order: number; name: string }>(a: T, b: T) {
  return a.order - b.order || a.name.localeCompare(b.name);
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
  const [justAdded, setJustAdded] = useState(false);

  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");
  const [toast, setToast] = useState<string | null>(null);

  const [editingLink, setEditingLink] = useState<JournalLink | null>(null);
  const [editHierarchy, setEditHierarchy] = useState<JournalHierarchy>({ ...EMPTY_HIERARCHY });
  const [editUrl, setEditUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editError, setEditError] = useState("");

  const activeTrack = tracks.find((t) => t.id === hierarchy.trackId);
  const accent = activeTrack?.color ?? PRIMARY_ACCENT;

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

  const pathPreviewText = hierarchy.trackId
    ? pathPreview?.label ?? activeTrack?.name ?? ""
    : "No categorization selected — link will be saved as uncategorized.";

  const trackChipData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const link of links) {
      const key = getLinkGroupKey(link);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const chips: { id: string; name: string; color: string; count: number }[] = [];
    for (const track of [...tracks].sort(byOrder)) {
      const count = counts.get(track.id);
      if (count) chips.push({ id: track.id, name: track.name, color: track.color, count });
    }
    const uncategorizedCount = counts.get(UNCATEGORIZED_GROUP_KEY);
    if (uncategorizedCount) {
      chips.push({
        id: UNCATEGORIZED_GROUP_KEY,
        name: "Uncategorized",
        color: UNCATEGORIZED_COLOR,
        count: uncategorizedCount,
      });
    }
    return chips;
  }, [links, tracks]);

  const filteredLinks = useMemo(() => {
    return links
      .filter((link) => linkMatchesSearch(link, search))
      .filter((link) => {
        if (trackFilter === "all") return true;
        return getLinkGroupKey(link) === trackFilter;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [links, search, trackFilter]);

  const linkGroups = useMemo((): LinkGroup[] => {
    const grouped = new Map<string, JournalLink[]>();
    for (const link of filteredLinks) {
      const key = getLinkGroupKey(link);
      const list = grouped.get(key) ?? [];
      list.push(link);
      grouped.set(key, list);
    }

    const result: LinkGroup[] = [];
    for (const track of [...tracks].sort(byOrder)) {
      const trackLinks = grouped.get(track.id);
      if (trackLinks?.length) {
        result.push({
          key: track.id,
          name: track.name,
          color: track.color,
          links: trackLinks,
        });
      }
    }
    const uncategorized = grouped.get(UNCATEGORIZED_GROUP_KEY);
    if (uncategorized?.length) {
      result.push({
        key: UNCATEGORIZED_GROUP_KEY,
        name: "Uncategorized",
        color: UNCATEGORIZED_COLOR,
        links: uncategorized,
      });
    }
    return result;
  }, [filteredLinks, tracks]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

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
    showToast("Link saved");
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  const handleCopy = async (link: JournalLink) => {
    await navigator.clipboard.writeText(link.url);
    showToast("URL copied to clipboard");
  };

  const handleDelete = async (link: JournalLink) => {
    await db.journalLinks.delete(link.id);
    showToast("Link deleted");
  };

  const openEdit = (link: JournalLink) => {
    setEditingLink(link);
    setEditHierarchy(hierarchyFromLink(link));
    setEditUrl(link.url);
    setEditTitle(link.title ?? "");
    setEditError("");
  };

  const handleSaveEdit = async () => {
    if (!editingLink) return;
    const normalized = normalizeUrl(editUrl);
    if (!normalized) {
      setEditError("Enter a valid URL");
      return;
    }

    const payload = buildLinkPayload(editHierarchy, normalized, editTitle);
    await db.journalLinks.update(editingLink.id, {
      ...payload,
      updatedAt: nowISO(),
    });

    setEditingLink(null);
    showToast("Link updated");
  };

  const editPathPreview = useMemo(() => {
    if (!editHierarchy.trackId) return null;
    return getHierarchyPath(
      {
        trackId: editHierarchy.trackId,
        moduleId: editHierarchy.moduleId || undefined,
        topicId: editHierarchy.topicId || undefined,
        subtopicId: editHierarchy.subtopicId || undefined,
      },
      tracks,
      modules,
      topics,
      subtopics
    );
  }, [editHierarchy, tracks, modules, topics, subtopics]);

  return (
    <section className="relative space-y-5">
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
              <p
                className={cn(
                  "mt-3 truncate text-[11px]",
                  hierarchy.trackId ? "text-muted-foreground" : "text-muted-foreground/80 italic"
                )}
                title={pathPreviewText}
              >
                {hierarchy.trackId ? (
                  <>
                    Pinning to: <span className="text-foreground/90">{pathPreviewText}</span>
                  </>
                ) : (
                  pathPreviewText
                )}
              </p>
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
                  <ArrowRight className="h-4 w-4" /> Save link
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium">Saved links</h3>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search links…"
              className="h-9 border-white/[0.08] bg-white/[0.02] pl-9 text-sm"
            />
          </div>
        </div>

        {trackChipData.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTrackFilter("all")}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                trackFilter === "all"
                  ? "border-[#534AB7]/60 bg-[#534AB7]/20 text-foreground"
                  : "border-white/[0.08] bg-transparent text-muted-foreground hover:border-white/[0.14] hover:text-foreground"
              )}
            >
              All
              <span className="tabular-nums opacity-70">{links.length}</span>
            </button>
            {trackChipData.map((chip) => {
              const active = trackFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setTrackFilter(chip.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                    active
                      ? "border-white/[0.2] bg-white/[0.06] text-foreground"
                      : "border-white/[0.08] bg-transparent text-muted-foreground hover:border-white/[0.14] hover:text-foreground"
                  )}
                  style={
                    active
                      ? { borderColor: `${chip.color}66`, background: `${chip.color}18` }
                      : undefined
                  }
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: chip.color }}
                  />
                  {chip.name}
                  <span className="tabular-nums opacity-70">{chip.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {links.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-[0.5px] border-white/[0.08] bg-white/[0.03]">
              <Link2 className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <h3 className="text-base font-medium">No links pinned yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Save YouTube lectures, GitHub repos, docs, or Notion pages right where you need them.
            </p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] py-10 text-center">
            <p className="text-sm text-muted-foreground">No links match your search or filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {linkGroups.map((group) => (
                <motion.div
                  key={group.key}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: group.color }}
                    />
                    <h4 className="text-sm font-medium">{group.name}</h4>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      ({group.links.length})
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.links.map((link, i) => {
                      const track = tracks.find((t) => t.id === link.trackId);
                      const color = track?.color ?? UNCATEGORIZED_COLOR;
                      const displayTitle = link.title || suggestLinkTitle(link.url);
                      const domain = getLinkDomain(link.url);
                      const depth = getLinkDepth(link);
                      const pathLabel = getLinkPathLabel(
                        link,
                        tracks,
                        modules,
                        topics,
                        subtopics
                      );

                      return (
                        <motion.div
                          key={link.id}
                          layout
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ delay: i * 0.03 }}
                          className={cn(
                            "group relative flex flex-col overflow-hidden rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-4 transition-all duration-200",
                            "hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.04] hover:shadow-lg hover:shadow-black/20"
                          )}
                          style={{ borderLeftWidth: 3, borderLeftColor: color }}
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
                              <div className="flex items-start gap-2">
                                <p className="line-clamp-2 flex-1 text-sm font-medium leading-snug">
                                  {displayTitle}
                                </p>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                                  aria-label="Open link"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                {domain}
                              </p>
                            </div>
                          </div>

                          <div className="relative mt-3 space-y-1">
                            <Badge
                              variant="outline"
                              className="border-white/[0.08] text-[9px] font-normal"
                              style={{ color, borderColor: `${color}44` }}
                            >
                              {getLevelLabel(depth)}
                            </Badge>
                            <p
                              className="truncate text-[10px] text-muted-foreground"
                              title={pathLabel}
                            >
                              {pathLabel}
                            </p>
                          </div>

                          <div className="relative mt-3 grid grid-cols-3 gap-1 border-t border-white/[0.06] pt-3">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 border-white/[0.08] bg-transparent text-xs"
                              onClick={() => openEdit(link)}
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 border-white/[0.08] bg-transparent text-xs"
                              onClick={() => void handleCopy(link)}
                            >
                              <Copy className="h-3 w-3" />
                              Copy
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 border-white/[0.08] bg-transparent text-xs text-destructive hover:text-destructive"
                              onClick={() => void handleDelete(link)}
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-white/[0.1]">
          <DialogHeader>
            <DialogTitle>Edit link</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-4">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Learning path
              </p>
              <HierarchyPicker
                value={editHierarchy}
                onChange={setEditHierarchy}
                tracks={tracks}
                modules={modules}
                topics={topics}
                subtopics={subtopics}
              />
              <p className="mt-3 truncate text-[11px] text-muted-foreground">
                {editHierarchy.trackId ? (
                  <>
                    Path:{" "}
                    <span className="text-foreground/90">
                      {editPathPreview?.label ?? "—"}
                    </span>
                  </>
                ) : (
                  <span className="italic">No category assigned</span>
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                URL
              </label>
              <Input
                value={editUrl}
                onChange={(e) => {
                  setEditUrl(e.target.value);
                  setEditError("");
                }}
                placeholder="https://…"
                className="border-white/[0.1] bg-white/[0.04]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Label
              </label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Lecture recording"
                className="border-white/[0.1] bg-white/[0.04]"
              />
            </div>

            {editError && <p className="text-xs text-red-400">{editError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingLink(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleSaveEdit()}
                style={{ background: PRIMARY_ACCENT }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border-[0.5px] border-white/[0.12] bg-[#18181b]/95 px-4 py-2.5 text-sm shadow-xl backdrop-blur-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
