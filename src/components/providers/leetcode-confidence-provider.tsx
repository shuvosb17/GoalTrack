"use client";

import { useEffect, useState } from "react";
import {
  registerLeetcodeConfidencePromptHandler,
  type LeetcodeConfidencePromptRequest,
} from "@/lib/leetcode-confidence-prompt";
import { LeetcodeConfidenceDialog } from "@/components/tracks/leetcode-confidence-dialog";

export function LeetcodeConfidenceProvider() {
  const [prompt, setPrompt] = useState<LeetcodeConfidencePromptRequest | null>(null);

  useEffect(() => {
    registerLeetcodeConfidencePromptHandler((request) => setPrompt(request));
    return () => registerLeetcodeConfidencePromptHandler(null);
  }, []);

  return (
    <LeetcodeConfidenceDialog
      open={!!prompt}
      onOpenChange={(open) => {
        if (!open) setPrompt(null);
      }}
      problemId={prompt?.problemId ?? null}
      problemTitle={prompt?.problemTitle ?? ""}
      pattern={prompt?.pattern ?? ""}
    />
  );
}
