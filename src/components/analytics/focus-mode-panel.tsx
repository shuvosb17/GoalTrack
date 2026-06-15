"use client";

import { format, parseISO } from "date-fns";
import { IconBrain } from "@tabler/icons-react";
import { FOCUS_MODE_META, type FocusModeEntry } from "@/lib/analytics";
import { formatDuration } from "@/lib/utils";

interface FocusModePanelProps {
  entries: FocusModeEntry[];
  summary: {
    total: number;
    thisWeek: number;
    weekDistracted: number;
    weekNormal: number;
    weekDeep: number;
  };
}

export function FocusModePanel({ entries, summary }: FocusModePanelProps) {
  if (summary.total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/[0.08] py-12 text-center">
        <IconBrain className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" stroke={1.25} />
        <p className="text-sm font-medium">No focus ratings yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
          Rate sessions after stopping the timer — Distracted, Normal, or Deep focus — and they&apos;ll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {([3, 2, 1] as const).map((rating) => {
          const meta = FOCUS_MODE_META[rating];
          const count =
            rating === 3
              ? summary.weekDeep
              : rating === 2
                ? summary.weekNormal
                : summary.weekDistracted;
          return (
            <div
              key={rating}
              className="flex items-center gap-2 rounded-lg border-[0.5px] border-white/[0.08] px-3 py-2"
              style={{ background: meta.bg }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
              <span className="text-xs font-medium" style={{ color: meta.color }}>
                {meta.label}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {count} this week
              </span>
            </div>
          );
        })}
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {entries.map((entry) => {
          const meta = FOCUS_MODE_META[entry.rating];
          const when = parseISO(entry.startTime);
          return (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
              style={{ borderLeftWidth: 3, borderLeftColor: meta.color }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ color: meta.color, background: meta.bg }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {format(when, "MMM d · h:mm a")}
                  </span>
                  <span className="text-[11px] font-medium tabular-nums">
                    {formatDuration(entry.duration)}
                  </span>
                </div>
                {(entry.trackName || entry.topicName) && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {[entry.trackName, entry.topicName].filter(Boolean).join(" → ")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {entries.length < summary.total && (
        <p className="text-center text-[10px] text-muted-foreground">
          Showing latest {entries.length} of {summary.total} rated sessions
        </p>
      )}
    </div>
  );
}
