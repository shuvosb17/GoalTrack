import { format, isToday, isYesterday, parseISO } from "date-fns";
import type {
  Track, Module, Topic, Subtopic, ProgressStatus,
  StatusTopicEntry, DailyStatusSnapshot, UrgencyAlert,
} from "./types";
import { getTopicProgressPercent } from "./in-progress";

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
  const d = parseISO(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMMM d, yyyy");
}

function buildStatusEntry(
  topic: Topic,
  subtopics: Subtopic[],
  modules: Module[],
  tracks: Track[]
): StatusTopicEntry {
  const mod = modules.find((m) => m.id === topic.moduleId);
  const track = tracks.find((t) => t.id === topic.trackId);
  const topicSubs = subtopics.filter((s) => s.topicId === topic.id && !s.archived);
  const activeSubs = topicSubs.filter((s) => s.status === "in_progress");
  const dueDate = getEffectiveDueDate(topic, activeSubs);
  const daysRemaining = getDaysUntilDue(dueDate);

  return {
    topic,
    moduleName: mod?.name ?? "Unknown",
    trackName: track?.name ?? "Unknown",
    trackColor: track?.color ?? "#8b5cf6",
    trackIcon: track?.icon ?? "📚",
    trackId: topic.trackId,
    moduleId: topic.moduleId,
    progress: getTopicProgressPercent(topic, subtopics),
    daysRemaining,
    isOverdue: daysRemaining !== null && daysRemaining < 0,
    isDueSoon: daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3,
    dueDate,
    statusDate: format(parseISO(topic.updatedAt), "yyyy-MM-dd"),
  };
}

export function getStatusTimeline(
  topics: Topic[],
  subtopics: Subtopic[],
  modules: Module[],
  tracks: Track[],
  statusFilter: ProgressStatus | "all" = "all"
): DailyStatusSnapshot[] {
  const active = topics.filter((t) => !t.archived);
  const filtered = statusFilter && statusFilter !== "all"
    ? active.filter((t) => t.status === statusFilter)
    : active.filter((t) => t.status !== "not_started");

  const byDate = new Map<string, StatusTopicEntry[]>();

  filtered.forEach((topic) => {
    const entry = buildStatusEntry(topic, subtopics, modules, tracks);
    const existing = byDate.get(entry.statusDate) ?? [];
    existing.push(entry);
    byDate.set(entry.statusDate, existing);
  });

  return [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => {
      const counts = emptyCounts();
      entries.forEach((e) => { counts[e.topic.status]++; });
      return {
        date,
        label: formatDateLabel(date),
        relativeLabel: format(parseISO(date), "MMM d"),
        counts,
        topics: entries.sort((a, b) => {
          const urgency = (e: StatusTopicEntry) => e.isOverdue ? 0 : e.isDueSoon ? 1 : 2;
          return urgency(a) - urgency(b) || a.topic.name.localeCompare(b.topic.name);
        }),
      };
    });
}

export function getGlobalStatusCounts(topics: Topic[]): Record<ProgressStatus, number> {
  const counts = emptyCounts();
  topics.filter((t) => !t.archived).forEach((t) => { counts[t.status ?? "not_started"]++; });
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
