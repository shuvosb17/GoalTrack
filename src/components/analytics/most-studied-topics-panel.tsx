"use client";

import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import type { TopStudyItem } from "@/lib/session-attribution";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ALL_TOPICS = "All topics" as const;

const DONUT_SIZE = 220;

export const STUDY_TRACK_COLORS: Record<string, { bar: string; dot: string }> = {
  "System Design": { bar: "#534AB7", dot: "#7F77DD" },
  "CS Fundamentals": { bar: "#0F6E56", dot: "#1D9E75" },
  Academic: { bar: "#993C1D", dot: "#D85A30" },
  LeetCode: { bar: "#185FA5", dot: "#378ADD" },
  Development: { bar: "#10b981", dot: "#34d399" },
};

const DIM_SEGMENT = "rgba(128,128,128,0.15)";
const PURPLE_HERO = "#534AB7";
const CHIP_ACTIVE_BG = "#534AB7";
const CHIP_ACTIVE_TEXT = "#EEEDFE";

const TYPE_TAG_STYLES: Record<
  TopStudyItem["level"],
  { bg: string; text: string; label: string }
> = {
  topic: { bg: "#EEEDFE", text: "#3C3489", label: "topic" },
  module: { bg: "#E1F5EE", text: "#085041", label: "module" },
  track: { bg: "#EEEDFE", text: "#3C3489", label: "track" },
};

function getTrackColors(trackName: string) {
  return STUDY_TRACK_COLORS[trackName] ?? { bar: PURPLE_HERO, dot: "#7F77DD" };
}

function roundHours(h: number): number {
  return Math.round(h * 10) / 10;
}

function formatHours(h: number) {
  const rounded = roundHours(h);
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
}

function sectionLabel(filter: string): string {
  if (filter === ALL_TOPICS) return "ALL TOPICS · RANKED BY HOURS";
  return `${filter.toUpperCase()} · RANKED BY HOURS`;
}

function buildTrackBreakdown(items: TopStudyItem[]) {
  const totals = new Map<string, { hoursMs: number; color: string }>();
  items.forEach((i) => {
    const existing = totals.get(i.trackName);
    const colors = getTrackColors(i.trackName);
    totals.set(i.trackName, {
      hoursMs: (existing?.hoursMs ?? 0) + i.hours * 3600000,
      color: existing?.color ?? i.trackColor ?? colors.bar,
    });
  });
  return [...totals.entries()]
    .map(([name, { hoursMs, color }]) => ({ name, hours: roundHours(hoursMs / 3600000), color }))
    .filter((d) => d.hours > 0)
    .sort((a, b) => b.hours - a.hours);
}

function AnimatedBarFill({ pct, color }: { pct: number; color: string }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(0);
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setWidth(pct));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [pct]);

  return (
    <div className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: color,
          transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

function DonutChart({
  data,
  activeFilter,
  heroTotal,
  centerLabel,
}: {
  data: { name: string; hours: number; color: string }[];
  activeFilter: string;
  heroTotal: number;
  centerLabel: string;
}) {
  return (
    <div className="relative mx-auto shrink-0" style={{ width: DONUT_SIZE, height: DONUT_SIZE }}>
      <PieChart width={DONUT_SIZE} height={DONUT_SIZE}>
        <Pie
          data={data}
          dataKey="hours"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="68%"
          outerRadius="100%"
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry) => {
            const highlighted =
              activeFilter === ALL_TOPICS || activeFilter === entry.name;
            return (
              <Cell
                key={entry.name}
                fill={highlighted ? entry.color : DIM_SEGMENT}
              />
            );
          })}
        </Pie>
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p
          className="text-2xl font-medium tabular-nums leading-none sm:text-[28px]"
          style={{ color: PURPLE_HERO }}
        >
          {formatHours(heroTotal)}h
        </p>
        <p className="mt-1.5 max-w-[120px] truncate text-center text-[11px] text-muted-foreground">
          {centerLabel}
        </p>
      </div>
    </div>
  );
}

