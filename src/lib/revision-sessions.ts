import { v4 as uuid } from "uuid";
import { db } from "./db";
import type { LearningSession } from "./types";
import type { ReviewCatalogItem } from "./revision-catalog";
import { nowISO, todayISO } from "./utils";

/** Persist study time from a revision session — split evenly across queued items. */
export async function logRevisionStudyTime(
  queue: ReviewCatalogItem[],
  totalMs: number
): Promise<void> {
  if (totalMs < 1000 || queue.length === 0) return;

  const now = Date.now();
  const perItem = Math.floor(totalMs / queue.length);
  const remainder = totalMs - perItem * queue.length;
  let cursor = now.getTime() - totalMs;

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    const duration = perItem + (i === queue.length - 1 ? remainder : 0);
    if (duration < 1000) continue;

    const startMs = cursor;
    const endMs = cursor + duration;
    cursor = endMs;

    const session: LearningSession = {
      id: uuid(),
      trackId: item.trackId,
      startTime: new Date(startMs).toISOString(),
      endTime: new Date(endMs).toISOString(),
      duration,
      date: todayISO(),
      manual: false,
      createdAt: nowISO(),
      notes: "Revision session",
    };

    if (item.subtopicId) session.subtopicId = item.subtopicId;
    else if (item.topicId) session.topicId = item.topicId;

    await db.sessions.add(session);
  }
}
