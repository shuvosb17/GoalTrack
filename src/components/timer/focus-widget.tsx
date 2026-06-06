"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Timer } from "lucide-react";
import { useTimerStore } from "@/stores/timer-store";
import { useSessions } from "@/hooks/use-data";
import { formatDuration } from "@/lib/utils";
import { getTodayHours } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export function FocusWidget() {
  const { isRunning, isPaused, activityLabel, pause, resume, stop, getElapsedMs } = useTimerStore();
  const sessions = useSessions();

  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => {
      useTimerStore.setState({ tick: Date.now() });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const elapsed = getElapsedMs();
  const todayMs = getTodayHours(sessions) + (isRunning && !isPaused ? elapsed : 0);

  if (!isRunning && !isPaused) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50 glass-card rounded-2xl p-4 shadow-2xl border border-primary/20 min-w-[320px]"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <Timer className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Focus Session</p>
            <p className="text-sm font-medium truncate">{activityLabel || "Learning"}</p>
          </div>
          <span className="text-2xl font-mono font-bold text-primary tabular-nums">
            {formatDuration(elapsed)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 px-1">
          <span>Today: {formatDuration(todayMs)}</span>
          <span className={isPaused ? "text-amber-400" : "text-emerald-400"}>
            {isPaused ? "Paused" : "Running"}
          </span>
        </div>

        <div className="flex gap-2">
          {isPaused ? (
            <Button size="sm" className="flex-1" onClick={resume}>
              <Play className="h-3 w-3" /> Resume
            </Button>
          ) : (
            <Button size="sm" variant="secondary" className="flex-1" onClick={pause}>
              <Pause className="h-3 w-3" /> Pause
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={() => stop()}>
            <Square className="h-3 w-3" /> Stop
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
