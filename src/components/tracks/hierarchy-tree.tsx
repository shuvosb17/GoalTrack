"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronDown, Plus, GripVertical,
  Archive, Copy, Trash2, Pencil,
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
import { STATUS_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/utils";
import { formatDeadline, getDaysUntilDue } from "@/lib/in-progress";
import { todayISO } from "@/lib/utils";
import { db } from "@/lib/db";
import {
  createModule, createTopic, createSubtopic, updateSubtopicStatus, updateTopicStatus,
  updateTopicDifficulty, updateSubtopicDifficulty,
  renameModule, renameTopic, deleteModule, deleteTopic,
  archiveSubtopic, deleteSubtopic, duplicateSubtopic, reorderItems,
} from "@/lib/crud";
import type { Track, Module, Topic, Subtopic, ProgressStatus, Difficulty } from "@/lib/types";
import { getModuleProgress, getTopicProgress, getTrackProgress } from "@/lib/analytics";
import { useSessions } from "@/hooks/use-data";
import {
  getSubtopicLoggedMs, getTopicLoggedMs, getModuleLoggedMs, getTrackLoggedMs,
} from "@/lib/time-log";

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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<{ type: string; parentId?: string; trackId?: string; moduleId?: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("medium");
  const [statusDialog, setStatusDialog] = useState<{ id: string; type: "topic" | "subtopic"; dueDate: string } | null>(null);
  const [editDialog, setEditDialog] = useState<{ type: "module" | "topic"; id: string; name: string; difficulty?: Difficulty } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ type: "module" | "topic"; id: string; name: string } | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredTracks = selectedTrackId ? tracks.filter((t) => t.id === selectedTrackId) : tracks;

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
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
    setEditDialog(null);
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    if (deleteDialog.type === "module") await deleteModule(deleteDialog.id);
    if (deleteDialog.type === "topic") await deleteTopic(deleteDialog.id);
    setDeleteDialog(null);
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
    <div className="space-y-4">
      {filteredTracks.map((track) => {
        const trackModules = modules.filter((m) => m.trackId === track.id).sort((a, b) => a.order - b.order);
        const trackProgress = getTrackProgress(track.id, topics, subtopics).percentage;

        return (
          <div key={track.id} className="glass-card rounded-xl overflow-hidden">
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => toggle(track.id)}
            >
              <span className="text-xl">{track.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{track.name}</h3>
                  <Badge variant="outline">{trackProgress}%</Badge>
                </div>
                <Progress value={trackProgress} className="h-1 mt-2" />
              </div>
              <TimerControls
                path={{ trackId: track.id }}
                label={track.name}
                compact
                loggedMs={getTrackLoggedMs(track.id, sessions)}
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setDialog({ type: "module", trackId: track.id }); }}>
                <Plus className="h-4 w-4" />
              </Button>
              {expanded.has(track.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>

            <AnimatePresence>
              {expanded.has(track.id) && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-2 border-t border-border/50 pt-3">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, trackModules, db.modules)}>
                      <SortableContext items={trackModules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                        {trackModules.map((mod) => {
                          const modTopics = topics.filter((t) => t.moduleId === mod.id).sort((a, b) => a.order - b.order);
                          const modProgress = getModuleProgress(mod.id, topics, subtopics);

                          return (
                            <SortableItem key={mod.id} id={mod.id}>
                              <div className="rounded-lg border border-border/50 overflow-hidden">
                                <div className="flex items-center gap-2 p-3 bg-secondary/20 cursor-pointer group" onClick={() => toggle(mod.id)}>
                                  {expanded.has(mod.id) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                  <span className="text-sm font-medium flex-1">{mod.name}</span>
                                  <span className="text-xs text-muted-foreground w-8 text-right">{modProgress.percentage}%</span>
                                  <Progress value={modProgress.percentage} className="h-1 w-16 hidden sm:block" />
                                  <TimerControls
                                    path={{ trackId: track.id, moduleId: mod.id }}
                                    label={`${track.name} → ${mod.name}`}
                                    compact
                                    loggedMs={getModuleLoggedMs(mod.id, subtopics, sessions)}
                                  />
                                  <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditDialog({ type: "module", id: mod.id, name: mod.name }); }}>
                                      <Pencil className="h-3 w-3" />
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
                                          const topicSubs = subtopics.filter((s) => s.topicId === topic.id && !s.archived).sort((a, b) => a.order - b.order);
                                          const topicProgress = getTopicProgress(topic, subtopics);

                                          return (
                                            <div key={topic.id} className="rounded-md border border-border/30">
                                              <div className="flex items-center gap-2 p-2 pl-4 cursor-pointer hover:bg-secondary/20 group" onClick={() => toggle(topic.id)}>
                                                {expanded.has(topic.id) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                <span className="text-sm flex-1">{topic.name}</span>
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
                                                <Select
                                                  value={topic.status ?? "not_started"}
                                                  onValueChange={(v) => {
                                                    const status = v as ProgressStatus;
                                                    if (status === "in_progress") {
                                                      updateTopicStatus(topic.id, status, topic.dueDate ?? todayISO());
                                                      setStatusDialog({ id: topic.id, type: "topic", dueDate: topic.dueDate ?? todayISO() });
                                                    } else {
                                                      updateTopicStatus(topic.id, status);
                                                    }
                                                  }}
                                                >
                                                  <SelectTrigger className="h-6 w-[110px] text-[10px]" onClick={(e) => e.stopPropagation()}>
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                                      <SelectItem key={k} value={k}>{v}</SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                                <TimerControls
                                                  path={{ trackId: track.id, moduleId: mod.id, topicId: topic.id }}
                                                  label={`${mod.name} → ${topic.name}`}
                                                  compact
                                                  loggedMs={getTopicLoggedMs(topic.id, subtopics, sessions)}
                                                />
                                                <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
                                                  <Button size="icon" variant="ghost" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); setEditDialog({ type: "topic", id: topic.id, name: topic.name, difficulty: topic.difficulty }); }}>
                                                    <Pencil className="h-3 w-3" />
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
                                                    <div className="px-4 pb-2 space-y-1">
                                                      {topicSubs.map((sub) => (
                                                        <div key={sub.id} className="flex items-center gap-2 p-2 pl-6 rounded hover:bg-secondary/20 group">
                                                          <Select value={sub.status} onValueChange={(v) => {
                                                            const status = v as ProgressStatus;
                                                            updateSubtopicStatus(sub.id, status, sub.dueDate ?? todayISO());
                                                            if (status === "in_progress") {
                                                              setStatusDialog({ id: sub.id, type: "subtopic", dueDate: sub.dueDate ?? todayISO() });
                                                            }
                                                          }}>
                                                            <SelectTrigger className="h-7 w-[130px] text-xs">
                                                              <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                                                <SelectItem key={k} value={k}>{v}</SelectItem>
                                                              ))}
                                                            </SelectContent>
                                                          </Select>
                                                          <span className="text-sm flex-1">{sub.name}</span>
                                                          {sub.status === "in_progress" && sub.dueDate && (
                                                            <Badge variant={getDaysUntilDue(sub.dueDate)! < 0 ? "destructive" : "warning"} className="text-[10px]">
                                                              {formatDeadline(getDaysUntilDue(sub.dueDate), sub.dueDate)}
                                                            </Badge>
                                                          )}
                                                          <Select
                                                            value={sub.difficulty}
                                                            onValueChange={(v) => updateSubtopicDifficulty(sub.id, v as Difficulty)}
                                                          >
                                                            <SelectTrigger
                                                              className="h-7 w-[88px] text-[10px] border-border/50"
                                                              style={{ color: DIFFICULTY_COLORS[sub.difficulty] }}
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
                                                          <TimerControls
                                                            path={{ trackId: track.id, moduleId: mod.id, topicId: topic.id, subtopicId: sub.id }}
                                                            label={`${topic.name} → ${sub.name}`}
                                                            compact
                                                            loggedMs={getSubtopicLoggedMs(sub.id, sessions)}
                                                            allowManual
                                                          />
                                                          <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
                                                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => duplicateSubtopic(sub)}><Copy className="h-3 w-3" /></Button>
                                                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => archiveSubtopic(sub.id)}><Archive className="h-3 w-3" /></Button>
                                                            <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => deleteSubtopic(sub.id)}><Trash2 className="h-3 w-3" /></Button>
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
          {editDialog?.type === "topic" && (
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
              ? `Delete "${deleteDialog.name}" and all its topics, subtopics, and related time logs? This cannot be undone.`
              : `Delete "${deleteDialog?.name}" and all its subtopics and related time logs? This cannot be undone.`}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!statusDialog} onOpenChange={() => setStatusDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Deadline</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Defaults to today in your local timezone. Adjust if needed — shown on Tracks and Status pages.
          </p>
          <div>
            <label className="text-xs text-muted-foreground">Due date</label>
            <Input
              type="date"
              value={statusDialog?.dueDate ?? ""}
              onChange={(e) => statusDialog && setStatusDialog({ ...statusDialog, dueDate: e.target.value })}
            />
          </div>
          <Button
            onClick={async () => {
              if (!statusDialog) return;
              if (statusDialog.type === "topic") {
                await updateTopicStatus(statusDialog.id, "in_progress", statusDialog.dueDate);
              } else {
                await updateSubtopicStatus(statusDialog.id, "in_progress", statusDialog.dueDate);
              }
              setStatusDialog(null);
            }}
            className="w-full"
          >
            Save Deadline
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
