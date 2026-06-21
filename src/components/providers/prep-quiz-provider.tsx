"use client";

import { useEffect, useState } from "react";
import { registerPrepQuizPromptHandler, type PrepQuizPromptRequest } from "@/lib/prep-quiz-prompt";
import { registerMockRoundPromptHandler, type MockRoundPromptRequest } from "@/lib/mock-round-prompt";
import { PrepQuizDialog } from "@/components/tracks/prep-quiz-dialog";
import { MockRoundDialog } from "@/components/tracks/mock-round-dialog";

export function PrepQuizProvider() {
  const [quizRequest, setQuizRequest] = useState<PrepQuizPromptRequest | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [mockRequest, setMockRequest] = useState<MockRoundPromptRequest | null>(null);
  const [mockOpen, setMockOpen] = useState(false);

  useEffect(() => {
    registerPrepQuizPromptHandler((request) => {
      setQuizRequest(request);
      setQuizOpen(true);
    });
    registerMockRoundPromptHandler((request) => {
      setMockRequest(request);
      setMockOpen(true);
    });
    return () => {
      registerPrepQuizPromptHandler(null);
      registerMockRoundPromptHandler(null);
    };
  }, []);

  function handlePatternQuizPassed(patternName: string) {
    setMockRequest({
      mode: "pattern",
      pattern: patternName,
      patternLabel: patternName,
    });
    setMockOpen(true);
  }

  return (
    <>
      <PrepQuizDialog
        open={quizOpen}
        onOpenChange={setQuizOpen}
        request={quizRequest}
        onPatternQuizPassed={handlePatternQuizPassed}
      />
      <MockRoundDialog open={mockOpen} onOpenChange={setMockOpen} request={mockRequest} />
    </>
  );
}
