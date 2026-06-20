"use client";

import { useEffect, useMemo, useState } from "react";
import { eachDayOfInterval, format, isSameDay, parseISO } from "date-fns";
import { IconBrain, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
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
}

function countByRating(items: FocusModeEntry[], rating: SessionQualityRating) {
  return items.filter((e) => e.rating === rating).length;
}

export function FocusModePanel({ entries }: FocusModePanelProps) {
  const [filter, setFilter] = useState<FocusFilter>("all");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const today = useMemo(() => parseLocalDate(todayISO()), []);

  const maxWeekOffset = useMemo(() => {
    if (entries.length === 0) return 0;
    const earliest = entries.reduce((min, e) => (e.date < min ? e.date : min), entries[0].date);
    const earliestDate = parseLocalDate(earliest);
    const { start: currentStart } = getCalendarWeekRange(0, today);
    const diffWeeks = Math.floor(
      (currentStart.getTime() - getCalendarWeekRange(0, earliestDate).start.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );
    return Math.max(0, diffWeeks);
  }, [entries, today]);

  const weekRange = useMemo(
    () => getCalendarWeekRange(weekOffset, today),
    [weekOffset, today]
  );

  const weekStartKey = format(weekRange.start, "yyyy-MM-dd");
  const weekEndKey = format(weekRange.end, "yyyy-MM-dd");

  const weekLabel = useMemo(() => {
    if (weekOffset === 0) {
      return `This week · ${format(weekRange.start, "MMM d")} – ${format(weekRange.end, "MMM d")}`;
    }
    return `${format(weekRange.start, "MMM d")} – ${format(weekRange.end, "MMM d, yyyy")}`;
  }, [weekOffset, weekRange]);

  const weekEntries = useMemo(
    () => entries.filter((e) => e.date >= weekStartKey && e.date <= weekEndKey),
    [entries, weekStartKey, weekEndKey]
  );

  const weekDays = useMemo(
    () =>
      eachDayOfInterval({ start: weekRange.start, end: weekRange.end }).map((d) =>
        format(d, "yyyy-MM-dd")
      ),
    [weekRange]
  );

  const dayCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of weekEntries) {
      counts.set(entry.date, (counts.get(entry.date) ?? 0) + 1);
    }
    return counts;
  }, [weekEntries]);

  useEffect(() => {
    setSelectedDay(null);
    setFilter("all");
  }, [weekOffset]);

  const scopedEntries = useMemo(() => {
    if (!selectedDay) return weekEntries;
    return weekEntries.filter((e) => e.date === selectedDay);
  }, [weekEntries, selectedDay]);

  const weekDeep = countByRating(scopedEntries, 3);
  const weekNormal = countByRating(scopedEntries, 2);
  const weekDistracted = countByRating(scopedEntries, 1);
  const weekTotal = weekDeep + weekNormal + weekDistracted;

  const timelineData = useMemo(
    () =>
      [...scopedEntries]
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map((e) => ({
          id: e.id,
          label: format(parseISO(e.startTime), "h:mm a"),
          minutes: Math.max(0.5, Math.round((e.duration / 60000) * 10) / 10),
          durationMs: e.duration,
          rating: e.rating,
        })),
    [scopedEntries]
  );

  const filteredEntries = useMemo(() => {
    const sorted = [...scopedEntries].sort((a, b) => b.startTime.localeCompare(a.startTime));
    if (filter === "all") return sorted;
    return sorted.filter((e) => e.rating === filter);
  }, [scopedEntries, filter]);

  const maxTimelineMinutes = Math.max(...timelineData.map((d) => d.minutes), 5);

  if (entries.length === 0) {
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

  const periodLabel = selectedDay
    ? format(parseLocalDate(selectedDay), "EEEE, MMM d")
    : weekOffset === 0
      ? "this week"
      : "selected week";

  return (
    <div className="space-y-5">
      {/* Week selector */}
      <div className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Week
          </p>
          <p className="truncate text-xs text-muted-foreground">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={weekOffset >= maxWeekOffset}
            onClick={() => setWeekOffset((w) => w + 1)}
            className="inline-flex items-center gap-1 rounded-lg border-[0.5px] border-white/[0.08] px-3 py-2 text-xs text-foreground transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconChevronLeft className="h-3.5 w-3.5" stroke={1.5} />
            Previous week
          </button>
          <button
            type="button"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            className="ml-auto inline-flex items-center gap-1 rounded-lg border-[0.5px] border-white/[0.08] px-3 py-2 text-xs text-foreground transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next week
            <IconChevronRight className="h-3.5 w-3.5" stroke={1.5} />
          </button>
        </div>
      </div>

      {/* Day selector */}
      <div className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Day
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
              selectedDay === null
                ? "border-[#534AB7]/50 bg-[#534AB7]/20 text-foreground"
                : "border-white/[0.08] text-muted-foreground hover:border-white/[0.14] hover:text-foreground"
            )}
          >
            All week
          </button>
          {weekDays.map((dayKey) => {
            const dayDate = parseLocalDate(dayKey);
            const count = dayCounts.get(dayKey) ?? 0;
            const isToday = isSameDay(dayDate, today);
            const active = selectedDay === dayKey;

            return (
              <button
                key={dayKey}
                type="button"
                onClick={() => setSelectedDay(dayKey)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
                  active
                    ? "border-[#534AB7]/50 bg-[#534AB7]/20 text-foreground"
                    : count > 0
                      ? "border-white/[0.1] text-foreground hover:border-white/[0.16]"
                      : "border-white/[0.06] text-muted-foreground/70 hover:border-white/[0.1]"
                )}
              >
                {isToday ? "Today" : format(dayDate, "EEE d")}
                {count > 0 && <span className="ml-1 tabular-nums opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {RATING_ORDER.map((rating) => {
          const meta = FOCUS_MODE_META[rating];
          const count =
            rating === 3 ? weekDeep : rating === 2 ? weekNormal : weekDistracted;
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
              <p className="mt-1 text-[11px] text-muted-foreground">
                sessions {selectedDay ? "this day" : periodLabel}
              </p>
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
              No {filter === "all" ? "" : FOCUS_MODE_META[filter].label.toLowerCase()} sessions for{" "}
              {selectedDay ? format(parseLocalDate(selectedDay), "MMM d") : periodLabel}.
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
