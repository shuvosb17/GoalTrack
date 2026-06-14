import { db } from "./db";
import { isSubtopicDone } from "./utils";
import type { Subtopic, Topic } from "./types";

export type ConfidencePromptMode = "complete" | "review";

export interface ConfidencePromptRequest {
  entityType: "topic" | "subtopic";
  entityId: string;
  entityName: string;
  parentTopicName?: string;
  mode: ConfidencePromptMode;
}

type PromptHandler = (request: ConfidencePromptRequest) => void;

let promptHandler: PromptHandler | null = null;

export function registerConfidencePromptHandler(handler: PromptHandler | null) {
  promptHandler = handler;
}

/** Queue confidence dialog when a subtopic was just completed but not yet rated. */
export async function enqueueConfidencePromptIfNeededForSubtopic(subtopicId: string) {
  if (!promptHandler) return;

  const sub = await db.subtopics.get(subtopicId);
  if (!sub || sub.archived) return;
  if (!isSubtopicDone(sub.status)) return;
  if (sub.completionMeta?.confidenceRated) return;

  const topic = await db.topics.get(sub.topicId);
  promptHandler({
    entityType: "subtopic",
    entityId: sub.id,
    entityName: sub.name,
    parentTopicName: topic?.name,
    mode: "complete",
  });
}

/** Queue confidence dialog when a leaf topic (no subtopics) was completed but not yet rated. */
export async function enqueueConfidencePromptIfNeeded(topicId: string) {
  if (!promptHandler) return;

  const topic = await db.topics.get(topicId);
  if (!topic || topic.archived) return;

  const subs = await db.subtopics.where("topicId").equals(topicId).filter((s) => !s.archived).toArray();
  if (subs.length > 0) return;

  if (topic.status !== "completed" && topic.status !== "mastered") return;
  if (topic.completionMeta?.confidenceRated) return;

  promptHandler({
    entityType: "topic",
    entityId: topic.id,
    entityName: topic.name,
    mode: "complete",
  });
}

export function enqueueConfidencePrompt(request: ConfidencePromptRequest) {
  promptHandler?.(request);
}

export function getSubtopicConfidence(sub: Subtopic): 1 | 2 | 3 | 4 | 5 {
  const rating = sub.completionMeta?.confidenceRating;
  if (rating && rating >= 1 && rating <= 5) return rating as 1 | 2 | 3 | 4 | 5;
  return 3;
}

export function getTopicConfidence(topic: Topic): 1 | 2 | 3 | 4 | 5 {
  const rating = topic.completionMeta?.confidenceRating;
  if (rating && rating >= 1 && rating <= 5) return rating as 1 | 2 | 3 | 4 | 5;
  return 3;
}