function TopicBreakdown({
  entries,
  donutTotal,
  activeFilter,
}: {
  entries: { name: string; hours: number; color: string }[];
  donutTotal: number;
  activeFilter: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <p className="mb-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Topic breakdown
      </p>
      <ul className="space-y-3.5">
        {entries.map((entry) => {
          const pct =
            donutTotal > 0 ? Math.round((entry.hours / donutTotal) * 100) : 0;
          const colors = getTrackColors(entry.name);
          const dimmed =
            activeFilter !== ALL_TOPICS && activeFilter !== entry.name;

          return (
            <li
              key={entry.name}
              className={cn(
                "group rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]",
                dimmed && "opacity-40"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform group-hover:scale-110"
                  style={{ background: colors.dot }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {entry.name}
                </span>
                <span className="shrink-0 tabular-nums text-sm text-muted-foreground">
                  {formatHours(entry.hours)}h
                </span>
                <span className="w-9 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                  {pct}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: entry.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RankedList({
  items,
  maxHours,
}: {
  items: TopStudyItem[];
  maxHours: number;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10">
        {items.map((item, i) => {
          const colors = getTrackColors(item.trackName);
          const tag = TYPE_TAG_STYLES[item.level];
          const pct = Math.max(0, (item.hours / maxHours) * 100);

          return (
            <div
              key={item.id}
              className="rounded-xl border-[0.5px] border-white/[0.08] px-3.5 py-3 transition-colors hover:border-white/[0.14] hover:bg-white/[0.03]"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: colors.dot }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-snug">{item.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    {item.level === "track" ? (
                      <span className="text-[11px] text-muted-foreground">track-level log</span>
                    ) : item.level !== "module" && (item.moduleName ?? item.trackName) ? (
                      <span className="text-[11px] text-muted-foreground">
                        {item.moduleName ?? item.trackName}
                      </span>
                    ) : null}
                    <span
                      className="rounded-full px-1.5 py-px text-[10px] font-medium lowercase"
                      style={{ background: tag.bg, color: tag.text }}
                    >
                      {tag.label}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right leading-none">
                  <span className="text-[15px] font-medium tabular-nums">
                    {formatHours(item.hours)}
                  </span>
                  <span className="ml-0.5 text-[11px] text-muted-foreground">h</span>
                </div>
              </div>
              <AnimatedBarFill pct={pct} color={colors.bar} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MostStudiedTopicsPanelProps {
  items: TopStudyItem[];
}

export function MostStudiedTopicsPanel({ items }: MostStudiedTopicsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<string>(ALL_TOPICS);

  const categoryBreakdown = useMemo(() => buildTrackBreakdown(items), [items]);

  const filterChips = useMemo(
    () => [ALL_TOPICS, ...categoryBreakdown.map((t) => t.name)],
    [categoryBreakdown]
  );

  const visibleItems = useMemo(() => {
    const filtered =
      activeFilter === ALL_TOPICS
        ? items
        : items.filter((i) => i.trackName === activeFilter);
    return [...filtered].sort((a, b) => b.hours - a.hours);
  }, [items, activeFilter]);

  const maxHours = visibleItems[0]?.hours ?? 1;
  const totalMs = items.reduce((sum, i) => sum + i.hours * 3600000, 0);
  const heroTotal = roundHours(totalMs / 3600000);

  const donutTotal = heroTotal;
  const donutCenterLabel = activeFilter === ALL_TOPICS ? "total" : activeFilter;

  const filterChipsRow = (
    <div className="flex flex-wrap gap-2">
      {filterChips.map((chip) => {
        const active = activeFilter === chip;
        return (
          <button
            key={chip}
            type="button"
            onClick={() => setActiveFilter(chip)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
              active
                ? "border-transparent shadow-sm"
                : "border-white/[0.12] bg-transparent text-muted-foreground hover:border-white/[0.22] hover:text-foreground"
            )}
            style={
              active
                ? { background: CHIP_ACTIVE_BG, color: CHIP_ACTIVE_TEXT }
                : undefined
            }
          >
            {chip}
          </button>
        );
      })}
    </div>
  );

  return (
    <Card className="relative overflow-hidden border-[0.5px] border-white/[0.08]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-15 lg:opacity-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% -30%, rgba(83,74,183,0.35), transparent)",
        }}
      />
      <CardContent className="relative pt-6 pb-6">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-4 lg:mb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-[22px]">
              Study Tracker
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              All logged hours · any status
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-4 lg:gap-6">
            {items.length > 0 && (
              <div className="text-right">
                <p
                  className="text-3xl font-medium tabular-nums leading-none sm:text-[40px]"
                  style={{ color: PURPLE_HERO }}
                >
                  {formatHours(heroTotal)}h
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">total this list</p>
              </div>
            )}
            <div className="hidden shrink-0 lg:block">{filterChipsRow}</div>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No study time logged yet.
          </p>
        ) : (
          <>
            {/* Filter chips — mobile / tablet */}
            <div className="mb-5 lg:hidden">{filterChipsRow}</div>

            {/* 3-column dashboard: donut | breakdown | rankings */}
            {categoryBreakdown.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[240px_minmax(240px,1fr)_minmax(300px,1.35fr)] lg:gap-10 xl:gap-12">
                {/* Left — Donut */}
                <div className="flex items-start justify-center lg:justify-start">
                  <DonutChart
                    data={categoryBreakdown}
                    activeFilter={activeFilter}
                    heroTotal={heroTotal}
                    centerLabel={donutCenterLabel}
                  />
                </div>

                {/* Center — Breakdown */}
                <div className="border-white/[0.06] md:px-0 lg:border-x lg:px-8 xl:px-10">
                  <TopicBreakdown
                    entries={categoryBreakdown}
                    donutTotal={donutTotal}
                    activeFilter={activeFilter}
                  />
                </div>

                {/* Right — Rankings */}
                <div className="min-w-0 md:col-span-2 lg:col-span-1">
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {sectionLabel(activeFilter)}
                  </p>
                  {visibleItems.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No study time logged for {activeFilter}.
                    </p>
                  ) : (
                    <RankedList items={visibleItems} maxHours={maxHours} />
                  )}
                </div>
              </div>
            )}

            {categoryBreakdown.length === 0 && (
              <div>
                <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {sectionLabel(activeFilter)}
                </p>
                {visibleItems.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No study time logged for {activeFilter}.
                  </p>
                ) : (
                  <RankedList items={visibleItems} maxHours={maxHours} />
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
