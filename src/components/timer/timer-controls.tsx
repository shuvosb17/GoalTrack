"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Square, Clock } from "lucide-react";
import { useTimerStore } from "@/stores/timer-store";
import { Button } from "@/components/ui/button";
import { formatDuration, formatHoursShort } from "@/lib/utils";
import type { HierarchyPath } from "@/lib/types";
import { isTimerActiveForPath } from "@/lib/time-log";
import { db } from "@/lib/db";
import { updateSubtopicStatus } from "@/lib/crud";
import { todayISO } from "@/lib/utils";
import { ManualTimeDialog } from "./manual-time-dialog";

interface TimerControlsProps {
  path: HierarchyPath;
  label: string;
  compact?: boolean;
  loggedMs?: number;
  allowManual?: boolean;
}

export function TimerControls({ path, label, compact, loggedMs = 0, allowManual = false }: TimerControlsProps) {
  const store = useTimerStore();
  const { isRunning, isPaused, trackId, moduleId, topicId, subtopicId, tick, start, pause, resume, stop, getElapsedMs } = store;
  void tick;

  const [manualOpen, setManualOpen] = useState(false);

  const isActive = isTimerActiveForPath(
    { isRunning, isPaused, trackId, moduleId, topicId, subtopicId },
    path
  );
  const elapsed = isActive ? getElapsedMs() : 0;

  useEffect(() => {
    if (!isActive || isPaused) return;
    const interval = setInterval(() => {
      useTimerStore.setState({ tick: Date.now() });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const handleStart = async () => {
    const current = useTimerStore.getState();
    if (current.isRunning && !isTimerActiveForPath(current, path)) {
      await current.stop();
    }
    start(path, label);
    if (path.subtopicId) {
      const sub = await db.subtopics.get(path.subtopicId);
      if (sub?.status === "not_started") {
        await updateSubtopicStatus(path.subtopicId, "in_progress", sub.dueDate ?? todayISO());
      }
    }
  };

  const loggedLabel = loggedMs > 0 ? formatHoursShort(loggedMs) : null;

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-1 shrink-0">
          {loggedLabel && (
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums" title="Total logged time">
              {loggedLabel}
            </span>
          )}
          {isActive ? (
            <>
              <span className="text-xs font-mono text-primary tabular-nums">{formatDuration(elapsed)}</span>
              {isPaused ? (
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={resume}><Play className="h-3 w-3" /></Button>
              ) : (
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={pause}><Pause className="h-3 w-3" /></Button>
              )}
              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => stop()}><Square className="h-3 w-3" /></Button>
            </>
          ) : (
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleStart}>
              <Play className="h-3 w-3" />
            </Button>
          )}
          {allowManual && (
            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={() => setManualOpen(true)} title="Add manual time">
              <Clock className="h-3 w-3" />
            </Button>
          )}
        </div>
        {allowManual && (
          <ManualTimeDialog open={manualOpen} onOpenChange={setManualOpen} path={path} label={label} />
        )}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {loggedLabel && (
        <span className="text-xs font-mono text-muted-foreground tabular-nums">{loggedLabel} logged</span>
      )}
      {isActive ? (
        <>
          <span className="text-sm font-mono font-bold text-primary tabular-nums">{formatDuration(elapsed)}</span>
          {isPaused ? (
            <Button size="sm" onClick={resume}><Play className="h-3 w-3" /> Resume</Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={pause}><Pause className="h-3 w-3" /> Pause</Button>
          )}
          <Button size="sm" variant="destructive" onClick={() => stop()}><Square className="h-3 w-3" /> Stop</Button>
        </>
      ) : (
        <Button size="sm" onClick={handleStart}><Play className="h-3 w-3" /> Start Timer</Button>
      )}
      {allowManual && (
        <>
          <Button size="sm" variant="outline" onClick={() => setManualOpen(true)}><Clock className="h-3 w-3" /> Add Time</Button>
          <ManualTimeDialog open={manualOpen} onOpenChange={setManualOpen} path={path} label={label} />
        </>
      )}
    </div>
  );
}
