import { v4 as uuid } from "uuid";
import { db } from "./db";
import type { LearningSession } from "./types";
import type { ReviewCatalogItem } from "./revision-catalog";
import { nowISO, todayISO } from "./utils";

/** Persist study time for a single revision session item. */
export async function logRevisionStudyTime(
  item: ReviewCatalogItem,
  totalMs: number
): Promise<void> {
  if (totalMs < 1000) return;

  const now = Date.now();
  const startMs = now - totalMs;

  const session: LearningSession = {
    id: uuid(),
    trackId: item.trackId,
    startTime: new Date(startMs).toISOString(),
    endTime: new Date(now).toISOString(),
    duration: totalMs,
    date: todayISO(),
    manual: false,
    createdAt: nowISO(),
    notes: "Revision session",
  };

  if (item.subtopicId) session.subtopicId = item.subtopicId;
  else if (item.topicId) session.topicId = item.topicId;

  await db.sessions.add(session);
}
