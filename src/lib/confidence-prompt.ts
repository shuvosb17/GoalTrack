import { db } from "./db";
import { isTopicComplete } from "./in-progress";

export type ConfidencePromptMode = "complete" | "review";

export interface ConfidencePromptRequest {
  topicId: string;
  topicName: string;
  mode: ConfidencePromptMode;
}

type PromptHandler = (request: ConfidencePromptRequest) => void;

let promptHandler: PromptHandler | null = null;

export function registerConfidencePromptHandler(handler: PromptHandler | null) {
  promptHandler = handler;
}

/** Queue a confidence dialog when a topic was just completed but not yet rated. */
export async function enqueueConfidencePromptIfNeeded(topicId: string) {
  if (!promptHandler) return;

  const topic = await db.topics.get(topicId);
  if (!topic || topic.archived) return;

  const subs = await db.subtopics.where("topicId").equals(topicId).filter((s) => !s.archived).toArray();
  if (!isTopicComplete(topic, subs)) return;

  if (topic.completionMeta?.confidenceRated) return;

  promptHandler({
    topicId: topic.id,
    topicName: topic.name,
    mode: "complete",
  });
}

export function enqueueConfidencePrompt(request: ConfidencePromptRequest) {
  promptHandler?.(request);
}
