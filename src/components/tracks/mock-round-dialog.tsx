"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";
import { useLeetcodeProblems } from "@/hooks/use-data";
import { toggleLeetcodeProblem } from "@/lib/crud";
import { pickMockRoundProblems } from "@/lib/leetcode-readiness";
import { saveMockRoundSession } from "@/lib/prep-quiz-crud";
import type { MockRoundPromptRequest } from "@/lib/mock-round-prompt";
import type { LeetcodeProblem } from "@/lib/types";
import { cn } from "@/lib/utils";

const ACCENT = "#534AB7";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface MockRoundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MockRoundPromptRequest | null;
}

export function MockRoundDialog({ open, onOpenChange, request }: MockRoundDialogProps) {
  const allProblems = useLeetcodeProblems();
  const [sessionProblems, setSessionProblems] = useState<LeetcodeProblem[]>([]);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [ended, setEnded] = useState(false);
  const initKeyRef = useRef<string | null>(null);

  const durationMinutes = request?.mode === "pattern" ? 45 : 90;

  useEffect(() => {
    if (!open || !request) {
      initKeyRef.current = null;
      return;
    }
    const initKey = `${request.mode}:${request.pattern ?? "global"}`;
    if (initKeyRef.current === initKey || allProblems.length === 0) return;
    initKeyRef.current = initKey;

    const picked = pickMockRoundProblems(allProblems, "BD-CORE", 3, request.pattern);
    setSessionProblems(picked);
    setStartedAt(new Date().toISOString());
    setSecondsLeft(durationMinutes * 60);
    setEnded(false);
  }, [open, request, allProblems, durationMinutes]);

  useEffect(() => {
    if (!open || ended || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setEnded(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, ended, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && open && startedAt && !ended) {
      setEnded(true);
    }
  }, [secondsLeft, open, startedAt, ended]);

  const liveProblems = sessionProblems.map(
    (sp) => allProblems.find((p) => p.id === sp.id) ?? sp
  );

  const solvedInSession = useMemo(
    () => liveProblems.filter((p) => p.done).length,
    [liveProblems]
  );

  async function handleEnd() {
    if (startedAt && request) {
      await saveMockRoundSession({
        mode: request.mode,
        pattern: request.pattern,
        problemIds: sessionProblems.map((p) => p.id),
        durationMinutes,
        startedAt,
        completedAt: new Date().toISOString(),
      });
    }
    setEnded(true);
  }

  function handleClose() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {request?.mode === "pattern"
              ? `Pattern Mock — ${request.patternLabel ?? request.pattern}`
              : "Mock Round — BD-CORE"}
          </DialogTitle>
        </DialogHeader>

        {!ended ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-muted-foreground">Time remaining</span>
              <span
                className={cn(
                  "metric-value text-2xl tabular-nums",
                  secondsLeft < 600 && "text-amber-400"
                )}
                style={secondsLeft >= 600 ? { color: ACCENT } : undefined}
              >
                {formatTime(secondsLeft)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Solve {sessionProblems.length} problem{sessionProblems.length === 1 ? "" : "s"} under interview conditions.
            </p>
            <ul className="space-y-2">
              {liveProblems.map((problem) => (
                <li
                  key={problem.id}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => void toggleLeetcodeProblem(problem.id)}
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      problem.done ? "border-transparent text-white" : "border-white/20"
                    )}
                    style={problem.done ? { background: ACCENT } : undefined}
                  >
                    {problem.done && <Check className="h-2.5 w-2.5" />}
                  </button>
                  {problem.url ? (
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 flex-1 items-center gap-1 text-sm hover:underline"
                    >
                      <span className="truncate">{problem.title}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-40" />
                    </a>
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-sm">{problem.title}</span>
                  )}
                  <span className="text-[10px] uppercase text-muted-foreground">{problem.difficulty[0]}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => void handleEnd()}>
                End early
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm font-medium">Mock round complete</p>
            <p className="metric-value text-3xl tabular-nums" style={{ color: ACCENT }}>
              {solvedInSession}/{sessionProblems.length}
            </p>
            <p className="text-xs text-muted-foreground">problems marked solved</p>
            <Button size="sm" style={{ background: ACCENT }} onClick={handleClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
