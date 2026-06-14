import type { Module, Subtopic, Topic, Track } from "./types";
import { isTopicComplete } from "./in-progress";
import { getModuleProgress } from "./analytics";
import { getSubtopicConfidence, getTopicConfidence } from "./confidence-prompt";
import { isSubtopicDone } from "./utils";

export type ReviewItemKind = "topic" | "subtopic" | "module";

export interface ReviewCatalogItem {
  id: string;
  kind: ReviewItemKind;
  name: string;
  trackId: string;
  trackName: string;
  trackColor: string;
  /** 1 = shakiest · 5 = solid */
  confidence: 1 | 2 | 3 | 4 | 5;
  topicId?: string;
  subtopicId?: string;
  /** Parent topic when kind is subtopic */
  parentTopicName?: string;
}

export function confidenceTier(confidence: number): "low" | "medium" | "high" {
  if (confidence <= 2) return "low";
  if (confidence === 3) return "medium";
  return "high";
}

export function buildRevisionCatalog(
  tracks: Track[],
  modules: Module[],
  topics: Topic[],
  subtopics: Subtopic[]
): ReviewCatalogItem[] {
  const items: ReviewCatalogItem[] = [];
  const trackById = new Map(tracks.map((t) => [t.id, t]));

  for (const topic of topics) {
    if (topic.archived) continue;
    const track = trackById.get(topic.trackId);
    if (!track) continue;

    const topicSubs = subtopics
      .filter((s) => s.topicId === topic.id && !s.archived)
      .sort((a, b) => a.order - b.order);

    if (topicSubs.length > 0) {
      for (const sub of topicSubs) {
        if (!isSubtopicDone(sub.status)) continue;
        items.push({
          id: `subtopic:${sub.id}`,
          kind: "subtopic",
          name: sub.name,
          parentTopicName: topic.name,
          trackId: topic.trackId,
          trackName: track.name,
          trackColor: track.color,
          confidence: getSubtopicConfidence(sub),
          topicId: topic.id,
          subtopicId: sub.id,
        });
      }
    } else if (isTopicComplete(topic, subtopics)) {
      items.push({
        id: `topic:${topic.id}`,
        kind: "topic",
        name: topic.name,
        trackId: topic.trackId,
        trackName: track.name,
        trackColor: track.color,
        confidence: getTopicConfidence(topic),
        topicId: topic.id,
      });
    }
  }

  for (const mod of modules) {
    if (mod.archived) continue;
    const progress = getModuleProgress(mod.id, topics, subtopics);
    if (progress.percentage < 100) continue;
    const track = trackById.get(mod.trackId);
    if (!track) continue;

    const modTopicIds = new Set(
      topics.filter((t) => t.moduleId === mod.id && !t.archived).map((t) => t.id)
    );
    const modCatalogItems = items.filter(
      (i) => i.topicId && modTopicIds.has(i.topicId)
    );
    const confidences = modCatalogItems.map((i) => i.confidence);
    const confidence = (confidences.length > 0
      ? Math.min(...confidences)
      : 3) as 1 | 2 | 3 | 4 | 5;

    items.push({
      id: `module:${mod.id}`,
      kind: "module",
      name: mod.name,
      trackId: mod.trackId,
      trackName: track.name,
      trackColor: track.color,
      confidence,
    });
  }

  return items.sort((a, b) => a.confidence - b.confidence || a.name.localeCompare(b.name));
}

export function countCompletedByTrack(
  catalog: ReviewCatalogItem[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of catalog) {
    if (item.kind === "module") continue;
    counts.set(item.trackId, (counts.get(item.trackId) ?? 0) + 1);
  }
  return counts;
}

export function buildQuizPrompts(item: ReviewCatalogItem): string[] {
  if (item.kind === "module") {
    return [
      `Summarize the main themes covered in "${item.name}" from memory.`,
      `List the hardest concepts in this module and explain each in one sentence.`,
      `How would you teach this module to someone seeing it for the first time?`,
    ];
  }
  if (item.kind === "subtopic") {
    return [
      `Explain "${item.name}" (${item.parentTopicName}) without looking at your notes.`,
      `Write down three specific facts or steps from this subtopic you must remember.`,
      `What part of "${item.name}" would you fail to recall if tested tomorrow?`,
    ];
  }
  return [
    `Explain the core ideas of "${item.name}" without looking at your notes.`,
    `Write down three specific facts, formulas, or steps you must remember.`,
    `What part of this topic would you fail to recall if tested tomorrow?`,
  ];
}

export function isRateableReviewItem(item: ReviewCatalogItem): boolean {
  return (
    (item.kind === "topic" && !!item.topicId) ||
    (item.kind === "subtopic" && !!item.subtopicId)
  );
}
