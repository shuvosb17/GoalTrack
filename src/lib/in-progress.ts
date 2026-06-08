import { differenceInCalendarDays, format } from "date-fns";
import type { Track, Module, Topic, Subtopic, InProgressTask, InProgressTopicGroup } from "./types";
import { calculateSubtopicProgress, statusWeight, parseLocalDate, todayISO } from "./utils";

export function isTopicComplete(topic: Topic, subtopics: Subtopic[]): boolean {
  if (topic.status === "completed" || topic.status === "mastered") return true;
  const subs = subtopics.filter((s) => s.topicId === topic.id && !s.archived);
  if (subs.length === 0) return false;
  return subs.every((s) => s.status === "completed" || s.status === "mastered");
}

export function isTopicActive(topic: Topic, subtopics: Subtopic[]): boolean {
  if (topic.archived) return false;
  if (topic.status === "in_progress") return true;
  const subs = subtopics.filter((s) => s.topicId === topic.id && !s.archived);
  return subs.some((s) => s.status === "in_progress");
}

/** Progress for one topic: completed/mastered topic = 100%, else subtopic-based or topic status */
export function getTopicProgressPercent(topic: Topic, subtopics: Subtopic[]): number {
  if (topic.status === "completed" || topic.status === "mastered") return 100;
  const subs = subtopics.filter((s) => s.topicId === topic.id && !s.archived);
  if (subs.length > 0) return calculateSubtopicProgress(subs);
  return Math.round(statusWeight(topic.status ?? "not_started") * 100);
}

/** Roll up progress across topics by weighting every subtopic (not averaging topic %) */
export function calculateTopicsProgress(topics: Topic[], subtopics: Subtopic[]): number {
  const active = topics.filter((t) => !t.archived);
  if (active.length === 0) return 0;

  let totalWeight = 0;
  let totalUnits = 0;

  for (const topic of active) {
    const subs = subtopics.filter((s) => s.topicId === topic.id && !s.archived);
    const percent = getTopicProgressPercent(topic, subtopics);
    if (subs.length > 0) {
      totalWeight += (percent / 100) * subs.length;
      totalUnits += subs.length;
    } else {
      totalWeight += percent / 100;
      totalUnits += 1;
    }
  }

  return totalUnits > 0 ? Math.round((totalWeight / totalUnits) * 100) : 0;
}

export function getDaysUntilDue(dueDate?: string): number | null {
  if (!dueDate) return null;
  return differenceInCalendarDays(parseLocalDate(dueDate), parseLocalDate(todayISO()));
}

export function formatDeadline(daysRemaining: number | null, dueDate?: string): string {
  if (!dueDate) return "No deadline";
  if (daysRemaining === null) return "No deadline";
  if (daysRemaining < 0) return `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"}`;
  if (daysRemaining === 0) return "Due today";
  if (daysRemaining === 1) return "Due tomorrow";
  return `${daysRemaining} days left`;
}

export function formatDueDate(dueDate: string): string {
  return format(parseLocalDate(dueDate), "MMM d, yyyy");
}

export function getEffectiveDueDate(topic: Topic, activeSubtopics: Subtopic[]): string | undefined {
  const dates = [
    topic.dueDate,
    ...activeSubtopics.map((s) => s.dueDate).filter(Boolean),
  ].filter(Boolean) as string[];
  if (dates.length === 0) return undefined;
  return dates.sort((a, b) => parseLocalDate(a).getTime() - parseLocalDate(b).getTime())[0];
}

export function getInProgressTopics(
  topics: Topic[],
  subtopics: Subtopic[],
  modules: Module[],
  tracks: Track[]
): InProgressTopicGroup[] {
  const groups: InProgressTopicGroup[] = [];

  topics.forEach((topic) => {
    if (topic.archived) return;
    const topicSubs = subtopics.filter((s) => s.topicId === topic.id && !s.archived);
    const activeSubtopics = topicSubs.filter((s) => s.status === "in_progress");
    const topicIsActive = topic.status === "in_progress" || activeSubtopics.length > 0;

    if (!topicIsActive) return;

    const mod = modules.find((m) => m.id === topic.moduleId);
    const track = tracks.find((t) => t.id === topic.trackId);
    const dueDate = getEffectiveDueDate(topic, activeSubtopics);
    const daysRemaining = getDaysUntilDue(dueDate);

    groups.push({
      topic,
      moduleName: mod?.name ?? "Unknown",
      trackName: track?.name ?? "Unknown",
      trackColor: track?.color ?? "#8b5cf6",
      trackIcon: track?.icon ?? "📚",
      trackId: topic.trackId,
      moduleId: topic.moduleId,
      progress: getTopicProgressPercent(topic, subtopics),
      activeSubtopics,
      daysRemaining,
      isOverdue: daysRemaining !== null && daysRemaining < 0,
      dueDate,
    });
  });

  return sortInProgressTopicsByUrgency(groups);
}

export function getInProgressTasks(
  subtopics: Subtopic[],
  topics: Topic[],
  modules: Module[],
  tracks: Track[]
): InProgressTask[] {
  const inProgress = subtopics.filter((s) => !s.archived && s.status === "in_progress");

  const tasks: InProgressTask[] = inProgress.map((sub) => {
    const topic = topics.find((t) => t.id === sub.topicId);
    const mod = modules.find((m) => m.id === sub.moduleId);
    const track = tracks.find((t) => t.id === sub.trackId);
    const daysRemaining = getDaysUntilDue(sub.dueDate);

    return {
      subtopic: sub,
      topicName: topic?.name ?? "Unknown",
      moduleName: mod?.name ?? "Unknown",
      trackName: track?.name ?? "Unknown",
      trackColor: track?.color ?? "#8b5cf6",
      trackIcon: track?.icon ?? "📚",
      daysRemaining,
      isOverdue: daysRemaining !== null && daysRemaining < 0,
    };
  });

  return sortInProgressByUrgency(tasks);
}

export function sortInProgressTopicsByUrgency(groups: InProgressTopicGroup[]): InProgressTopicGroup[] {
  return [...groups].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return b.progress - a.progress;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return parseLocalDate(a.dueDate).getTime() - parseLocalDate(b.dueDate).getTime();
  });
}

export function sortInProgressByUrgency(tasks: InProgressTask[]): InProgressTask[] {
  return [...tasks].sort((a, b) => {
    const aDue = a.subtopic.dueDate;
    const bDue = b.subtopic.dueDate;
    if (!aDue && !bDue) return 0;
    if (!aDue) return 1;
    if (!bDue) return -1;
    return parseLocalDate(aDue).getTime() - parseLocalDate(bDue).getTime();
  });
}

/** Default deadline — today unless daysFromNow is specified */
export function defaultDueDate(daysFromNow = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return format(d, "yyyy-MM-dd");
}

export function countInProgress(topics: Topic[], subtopics: Subtopic[]): number {
  return getInProgressTopics(topics, subtopics, [], []).length;
}
