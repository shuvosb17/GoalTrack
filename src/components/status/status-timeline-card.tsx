"use client";

import Link from "next/link";
import { Clock, Flag, BookmarkCheck } from "lucide-react";
import { TimerControls } from "@/components/timer/timer-controls";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/utils";
import { ALL_STATUSES, formatDeadline } from "@/lib/status";
import type { ProgressStatus, StatusTopicEntry, GoalMilestone } from "@/lib/types";
import { getActiveGoalsForTopic } from "@/lib/goal-milestones";
import { isTopicDueForReview } from "@/lib/metrics";

type CardVisualStatus = "overdue" | "in_progress" | "completed" | "mastered";

const CARD_STATUS_COLORS: Record<CardVisualStatus, { text: string; bg: string }> = {
  overdue: { text: "#E24B4A", bg: "rgba(226,75,74,0.1)" },
  in_progress: { text: "#FAC775", bg: "rgba(250,199,117,0.1)" },
  completed: { text: "#97C459", bg: "rgba(151,196,89,0.1)" },
  mastered: { text: "#97C459", bg: "rgba(151,196,89,0.1)" },
};

function resolveCardVisualStatus(entry: StatusTopicEntry): CardVisualStatus {
  if (entry.isOverdue) return "overdue";
  if (entry.displayStatus === "mastered") return "mastered";
  if (entry.displayStatus === "completed") return "completed";
  return "in_progress";
}

function statusBadgeLabel(entry: StatusTopicEntry, visual: CardVisualStatus): string {
  if (visual === "overdue") return "Overdue";
  return STATUS_LABELS[entry.displayStatus];
}

function CompactProgressRow({
  label,
  text,
  percent,
  color,
  tagBg,
  isActive,
}: {
  label: string;
  text: string;
  percent: number;
  color: string;
  tagBg: string;
  isActive?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-[62px] shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{text}</span>
      <div className="h-[5px] w-[90px] shrink-0 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="w-8 shrink-0 text-right font-mono text-[11px] tabular-nums"
        style={{ color }}
      >
        {clamped}%
      </span>
      {isActive && (
        <span
          className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium lowercase"
          style={{ color, backgroundColor: tagBg }}
        >
          working on it
        </span>
      )}
    </div>
  );
}

interface StatusTimelineCardProps {
  entry: StatusTopicEntry;
  goalMilestones: GoalMilestone[];
  onReview: (topicId: string, topicName: string) => void;
  onStatusChange: (entry: StatusTopicEntry, next: ProgressStatus) => void;
}

export function StatusTimelineCard({
  entry,
  goalMilestones,
  onReview,
  onStatusChange,
}: StatusTimelineCardProps) {
  const visual = resolveCardVisualStatus(entry);
  const colors = CARD_STATUS_COLORS[visual];
  const status = entry.displayStatus;

  const breadcrumb = entry.focalSubtopic
    ? `${entry.trackName} / ${entry.moduleName} / ${entry.topic.name}`
    : `${entry.trackName} / ${entry.moduleName}`;

  const subtopicActive = entry.focalSubtopic?.status === "in_progress";
  const topicActive =
    !subtopicActive &&
    (entry.topicEffectiveStatus === "in_progress" ||
      (!entry.focalSubtopic && status === "in_progress"));

  const subtopicPercent = entry.focalSubtopic
    ? entry.focalSubtopic.status === "in_progress"
      ? 0
      : (entry.subtopicProgress ?? 0)
    : 0;

  const subtopicText = entry.focalSubtopic
    ? entry.focalSubtopic.name
    : entry.subtopicsTotal > 0
      ? "No active subtopic"
      : "—";

  const topicText =
    entry.subtopicsTotal > 0
      ? `${entry.topic.name} (${entry.subtopicsDone}/${entry.subtopicsTotal} done)`
      : entry.topic.name;

  const showSubtopicRow = !!entry.focalSubtopic || entry.subtopicsTotal > 0;
  const overdueDays =
    entry.isOverdue && entry.daysRemaining !== null ? Math.abs(entry.daysRemaining) : null;

  return (
    <div
      className="rounded-r-xl border-l-[3px] py-3.5 pl-4 pr-4"
      style={{
        borderLeftColor: colors.text,
        backgroundColor: "#15151a",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/tracks?track=${entry.trackId}&topic=${entry.topic.id}`}
            className="block truncate text-sm font-medium text-foreground hover:underline"
          >
            {entry.displayName}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{breadcrumb}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ color: colors.text, backgroundColor: colors.bg }}
        >
          {statusBadgeLabel(entry, visual)}
        </span>
      </div>

      <div className="mt-2.5 space-y-1.5">
        {showSubtopicRow && (
          <CompactProgressRow
            label="Subtopic"
            text={subtopicText}
            percent={subtopicPercent}
            color={colors.text}
            tagBg={colors.bg}
            isActive={subtopicActive}
          />
        )}
        <CompactProgressRow
          label="Topic"
          text={topicText}
          percent={entry.topicProgress}
          color={colors.text}
          tagBg={colors.bg}
          isActive={topicActive}
        />
      </div>

      {entry.isOverdue && overdueDays !== null && (
        <p className="mt-2 flex items-center gap-1 text-xs" style={{ color: colors.text }}>
          <Clock className="h-3 w-3 shrink-0" />
          Overdue by {overdueDays} day{overdueDays === 1 ? "" : "s"}
        </p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-2.5">
        {status === "in_progress" && !entry.isOverdue && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDeadline(entry.daysRemaining, entry.dueDate)}
          </span>
        )}
        {entry.isDueSoon && !entry.isOverdue && status === "in_progress" && (
          <span className="text-[10px] text-amber-400/90">Due soon</span>
        )}
        {getActiveGoalsForTopic(entry.topic, goalMilestones).map((goal) => (
          <Link key={goal.id} href="/milestones">
            <Badge variant="outline" className="gap-1 text-[10px] hover:bg-secondary/50">
              <Flag className="h-3 w-3" /> {goal.title}
            </Badge>
          </Link>
        ))}
        <TimerControls
          path={{
            trackId: entry.trackId,
            moduleId: entry.moduleId,
            topicId: entry.topic.id,
            subtopicId: entry.focalSubtopic?.id,
          }}
          label={
            entry.focalSubtopic
              ? `${entry.topic.name} → ${entry.focalSubtopic.name}`
              : `${entry.moduleName} → ${entry.topic.name}`
          }
          compact
          hideLogged
        />
        <Select
          value={entry.focalSubtopic?.status ?? status}
          onValueChange={(v) => onStatusChange(entry, v as ProgressStatus)}
        >
          <SelectTrigger className="h-7 w-[130px] border-white/[0.08] bg-white/[0.02] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isTopicDueForReview(entry.topic) && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 border-violet-500/30 px-2 text-[10px] text-violet-300"
            onClick={() => onReview(entry.topic.id, entry.topic.name)}
          >
            <BookmarkCheck className="h-3 w-3" /> Review
          </Button>
        )}
      </div>
    </div>
  );
}
