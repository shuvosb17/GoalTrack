"use client";

import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { format, parseISO, subDays, isAfter } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  NotebookPen, Plus, Lightbulb, AlertCircle, Star, ArrowRight,
  Clock, Trash2, Pencil, BookOpen, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useJournal, useSessions, useTracks, useAllModules, useAllTopics, useAllSubtopics,
} from "@/hooks/use-data";
import { db } from "@/lib/db";
import { nowISO, todayISO, formatDuration } from "@/lib/utils";
import {
  HierarchyPicker, getHierarchyPath, matchSessionsForJournal, type JournalHierarchy,
} from "@/components/journal/hierarchy-picker";
import type { JournalEntry } from "@/lib/types";

const EMPTY_HIERARCHY: JournalHierarchy = { trackId: "", moduleId: "", topicId: "", subtopicId: "" };

const FIELDS = [
  { key: "learned" as const, label: "What I Learned", icon: Lightbulb, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { key: "challenges" as const, label: "Challenges", icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { key: "takeaways" as const, label: "Key Takeaways", icon: Star, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { key: "nextActions" as const, label: "Next Actions", icon: ArrowRight, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
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

  const linkedSessions = useMemo(
    () => matchSessionsForJournal(sessions, form.date, form.hierarchy),
    [sessions, form.date, form.hierarchy]
  );

  const stats = useMemo(() => {
    const weekAgo = subDays(new Date(), 7);
    const thisWeek = entries.filter((e) => isAfter(parseISO(e.date), weekAgo)).length;
    const withTrack = entries.filter((e) => e.trackId).length;
    return { total: entries.length, thisWeek, withTrack };
  }, [entries]);

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

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
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

  const handleDelete = async (id: string) => {
    await db.journal.delete(id);
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-blue-600/10 pointer-events-none" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500">
                <NotebookPen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Learning Journal</h1>
            </div>
            <p className="text-muted-foreground max-w-lg">
              Capture what you learned under any track, module, topic, or subtopic — and reflect with purpose.
            </p>
          </div>
          <Button size="lg" onClick={openNew} className="shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" /> New Entry
          </Button>
        </div>
        <div className="relative grid grid-cols-3 gap-4 mt-8 max-w-md">
          {[
            { label: "Total Entries", value: stats.total, icon: BookOpen },
            { label: "This Week", value: stats.thisWeek, icon: Sparkles },
            { label: "Linked to Tracks", value: stats.withTrack, icon: NotebookPen },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-secondary/40 border border-border/50 p-3 text-center">
              <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={trackFilter} onValueChange={setTrackFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Tracks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tracks</SelectItem>
            {tracks.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.icon} {t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Entries */}
      {filteredEntries.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 text-center">
          <NotebookPen className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No journal entries yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Start documenting your learning journey — link entries to specific topics for better recall.
          </p>
          <Button className="mt-6" onClick={openNew}><Plus className="h-4 w-4" /> Write First Entry</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredEntries.map((entry, i) => {
              const path = getHierarchyPath(entry, tracks, modules, topics, subtopics);
              const linked = sessions.filter((s) => entry.sessionIds.includes(s.id));
              const trackColor = path?.track?.color ?? "#8b5cf6";

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card rounded-2xl overflow-hidden group"
                  style={{ borderLeftWidth: 4, borderLeftColor: trackColor }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg">{path?.track?.icon ?? "📝"}</span>
                          <h3 className="font-semibold text-lg">
                            {entry.title || format(parseISO(entry.date), "EEEE, MMM d")}
                          </h3>
                          <Badge variant="outline" className="text-[10px]">
                            {format(parseISO(entry.date), "yyyy-MM-dd")}
                          </Badge>
                        </div>
                        {path && (
                          <p className="text-xs text-muted-foreground mt-1 truncate" title={path.label}>
                            {path.label}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(entry)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(entry.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      {FIELDS.map((field) => {
                        const text = entry[field.key];
                        if (!text) return null;
                        const Icon = field.icon;
                        return (
                          <div key={field.key} className={`rounded-xl border p-3 ${field.bg}`}>
                            <div className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${field.color}`}>
                              <Icon className="h-3.5 w-3.5" /> {field.label}
                            </div>
                            <p className="text-sm leading-relaxed">{text}</p>
                          </div>
                        );
                      })}
                    </div>

                    {linked.length > 0 && (
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {linked.length} linked session{linked.length > 1 ? "s" : ""} · {formatDuration(linked.reduce((s, sess) => s + sess.duration, 0))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Entry dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setOpen(false); setEditingId(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Journal Entry" : "New Journal Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Title (optional)</label>
                <Input
                  placeholder="e.g. Class 01 reflection"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <p className="text-xs font-medium text-primary">Link to Learning Path</p>
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
                  <label className={`text-xs font-medium flex items-center gap-1.5 ${field.color}`}>
                    <Icon className="h-3.5 w-3.5" /> {field.label}
                  </label>
                  <Textarea
                    placeholder={`Write your ${field.label.toLowerCase()}...`}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    rows={2}
                  />
                </div>
              );
            })}

            {linkedSessions.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
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
