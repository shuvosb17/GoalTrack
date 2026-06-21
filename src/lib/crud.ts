import { v4 as uuid } from "uuid";
import { db } from "./db";
import type { Module, Topic, Subtopic, ProgressStatus, Difficulty, LeetcodeProblem } from "./types";
import { nowISO, todayISO, parseLocalDate } from "./utils";
import { computeNextReviewDate } from "./metrics";
import { isTopicComplete } from "./in-progress";
import { enqueueConfidencePromptIfNeeded, enqueueConfidencePromptIfNeededForSubtopic } from "./confidence-prompt";
import type { TopicCompletionMeta } from "./types/metrics";

function buildCompletionMeta(existing?: TopicCompletionMeta): TopicCompletionMeta {
  return {
    completedAt: existing?.completedAt ?? nowISO(),
    confidenceRating: existing?.confidenceRating ?? 3,
    nextReviewDue: existing?.nextReviewDue ?? computeNextReviewDate(3),
    reviewedAt: existing?.reviewedAt,
    confidenceRated: existing?.confidenceRated ?? false,
  };
}

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
    if (!topic.completionMeta) {
      updates.completionMeta = buildCompletionMeta();
    }
  }
  await db.topics.update(topicId, updates);

  if (
    topic.status !== topicStatus &&
    (topicStatus === "completed" || topicStatus === "mastered") &&
    subs.length === 0
  ) {
    await enqueueConfidencePromptIfNeeded(topicId);
  }
}

/** Set the same due date on the topic and all in-progress subtopics (topic-level deadline only). */
async function propagateDueDateToAllSubtopics(topicId: string, dueDate: string) {
  await db.topics.update(topicId, { dueDate, updatedAt: nowISO() });

  const subs = await db.subtopics
    .where("topicId")
    .equals(topicId)
    .filter((s) => !s.archived && s.status === "in_progress")
    .toArray();

  await Promise.all(
    subs.map((sub) => db.subtopics.update(sub.id, { dueDate, updatedAt: nowISO() }))
  );
}

/** Roll topic due date up to the earliest in-progress subtopic deadline (display only). */
async function syncTopicDueDateFromSubtopics(topicId: string) {
  const topic = await db.topics.get(topicId);
  if (!topic) return;

  const subs = await db.subtopics
    .where("topicId")
    .equals(topicId)
    .filter((s) => !s.archived && s.status === "in_progress" && Boolean(s.dueDate))
    .toArray();

  const dates = subs
    .map((s) => s.dueDate!)
    .sort((a, b) => parseLocalDate(a).getTime() - parseLocalDate(b).getTime());
  const earliest = dates[0];

  if (earliest) {
    if (topic.dueDate !== earliest) {
      await db.topics.update(topicId, { dueDate: earliest, updatedAt: nowISO() });
    }
    return;
  }

  if (topic.dueDate) {
    await db.topics.update(topicId, { dueDate: undefined, updatedAt: nowISO() });
  }
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
    updates.dueDate = dueDate ?? sub.dueDate ?? todayISO();
  } else if (status === "not_started") {
    updates.startedAt = undefined;
    updates.dueDate = undefined;
  } else if (status === "completed" || status === "mastered") {
    updates.dueDate = undefined;
    if (!sub.completionMeta) {
      updates.completionMeta = buildCompletionMeta();
    }
  }

  const justCompleted =
    sub.status !== status && (status === "completed" || status === "mastered");

  await db.subtopics.update(id, updates);
  if (status === "in_progress" && updates.dueDate) {
    await syncTopicDueDateFromSubtopics(sub.topicId);
  }
  await syncTopicStatusFromSubtopics(sub.topicId);

  if (justCompleted) {
    await enqueueConfidencePromptIfNeededForSubtopic(id);
  }
}

