"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { SKIP_REASON_LABELS } from "@/lib/analytics";
import { getDistinctSkipLogsByDate } from "@/lib/skip-logs";
import type { SkipLog } from "@/lib/types/metrics";

interface InconsistencyTrackingPanelProps {
  skipLogs: SkipLog[];
}

export function InconsistencyTrackingPanel({ skipLogs }: InconsistencyTrackingPanelProps) {
  const history = useMemo(() => getDistinctSkipLogsByDate(skipLogs), [skipLogs]);

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No missed-day responses logged yet. When you skip a day, your reason will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between gap-3 rounded-lg border-[0.5px] border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium">{format(parseISO(log.date), "EEE, MMM d, yyyy")}</p>
            <p className="text-xs text-muted-foreground">
              {log.loggedAt
                ? `Logged ${format(parseISO(log.loggedAt), "MMM d · h:mm a")}`
                : "Missed study day"}
            </p>
          </div>
          <span className="shrink-0 rounded-full border-[0.5px] border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-muted-foreground">
            {SKIP_REASON_LABELS[log.reason]}
          </span>
        </div>
      ))}
    </div>
  );
}
