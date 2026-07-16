"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronDown, Plus, GripVertical,
  Archive, ArchiveRestore, Copy, Trash2, Pencil, BookmarkCheck, X,
} from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TimerControls } from "@/components/timer/timer-controls";
import { STATUS_LABELS, STATUS_COLORS, DIFFICULTY_LABELS, DIFFICULTY_COLORS, cn } from "@/lib/utils";
import { formatDeadline, getDaysUntilDue, getSubtopicDueDate } from "@/lib/in-progress";
import { todayISO } from "@/lib/utils";
import { db } from "@/lib/db";
import {
  createModule, createTopic, createSubtopic, updateSubtopicStatus, updateTopicStatus,
  updateSubtopicDueDate,
  updateTopicDifficulty, updateSubtopicDifficulty,
  renameModule, renameTopic, renameSubtopic, deleteModule, deleteTopic,
  archiveModule, unarchiveModule, archiveTopic, unarchiveTopic,
  archiveSubtopic, deleteSubtopic, duplicateSubtopic, reorderItems, snoozeTopicReview,
} from "@/lib/crud";
import { isTopicDueForReview, getReviewDueLabel } from "@/lib/metrics";
import { useReviewStore } from "@/stores/review-store";
import { TopicConfidenceDialog, type TopicConfidenceMode } from "@/components/tracks/topic-confidence-dialog";
import { SetDeadlineDialog } from "@/components/tracks/set-deadline-dialog";
import type { Track, Module, Topic, Subtopic, ProgressStatus, Difficulty } from "@/lib/types";
import { getModuleProgress, getTopicProgress, getTrackProgress } from "@/lib/analytics";
import { useSessions } from "@/hooks/use-data";
import {
  getSubtopicLoggedMs, getTopicLoggedMs, getModuleLoggedMs, getTrackLoggedMs,
} from "@/lib/time-log";
import { InlineCodeText } from "@/components/shared/inline-code-text";
import { toPlainLearningLabel } from "@/lib/format-learning-text";
import { GO_BACKEND_PROJECT_TOPIC_PREFIX } from "@/lib/go-backend-projects";
import { TrackRow } from "@/components/tracks/track-row";
import {
  ProblemSearch,
  type ProblemSearchResult,
} from "@/components/tracks/problem-search";
import { getTrackLast7DayHours } from "@/lib/track-sparkline";

const PROBLEM_SEARCH_LIMIT = 25;

