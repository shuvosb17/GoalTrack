"use client";

import { useRef, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConsistencyCalendarDay } from "@/lib/analytics";
import { SKIP_REASON_LABELS } from "@/lib/analytics";

const STATUS_STYLES: Record<ConsistencyCalendarDay["status"], string> = {
  on_pace: "bg-emerald-500/70 ring-emerald-400/30",
  partial: "bg-amber-500/60 ring-amber-400/30",
  missed: "bg-red-500/40 ring-red-400/20",
  skipped: "bg-zinc-600/80 ring-zinc-500/30",
  future: "bg-zinc-800/50",
};

const QUALITY_LABELS: Record<number, string> = {
  1: "Distracted",
  2: "Normal",
  3: "Deep focus",
};

function dayTooltip(day: ConsistencyCalendarDay) {
  const dateLabel = format(parseISO(day.date), "MMM d, yyyy");
  if (day.status === "future") return `${dateLabel} · upcoming`;
  if (day.status === "skipped") {
    const reason = day.skipReason ? SKIP_REASON_LABELS[day.skipReason] : "Skipped";
    return `${dateLabel} · Skipped · ${reason}`;
  }
  const parts = [`${dateLabel} · ${day.hours}h`];
  if (day.avgQuality !== null) parts.push(QUALITY_LABELS[Math.round(day.avgQuality)] ?? `Quality ${day.avgQuality}`);
  if (day.topicLabels.length > 0) parts.push(`Topics: ${day.topicLabels.join(", ")}`);
  return parts.join(" · ");
}

export function ConsistencyCalendar({ days }: { days: ConsistencyCalendarDay[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const weeks: ConsistencyCalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const scrollToLatest = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth - el.clientWidth;
  }, []);

  useEffect(() => {
    scrollToLatest();
    const t = setTimeout(scrollToLatest, 150);
    return () => clearTimeout(t);
  }, [days.length, scrollToLatest]);

  return (
    <div className="space-y-3">
      <TooltipProvider>
        <div ref={scrollRef} className="flex gap-1 overflow-x-auto pb-2 scroll-smooth">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "h-3 w-3 cursor-default rounded-sm ring-1 ring-inset transition-transform hover:scale-125",
                        STATUS_STYLES[day.status]
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    {dayTooltip(day)}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </TooltipProvider>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        {(
          [
            ["on_pace", "On target", "bg-emerald-500/70"],
            ["partial", "Partial", "bg-amber-500/60"],
            ["missed", "Missed", "bg-red-500/40"],
            ["skipped", "Skip logged", "bg-zinc-600/80"],
          ] as const
        ).map(([, label, bg]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-sm", bg)} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
