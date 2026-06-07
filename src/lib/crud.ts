import { v4 as uuid } from "uuid";
import { db } from "./db";
import type { Module, Topic, Subtopic, ProgressStatus, Difficulty } from "./types";
import { nowISO } from "./utils";
import { defaultDueDate, isTopicComplete } from "./in-progress";

export async function renameModule(id: string, name: string) {
  await db.modules.update(id, { name, updatedAt: nowISO() });
}

export async function renameTopic(id: string, name: string) {
  await db.topics.update(id, { name, updatedAt: nowISO() });
}

export async function deleteModule(id: string) {
  const subs = await db.subtopics.where("moduleId").equals(id).toArray();
  const topicIds = (await db.topics.where("moduleId").equals(id).toArray()).map((t) => t.id);

  await db.transaction("rw", [db.modules, db.topics, db.subtopics, db.sessions], async () => {
    for (const sub of subs) {
      await db.sessions.where("subtopicId").equals(sub.id).delete();
    }
    for (const topicId of topicIds) {
      await db.sessions.where("topicId").equals(topicId).delete();
    }
    await db.subtopics.where("moduleId").equals(id).delete();
    await db.topics.where("moduleId").equals(id).delete();
    await db.sessions.where("moduleId").equals(id).delete();
    await db.modules.delete(id);
  });
}

export async function deleteTopic(id: string) {
  const subs = await db.subtopics.where("topicId").equals(id).toArray();

  await db.transaction("rw", [db.topics, db.subtopics, db.sessions], async () => {
    for (const sub of subs) {
      await db.sessions.where("subtopicId").equals(sub.id).delete();
    }
    await db.subtopics.where("topicId").equals(id).delete();
    await db.sessions.where("topicId").equals(id).delete();
    await db.topics.delete(id);
  });
}

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
  await syncTopicStatusFromSubtopics(topicId);
  return subtopic;
}

export async function syncTopicStatusFromSubtopics(topicId: string) {
  const subs = await db.subtopics.where("topicId").equals(topicId).filter((s) => !s.archived).toArray();
  if (subs.length === 0) return;

  let topicStatus: ProgressStatus = "not_started";
  const topic = await db.topics.get(topicId);
  if (topic && isTopicComplete(topic, subs)) {
    topicStatus = subs.every((s) => s.status === "mastered") ? "mastered" : "completed";
  } else if (subs.some((s) => s.status === "in_progress" || s.status === "completed" || s.status === "mastered")) {
    topicStatus = "in_progress";
  }

  if (!topic || topic.status === topicStatus) return;

  const latestSubChange = subs
    .map((s) => s.statusChangedAt)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  const updates: Partial<Topic> = {
    status: topicStatus,
    statusChangedAt: latestSubChange ?? nowISO(),
    updatedAt: nowISO(),
  };
  if (topicStatus === "completed" || topicStatus === "mastered") {
    updates.dueDate = undefined;
  }
  await db.topics.update(topicId, updates);
}

export async function updateSubtopicStatus(id: string, status: ProgressStatus, dueDate?: string) {
  const sub = await db.subtopics.get(id);
  if (!sub) return;

  const updates: Partial<Subtopic> = { status, updatedAt: nowISO() };
  if (sub.status !== status) {
    updates.statusChangedAt = nowISO();
  }

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
  if (topic.status !== status) {
    updates.statusChangedAt = nowISO();
  }

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

  if (status === "completed" || status === "mastered") {
    const changedAt = updates.statusChangedAt ?? nowISO();
    const subs = await db.subtopics.where("topicId").equals(id).filter((s) => !s.archived).toArray();
    await Promise.all(
      subs
        .filter((sub) => sub.status !== status)
        .map((sub) =>
          db.subtopics.update(sub.id, {
            status,
            dueDate: undefined,
            updatedAt: nowISO(),
            statusChangedAt: changedAt,
          })
        )
    );
  }
}

export async function updateSubtopicDueDate(id: string, dueDate: string) {
  await db.subtopics.update(id, { dueDate, updatedAt: nowISO() });
}

export async function updateTopicDueDate(id: string, dueDate: string) {
  await db.topics.update(id, { dueDate, updatedAt: nowISO() });
}

export async function updateTopicDifficulty(id: string, difficulty: Difficulty) {
  await db.topics.update(id, { difficulty, updatedAt: nowISO() });
}

export async function updateSubtopicDifficulty(id: string, difficulty: Difficulty) {
  await db.subtopics.update(id, { difficulty, updatedAt: nowISO() });
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

export async function archiveSubtopic(id: string) {
  const sub = await db.subtopics.get(id);
  if (!sub) return;
  await archiveItem(db.subtopics, id);
  await syncTopicStatusFromSubtopics(sub.topicId);
}

export async function deleteSubtopic(id: string) {
  const sub = await db.subtopics.get(id);
  if (!sub) return;
  await deleteItem(db.subtopics, id);
  await syncTopicStatusFromSubtopics(sub.topicId);
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
