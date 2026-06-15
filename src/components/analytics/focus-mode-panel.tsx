"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { IconBrain } from "@tabler/icons-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_TOOLTIP_STYLE,
  FOCUS_MODE_META,
  type FocusModeEntry,
} from "@/lib/analytics";
import type { SessionQualityRating } from "@/lib/types/metrics";
import {
  formatDuration,
  getCalendarWeekRange,
  parseLocalDate,
  todayISO,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

type FocusFilter = "all" | SessionQualityRating;

const RATING_ORDER: SessionQualityRating[] = [3, 2, 1];

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
  const [filter, setFilter] = useState<FocusFilter>("all");

  const weekStartKey = useMemo(
    () => format(getCalendarWeekRange(0, parseLocalDate(todayISO())).start, "yyyy-MM-dd"),
    []
  );

  const weekEntries = useMemo(
    () => entries.filter((e) => e.date >= weekStartKey),
    [entries, weekStartKey]
  );

  const weekTotal = summary.weekDeep + summary.weekNormal + summary.weekDistracted;

  const timelineData = useMemo(
    () =>
      [...weekEntries]
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map((e) => ({
          id: e.id,
          label: format(parseISO(e.startTime), "h:mm a"),
          minutes: Math.max(0.5, Math.round((e.duration / 60000) * 10) / 10),
          durationMs: e.duration,
          rating: e.rating,
        })),
    [weekEntries]
  );

  const filteredEntries = useMemo(() => {
    const pool = weekEntries.length > 0 ? weekEntries : entries;
    const sorted = [...pool].sort((a, b) => b.startTime.localeCompare(a.startTime));
    if (filter === "all") return sorted;
    return sorted.filter((e) => e.rating === filter);
  }, [entries, weekEntries, filter]);

  const maxTimelineMinutes = Math.max(...timelineData.map((d) => d.minutes), 5);

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

  const filters: { key: FocusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: 3, label: "Deep focus" },
    { key: 2, label: "Normal" },
    { key: 1, label: "Distracted" },
  ];

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {RATING_ORDER.map((rating) => {
          const meta = FOCUS_MODE_META[rating];
          const count =
            rating === 3
              ? summary.weekDeep
              : rating === 2
                ? summary.weekNormal
                : summary.weekDistracted;
          const pct = weekTotal > 0 ? (count / weekTotal) * 100 : 0;

          return (
            <div
              key={rating}
              className="flex flex-col rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
                <span className="text-xs font-medium" style={{ color: meta.color }}>
                  {meta.label}
                </span>
              </div>
              <p className="metric-value text-3xl tabular-nums leading-none">{count}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">sessions this week</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: meta.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline chart */}
      {timelineData.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Session timeline
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={timelineData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, Math.ceil(maxTimelineMinutes / 5) * 5]}
                tickFormatter={(v) => `${v}m`}
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload as (typeof timelineData)[0];
                  const meta = FOCUS_MODE_META[d.rating as SessionQualityRating];
                  return (
                    <div style={CHART_TOOLTIP_STYLE} className="px-3 py-2 text-xs">
                      <p className="font-medium" style={{ color: meta.color }}>
                        {meta.label}
                      </p>
                      <p className="mt-0.5 tabular-nums text-muted-foreground">
                        {formatDuration(d.durationMs)}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="minutes" radius={[3, 3, 0, 0]} maxBarSize={36}>
                {timelineData.map((d) => (
                  <Cell key={d.id} fill={FOCUS_MODE_META[d.rating].color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Session list */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Sessions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={String(f.key)}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                  filter === f.key
                    ? "border-white/[0.2] bg-white/[0.08] text-foreground"
                    : "border-transparent text-muted-foreground hover:border-white/[0.1] hover:bg-white/[0.04]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {filteredEntries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No {filter === "all" ? "" : FOCUS_MODE_META[filter].label.toLowerCase()} sessions this week.
            </p>
          ) : (
            filteredEntries.map((entry) => {
              const meta = FOCUS_MODE_META[entry.rating];
              const when = parseISO(entry.startTime);
              const path = [entry.trackName, entry.topicName].filter(Boolean).join(" → ");

              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] py-3 pl-0 pr-4"
                  style={{ borderLeftWidth: 3, borderLeftColor: meta.color }}
                >
                  <div className="min-w-0 flex-1 pl-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                        style={{ color: meta.color, background: meta.bg }}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {format(when, "MMM d · h:mm a")}
                      </span>
                    </div>
                    {path && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">{path}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatDuration(entry.duration)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