export async function updateTopicStatus(id: string, status: ProgressStatus, dueDate?: string) {
  const topic = await db.topics.get(id);
  if (!topic) return;

  let resolvedStatus = status;
  if (status === "in_progress") {
    const subs = await db.subtopics.where("topicId").equals(id).filter((s) => !s.archived).toArray();
    if (subs.length > 0 && subs.every((s) => s.status === "completed" || s.status === "mastered")) {
      resolvedStatus = subs.every((s) => s.status === "mastered") ? "mastered" : "completed";
    }
  }

  const updates: Partial<Topic> = { status: resolvedStatus, updatedAt: nowISO() };
  if (topic.status !== resolvedStatus) {
    updates.statusChangedAt = nowISO();
  }

  if (resolvedStatus === "in_progress") {
    updates.startedAt = topic.startedAt ?? nowISO();
    updates.dueDate = dueDate ?? topic.dueDate ?? todayISO();
  } else if (resolvedStatus === "not_started") {
    updates.startedAt = undefined;
    updates.dueDate = undefined;
  } else if (resolvedStatus === "completed" || resolvedStatus === "mastered") {
    updates.dueDate = undefined;
    if (!topic.completionMeta) {
      updates.completionMeta = buildCompletionMeta();
    }
  }

  await db.topics.update(id, updates);

  const justCompleted =
    topic.status !== resolvedStatus &&
    (resolvedStatus === "completed" || resolvedStatus === "mastered");

  if (resolvedStatus === "in_progress" && updates.dueDate) {
    await propagateDueDateToAllSubtopics(id, updates.dueDate);
  }

  if (resolvedStatus === "completed" || resolvedStatus === "mastered") {
    const changedAt = updates.statusChangedAt ?? nowISO();
    const subs = await db.subtopics.where("topicId").equals(id).filter((s) => !s.archived).toArray();
    await Promise.all(
      subs
        .filter((sub) => sub.status !== resolvedStatus)
        .map((sub) =>
          db.subtopics.update(sub.id, {
            status: resolvedStatus,
            dueDate: undefined,
            updatedAt: nowISO(),
            statusChangedAt: changedAt,
            ...((resolvedStatus === "completed" || resolvedStatus === "mastered") &&
            !sub.completionMeta
              ? { completionMeta: buildCompletionMeta() }
              : {}),
          })
        )
    );
  } else {
    await syncTopicStatusFromSubtopics(id);
  }

  if (justCompleted) {
    const subs = await db.subtopics.where("topicId").equals(id).filter((s) => !s.archived).toArray();
    if (subs.length === 0) {
      await enqueueConfidencePromptIfNeeded(id);
    }
  }
}

/**
 * Records retention confidence on a completed subtopic.
 */
export async function setSubtopicCompletionConfidence(
  id: string,
  confidence: 1 | 2 | 3 | 4 | 5,
  options?: { isReview?: boolean }
) {
  const sub = await db.subtopics.get(id);
  if (!sub) return;
  const completedAt = sub.completionMeta?.completedAt ?? nowISO();
  const nextReviewDue = computeNextReviewDate(confidence);
  await db.subtopics.update(id, {
    completionMeta: {
      completedAt,
      confidenceRating: confidence,
      nextReviewDue,
      reviewedAt: options?.isReview ? nowISO() : sub.completionMeta?.reviewedAt,
      confidenceRated: true,
    },
    updatedAt: nowISO(),
  });
}

export async function markSubtopicReviewed(id: string, confidence: 1 | 2 | 3 | 4 | 5) {
  await setSubtopicCompletionConfidence(id, confidence, { isReview: true });
}

/**
 * Records a retention-confidence rating (1–5) on a completed topic and schedules
 * the next review for `confidence * 3` days out. Lower confidence ⇒ sooner review.
 */
export async function setTopicCompletionConfidence(
  id: string,
  confidence: 1 | 2 | 3 | 4 | 5,
  options?: { isReview?: boolean }
) {
  const topic = await db.topics.get(id);
  if (!topic) return;
  const completedAt = topic.completionMeta?.completedAt ?? nowISO();
  const nextReviewDue = computeNextReviewDate(confidence);
  await db.topics.update(id, {
    completionMeta: {
      completedAt,
      confidenceRating: confidence,
      nextReviewDue,
      reviewedAt: options?.isReview ? nowISO() : topic.completionMeta?.reviewedAt,
      confidenceRated: true,
    },
    updatedAt: nowISO(),
  });
}

