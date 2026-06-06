import { v4 as uuid } from "uuid";
import { db } from "./db";
import type { Module, Topic, Subtopic, ProgressStatus, Difficulty } from "./types";
import { nowISO } from "./utils";
import { defaultDueDate, isTopicComplete } from "./in-progress";

export async function createModule(trackId: string, name: string) {
  const modules = await db.modules.where("trackId").equals(trackId).toArray();
  const newModule: Module = {
    id: uuid(), trackId, name, order: modules.length, archived: false, createdAt: nowISO(), updatedAt: nowISO(),
  };
  await db.modules.add(newModule);
  return newModule;
}

export async function createTopic(moduleId: string, trackId: string, name: string, difficulty: Difficulty = "medium") {
  const topics = await db.topics.where("moduleId").equals(moduleId).toArray();
  const topic: Topic = {
    id: uuid(), moduleId, trackId, name, difficulty, status: "not_started",
    order: topics.length, archived: false, createdAt: nowISO(), updatedAt: nowISO(),
  };
  await db.topics.add(topic);
  return topic;
}

export async function createSubtopic(topicId: string, moduleId: string, trackId: string, name: string, difficulty: Difficulty = "medium") {
  const subtopics = await db.subtopics.where("topicId").equals(topicId).toArray();
  const subtopic: Subtopic = {
    id: uuid(), topicId, moduleId, trackId, name, status: "not_started", difficulty,
    order: subtopics.length, archived: false, createdAt: nowISO(), updatedAt: nowISO(),
  };
  await db.subtopics.add(subtopic);
  return subtopic;
}

async function syncTopicStatusFromSubtopics(topicId: string) {
  const subs = await db.subtopics.where("topicId").equals(topicId).filter((s) => !s.archived).toArray();
  if (subs.length === 0) return;

  let topicStatus: ProgressStatus = "not_started";
  if (isTopicComplete(topicId, subs)) {
    topicStatus = subs.every((s) => s.status === "mastered") ? "mastered" : "completed";
  } else if (subs.some((s) => s.status === "in_progress" || s.status === "completed" || s.status === "mastered")) {
    topicStatus = "in_progress";
  }

  const updates: Partial<Topic> = { status: topicStatus, updatedAt: nowISO() };
  if (topicStatus === "completed" || topicStatus === "mastered") {
    updates.dueDate = undefined;
  }
  await db.topics.update(topicId, updates);
}

export async function updateSubtopicStatus(id: string, status: ProgressStatus, dueDate?: string) {
  const sub = await db.subtopics.get(id);
  if (!sub) return;

  const updates: Partial<Subtopic> = { status, updatedAt: nowISO() };

  if (status === "in_progress") {
    updates.startedAt = sub.startedAt ?? nowISO();
    updates.dueDate = dueDate ?? sub.dueDate ?? defaultDueDate(7);
  } else if (status === "not_started") {
    updates.startedAt = undefined;
    updates.dueDate = undefined;
  } else if (status === "completed" || status === "mastered") {
    updates.dueDate = undefined;
  }

  await db.subtopics.update(id, updates);
  await syncTopicStatusFromSubtopics(sub.topicId);
}

export async function updateTopicStatus(id: string, status: ProgressStatus, dueDate?: string) {
  const topic = await db.topics.get(id);
  if (!topic) return;

  const updates: Partial<Topic> = { status, updatedAt: nowISO() };

  if (status === "in_progress") {
    updates.startedAt = topic.startedAt ?? nowISO();
    updates.dueDate = dueDate ?? topic.dueDate ?? defaultDueDate(7);
  } else if (status === "not_started") {
    updates.startedAt = undefined;
    updates.dueDate = undefined;
  } else if (status === "completed" || status === "mastered") {
    updates.dueDate = undefined;
  }

  await db.topics.update(id, updates);
}

export async function updateSubtopicDueDate(id: string, dueDate: string) {
  await db.subtopics.update(id, { dueDate, updatedAt: nowISO() });
}

export async function updateTopicDueDate(id: string, dueDate: string) {
  await db.topics.update(id, { dueDate, updatedAt: nowISO() });
}

export async function updateItem<T extends { id: string }>(
  table: { update: (id: string, changes: Partial<T>) => Promise<number> },
  id: string,
  changes: Partial<T>
) {
  await table.update(id, { ...changes, updatedAt: nowISO() } as Partial<T>);
}

export async function archiveItem(
  table: { update: (id: string, changes: { archived: boolean; updatedAt: string }) => Promise<number> },
  id: string
) {
  await table.update(id, { archived: true, updatedAt: nowISO() });
}

export async function deleteItem(table: { delete: (id: string) => Promise<void> }, id: string) {
  await table.delete(id);
}

export async function duplicateSubtopic(subtopic: Subtopic) {
  const subtopics = await db.subtopics.where("topicId").equals(subtopic.topicId).toArray();
  const copy: Subtopic = {
    ...subtopic,
    id: uuid(),
    name: `${subtopic.name} (Copy)`,
    status: "not_started",
    startedAt: undefined,
    dueDate: undefined,
    order: subtopics.length,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  await db.subtopics.add(copy);
  return copy;
}

export async function reorderItems<T extends { id: string; order: number }>(
  table: { update: (id: string, changes: { order: number }) => Promise<number> },
  items: T[]
) {
  await Promise.all(items.map((item, index) => table.update(item.id, { order: index })));
}
