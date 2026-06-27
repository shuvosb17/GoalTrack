import { format, subDays } from "date-fns";
import { getStatusTimeline } from "./status";
import type { Module, Subtopic, Topic, Track } from "./types";

/**
 * Status timeline entries dated within the last N days — same source as the
 * Status page list. Uses statusChangedAt, not Topic.createdAt (which spikes
 * after bulk path imports).
 */
export function countStatusActivitySince(
  topics: Topic[],
  subtopics: Subtopic[],
  modules: Module[],
  tracks: Track[],
  days: number = 7
): number {
  const cutoff = format(subDays(new Date(), days), "yyyy-MM-dd");
  const timeline = getStatusTimeline(topics, subtopics, modules, tracks, "all");

  return timeline
    .filter((day) => day.date >= cutoff)
    .reduce((sum, day) => sum + day.topics.length, 0);
}
