"use client";

import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import type { TopStudyItem } from "@/lib/session-attribution";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FILTER_CATEGORIES = [
  "System Design",
  "CS Fundamentals",
  "Academic",
  "LeetCode",
] as const;

const FILTER_CHIPS = ["All topics", ...FILTER_CATEGORIES] as const;
type FilterChip = (typeof FILTER_CHIPS)[number];

export const STUDY_TRACK_COLORS: Record<string, { bar: string; dot: string }> = {
  "System Design": { bar: "#534AB7", dot: "#7F77DD" },
  "CS Fundamentals": { bar: "#0F6E56", dot: "#1D9E75" },
  Academic: { bar: "#993C1D", dot: "#D85A30" },
  LeetCode: { bar: "#185FA5", dot: "#378ADD" },
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

function formatHours(h: number) {
  return h % 1 === 0 ? h.toFixed(0) : h.toFixed(1);
}

function sectionLabel(filter: FilterChip): string {
  if (filter === "All topics") return "ALL TOPICS · RANKED BY HOURS";
  return `${filter.toUpperCase()} · RANKED BY HOURS`;
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
    <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-white/[0.06]">
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

interface MostStudiedTopicsPanelProps {
  items: TopStudyItem[];
}

export function MostStudiedTopicsPanel({ items }: MostStudiedTopicsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<FilterChip>("All topics");

  const visibleItems = useMemo(() => {
    const filtered =
      activeFilter === "All topics"
        ? items
        : items.filter((i) => i.trackName === activeFilter);
    return [...filtered].sort((a, b) => b.hours - a.hours);
  }, [items, activeFilter]);

  const maxHours = visibleItems[0]?.hours ?? 1;
  const heroTotal = visibleItems.reduce((sum, i) => sum + i.hours, 0);

  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    items.forEach((i) => {
      totals.set(i.trackName, (totals.get(i.trackName) ?? 0) + i.hours);
    });
    return FILTER_CATEGORIES.map((name) => ({
      name,
      hours: totals.get(name) ?? 0,
      color: getTrackColors(name).bar,
    })).filter((d) => d.hours > 0);
  }, [items]);

  const donutTotal = categoryBreakdown.reduce((s, d) => s + d.hours, 0);

  const donutCenterLabel =
    activeFilter === "All topics" ? "total" : activeFilter;

  return (
    <Card className="border-[0.5px] border-white/[0.08]">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-medium leading-tight text-foreground">
              Study tracker
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              All logged hours · any status
            </p>
          </div>
          {items.length > 0 && (
            <div className="text-right">
              <p
                className="text-[40px] font-medium tabular-nums leading-none"
                style={{ color: PURPLE_HERO }}
              >
                {formatHours(heroTotal)}h
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">total this list</p>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No study time logged yet.
          </p>
        ) : (
          <>
            {/* Filter chips */}
            <div className="mb-6 flex flex-wrap gap-2">
              {FILTER_CHIPS.map((chip) => {
                const active = activeFilter === chip;
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setActiveFilter(chip)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "border-transparent"
                        : "border-white/[0.12] bg-transparent text-muted-foreground hover:border-white/[0.2] hover:text-foreground"
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

            {/* Donut + legend */}
            {categoryBreakdown.length > 0 && (
              <div className="mb-6 grid items-center gap-6 sm:grid-cols-[180px_1fr]">
                <div className="relative mx-auto h-[180px] w-[180px] shrink-0">
                  <PieChart width={180} height={180}>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="hours"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="68%"
                      outerRadius="100%"
                      paddingAngle={2}
                      stroke="none"
                    >
                      {categoryBreakdown.map((entry) => {
                        const highlighted =
                          activeFilter === "All topics" ||
                          activeFilter === entry.name;
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
                      className="text-xl font-medium tabular-nums leading-none"
                      style={{ color: PURPLE_HERO }}
                    >
                      {formatHours(heroTotal)}h
                    </p>
                    <p className="mt-1 max-w-[100px] truncate text-center text-[10px] text-muted-foreground">
                      {donutCenterLabel}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5">
                  {categoryBreakdown.map((entry) => {
                    const pct =
                      donutTotal > 0
                        ? Math.round((entry.hours / donutTotal) * 100)
                        : 0;
                    const colors = getTrackColors(entry.name);
                    const dimmed =
                      activeFilter !== "All topics" &&
                      activeFilter !== entry.name;
                    return (
                      <li
                        key={entry.name}
                        className={cn(
                          "flex items-center gap-2.5 text-sm transition-opacity",
                          dimmed && "opacity-40"
                        )}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: colors.dot }}
                        />
                        <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {formatHours(entry.hours)}h
                        </span>
                        <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">
                          {pct}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Section label */}
            <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {sectionLabel(activeFilter)}
            </p>

            {/* Bar list */}
            {visibleItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No study time logged for {activeFilter}.
              </p>
            ) : (
              <div className="space-y-2">
                {visibleItems.map((item, i) => {
                  const colors = getTrackColors(item.trackName);
                  const tag = TYPE_TAG_STYLES[item.level];
                  const pct = Math.max(0, (item.hours / maxHours) * 100);

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border-[0.5px] border-white/[0.08] px-3.5 py-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-4 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                          {i + 1}
                        </span>
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ background: colors.dot }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium leading-snug">
                            {item.name}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground">
                              {item.trackName}
                            </span>
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
                          <span className="ml-0.5 text-[11px] text-muted-foreground">
                            h
                          </span>
                        </div>
                      </div>
                      <AnimatedBarFill pct={pct} color={colors.bar} />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