/** Re-rate retention after a scheduled review — reschedules the next review date. */
export async function markTopicReviewed(id: string, confidence: 1 | 2 | 3 | 4 | 5) {
  await setTopicCompletionConfidence(id, confidence, { isReview: true });
}

/** Logs a solved LeetCode problem: bumps the aggregate counter and appends a dated entry. */
export async function addLeetCodeProblem(difficulty: "easy" | "medium" | "hard") {
  const settings = await db.settings.get("default");
  if (!settings) return;
  const stats = settings.leetCodeStats ?? { easy: 0, medium: 0, hard: 0 };
  const log = settings.leetCodeLog ?? [];
  await db.settings.put({
    ...settings,
    leetCodeStats: { ...stats, [difficulty]: (stats[difficulty] ?? 0) + 1, lastSolvedDate: todayISO() },
    leetCodeLog: [...log, { date: todayISO(), difficulty }],
  });
}

/** Reverses the most recent solve of the given difficulty (for accidental taps). */
export async function removeLeetCodeProblem(difficulty: "easy" | "medium" | "hard") {
  const settings = await db.settings.get("default");
  if (!settings) return;
  const stats = settings.leetCodeStats ?? { easy: 0, medium: 0, hard: 0 };
  if ((stats[difficulty] ?? 0) <= 0) return;
  const log = [...(settings.leetCodeLog ?? [])];
  const lastIdx = log.map((e) => e.difficulty).lastIndexOf(difficulty);
  if (lastIdx >= 0) log.splice(lastIdx, 1);
  await db.settings.put({
    ...settings,
    leetCodeStats: { ...stats, [difficulty]: Math.max(0, (stats[difficulty] ?? 0) - 1) },
    leetCodeLog: log,
  });
}

export async function toggleLeetcodeProblem(id: string) {
  const problem = await db.leetcodeProblems.get(id);
  if (!problem) return;

  const nextDone = !problem.done;
  const updates = {
    done: nextDone,
    doneAt: nextDone ? todayISO() : undefined,
    updatedAt: nowISO(),
  };

  await db.leetcodeProblems.update(id, updates);

  if (nextDone && !problem.done) {
    await addLeetCodeProblem(problem.difficulty);
  } else if (!nextDone && problem.done) {
    await removeLeetCodeProblem(problem.difficulty);
  }
}

export async function addLeetcodeProblem(input: {
  pattern: string;
  title: string;
  url?: string;
  difficulty: "easy" | "medium" | "hard";
  notes?: string;
}) {
  const existing = await db.leetcodeProblems.where("pattern").equals(input.pattern).toArray();
  const now = nowISO();
  const problem = {
    id: uuid(),
    pattern: input.pattern,
    title: input.title,
    url: input.url,
    difficulty: input.difficulty,
    done: false,
    isCore: false,
    notes: input.notes,
    order: existing.length > 0 ? Math.max(...existing.map((p) => p.order)) + 1 : 0,
    createdAt: now,
    updatedAt: now,
  };
  await db.leetcodeProblems.add(problem);
  return problem;
}

export async function updateLeetcodeProblem(
  id: string,
  patch: Partial<Pick<LeetcodeProblem, "title" | "url" | "difficulty" | "notes" | "pattern">>
) {
  await db.leetcodeProblems.update(id, { ...patch, updatedAt: nowISO() });
}

export async function deleteLeetcodeProblem(id: string) {
  const problem = await db.leetcodeProblems.get(id);
  if (!problem) return;
  if (problem.done) {
    await removeLeetCodeProblem(problem.difficulty);
  }
  await db.leetcodeProblems.delete(id);
}

export async function toggleCsReviewItem(id: string) {
  const item = await db.csReviewItems.get(id);
  if (!item) return;
  await db.csReviewItems.update(id, { done: !item.done, updatedAt: nowISO() });
}

export async function updateSubtopicDueDate(id: string, dueDate: string) {
  const sub = await db.subtopics.get(id);
  if (!sub) return;
  await db.subtopics.update(id, { dueDate, updatedAt: nowISO() });
  await syncTopicDueDateFromSubtopics(sub.topicId);
}

export async function updateTopicDueDate(id: string, dueDate: string) {
  await propagateDueDateToAllSubtopics(id, dueDate);
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
