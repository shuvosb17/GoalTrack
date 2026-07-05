"use client";

import { Clock } from "lucide-react";
import { TimerControls } from "@/components/timer/timer-controls";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS } from "@/lib/utils";
import type { HierarchyPath, ProgressStatus } from "@/lib/types";

const IN_PROGRESS_ACCENT = "#FAC775";

function ProgressLine({
  label,
  detail,
  percent,
}: {
  label: string;
  detail: string;
  percent: number;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="grid grid-cols-[52px_1fr_72px_36px] items-center gap-2 text-[11px]">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="truncate text-muted-foreground">{detail}</span>
      <div className="h-[4px] overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full"
          style={{ width: `${clamped}%`, backgroundColor: IN_PROGRESS_ACCENT }}
        />
      </div>
      <span className="text-right font-mono tabular-nums" style={{ color: IN_PROGRESS_ACCENT }}>
        {clamped}%
      </span>
    </div>
  );
}

export interface InProgressTrackCardProps {
  title: string;
  breadcrumb: string;
  status: ProgressStatus;
  onStatusChange: (status: ProgressStatus) => void;
  timerPath: HierarchyPath;
  timerLabel: string;
  dueLabel?: string | null;
  dueSoon?: boolean;
  onEditDeadline?: () => void;
  showSubtopicRow?: boolean;
  subtopicDetail?: string;
  subtopicPercent?: number;
  topicDetail: string;
  topicPercent: number;
  compact?: boolean;
}

export function InProgressTrackCard({
  title,
  breadcrumb,
  status,
  onStatusChange,
  timerPath,
  timerLabel,
  dueLabel,
  dueSoon,
  onEditDeadline,
  showSubtopicRow,
  subtopicDetail,
  subtopicPercent = 0,
  topicDetail,
  topicPercent,
  compact,
}: InProgressTrackCardProps) {
  return (
    <div
      className="rounded-r-lg border-l-[3px] bg-[#15151a]"
      style={{ borderLeftColor: IN_PROGRESS_ACCENT }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={compact ? "px-3 py-2.5" : "px-3.5 py-3"}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{title}</p>
            <p className="truncate text-xs text-muted-foreground">{breadcrumb}</p>
          </div>
          <span
            className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium"
            style={{
              color: IN_PROGRESS_ACCENT,
              borderColor: `${IN_PROGRESS_ACCENT}55`,
              backgroundColor: `${IN_PROGRESS_ACCENT}14`,
            }}
          >
            In Progress
          </span>
        </div>

        <div className="mt-2 space-y-1.5">
          {showSubtopicRow && subtopicDetail && (
            <ProgressLine label="Sub" detail={subtopicDetail} percent={subtopicPercent} />
          )}
          <ProgressLine label="Topic" detail={topicDetail} percent={topicPercent} />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-2.5">
          {dueLabel && (
            <button
              type="button"
              onClick={onEditDeadline}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Clock className="h-3 w-3" />
              {dueLabel}
            </button>
          )}
          {dueSoon && (
            <span className="text-[10px]" style={{ color: IN_PROGRESS_ACCENT }}>
              Due soon
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <TimerControls path={timerPath} label={timerLabel} compact hideLogged />
            <Select value={status} onValueChange={(v) => onStatusChange(v as ProgressStatus)}>
              <SelectTrigger className="h-7 w-[118px] border-white/[0.08] bg-white/[0.02] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
