"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { GoalMilestone, Module, Topic, Track, Subtopic } from "@/lib/types";
import { GOAL_MONTH_OPTIONS, createGoalMilestone, updateGoalMilestone, resolveGoalProgress } from "@/lib/goal-milestones";
import { todayISO } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";

interface GoalHierarchy {
  trackId: string;
  moduleId: string;
  topicId: string;
}

interface GoalMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracks: Track[];
  modules: Module[];
  topics: Topic[];
  subtopics: Subtopic[];
  editing?: GoalMilestone | null;
}

export function GoalMilestoneDialog({
  open,
  onOpenChange,
  tracks,
  modules,
  topics,
  subtopics,
  editing,
}: GoalMilestoneDialogProps) {
  const [title, setTitle] = useState("");
  const [hierarchy, setHierarchy] = useState<GoalHierarchy>({ trackId: "", moduleId: "", topicId: "" });
  const [startDate, setStartDate] = useState(todayISO());
  const [months, setMonths] = useState(3);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title);
      setHierarchy({
        trackId: editing.trackId,
        moduleId: editing.moduleId ?? "",
        topicId: editing.topicId ?? "",
      });
      setStartDate(editing.startDate);
      setMonths(editing.months);
      setNotes(editing.notes ?? "");
    } else {
      setTitle("");
      setHierarchy({ trackId: tracks[0]?.id ?? "", moduleId: "", topicId: "" });
      setStartDate(todayISO());
      setMonths(3);
      setNotes("");
    }
  }, [open, editing, tracks]);

  const trackModules = modules.filter((m) => m.trackId === hierarchy.trackId && !m.archived);
  const moduleTopics = topics.filter((t) => t.moduleId === hierarchy.moduleId && !t.archived);
  const liveProgress = hierarchy.trackId
    ? resolveGoalProgress(
        { trackId: hierarchy.trackId, moduleId: hierarchy.moduleId || undefined, topicId: hierarchy.topicId || undefined },
        topics,
        subtopics
      )
    : 0;
  const scopeLabel = hierarchy.topicId
    ? topics.find((t) => t.id === hierarchy.topicId)?.name ?? "Topic"
    : hierarchy.moduleId
      ? modules.find((m) => m.id === hierarchy.moduleId)?.name ?? "Module"
      : tracks.find((t) => t.id === hierarchy.trackId)?.name ?? "Track";

  const updateHierarchy = (patch: Partial<GoalHierarchy>) => {
    const next = { ...hierarchy, ...patch };
    if (patch.trackId !== undefined) {
      next.moduleId = "";
      next.topicId = "";
    }
    if (patch.moduleId !== undefined) next.topicId = "";
    setHierarchy(next);
  };

  const handleSave = async () => {
    if (!title.trim() || !hierarchy.trackId) return;
    if (editing) {
      await updateGoalMilestone(
        editing.id,
        {
          title: title.trim(),
          trackId: hierarchy.trackId,
          moduleId: hierarchy.moduleId || undefined,
          topicId: hierarchy.topicId || undefined,
          startDate,
          months,
          notes: notes.trim() || undefined,
        },
        topics,
        subtopics
      );
    } else {
      await createGoalMilestone({
        title: title.trim(),
        trackId: hierarchy.trackId,
        moduleId: hierarchy.moduleId || undefined,
        topicId: hierarchy.topicId || undefined,
        startDate,
        months,
        notes: notes.trim() || undefined,
        topics,
        subtopics,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Goal Milestone" : "New Goal Milestone"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Goal title</label>
            <Input
              className="mt-1 h-11"
              placeholder="e.g. Master Graph Theory basics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Track</label>
              <Select value={hierarchy.trackId || "none"} onValueChange={(v) => updateHierarchy({ trackId: v === "none" ? "" : v })}>
                <SelectTrigger className="mt-1 h-11"><SelectValue placeholder="Select track" /></SelectTrigger>
                <SelectContent>
                  {tracks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.icon} {t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Module (optional)</label>
              <Select
                value={hierarchy.moduleId || "none"}
                onValueChange={(v) => updateHierarchy({ moduleId: v === "none" ? "" : v })}
                disabled={!hierarchy.trackId}
              >
                <SelectTrigger className="mt-1 h-11"><SelectValue placeholder="Whole track" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Whole track</SelectItem>
                  {trackModules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">Topic (optional)</label>
              <Select
                value={hierarchy.topicId || "none"}
                onValueChange={(v) => updateHierarchy({ topicId: v === "none" ? "" : v })}
                disabled={!hierarchy.moduleId}
              >
                <SelectTrigger className="mt-1 h-11"><SelectValue placeholder="Whole module" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Whole module</SelectItem>
                  {moduleTopics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hierarchy.trackId && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <RefreshCw className="h-3.5 w-3.5" /> Live from Tracks
                </span>
                <span className="font-mono font-semibold">{liveProgress}%</span>
              </div>
              <Progress value={liveProgress} className="h-2" />
              <p className="text-[11px] text-muted-foreground">
                Current progress for <span className="text-foreground">{scopeLabel}</span> — updates automatically when you work in Tracks or here.
              </p>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground">Timeline</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {GOAL_MONTH_OPTIONS.map((m) => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={months === m ? "default" : "outline"}
                  onClick={() => setMonths(m)}
                >
                  {m} {m === 1 ? "month" : "months"}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Start date</label>
            <Input type="date" className="mt-1 h-11" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Notes (optional)</label>
            <Textarea
              className="mt-1"
              placeholder="What does success look like for this chunk?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleSave} className="w-full h-11" disabled={!title.trim() || !hierarchy.trackId}>
            {editing ? "Save Changes" : "Create Goal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
