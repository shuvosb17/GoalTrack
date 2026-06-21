"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { getQuizForSubject, PASS_THRESHOLD } from "@/lib/prep-quizzes";
import { savePrepQuizAttempt } from "@/lib/prep-quiz-crud";
import type { PrepQuizQuestion } from "@/lib/prep-quizzes";
import type { PrepQuizPromptRequest } from "@/lib/prep-quiz-prompt";
import { cn } from "@/lib/utils";

const ACCENT = "#534AB7";

interface PrepQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: PrepQuizPromptRequest | null;
  onPatternQuizPassed?: (patternName: string) => void;
}

export function PrepQuizDialog({
  open,
  onOpenChange,
  request,
  onPatternQuizPassed,
}: PrepQuizDialogProps) {
  const [questions, setQuestions] = useState<PrepQuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState(false);

  const reset = useCallback(() => {
    if (!request) return;
    const quiz = getQuizForSubject(request.subjectType, request.subjectKey) ?? [];
    setQuestions(quiz);
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
    setFinished(false);
    setPassed(false);
  }, [request]);

  useEffect(() => {
    if (open && request) reset();
  }, [open, request, reset]);

  const current = questions[index];
  const passCount = Math.ceil(questions.length * PASS_THRESHOLD);

  async function finishQuiz(finalCorrect: number) {
    if (!request) return;
    const didPass = finalCorrect >= passCount;
    setFinished(true);
    setPassed(didPass);

    await savePrepQuizAttempt({
      subjectType: request.subjectType,
      subjectKey: request.subjectKey,
      score: finalCorrect,
      total: questions.length,
      passed: didPass,
    });

    if (didPass && request.subjectType === "cs" && request.csItemId) {
      await db.csReviewItems.update(request.csItemId, {
        quizPassed: true,
        quizBestScore: Math.round((finalCorrect / questions.length) * 100),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  function handleSelect(optionIndex: number) {
    if (revealed || !current) return;
    setSelected(optionIndex);
    setRevealed(true);
  }

  function handleNext() {
    if (!current) return;
    const isCorrect = selected === current.correctIndex;
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    setCorrectCount(nextCorrect);

    if (index + 1 >= questions.length) {
      void finishQuiz(nextCorrect);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  function handleClose() {
    onOpenChange(false);
  }

  function handleStartMock() {
    if (request?.subjectType === "pattern") {
      onPatternQuizPassed?.(request.subjectKey);
    }
    onOpenChange(false);
  }

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {request.subjectType === "cs" ? "Concept Quiz" : "Pattern Quiz"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{request.subjectLabel}</p>

        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No quiz available for this topic yet.</p>
        ) : finished ? (
          <div className="space-y-4 text-center">
            <div
              className="metric-value text-4xl tabular-nums"
              style={{ color: passed ? "#97C459" : "#f87171" }}
            >
              {correctCount}/{questions.length}
            </div>
            <p className="text-sm font-medium">{passed ? "Passed!" : "Not quite — review and retry"}</p>
            <p className="text-xs text-muted-foreground">
              Need {passCount}/{questions.length} ({Math.round(PASS_THRESHOLD * 100)}%) to pass
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {!passed && (
                <Button size="sm" style={{ background: ACCENT }} onClick={reset}>
                  Retry
                </Button>
              )}
              {passed && request.subjectType === "pattern" && (
                <Button size="sm" style={{ background: ACCENT }} onClick={handleStartMock}>
                  Start pattern mock
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleClose}>
                {passed ? "Done" : "Close"}
              </Button>
            </div>
          </div>
        ) : current ? (
          <div className="space-y-4">
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    i < index ? "bg-[#534AB7]" : i === index ? "bg-[#534AB7]/60" : "bg-white/10"
                  )}
                />
              ))}
            </div>
            <p className="text-sm font-medium">
              Q{index + 1}. {current.question}
            </p>
            <ul className="space-y-2">
              {current.options.map((opt, i) => {
                let style = "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]";
                if (revealed) {
                  if (i === current.correctIndex) style = "border-[#97C459]/50 bg-[#97C459]/10";
                  else if (i === selected) style = "border-red-400/50 bg-red-400/10";
                }
                return (
                  <li key={i}>
                    <button
                      type="button"
                      disabled={revealed}
                      onClick={() => handleSelect(i)}
                      className={cn(
                        "w-full rounded-lg border-[0.5px] px-3 py-2 text-left text-sm transition-colors",
                        style
                      )}
                    >
                      {opt}
                    </button>
                  </li>
                );
              })}
            </ul>
            {revealed && (
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-xs text-muted-foreground">
                {current.explanation}
              </div>
            )}
            {revealed && (
              <Button size="sm" className="w-full" style={{ background: ACCENT }} onClick={handleNext}>
                {index + 1 >= questions.length ? "See results" : "Next question"}
              </Button>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
