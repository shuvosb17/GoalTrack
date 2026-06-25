"use client";

import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus, Lightbulb, AlertCircle, Star, ArrowRight, Clock, Trash2, Pencil, BookMarked,
} from "lucide-react";
import { IconNotebook, IconBulb } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  useJournal, useSessions, useTracks, useAllModules, useAllTopics, useAllSubtopics,
} from "@/hooks/use-data";
import { db } from "@/lib/db";
import { nowISO, todayISO, formatDuration } from "@/lib/utils";
import {
  getJournalStats, getUnjournaledStudyDays, groupEntriesByMonth,
} from "@/lib/journal";
import {
  HierarchyPicker, getHierarchyPath, matchSessionsForJournal, type JournalHierarchy,
} from "@/components/journal/hierarchy-picker";
import { ResourceLinksPanel } from "@/components/journal/resource-links-panel";
import type { JournalEntry } from "@/lib/types";

const EMPTY_HIERARCHY: JournalHierarchy = { trackId: "", moduleId: "", topicId: "", subtopicId: "" };

const FIELDS = [
  { key: "learned" as const, label: "Learned", icon: Lightbulb, color: "#10b981" },
  { key: "challenges" as const, label: "Challenges", icon: AlertCircle, color: "#f59e0b" },
  { key: "takeaways" as const, label: "Takeaways", icon: Star, color: "#8b5cf6" },
  { key: "nextActions" as const, label: "Next", icon: ArrowRight, color: "#3b82f6" },
];

type FormState = {
  title: string;
  date: string;
  hierarchy: JournalHierarchy;
  learned: string;
  challenges: string;
  takeaways: string;
  nextActions: string;
};

const emptyForm = (): FormState => ({
  title: "",
  date: todayISO(),
  hierarchy: { ...EMPTY_HIERARCHY },
  learned: "",
  challenges: "",
  takeaways: "",
  nextActions: "",
});

