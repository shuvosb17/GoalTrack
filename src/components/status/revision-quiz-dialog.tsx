"use client";

import { useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { markTopicReviewed, markSubtopicReviewed } from "@/lib/crud";
import {
  buildQuizPrompts,
  isRateableReviewItem,
  type ReviewCatalogItem,
} from "@/lib/revision-catalog";

interface RevisionQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queue: ReviewCatalogItem[];
  onComplete: () => void;
}

export function RevisionQuizDialog({
  open,
  onOpenChange,
  queue,
  onComplete,
}: RevisionQuizDialogProps) {
  const [step, setStep] = useState(0);
  const [ratingStep, setRatingStep] = useState(0);
  const [phase, setPhase] = useState<"quiz" | "rate">("quiz");

  const rateItems = queue.filter(isRateableReviewItem);
  const quizSteps = queue.length;
  const totalSteps = quizSteps + rateItems.length;

  const reset = () => {
    setStep(0);
    setRatingStep(0);
    setPhase("quiz");
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      reset();
      onOpenChange(false);
    }
  };

  const handleFinishQuiz = () => {
    if (rateItems.length === 0) {
      onComplete();
      reset();
      onOpenChange(false);
      return;
    }
    setPhase("rate");
    setRatingStep(0);
  };

  const handleRate = async (n: 1 | 2 | 3 | 4 | 5) => {
    const item = rateItems[ratingStep];
    if (item?.kind === "subtopic" && item.subtopicId) {
      await markSubtopicReviewed(item.subtopicId, n);
    } else if (item?.kind === "topic" && item.topicId) {
      await markTopicReviewed(item.topicId, n);
    }
    if (ratingStep + 1 >= rateItems.length) {
      onComplete();
      reset();
      onOpenChange(false);
    } else {
      setRatingStep((s) => s + 1);
    }
  };

  const currentItem = phase === "quiz" ? queue[step] : rateItems[ratingStep];
  const progressIndex = phase === "quiz" ? step : quizSteps + ratingStep;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {phase === "quiz" ? "Revision session" : "Re-rate retention"}
          </DialogTitle>
        </DialogHeader>

        {queue.length === 0 ? null : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${((progressIndex + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {progressIndex + 1}/{totalSteps}
              </span>
            </div>

            {phase === "quiz" && currentItem && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {currentItem.trackName} · {currentItem.kind}
                    {currentItem.parentTopicName ? ` · ${currentItem.parentTopicName}` : ""}
                  </p>
                  <h3 className="mt-1 text-lg font-medium">{currentItem.name}</h3>
                </div>
                <ol className="space-y-3">
                  {buildQuizPrompts(currentItem).map((prompt, i) => (
                    <li
                      key={i}
                      className="rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mr-2 font-medium text-foreground">{i + 1}.</span>
                      {prompt}
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-muted-foreground">
                  Answer each prompt mentally or on paper before continuing.
                </p>
              </div>
            )}

            {phase === "rate" && currentItem && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  After reviewing{" "}
                  <span className="font-medium text-foreground">{currentItem.name}</span>
                  {currentItem.parentTopicName && (
                    <span className="text-muted-foreground"> ({currentItem.parentTopicName})</span>
                  )}
                  , how well do you remember it?
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleRate(n)}
                      className="flex flex-col items-center gap-1 rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.03] py-3 text-xs transition-colors hover:bg-white/[0.06]"
                    >
                      <span className="text-base font-medium">{n}</span>
                      {n === 1 && "Shaky"}
                      {n === 3 && "OK"}
                      {n === 5 && "Solid"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === "quiz" && (
              <div className="mt-4 flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={step === 0}
                  onClick={() => setStep((s) => s - 1)}
                  className="gap-1 border-white/[0.08]"
                >
                  <IconChevronLeft className="h-4 w-4" /> Back
                </Button>
                {step < quizSteps - 1 ? (
                  <Button size="sm" onClick={() => setStep((s) => s + 1)} className="gap-1">
                    Next <IconChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleFinishQuiz}>
                    {rateItems.length > 0 ? "Rate retention" : "Finish"}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
