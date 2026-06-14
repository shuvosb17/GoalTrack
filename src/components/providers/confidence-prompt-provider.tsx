"use client";

import { useEffect, useState } from "react";
import {
  registerConfidencePromptHandler,
  type ConfidencePromptRequest,
} from "@/lib/confidence-prompt";
import { TopicConfidenceDialog } from "@/components/tracks/topic-confidence-dialog";

export function ConfidencePromptProvider() {
  const [prompt, setPrompt] = useState<ConfidencePromptRequest | null>(null);

  useEffect(() => {
    registerConfidencePromptHandler((request) => setPrompt(request));
    return () => registerConfidencePromptHandler(null);
  }, []);

  return (
    <TopicConfidenceDialog
      open={!!prompt}
      onOpenChange={(open) => {
        if (!open) setPrompt(null);
      }}
      topicId={prompt?.topicId ?? null}
      topicName={prompt?.topicName ?? ""}
      mode={prompt?.mode ?? "complete"}
    />
  );
}
