import { format, isToday, isYesterday } from "date-fns";
import { toLocalDateKey, parseLocalDate } from "./utils";
import type {
  Track, Module, Topic, Subtopic, ProgressStatus,
  StatusTopicEntry, DailyStatusSnapshot, UrgencyAlert,
} from "./types";
import {
  getTopicProgressPercent,
  getSubtopicProgressPercent,
  getEffectiveTopicStatus,
  getSubtopicDueDate,
} from "./in-progress";
import { isSubtopicDone } from "./utils";

export {
  isTopicComplete,
  calculateTopicsProgress,
  getDaysUntilDue,
  formatDeadline,
  formatDueDate,
  getEffectiveDueDate,
  getInProgressTopics,
  sortInProgressTopicsByUrgency,
  defaultDueDate,
  getEffectiveTopicStatus,
} from "./in-progress";

import {
  getDaysUntilDue,
  getEffectiveDueDate,
  getInProgressTopics,
  formatDueDate,
} from "./in-progress";

const ALL_STATUSES: ProgressStatus[] = ["not_started", "in_progress", "completed", "mastered"];

function emptyCounts(): Record<ProgressStatus, number> {
  return { not_started: 0, in_progress: 0, completed: 0, mastered: 0 };
}

function formatDateLabel(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMMM d, yyyy");
}

function getTopicStatusDate(topic: Topic, subtopics: Subtopic[]): string {
  const topicSubs = subtopics.filter((s) => s.topicId === topic.id && !s.archived);
  const timestamps: string[] = [];

  if (topic.statusChangedAt) timestamps.push(topic.statusChangedAt);

  for (const sub of topicSubs) {
    if (!sub.statusChangedAt) continue;
    const matches =
      sub.status === topic.status ||
      ((topic.status === "completed" || topic.status === "mastered") &&
        (sub.status === "completed" || sub.status === "mastered"));
    if (matches) timestamps.push(sub.statusChangedAt);
  }

  if (timestamps.length === 0) return toLocalDateKey(topic.updatedAt);

  return timestamps.map(toLocalDateKey).sort()[0];
}

function entryMatchesFilter(
  entry: StatusTopicEntry,
  statusFilter: ProgressStatus | "all"
): boolean {
  if (statusFilter === "all") {
    return entry.topicEffectiveStatus !== "not_started";
  }
  if (entry.focalSubtopic) {
    if (entry.displayStatus === statusFilter) return true;
    // Topic still underway — show completed subtopic rows under In Progress too
    if (statusFilter === "in_progress" && entry.topicEffectiveStatus === "in_progress") return true;
    return false;
  }
  return entry.displayStatus === statusFilter;
}

function buildSubtopicFocalEntry(
  base: Omit<StatusTopicEntry, "displayName" | "displayStatus" | "focalSubtopic" | "subtopicProgress" | "progress" | "daysRemaining" | "isOverdue" | "isDueSoon" | "dueDate" | "statusDate">,
  sub: Subtopic,
  topic: Topic,
  subtopics: Subtopic[]
): StatusTopicEntry {
  const subDue = getSubtopicDueDate(sub, topic);
  const subDays = getDaysUntilDue(subDue);
  const subtopicProgress = getSubtopicProgressPercent(sub);
  const isActive = sub.status === "in_progress";

  return {
    ...base,
    displayName: sub.name,
    displayStatus: sub.status,
    focalSubtopic: sub,
    subtopicProgress,
    progress: subtopicProgress,
    dueDate: subDue,
    daysRemaining: subDays,
    isOverdue: isActive && subDays !== null && subDays < 0,
    isDueSoon: isActive && subDays !== null && subDays >= 0 && subDays <= 3,
    statusDate: sub.statusChangedAt ? toLocalDateKey(sub.statusChangedAt) : getTopicStatusDate(topic, subtopics),
  };
}

function buildStatusEntries(
  topic: Topic,
  subtopics: Subtopic[],
  modules: Module[],
  tracks: Track[]
): StatusTopicEntry[] {
  const mod = modules.find((m) => m.id === topic.moduleId);
  const track = tracks.find((t) => t.id === topic.trackId);
  const topicSubs = subtopics.filter((s) => s.topicId === topic.id && !s.archived);
  const activeSubs = topicSubs.filter((s) => s.status === "in_progress");
  const effectiveStatus = getEffectiveTopicStatus(topic, subtopics);

  const topicProgress = getTopicProgressPercent(topic, subtopics);
  const subtopicsTotal = topicSubs.length;
  const subtopicsDone = topicSubs.filter((s) => isSubtopicDone(s.status)).length;

  const base = {
    topic,
    moduleName: mod?.name ?? "Unknown",
    trackName: track?.name ?? "Unknown",
    trackColor: track?.color ?? "#8b5cf6",
    trackIcon: track?.icon ?? "📚",
    trackId: topic.trackId,
    moduleId: topic.moduleId,
    topicEffectiveStatus: effectiveStatus,
    activeSubtopics: activeSubs,
    topicProgress,
    subtopicsDone,
    subtopicsTotal,
  };

  // Subtopics that have started (in progress, completed, or mastered) each get a focal row.
  const focalSubs = topicSubs.filter((s) => s.status !== "not_started");

  if (effectiveStatus === "in_progress" && focalSubs.length > 0) {
    return focalSubs.map((sub) => buildSubtopicFocalEntry(base, sub, topic, subtopics));
  }

  const dueDate = getEffectiveDueDate(topic, activeSubs);
  const daysRemaining = getDaysUntilDue(dueDate);
  return [
    {
      ...base,
      displayName: topic.name,
      displayStatus: effectiveStatus,
      subtopicProgress: undefined,
      progress: topicProgress,
      dueDate,
      daysRemaining,
      isOverdue: daysRemaining !== null && daysRemaining < 0,
      isDueSoon: daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3,
      statusDate: getTopicStatusDate(topic, subtopics),
    },
  ];
}