export default function JournalPage() {
  const entries = useJournal();
  const sessions = useSessions();
  const tracks = useTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const subtopics = useAllSubtopics();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [trackFilter, setTrackFilter] = useState("all");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => getJournalStats(entries), [entries]);
  const unjournaledDays = useMemo(
    () => getUnjournaledStudyDays(sessions, entries, 7),
    [sessions, entries]
  );

  const linkedSessions = useMemo(
    () => matchSessionsForJournal(sessions, form.date, form.hierarchy),
    [sessions, form.date, form.hierarchy]
  );

  const filteredEntries = useMemo(() => {
    let list = entries;
    if (trackFilter !== "all") list = list.filter((e) => e.trackId === trackFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) =>
        [e.title, e.learned, e.challenges, e.takeaways, e.nextActions].some((f) => f?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [entries, trackFilter, search]);

  const grouped = useMemo(() => groupEntriesByMonth(filteredEntries), [filteredEntries]);

  const openNew = (date?: string) => {
    setEditingId(null);
    setForm({ ...emptyForm(), date: date ?? todayISO() });
    setOpen(true);
  };

  const openEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setForm({
      title: entry.title ?? "",
      date: entry.date,
      hierarchy: {
        trackId: entry.trackId ?? "",
        moduleId: entry.moduleId ?? "",
        topicId: entry.topicId ?? "",
        subtopicId: entry.subtopicId ?? "",
      },
      learned: entry.learned,
      challenges: entry.challenges,
      takeaways: entry.takeaways,
      nextActions: entry.nextActions,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      date: form.date,
      title: form.title.trim() || undefined,
      trackId: form.hierarchy.trackId || undefined,
      moduleId: form.hierarchy.moduleId || undefined,
      topicId: form.hierarchy.topicId || undefined,
      subtopicId: form.hierarchy.subtopicId || undefined,
      learned: form.learned,
      challenges: form.challenges,
      takeaways: form.takeaways,
      nextActions: form.nextActions,
      sessionIds: linkedSessions.map((s) => s.id),
      updatedAt: nowISO(),
    };

    if (editingId) {
      await db.journal.update(editingId, payload);
    } else {
      await db.journal.add({ id: uuid(), ...payload, createdAt: nowISO() });
    }
    setOpen(false);
    setForm(emptyForm());
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-medium tracking-tight sm:text-3xl">
            <IconNotebook className="h-7 w-7 text-primary" stroke={1.5} /> Journal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Capture what you learned and link reflections to your tracks.
          </p>
        </div>
        <Button onClick={() => openNew()} className="gap-2">
          <Plus className="h-4 w-4" /> New Entry
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total entries", value: stats.total },
          { label: "This week", value: stats.thisWeek },
          { label: "Journaling streak", value: `${stats.streak}d` },
          { label: "Linked to tracks", value: stats.withTrack },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-3 sm:p-4 text-center">
            <p className="metric-value text-2xl tabular-nums sm:text-3xl">{item.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {unjournaledDays.length > 0 && (
        <div className="rounded-xl border-[0.5px] border-amber-500/25 bg-amber-500/[0.04] p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium text-amber-400/90">
            <IconBulb className="h-3.5 w-3.5" stroke={1.5} />
            Reflect on a study day
          </p>
          <div className="flex flex-wrap gap-2">
            {unjournaledDays.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => openNew(date)}
                className="rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs hover:bg-white/[0.06] transition-colors"
              >
                {format(parseISO(date), "EEE, MMM d")}
              </button>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/journal/go-backend"
        className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-500/25 bg-violet-500/[0.06] px-4 py-4 transition-colors hover:bg-violet-500/[0.09]"
      >
        <div className="flex min-w-0 items-start gap-3">
          <BookMarked className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" />
          <div>
            <p className="font-medium text-violet-100">Go Backend Resource Library</p>
            <p className="mt-1 text-sm text-muted-foreground">
              410 curated links across Modules 0–23 — search by module, topic, or subtopic.
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="shrink-0 border-violet-500/30">
          Open library
        </Button>
      </Link>

      <ResourceLinksPanel
        tracks={tracks}
        modules={modules}
        topics={topics}
        subtopics={subtopics}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs border-[0.5px] border-white/[0.08] bg-white/[0.02]"
        />
        <Select value={trackFilter} onValueChange={setTrackFilter}>
          <SelectTrigger className="w-[200px] border-[0.5px] border-white/[0.08] bg-white/[0.02]">
            <SelectValue placeholder="All Tracks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tracks</SelectItem>
            {tracks.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.icon} {t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.08] py-16 text-center">
          <IconNotebook className="mx-auto mb-4 h-12 w-12 text-muted-foreground/25" stroke={1.25} />
          <h3 className="text-lg font-medium">No journal entries yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Start documenting your learning — link entries to topics for better recall.
          </p>
          <Button className="mt-6 gap-2" onClick={() => openNew()}>
            <Plus className="h-4 w-4" /> Write first entry
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.key}>
              <SectionHeading>{group.label}</SectionHeading>
              <div className="space-y-3">
                <AnimatePresence>
                  {group.entries.map((entry, i) => {
                    const path = getHierarchyPath(entry, tracks, modules, topics, subtopics);
                    const linked = sessions.filter((s) => entry.sessionIds.includes(s.id));
                    const trackColor = path?.track?.color ?? "#8b5cf6";

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="group rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] overflow-hidden"
                        style={{ borderLeftWidth: 3, borderLeftColor: trackColor }}
                      >
                        <div className="p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span>{path?.track?.icon ?? "📝"}</span>
                                <h3 className="font-semibold">
                                  {entry.title || format(parseISO(entry.date), "EEEE, MMM d")}
                                </h3>
                                <Badge variant="outline" className="text-[10px] border-white/[0.08]">
                                  {entry.date}
                                </Badge>
                              </div>
                              {path && (
                                <p className="mt-1 truncate text-xs text-muted-foreground" title={path.label}>
                                  {path.label}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(entry)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => db.journal.delete(entry.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {FIELDS.map((field) => {
                              const text = entry[field.key];
                              if (!text) return null;
                              const Icon = field.icon;
                              return (
                                <div
                                  key={field.key}
                                  className="max-w-full rounded-lg border-[0.5px] border-white/[0.06] bg-white/[0.02] px-2.5 py-2"
                                >
                                  <div className="mb-1 flex items-center gap-1 text-[10px] font-medium" style={{ color: field.color }}>
                                    <Icon className="h-3 w-3" /> {field.label}
                                  </div>
                                  <p className="text-xs leading-relaxed line-clamp-3">{text}</p>
                                </div>
                              );
                            })}
                          </div>

                          {linked.length > 0 && (
                            <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {linked.length} session{linked.length > 1 ? "s" : ""} · {formatDuration(linked.reduce((s, sess) => s + sess.duration, 0))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { if (!v) { setOpen(false); setEditingId(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Entry" : "New Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Title (optional)</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Class 01 reflection" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>

            <div className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Link to learning path</p>
              <HierarchyPicker
                value={form.hierarchy}
                onChange={(hierarchy) => setForm({ ...form, hierarchy })}
                tracks={tracks}
                modules={modules}
                topics={topics}
                subtopics={subtopics}
              />
            </div>

            {FIELDS.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-medium" style={{ color: field.color }}>
                    <Icon className="h-3.5 w-3.5" /> {field.label}
                  </label>
                  <Textarea
                    placeholder={`${field.label}...`}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    rows={2}
                  />
                </div>
              );
            })}

            {linkedSessions.length > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Will link {linkedSessions.length} session{linkedSessions.length > 1 ? "s" : ""} ({formatDuration(linkedSessions.reduce((s, sess) => s + sess.duration, 0))})
              </p>
            )}

            <Button onClick={handleSave} className="w-full" size="lg">
              {editingId ? "Save Changes" : "Save Entry"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
