"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { setLeetcodeProblemConfidence } from "@/lib/crud";
import { computeNextReviewDate } from "@/lib/metrics";

interface LeetcodeConfidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problemId: string | null;
  problemTitle: string;
  pattern: string;
}

export function LeetcodeConfidenceDialog({
  open,
  onOpenChange,
  problemId,
  problemTitle,
  pattern,
}: LeetcodeConfidenceDialogProps) {
  const handleRate = async (n: 1 | 2 | 3 | 4 | 5) => {
    if (!problemId) return;
    await setLeetcodeProblemConfidence(problemId, n);
    onOpenChange(false);
  };

  const handleSkip = async () => {
    if (!problemId) {
      onOpenChange(false);
      return;
    }
    await setLeetcodeProblemConfidence(problemId, 3);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How well did you solve it?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Marked solved: <span className="font-medium text-foreground">{problemTitle}</span>
          <span className="text-muted-foreground"> · {pattern}</span>
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => void handleRate(n)}
              className="flex flex-col items-center gap-1 rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.03] py-3 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <span className="text-base font-medium text-foreground">{n}</span>
              {n === 1 && "Shaky"}
              {n === 2 && "Low"}
              {n === 3 && "OK"}
              {n === 4 && "Good"}
              {n === 5 && "Solid"}
            </button>
          ))}
        </div>
        <p className="text-center text-[10px] text-muted-foreground">
          Next review ~{computeNextReviewDate(3).slice(5)} at rating 3
        </p>
        <button
          type="button"
          onClick={() => void handleSkip()}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Skip — defaults to 3
        </button>
      </DialogContent>
    </Dialog>
  );
}