export function getStatusTimeline(
  topics: Topic[],
  subtopics: Subtopic[],
  modules: Module[],
  tracks: Track[],
  statusFilter: ProgressStatus | "all" = "all"
): DailyStatusSnapshot[] {
  const active = topics.filter((t) => !t.archived);
  const byDate = new Map<string, StatusTopicEntry[]>();

  active.forEach((topic) => {
    buildStatusEntries(topic, subtopics, modules, tracks).forEach((entry) => {
      if (!entryMatchesFilter(entry, statusFilter)) return;
      const existing = byDate.get(entry.statusDate) ?? [];
      existing.push(entry);
      byDate.set(entry.statusDate, existing);
    });
  });

  return [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => {
      const counts = emptyCounts();
      entries.forEach((e) => { counts[e.displayStatus]++; });
      return {
        date,
        label: formatDateLabel(date),
        relativeLabel: format(parseLocalDate(date), "MMM d"),
        counts,
        topics: entries.sort((a, b) => {
          const urgency = (e: StatusTopicEntry) => e.isOverdue ? 0 : e.isDueSoon ? 1 : 2;
          return urgency(a) - urgency(b) || a.topic.name.localeCompare(b.topic.name);
        }),
      };
    });
}

export function getGlobalStatusCounts(
  topics: Topic[],
  subtopics: Subtopic[] = []
): Record<ProgressStatus, number> {
  const counts = emptyCounts();
  topics
    .filter((t) => !t.archived)
    .forEach((t) => { counts[getEffectiveTopicStatus(t, subtopics)]++; });
  return counts;
}

export function getUrgencyAlerts(
  topics: Topic[],
  subtopics: Subtopic[],
  modules: Module[],
  tracks: Track[]
): UrgencyAlert[] {
  const alerts: UrgencyAlert[] = [];
  const inProgressGroups = getInProgressTopics(topics, subtopics, modules, tracks);

  inProgressGroups.forEach((group) => {
    if (group.isOverdue) {
      alerts.push({
        id: `overdue-${group.topic.id}`,
        level: "critical",
        message: `Overdue — was due ${group.dueDate ? formatDueDate(group.dueDate) : "earlier"}`,
        topicName: group.topic.name,
        trackName: group.trackName,
        dueDate: group.dueDate,
        topicId: group.topic.id,
      });
    } else if (group.daysRemaining === 0) {
      alerts.push({
        id: `today-${group.topic.id}`,
        level: "critical",
        message: "Due today — finish before end of day",
        topicName: group.topic.name,
        trackName: group.trackName,
        dueDate: group.dueDate,
        topicId: group.topic.id,
      });
    } else if (group.daysRemaining === 1) {
      alerts.push({
        id: `tomorrow-${group.topic.id}`,
        level: "warning",
        message: "Due tomorrow — prioritize this topic",
        topicName: group.topic.name,
        trackName: group.trackName,
        dueDate: group.dueDate,
        topicId: group.topic.id,
      });
    } else if (group.daysRemaining !== null && group.daysRemaining <= 3) {
      alerts.push({
        id: `soon-${group.topic.id}`,
        level: "warning",
        message: `${group.daysRemaining} days left to complete`,
        topicName: group.topic.name,
        trackName: group.trackName,
        dueDate: group.dueDate,
        topicId: group.topic.id,
      });
    } else if (!group.dueDate && group.topic.status === "in_progress") {
      alerts.push({
        id: `no-deadline-${group.topic.id}`,
        level: "info",
        message: "No deadline set — add one to stay on track",
        topicName: group.topic.name,
        trackName: group.trackName,
        topicId: group.topic.id,
      });
    }
  });

  const order = { critical: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => order[a.level] - order[b.level]);
}

export function getTodaySnapshot(
  timeline: DailyStatusSnapshot[]
): DailyStatusSnapshot | null {
  const today = format(new Date(), "yyyy-MM-dd");
  return timeline.find((d) => d.date === today) ?? null;
}

export function countActiveStatuses(counts: Record<ProgressStatus, number>): number {
  return counts.in_progress + counts.completed + counts.mastered;
}

export { ALL_STATUSES };
