import { v4 as uuid } from "uuid";
import { db } from "./db";
import { BS23_SYLLABUS } from "./bs23/syllabus";
import type {
  Bs23Artifact,
  Bs23Drill,
  Bs23DrillMode,
  Bs23StageId,
  Bs23TopicProgress,
} from "./types";
import { nowISO } from "./utils";

export async function saveBs23Drill(input: {
  stageId: Bs23StageId;
  competencyId: string;
  date: string;
  mode: Bs23DrillMode;
  scorePercent: number;
  durationMinutes?: number;
  difficulty?: Bs23Drill["difficulty"];
  notes?: string;
}): Promise<Bs23Drill> {
  const drill: Bs23Drill = {
    id: uuid(),
    ...input,
    createdAt: nowISO(),
  };
  await db.bs23Drills.add(drill);
  return drill;
}

export async function deleteBs23Drill(id: string): Promise<void> {
  await db.bs23Drills.delete(id);
}

export async function upsertBs23Artifact(input: {
  itemId: string;
  status: Bs23Artifact["status"];
  notes?: string;
}): Promise<Bs23Artifact> {
  const existing = await db.bs23Artifacts.where("itemId").equals(input.itemId).first();
  const now = nowISO();
  if (existing) {
    const updated: Bs23Artifact = {
      ...existing,
      status: input.status,
      notes: input.notes ?? existing.notes,
      completedAt: input.status === "done" ? now : existing.completedAt,
      updatedAt: now,
    };
    await db.bs23Artifacts.put(updated);
    return updated;
  }
  const artifact: Bs23Artifact = {
    id: uuid(),
    itemId: input.itemId,
    status: input.status,
    notes: input.notes,
    completedAt: input.status === "done" ? now : undefined,
    updatedAt: now,
  };
  await db.bs23Artifacts.add(artifact);
  return artifact;
}

function findTopic(topicId: string) {
  return BS23_SYLLABUS.find((t) => t.id === topicId);
}

export async function setBs23TopicStatus(
  topicId: string,
  status: Bs23TopicProgress["status"]
): Promise<Bs23TopicProgress> {
  const topic = findTopic(topicId);
  if (!topic) throw new Error(`Unknown topic: ${topicId}`);

  const now = nowISO();
  const existing = await db.bs23TopicProgress.where("topicId").equals(topicId).first();

  if (existing) {
    const updated: Bs23TopicProgress = {
      ...existing,
      status,
      completedAt: status === "done" ? now : undefined,
      updatedAt: now,
    };
    await db.bs23TopicProgress.put(updated);
    return updated;
  }

  const row: Bs23TopicProgress = {
    id: uuid(),
    topicId,
    stageId: topic.stageId,
    competencyId: topic.competencyId,
    status,
    completedAt: status === "done" ? now : undefined,
    updatedAt: now,
  };
  await db.bs23TopicProgress.add(row);
  return row;
}

export async function toggleBs23Topic(topicId: string): Promise<Bs23TopicProgress> {
  const existing = await db.bs23TopicProgress.where("topicId").equals(topicId).first();
  const current = existing?.status ?? "not_started";
  const next: Bs23TopicProgress["status"] =
    current === "not_started" ? "done" : current === "done" ? "not_started" : "done";
  return setBs23TopicStatus(topicId, next);
}

export async function bulkSetStageTopics(
  stageId: Bs23StageId,
  status: Bs23TopicProgress["status"]
): Promise<number> {
  const topics = BS23_SYLLABUS.filter((t) => t.stageId === stageId);
  let count = 0;
  for (const topic of topics) {
    await setBs23TopicStatus(topic.id, status);
    count += 1;
  }
  return count;
}
