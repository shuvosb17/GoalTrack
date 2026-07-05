"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
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
import { Flag, BookmarkCheck } from "lucide-react";

type CardVisualStatus = "overdue" | "in_progress" | "completed" | "mastered";

const CARD_STATUS_COLORS: Record<CardVisualStatus, string> = {
  overdue: "#E24B4A",
  in_progress: "#FAC775",
  completed: "#97C459",
  mastered: "#97C459",
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

function ProgressLine({
  label,
  detail,
  percent,
  accent,
}: {
  label: string;
  detail: string;
  percent: number;
  accent: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="grid grid-cols-[52px_1fr_72px_36px] items-center gap-2 text-[11px]">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="truncate text-muted-foreground">{detail}</span>
      <div className="h-[4px] overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full rounded-full" style={{ width: `${clamped}%`, backgroundColor: accent }} />
      </div>
      <span className="text-right font-mono tabular-nums" style={{ color: accent }}>
        {clamped}%
      </span>
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
  const accent = CARD_STATUS_COLORS[visual];
  const status = entry.displayStatus;

  const breadcrumb = entry.focalSubtopic
    ? `${entry.trackName} / ${entry.moduleName} / ${entry.topic.name}`
    : `${entry.trackName} / ${entry.moduleName}`;

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
      className="rounded-r-lg border-l-[3px] bg-[#15151a] py-3 pl-3.5 pr-3.5"
      style={{ borderLeftColor: accent }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/tracks?track=${entry.trackId}&topic=${entry.topic.id}`}
            className="block truncate text-sm font-medium hover:underline"
          >
            {entry.displayName}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{breadcrumb}</p>
        </div>
        <span
          className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium"
          style={{ color: accent, borderColor: `${accent}55`, backgroundColor: `${accent}14` }}
        >
          {statusBadgeLabel(entry, visual)}
        </span>
      </div>

      <div className="mt-2.5 space-y-1.5">
        {showSubtopicRow && (
          <ProgressLine label="Sub" detail={subtopicText} percent={subtopicPercent} accent={accent} />
        )}
        <ProgressLine label="Topic" detail={topicText} percent={entry.topicProgress} accent={accent} />
      </div>

      {entry.isOverdue && overdueDays !== null && (
        <p className="mt-2 flex items-center gap-1 text-xs" style={{ color: accent }}>
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
          <span className="text-[10px]" style={{ color: accent }}>
            Due soon
          </span>
        )}
        {getActiveGoalsForTopic(entry.topic, goalMilestones).map((goal) => (
          <Link key={goal.id} href="/milestones">
            <Badge variant="outline" className="gap-1 text-[10px] hover:bg-secondary/50">
              <Flag className="h-3 w-3" /> {goal.title}
            </Badge>
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-2">
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
            <SelectTrigger className="h-7 w-[118px] border-white/[0.08] bg-white/[0.02] text-xs">
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
    </div>
  );
}