interface HierarchyTreeProps {
  tracks: Track[];
  modules: Module[];
  topics: Topic[];
  subtopics: Subtopic[];
  selectedTrackId?: string;
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      <button {...attributes} {...listeners} className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
        <GripVertical className="h-3 w-3" />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function HierarchyTree({ tracks, modules, topics, subtopics, selectedTrackId }: HierarchyTreeProps) {
  const sessions = useSessions();
  const removeFromQueue = useReviewStore((s) => s.removeFromQueue);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<{ type: string; parentId?: string; trackId?: string; moduleId?: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("medium");
  const [statusDialog, setStatusDialog] = useState<{
    id: string;
    type: "topic" | "subtopic";
    dueDate: string;
    accentColor?: string;
  } | null>(null);
  const [editDialog, setEditDialog] = useState<{ type: "module" | "topic" | "subtopic"; id: string; name: string; difficulty?: Difficulty } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ type: "module" | "topic"; id: string; name: string } | null>(null);
  const [confidenceDialog, setConfidenceDialog] = useState<{ id: string; name: string; mode: TopicConfidenceMode } | null>(null);
  const [archivedOpen, setArchivedOpen] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedSubtopicId, setHighlightedSubtopicId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!highlightedSubtopicId) return;
    const timer = window.setTimeout(() => setHighlightedSubtopicId(null), 2000);
    return () => window.clearTimeout(timer);
  }, [highlightedSubtopicId]);

  const toggleArchived = (trackId: string) => {
    setArchivedOpen((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  const filteredTracks = selectedTrackId ? tracks.filter((t) => t.id === selectedTrackId) : tracks;

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getProblemSearchResults = (trackId: string): ProblemSearchResult[] => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const archivedModuleIds = new Set(
      modules.filter((m) => m.trackId === trackId && m.archived).map((m) => m.id)
    );
    const archivedTopicIds = new Set(
      topics.filter((t) => t.trackId === trackId && t.archived).map((t) => t.id)
    );
    const moduleById = new Map(
      modules.filter((m) => m.trackId === trackId && !m.archived).map((m) => [m.id, m])
    );
    const topicById = new Map(
      topics.filter((t) => t.trackId === trackId && !t.archived).map((t) => [t.id, t])
    );

    const matches: ProblemSearchResult[] = [];
    for (const sub of subtopics) {
      if (sub.trackId !== trackId || sub.archived) continue;
      if (archivedModuleIds.has(sub.moduleId) || archivedTopicIds.has(sub.topicId)) continue;
      if (!sub.name.toLowerCase().includes(query)) continue;

      const mod = moduleById.get(sub.moduleId);
      const topic = topicById.get(sub.topicId);
      if (!mod || !topic) continue;

      matches.push({
        subtopicId: sub.id,
        name: sub.name,
        moduleId: mod.id,
        moduleName: mod.name,
        topicId: topic.id,
        topicName: topic.name,
      });
      if (matches.length >= PROBLEM_SEARCH_LIMIT) break;
    }
    return matches;
  };

  const handleProblemSelect = (trackId: string, result: ProblemSearchResult) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(trackId);
      next.add(result.moduleId);
      next.add(result.topicId);
      return next;
    });
    setHighlightedSubtopicId(result.subtopicId);
    setSearchQuery("");

    requestAnimationFrame(() => {
      window.setTimeout(() => {
        const el = document.querySelector(
          `[data-subtopic-id="${globalThis.CSS.escape(result.subtopicId)}"]`
        );
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    });
  };

  const handleCreate = async () => {
    if (!dialog || !newName.trim()) return;
    if (dialog.type === "module" && dialog.trackId) await createModule(dialog.trackId, newName);
    if (dialog.type === "topic" && dialog.parentId && dialog.trackId) await createTopic(dialog.parentId, dialog.trackId, newName, newDifficulty);
    if (dialog.type === "subtopic" && dialog.parentId && dialog.moduleId && dialog.trackId)
      await createSubtopic(dialog.parentId, dialog.moduleId, dialog.trackId, newName, newDifficulty);
    setDialog(null);
    setNewName("");
    setNewDifficulty("medium");
  };

  const handleEdit = async () => {
    if (!editDialog || !editDialog.name.trim()) return;
    if (editDialog.type === "module") await renameModule(editDialog.id, editDialog.name.trim());
    if (editDialog.type === "topic") {
      await renameTopic(editDialog.id, editDialog.name.trim());
      if (editDialog.difficulty) await updateTopicDifficulty(editDialog.id, editDialog.difficulty);
    }
    if (editDialog.type === "subtopic") {
      await renameSubtopic(editDialog.id, editDialog.name.trim());
      if (editDialog.difficulty) await updateSubtopicDifficulty(editDialog.id, editDialog.difficulty);
    }
    setEditDialog(null);
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    if (deleteDialog.type === "module") await deleteModule(deleteDialog.id);
    if (deleteDialog.type === "topic") await deleteTopic(deleteDialog.id);
    setDeleteDialog(null);
  };

  const handleDismissReview = async (topicId: string) => {
    await snoozeTopicReview(topicId);
    removeFromQueue(`topic:${topicId}`);
  };

  const handleDragEnd = async (event: DragEndEvent, items: { id: string; order: number }[], table: Parameters<typeof reorderItems>[0]) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    await reorderItems(table, reordered);
  };

  return (
    <div className="space-y-0">
      {filteredTracks.map((track) => {
        const trackModulesAll = modules.filter((m) => m.trackId === track.id).sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
        const activeModules = trackModulesAll.filter((m) => !m.archived);
        const archivedModules = trackModulesAll.filter((m) => m.archived);
        const archivedTopicCount = topics.filter(
          (t) => t.trackId === track.id && t.archived && !archivedModules.some((m) => m.id === t.moduleId)
        ).length;
        const trackProgress = getTrackProgress(track.id, topics, subtopics, modules).percentage;

        const sparklineValues = getTrackLast7DayHours(track.id, sessions);

        return (
          <div key={track.id} className="mb-2.5 overflow-hidden">
            <TrackRow
              track={track}
              progressPercent={trackProgress}
              loggedMs={getTrackLoggedMs(track.id, sessions)}
              sparklineValues={sparklineValues}
              expanded={expanded.has(track.id)}
              onToggle={() => toggle(track.id)}
              onAddModule={() => setDialog({ type: "module", trackId: track.id })}
            />

            <AnimatePresence>
              {expanded.has(track.id) && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="space-y-2 border-t border-border/40 px-[18px] pb-4 pt-3">
                    <ProblemSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      results={getProblemSearchResults(track.id)}
                      onSelect={(result) => handleProblemSelect(track.id, result)}
                    />
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, activeModules, db.modules)}>
                      <SortableContext items={activeModules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                        {activeModules.map((mod) => {
                          const modTopicsAll = topics.filter((t) => t.moduleId === mod.id).sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
                          const modTopics = modTopicsAll.filter((t) => !t.archived);
                          const archivedModTopics = modTopicsAll.filter((t) => t.archived);
                          const modProgress = getModuleProgress(mod.id, topics, subtopics);

                          return (
                            <SortableItem key={mod.id} id={mod.id}>
                              <div className="rounded-lg border border-border/50 overflow-hidden">
                                <div className="flex items-center gap-2 overflow-x-auto p-3 bg-secondary/20 cursor-pointer group" onClick={() => toggle(mod.id)}>
                                  {expanded.has(mod.id) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                  <span className="text-sm font-medium flex-1 min-w-[8rem] truncate">{mod.name}</span>
                                  <span className="text-xs text-muted-foreground w-8 text-right">{modProgress.percentage}%</span>
                                  <Progress value={modProgress.percentage} className="h-1 w-16 hidden sm:block" />
                                  <TimerControls
                                    path={{ trackId: track.id, moduleId: mod.id }}
                                    label={`${track.name} → ${mod.name}`}
                                    compact
                                    loggedMs={getModuleLoggedMs(mod.id, topics, subtopics, sessions)}
                                  />
                                  <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditDialog({ type: "module", id: mod.id, name: mod.name }); }}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" title="Archive module" onClick={(e) => { e.stopPropagation(); void archiveModule(mod.id); }}>
                                      <Archive className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteDialog({ type: "module", id: mod.id, name: mod.name }); }}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setNewDifficulty("medium"); setDialog({ type: "topic", parentId: mod.id, trackId: track.id }); }}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                <AnimatePresence>
                                  {expanded.has(mod.id) && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                      <div className="p-2 space-y-1">
                                        {modTopics.map((topic) => {
                                          const topicSubs = subtopics.filter((s) => s.topicId === topic.id && !s.archived).sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
                                          const topicProgress = getTopicProgress(topic, subtopics);
                                          const reviewDue = isTopicDueForReview(topic);
                                          const reviewLabel = getReviewDueLabel(topic);
                                          const isProjectTopic = topic.name.startsWith(GO_BACKEND_PROJECT_TOPIC_PREFIX);

                                          return (
                                            <div
                                              key={topic.id}
                                              className={cn(
                                                "rounded-md border border-border/30",
                                                reviewDue && "ring-1 ring-violet-500/40 bg-violet-500/[0.03]",
                                                isProjectTopic && "border-emerald-500/30 bg-emerald-500/[0.04]"
                                              )}
                                            >
                                              <div className="flex items-center gap-2 overflow-x-auto p-2 pl-2 cursor-pointer hover:bg-secondary/20 group sm:pl-4" onClick={() => toggle(topic.id)}>
                                                {expanded.has(topic.id) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                <span className="text-sm flex-1 min-w-[6rem] truncate">{topic.name}</span>
                                                <Select
                                                  value={topic.difficulty}
                                                  onValueChange={(v) => updateTopicDifficulty(topic.id, v as Difficulty)}
                                                >
                                                  <SelectTrigger
                                                    className="h-6 w-[88px] text-[10px] border-border/50"
                                                    style={{ color: DIFFICULTY_COLORS[topic.difficulty] }}
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                                                      <SelectItem key={k} value={k} style={{ color: DIFFICULTY_COLORS[k as Difficulty] }}>
                                                        {v}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                                <span className="text-xs text-muted-foreground w-8 text-right">{topicProgress.percentage}%</span>
                                                <Progress value={topicProgress.percentage} className="h-1 w-12 hidden sm:block" />
                                                {(topic.status === "in_progress" || topicProgress.inProgress > 0) && (
                                                  <Badge variant="warning" className="text-[10px]">Active</Badge>
                                                )}
                                                {reviewDue && (
                                                  <Badge variant="outline" className="gap-1 border-violet-500/30 text-[10px] text-violet-300">
                                                    <BookmarkCheck className="h-3 w-3" /> Review due
                                                  </Badge>
                                                )}
                                                {reviewLabel && !reviewDue && (
                                                  <span className="hidden text-[10px] text-muted-foreground sm:inline">{reviewLabel}</span>
                                                )}
                                                <Select
                                                  value={topic.status ?? "not_started"}
                                                  onValueChange={(v) => {
                                                    const status = v as ProgressStatus;
                                                    if (status === "in_progress") {
                                                      updateTopicStatus(topic.id, status, topic.dueDate ?? todayISO());
                                                      setStatusDialog({
                                                        id: topic.id,
                                                        type: "topic",
                                                        dueDate: topic.dueDate ?? todayISO(),
                                                        accentColor: track.color,
                                                      });
                                                    } else {
                                                      updateTopicStatus(topic.id, status);
                                                    }
                                                  }}
                                                >
                                                  <SelectTrigger
                                                    className="h-6 w-[110px] text-[10px]"
                                                    style={{ color: STATUS_COLORS[topic.status ?? "not_started"] }}
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                                      <SelectItem key={k} value={k} style={{ color: STATUS_COLORS[k as ProgressStatus] }}>
                                                        {v}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                                {reviewDue && (
                                                  <>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      className="h-6 gap-1 border-violet-500/30 px-2 text-[10px] text-violet-300"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfidenceDialog({ id: topic.id, name: topic.name, mode: "review" });
                                                      }}
                                                    >
                                                      <BookmarkCheck className="h-3 w-3" /> Review
                                                    </Button>
                                                    <Button
                                                      size="icon"
                                                      variant="ghost"
                                                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                      title="Snooze review — reschedule using current confidence"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        void handleDismissReview(topic.id);
                                                      }}
                                                    >
                                                      <X className="h-3 w-3" />
                                                    </Button>
                                                  </>
                                                )}
                                                <TimerControls
                                                  path={{ trackId: track.id, moduleId: mod.id, topicId: topic.id }}
                                                  label={`${mod.name} → ${topic.name}`}
                                                  compact
                                                  loggedMs={getTopicLoggedMs(topic.id, subtopics, sessions)}
                                                />
                                                <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                                                  <Button size="icon" variant="ghost" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); setEditDialog({ type: "topic", id: topic.id, name: topic.name, difficulty: topic.difficulty }); }}>
                                                    <Pencil className="h-3 w-3" />
                                                  </Button>
                                                  <Button size="icon" variant="ghost" className="h-5 w-5" title="Archive topic" onClick={(e) => { e.stopPropagation(); void archiveTopic(topic.id); }}>
                                                    <Archive className="h-3 w-3" />
                                                  </Button>
                                                  <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteDialog({ type: "topic", id: topic.id, name: topic.name }); }}>
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); setNewDifficulty(topic.difficulty); setDialog({ type: "subtopic", parentId: topic.id, moduleId: mod.id, trackId: track.id }); }}>
                                                  <Plus className="h-3 w-3" />
                                                </Button>
                                              </div>

                                              <AnimatePresence>
                                                {expanded.has(topic.id) && (
                                                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}>
                                                    <div className="mt-1 max-h-[min(24rem,calc(2.75rem*8))] space-y-1 overflow-y-auto overscroll-contain pr-1">
                                                      {topicSubs.map((sub) => (
                                                        <div
                                                          key={sub.id}
                                                          data-subtopic-id={sub.id}
                                                          className={cn(
                                                            "group grid grid-cols-1 gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-white/[0.06] hover:bg-secondary/20 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:items-start sm:gap-2",
                                                            highlightedSubtopicId === sub.id &&
                                                              "border-primary/40 bg-primary/10 ring-1 ring-primary/30"
                                                          )}
                                                        >
                                                          <Select value={sub.status} onValueChange={(v) => {
                                                            const status = v as ProgressStatus;
                                                            updateSubtopicStatus(sub.id, status, sub.dueDate ?? todayISO());
                                                            if (status === "in_progress") {
                                                              setStatusDialog({
                                                                id: sub.id,
                                                                type: "subtopic",
                                                                dueDate: sub.dueDate ?? todayISO(),
                                                                accentColor: track.color,
                                                              });
                                                            }
                                                          }}>
                                                            <SelectTrigger
                                                              className="h-7 w-full text-xs sm:w-[7.5rem]"
                                                              style={{ color: STATUS_COLORS[sub.status] }}
                                                            >
                                                              <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                                                <SelectItem key={k} value={k} style={{ color: STATUS_COLORS[k as ProgressStatus] }}>
                                                                  {v}
                                                                </SelectItem>
                                                              ))}
                                                            </SelectContent>
                                                          </Select>
                                                          <div className="min-w-0 text-left text-sm">
                                                            <InlineCodeText text={sub.name} className="break-words" />
                                                          </div>
                                                          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                                                          {sub.status === "in_progress" && (() => {
                                                            const due = getSubtopicDueDate(sub, topic);
                                                            if (!due) return null;
                                                            const days = getDaysUntilDue(due);
                                                            return (
                                                              <Badge
                                                                variant={days! < 0 ? "destructive" : "warning"}
                                                                className="text-[10px] cursor-pointer hover:opacity-80"
                                                                onClick={() =>
                                                                  setStatusDialog({
                                                                    id: sub.id,
                                                                    type: "subtopic",
                                                                    dueDate: due,
                                                                    accentColor: track.color,
                                                                  })
                                                                }
                                                              >
                                                                {formatDeadline(days, due)}
                                                              </Badge>
                                                            );
                                                          })()}
                                                          <Select
                                                            value={sub.difficulty}
                                                            onValueChange={(v) => updateSubtopicDifficulty(sub.id, v as Difficulty)}
                                                          >
                                                            <SelectTrigger
                                                              className="h-7 w-[3.25rem] shrink-0 px-1.5 text-[10px] border-border/50"
                                                              style={{ color: DIFFICULTY_COLORS[sub.difficulty] }}
                                                              title={DIFFICULTY_LABELS[sub.difficulty]}
                                                            >
                                                              <SelectValue>
                                                                {DIFFICULTY_LABELS[sub.difficulty].slice(0, 3)}
                                                              </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                              {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                                                                <SelectItem key={k} value={k} style={{ color: DIFFICULTY_COLORS[k as Difficulty] }}>
                                                                  {v}
                                                                </SelectItem>
                                                              ))}
                                                            </SelectContent>
                                                          </Select>
                                                          <TimerControls
                                                            path={{ trackId: track.id, moduleId: mod.id, topicId: topic.id, subtopicId: sub.id }}
                                                            label={`${topic.name} → ${toPlainLearningLabel(sub.name)}`}
                                                            compact
                                                            loggedMs={getSubtopicLoggedMs(sub.id, sessions)}
                                                            allowManual
                                                          />
                                                          <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                                                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setEditDialog({ type: "subtopic", id: sub.id, name: sub.name, difficulty: sub.difficulty })}><Pencil className="h-3 w-3" /></Button>
                                                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => duplicateSubtopic(sub)}><Copy className="h-3 w-3" /></Button>
                                                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => archiveSubtopic(sub.id)}><Archive className="h-3 w-3" /></Button>
                                                            <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => deleteSubtopic(sub.id)}><Trash2 className="h-3 w-3" /></Button>
                                                          </div>
                                                          </div>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>
                                            </div>
                                          );
                                        })}
                                        {archivedModTopics.length > 0 && (
                                          <div className="mt-2 rounded-md border border-dashed border-border/40 p-2">
                                            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                              Archived topics
                                            </p>
                                            {archivedModTopics.map((topic) => (
                                              <div
                                                key={topic.id}
                                                className="flex flex-wrap items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary/20"
                                              >
                                                <span className="min-w-0 flex-1 truncate">{topic.name}</span>
                                                <TimerControls
                                                  path={{ trackId: track.id, moduleId: mod.id, topicId: topic.id }}
                                                  label={`${mod.name} → ${topic.name}`}
                                                  compact
                                                  loggedMs={getTopicLoggedMs(topic.id, subtopics, sessions)}
                                                />
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-6 w-6"
                                                  title="Restore topic"
                                                  onClick={() => void unarchiveTopic(topic.id)}
                                                >
                                                  <ArchiveRestore className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </SortableItem>
                          );
                        })}
                      </SortableContext>
                    </DndContext>
                    {(archivedModules.length > 0 || archivedTopicCount > 0) && (
                      <div className="mt-3 border-t border-border/50 pt-2">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary/30"
                          onClick={() => toggleArchived(track.id)}
                        >
                          {archivedOpen.has(track.id) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                          <Archive className="h-3 w-3" />
                          <span>
                            Archived ({archivedModules.length + archivedTopicCount})
                          </span>
                        </button>
                        {archivedOpen.has(track.id) && (
                          <div className="mt-2 space-y-2">
                            {archivedModules.map((mod) => (
                              <div
                                key={mod.id}
                                className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border/40 bg-secondary/10 px-3 py-2"
                              >
                                <span className="min-w-0 flex-1 text-sm text-muted-foreground">{mod.name}</span>
                                <span className="text-[10px] text-muted-foreground">excluded from progress</span>
                                <TimerControls
                                  path={{ trackId: track.id, moduleId: mod.id }}
                                  label={`${track.name} → ${mod.name}`}
                                  compact
                                  loggedMs={getModuleLoggedMs(mod.id, topics, subtopics, sessions)}
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  title="Restore module"
                                  onClick={() => void unarchiveModule(mod.id)}
                                >
                                  <ArchiveRestore className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <Dialog open={!!dialog} onOpenChange={() => { setDialog(null); setNewName(""); setNewDifficulty("medium"); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create {dialog?.type}</DialogTitle>
          </DialogHeader>
          <Input placeholder={`Enter ${dialog?.type} name`} value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
          {(dialog?.type === "topic" || dialog?.type === "subtopic") && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Difficulty</label>
              <Select value={newDifficulty} onValueChange={(v) => setNewDifficulty(v as Difficulty)}>
                <SelectTrigger className="w-full" style={{ color: DIFFICULTY_COLORS[newDifficulty] }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k} style={{ color: DIFFICULTY_COLORS[k as Difficulty] }}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={handleCreate}>Create</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editDialog?.type}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Name"
            value={editDialog?.name ?? ""}
            onChange={(e) => editDialog && setEditDialog({ ...editDialog, name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleEdit()}
          />
          {(editDialog?.type === "topic" || editDialog?.type === "subtopic") && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Difficulty</label>
              <Select
                value={editDialog.difficulty ?? "medium"}
                onValueChange={(v) => editDialog && setEditDialog({ ...editDialog, difficulty: v as Difficulty })}
              >
                <SelectTrigger className="w-full" style={{ color: DIFFICULTY_COLORS[editDialog.difficulty ?? "medium"] }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k} style={{ color: DIFFICULTY_COLORS[k as Difficulty] }}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={handleEdit}>Save</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteDialog?.type}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleteDialog?.type === "module"
              ? `Move "${deleteDialog.name}" and all its topics and subtopics to Recycle Bin? Study time logs are kept. You can restore from Settings.`
              : `Move "${deleteDialog?.name}" and all its subtopics to Recycle Bin? Study time logs are kept. You can restore from Settings.`}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      <SetDeadlineDialog
        open={!!statusDialog}
        onOpenChange={(open) => {
          if (!open) setStatusDialog(null);
        }}
        dueDate={statusDialog?.dueDate ?? todayISO()}
        onDueDateChange={(dateKey) => {
          if (statusDialog) setStatusDialog({ ...statusDialog, dueDate: dateKey });
        }}
        accent={statusDialog?.accentColor ?? "#FAC775"}
        onSave={async () => {
          if (!statusDialog) return;
          if (statusDialog.type === "topic") {
            await updateTopicStatus(statusDialog.id, "in_progress", statusDialog.dueDate);
          } else {
            const sub = await db.subtopics.get(statusDialog.id);
            if (sub?.status === "in_progress") {
              await updateSubtopicDueDate(statusDialog.id, statusDialog.dueDate);
            } else {
              await updateSubtopicStatus(statusDialog.id, "in_progress", statusDialog.dueDate);
            }
          }
          setStatusDialog(null);
        }}
      />

      <TopicConfidenceDialog
        open={!!confidenceDialog}
        onOpenChange={() => setConfidenceDialog(null)}
        entityId={confidenceDialog?.id ?? null}
        entityName={confidenceDialog?.name ?? ""}
        mode={confidenceDialog?.mode ?? "complete"}
      />
    </div>
  );
}
