"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { setTopicCompletionConfidence, markTopicReviewed } from "@/lib/crud";
import { computeNextReviewDate } from "@/lib/metrics";

export type TopicConfidenceMode = "complete" | "review";

interface TopicConfidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicId: string | null;
  topicName: string;
  mode: TopicConfidenceMode;
}

export function TopicConfidenceDialog({
  open,
  onOpenChange,
  topicId,
  topicName,
  mode,
}: TopicConfidenceDialogProps) {
  const isReview = mode === "review";

  const handleRate = async (n: 1 | 2 | 3 | 4 | 5) => {
    if (!topicId) return;
    if (isReview) {
      await markTopicReviewed(topicId, n);
    } else {
      await setTopicCompletionConfidence(topicId, n);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isReview ? "Time to refresh" : "How well do you know it?"}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {isReview ? (
            <>
              <span className="font-medium text-foreground">{topicName}</span> is due for review.
              Re-rate your retention — lower scores schedule sooner reviews.
            </>
          ) : (
            <>
              Completed <span className="font-medium text-foreground">{topicName}</span>.
              Rate your retention — lower confidence schedules a sooner review.
            </>
          )}
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleRate(n)}
              className="flex flex-col items-center gap-1 rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.03] py-3 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <span className="text-base font-medium text-foreground">{n}</span>
              {n === 1 && "Shaky"}
              {n === 3 && "OK"}
              {n === 5 && "Solid"}
            </button>
          ))}
        </div>
        <p className="text-center text-[10px] text-muted-foreground">
          Next review in {computeNextReviewDate(3).slice(5)} at rating 3 · scales with your score
        </p>
        {!isReview && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip — defaults to 3 ({computeNextReviewDate(3).replace(/^\d{4}-/, "")})
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
