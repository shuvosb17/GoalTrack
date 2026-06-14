"use client";

import { useEffect, useMemo, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconClock } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { markTopicReviewed, markSubtopicReviewed } from "@/lib/crud";
import { logRevisionStudyTime } from "@/lib/revision-sessions";
import {
  confidenceTier,
  isRateableReviewItem,
  type ReviewCatalogItem,
} from "@/lib/revision-catalog";
import { ConfidenceDots } from "@/components/status/confidence-dots";
import { useReviewStore } from "@/stores/review-store";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RevisionQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Shaky",
  2: "Low",
  3: "OK",
  4: "Good",
  5: "Solid",
};

const RATING_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#f59e0b",
  4: "#84cc16",
  5: "#22c55e",
};

function RevisionFocusCard({ item }: { item: ReviewCatalogItem }) {
  const tier = confidenceTier(item.confidence);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-[0.5px] border-white/[0.1] p-6"
      style={{ boxShadow: `inset 0 1px 0 ${item.trackColor}33` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse 90% 70% at 50% 0%, ${item.trackColor}55, transparent 70%)`,
        }}
      />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
            style={{
              color: item.trackColor,
              background: `${item.trackColor}22`,
              border: `0.5px solid ${item.trackColor}44`,
            }}
          >
            Revise
          </span>
          <ConfidenceDots confidence={item.confidence} />
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {item.trackName}
            {item.parentTopicName ? ` · ${item.parentTopicName}` : ""}
            {" · "}
            {item.kind}
          </p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight">
            {item.name}
          </h3>
        </div>

        <div
          className={cn(
            "rounded-xl border-[0.5px] border-white/[0.08] px-4 py-3 text-sm leading-relaxed",
            tier === "low" && "bg-red-500/[0.06] text-red-200/90",
            tier === "medium" && "bg-amber-500/[0.06] text-amber-100/90",
            tier === "high" && "bg-emerald-500/[0.06] text-emerald-100/90"
          )}
        >
          {tier === "low" && "This one needs extra attention — actively recall definitions, steps, and edge cases."}
          {tier === "medium" && "Solidify your memory — walk through the concept out loud before moving on."}
          {tier === "high" && "Quick refresh — verify you can still explain this without notes."}
        </div>
      </div>
    </div>
  );
}

export function RevisionQuizDialog({ open, onOpenChange }: RevisionQuizDialogProps) {
  const queue = useReviewStore((s) => s.queue);
  const progress = useReviewStore((s) => s.progress);
  const setProgress = useReviewStore((s) => s.setProgress);
  const finishSession = useReviewStore((s) => s.finishSession);

  const [elapsedMs, setElapsedMs] = useState(0);

  const rateItems = useMemo(() => queue.filter(isRateableReviewItem), [queue]);
  const phase = progress?.phase ?? "review";
  const step = progress?.step ?? 0;
  const ratingStep = progress?.ratingStep ?? 0;
  const startedAt = progress?.startedAt ?? null;

  const quizSteps = queue.length;
  const totalSteps = quizSteps + rateItems.length;
  const progressIndex = phase === "review" ? step : quizSteps + ratingStep;
  const currentItem = phase === "review" ? queue[step] : rateItems[ratingStep];

  useEffect(() => {
    if (!open || !startedAt) return;
    const tick = () => setElapsedMs(Date.now() - startedAt);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [open, startedAt]);

  const patchProgress = (patch: Partial<NonNullable<typeof progress>>) => {
    if (!progress) return;
    setProgress({ ...progress, ...patch });
  };

  const handleClose = (next: boolean) => {
    if (!next) onOpenChange(false);
  };

  const handleFinishReview = () => {
    if (rateItems.length === 0) {
      void handleComplete();
      return;
    }
    patchProgress({ phase: "rate", ratingStep: 0 });
  };

  const handleComplete = async () => {
    if (startedAt) {
      await logRevisionStudyTime(queue, Date.now() - startedAt);
    }
    finishSession();
    onOpenChange(false);
  };

  const handleRate = async (n: 1 | 2 | 3 | 4 | 5) => {
    const item = rateItems[ratingStep];
    if (item?.kind === "subtopic" && item.subtopicId) {
      await markSubtopicReviewed(item.subtopicId, n);
    } else if (item?.kind === "topic" && item.topicId) {
      await markTopicReviewed(item.topicId, n);
    }
    if (ratingStep + 1 >= rateItems.length) {
      await handleComplete();
    } else {
      patchProgress({ ratingStep: ratingStep + 1 });
    }
  };

  if (!progress) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-white/[0.1] p-0">
        <div className="border-b border-white/[0.06] px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle>
              {phase === "review" ? "Revision session" : "Rate retention"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500 ease-out"
                style={{ width: `${((progressIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {progressIndex + 1}/{totalSteps}
            </span>
          </div>

          {startedAt && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <IconClock className="h-3.5 w-3.5" stroke={1.5} />
              <span className="tabular-nums">{formatDuration(elapsedMs)}</span>
              <span>· logged when you finish</span>
            </div>
          )}
        </div>

        <div className="px-6 py-5">
          {phase === "review" && currentItem && (
            <RevisionFocusCard item={currentItem} />
          )}

          {phase === "rate" && currentItem && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  How well do you remember it?
                </p>
                <h3 className="mt-2 text-xl font-semibold">{currentItem.name}</h3>
                {currentItem.parentTopicName && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentItem.parentTopicName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleRate(n)}
                    className="group flex flex-col items-center gap-1.5 rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] py-4 transition-all hover:scale-[1.03] hover:border-white/[0.16] hover:bg-white/[0.05]"
                  >
                    <span
                      className="text-lg font-semibold tabular-nums"
                      style={{ color: RATING_COLORS[n] }}
                    >
                      {n}
                    </span>
                    <span className="text-[9px] text-muted-foreground group-hover:text-foreground">
                      {RATING_LABELS[n]}
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-center text-[10px] text-muted-foreground">
                Updates your confidence · lower scores schedule sooner reviews
              </p>
            </div>
          )}
        </div>

        {phase === "review" && (
          <div className="flex justify-between gap-2 border-t border-white/[0.06] px-6 py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={step === 0}
              onClick={() => patchProgress({ step: step - 1 })}
              className="gap-1 border-white/[0.08]"
            >
              <IconChevronLeft className="h-4 w-4" /> Back
            </Button>
            {step < quizSteps - 1 ? (
              <Button
                size="sm"
                onClick={() => patchProgress({ step: step + 1 })}
                className="gap-1"
              >
                Next <IconChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleFinishReview}>
                {rateItems.length > 0 ? "Rate retention" : "Finish"}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
