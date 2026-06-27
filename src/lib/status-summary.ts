import type { Topic } from "./types";
import { parseISO, subDays } from "date-fns";

/** Topics created within the last N days (topic-level; uses Topic.createdAt). */
export function countTopicsAddedSince(topics: Topic[], days: number): number {
  const cutoff = subDays(new Date(), days);
  return topics.filter(
    (t) => !t.archived && parseISO(t.createdAt) >= cutoff
  ).length;
}
