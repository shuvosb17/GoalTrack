"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { GoalMilestone, Module, Topic, Track, Subtopic } from "@/lib/types";
import {
  GOAL_MONTH_OPTIONS,
  createGoalMilestone,
  updateGoalMilestone,
  resolveGoalProgress,
  getGoalTopicIds,
  getGoalModuleIds,
  formatGoalScopeLabel,
  formatGoalDuration,
  computeEndDate,
} from "@/lib/goal-milestones";
import { v4 as uuid } from "uuid";
import { differenceInCalendarDays, format } from "date-fns";
import { getTopicProgress } from "@/lib/analytics";
import { cn, parseLocalDate, todayISO } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Check, RefreshCw, Plus, X, CalendarDays, Layers } from "lucide-react";

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
  const sortedTracks = useMemo(
    () => [...tracks].filter((t) => !t.archived).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [tracks]
  );

  const [title, setTitle] = useState("");
  const [trackId, setTrackId] = useState("");
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(computeEndDate(todayISO(), 3));
  const [notes, setNotes] = useState("");
  const [checkpointInput, setCheckpointInput] = useState("");
  const [checkpoints, setCheckpoints] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title);
      setTrackId(editing.trackId);
      setSelectedModuleIds(getGoalModuleIds(editing));
      setSelectedTopicIds(getGoalTopicIds(editing));
      setStartDate(editing.startDate);
      setEndDate(editing.endDate);
      setNotes(editing.notes ?? "");
      setCheckpoints(editing.checkpoints?.map((c) => c.label) ?? []);
      setCheckpointInput("");
    } else {
      const start = todayISO();
      setTitle("");
      setTrackId(sortedTracks[0]?.id ?? "");
      setSelectedModuleIds([]);
      setSelectedTopicIds([]);
      setStartDate(start);
      setEndDate(computeEndDate(start, 3));
      setNotes("");
      setCheckpoints([]);
      setCheckpointInput("");
    }
  }, [open, editing, sortedTracks]);

  const trackModules = useMemo(
    () =>
      modules
        .filter((m) => m.trackId === trackId && !m.archived)
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [modules, trackId]
  );

  const singleModuleId = selectedModuleIds.length === 1 ? selectedModuleIds[0] : null;
  const moduleTopics = useMemo(
    () =>
      singleModuleId
        ? topics
            .filter((t) => t.moduleId === singleModuleId && !t.archived)
            .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
        : [],
    [topics, singleModuleId]
  );

  const scopeInput = {
    trackId,
    moduleIds: selectedModuleIds.length > 0 ? selectedModuleIds : undefined,
    topicIds:
      singleModuleId && selectedTopicIds.length > 0 ? selectedTopicIds : undefined,
  };

  const liveProgress = trackId ? resolveGoalProgress(scopeInput, topics, subtopics, modules) : 0;
  const scopeLabel = trackId ? formatGoalScopeLabel(scopeInput, topics, modules, tracks) : "Track";

  const dayCount = Math.max(
    0,
    differenceInCalendarDays(parseLocalDate(endDate), parseLocalDate(startDate))
  );
  const validRange = dayCount >= 1;
  const activePreset = useMemo(
    () => GOAL_MONTH_OPTIONS.find((m) => computeEndDate(startDate, m) === endDate) ?? null,
    [startDate, endDate]
  );

  const changeTrack = (nextTrackId: string) => {
    setTrackId(nextTrackId);
    setSelectedModuleIds([]);
    setSelectedTopicIds([]);
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModuleIds((prev) => {
      const next = prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId];
      return next;
    });
    setSelectedTopicIds([]);
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const applyPreset = (m: number) => {
    setEndDate(computeEndDate(startDate, m));
  };

  const changeStartDate = (value: string) => {
    if (!value) return;
    setStartDate(value);
    if (activePreset) {
      setEndDate(computeEndDate(value, activePreset));
    } else if (parseLocalDate(endDate) <= parseLocalDate(value)) {
      setEndDate(computeEndDate(value, 1));
    }
  };

  const addCheckpoint = () => {
    const label = checkpointInput.trim();
    if (!label || checkpoints.includes(label)) return;
    setCheckpoints((prev) => [...prev, label]);
    setCheckpointInput("");
  };

  const removeCheckpoint = (label: string) => {
    setCheckpoints((prev) => prev.filter((c) => c !== label));
  };

  const handleSave = async () => {
    if (!title.trim() || !trackId || !validRange) return;
    const payload = {
      title: title.trim(),
      trackId,
      moduleIds: selectedModuleIds.length > 0 ? selectedModuleIds : undefined,
      topicIds: singleModuleId && selectedTopicIds.length > 0 ? selectedTopicIds : undefined,
      startDate,
      months: activePreset ?? Math.max(1, Math.round(dayCount / 30)),
      endDate,
      notes: notes.trim() || undefined,
    };

    if (editing) {
      await updateGoalMilestone(editing.id, {
        ...payload,
        checkpoints: checkpoints.length > 0
          ? checkpoints.map((label) => {
              const existing = editing.checkpoints?.find((c) => c.label === label);
              return existing ?? { id: uuid(), label, done: false };
            })
          : [],
      }, topics, subtopics, modules);
    } else {
      await createGoalMilestone({ ...payload, checkpoints, topics, subtopics, modules });
    }
    onOpenChange(false);
  };

  const moduleSummary =
    selectedModuleIds.length === 0
      ? "Whole track"
      : `${selectedModuleIds.length} module${selectedModuleIds.length === 1 ? "" : "s"} selected`;

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

          <div>
            <label className="text-xs text-muted-foreground">Track</label>
            <Select value={trackId || "none"} onValueChange={(v) => changeTrack(v === "none" ? "" : v)}>
              <SelectTrigger className="mt-1 h-11"><SelectValue placeholder="Select track" /></SelectTrigger>
              <SelectContent>
                {sortedTracks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.icon} {t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {trackId && trackModules.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" /> Modules (optional)
                </label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px]"
                    onClick={() => {
                      setSelectedModuleIds(trackModules.map((m) => m.id));
                      setSelectedTopicIds([]);
                    }}
                  >
                    Select all
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px]"
                    onClick={() => {
                      setSelectedModuleIds([]);
                      setSelectedTopicIds([]);
                    }}
                  >
                    Whole track
                  </Button>
                </div>
              </div>
              <p className="mb-2 text-[11px] text-muted-foreground">
                {selectedModuleIds.length === 0
                  ? "No modules selected — goal covers the entire track."
                  : moduleSummary}
              </p>
              <div className="max-h-52 divide-y divide-border/30 overflow-y-auto rounded-xl border border-border/50">
                {trackModules.map((mod) => {
                  const selected = selectedModuleIds.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-secondary/40",
                        selected && "bg-primary/10"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        )}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-sm">{mod.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {singleModuleId && moduleTopics.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="text-xs text-muted-foreground">Topics (optional · single module)</label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px]"
                    onClick={() => setSelectedTopicIds(moduleTopics.map((t) => t.id))}
                  >
                    Select all
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px]"
                    onClick={() => setSelectedTopicIds([])}
                  >
                    Whole module
                  </Button>
                </div>
              </div>
              <p className="mb-2 text-[11px] text-muted-foreground">
                {selectedTopicIds.length === 0
                  ? "No topics selected — goal covers the entire module."
                  : `${selectedTopicIds.length} topic${selectedTopicIds.length === 1 ? "" : "s"} selected`}
              </p>
              <div className="max-h-48 divide-y divide-border/30 overflow-y-auto rounded-xl border border-border/50">
                {moduleTopics.map((topic) => {
                  const selected = selectedTopicIds.includes(topic.id);
                  const pct = getTopicProgress(topic, subtopics).percentage;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-secondary/40",
                        selected && "bg-primary/10"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        )}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-sm">{topic.name}</span>
                      <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">{pct}%</Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {trackId && (
            <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
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
            <div className="mt-2 flex flex-wrap gap-2">
              {GOAL_MONTH_OPTIONS.map((m) => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={activePreset === m ? "default" : "outline"}
                  onClick={() => applyPreset(m)}
                >
                  {m} {m === 1 ? "month" : "months"}
                </Button>
              ))}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors",
                  activePreset === null
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border/60 text-muted-foreground"
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Custom
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] text-muted-foreground">Start date</label>
                <Input
                  type="date"
                  className="mt-1 h-11"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => changeStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">End date</label>
                <Input
                  type="date"
                  className="mt-1 h-11"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => e.target.value && setEndDate(e.target.value)}
                />
              </div>
            </div>

            <p className={cn("mt-2 text-[11px]", validRange ? "text-muted-foreground" : "text-red-400")}>
              {validRange ? (
                <>
                  Duration: <span className="text-foreground">{formatGoalDuration(startDate, endDate)}</span>{" "}
                  ({dayCount} day{dayCount === 1 ? "" : "s"}) · finishes{" "}
                  <span className="text-foreground">{format(parseLocalDate(endDate), "MMM d, yyyy")}</span>
                </>
              ) : (
                "End date must be after the start date."
              )}
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Checkpoints (optional)</label>
            <p className="mb-2 text-[11px] text-muted-foreground">
              Break the goal into small wins you can tick off along the way.
            </p>
            <div className="flex gap-2">
              <Input
                className="h-9 flex-1"
                placeholder="e.g. Finish first 5 topics"
                value={checkpointInput}
                onChange={(e) => setCheckpointInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCheckpoint())}
              />
              <Button type="button" size="sm" variant="outline" className="h-9 shrink-0" onClick={addCheckpoint}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            {checkpoints.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {checkpoints.map((label) => (
                  <Badge key={label} variant="secondary" className="gap-1 pr-1 text-xs">
                    {label}
                    <button type="button" onClick={() => removeCheckpoint(label)} className="rounded p-0.5 hover:bg-secondary">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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

          <Button onClick={handleSave} className="h-11 w-full" disabled={!title.trim() || !trackId || !validRange}>
            {editing ? "Save Changes" : "Create Goal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
