"use client";

import { useMemo } from "react";
import Link from "next/link";
import { IconStack2 } from "@tabler/icons-react";
import type { LearningSession, Track } from "@/lib/types";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  WEEK_DAY_LABELS,
  chartYMax,
  formatHoursCompact,
  formatWeekRangeLabel,
  getCommitmentTotal,
  getDaysLeftInWeek,
  getHoursPerTrackPerDay,
  getLoggedThisWeek,
  getTotalLoggedThisWeek,
  getWeekRange,
  isSameLocalDay,
  trackAccentColor,
  tracksWithCommitment,
  weekDayDates,
  yAxisTicks,
} from "@/lib/weekly-time-distribution";
import { parseLocalDate, todayISO } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CHART_H = 180;
const CHART_PAD_BOTTOM = 34;
const PURPLE_SOFT = "#8B84D6";
const LAVENDER = "#9C97D8";

const space = { fontFamily: "var(--font-space-grotesk), ui-sans-serif, sans-serif" } as const;
const mono = { fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace" } as const;

interface WeeklyTimeDistributionProps {
  tracks: Track[];
  sessions: LearningSession[];
}

export function WeeklyTimeDistribution({ tracks, sessions }: WeeklyTimeDistributionProps) {
  const today = useMemo(() => parseLocalDate(todayISO()), []);
  const weekRange = useMemo(() => getWeekRange(today), [today]);
  const daysLeft = useMemo(() => getDaysLeftInWeek(today), [today]);

  const hoursByTrack = useMemo(
    () => getHoursPerTrackPerDay(sessions, weekRange, tracks.map((t) => t.id)),
    [sessions, weekRange, tracks]
  );

  const dayTotals = useMemo(() => {
    const totals = [0, 0, 0, 0, 0, 0, 0];
    for (const track of tracks) {
      const arr = hoursByTrack[track.id] ?? [];
      for (let i = 0; i < 7; i++) totals[i] += arr[i] ?? 0;
    }
    return totals;
  }, [tracks, hoursByTrack]);

  const totalLogged = useMemo(
    () => getTotalLoggedThisWeek(sessions, weekRange),
    [sessions, weekRange]
  );

  const commitmentTracks = useMemo(() => tracksWithCommitment(tracks), [tracks]);
  const commitmentSum = useMemo(() => getCommitmentTotal(tracks), [tracks]);
  const paceLine = commitmentSum > 0 ? commitmentSum / 7 : null;
  const yMax = useMemo(() => chartYMax(dayTotals, paceLine), [dayTotals, paceLine]);
  const ticks = useMemo(() => yAxisTicks(yMax), [yMax]);
  const dayDates = useMemo(() => weekDayDates(weekRange), [weekRange]);

  const goalPct =
    commitmentSum > 0 ? Math.min(100, Math.round((totalLogged / commitmentSum) * 100)) : null;

  const goalLineBottom =
    paceLine != null ? CHART_PAD_BOTTOM + (paceLine / yMax) * CHART_H : null;

  return (
    <div>
      <SectionHeading icon={IconStack2}>Weekly Time Distribution</SectionHeading>

      <div
        className="relative overflow-hidden rounded-[18px] border px-[30px] pb-[26px] pt-7"
        style={{
          background: "linear-gradient(180deg, #131316 0%, #131316 100%)",
          borderColor: "#242429",
        }}
      >
        <div
          className="pointer-events-none absolute -right-[100px] -top-[160px] h-[340px] w-[340px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(83,74,183,0.16) 0%, rgba(83,74,183,0) 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-[140px] -left-[80px] h-[260px] w-[260px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(79,168,148,0.10) 0%, rgba(79,168,148,0) 70%)",
          }}
        />

        {/* Header */}
        <div className="relative z-[1] mb-1.5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[22px] font-semibold text-[#f2f2f3]" style={space}>
              This Week
            </h3>
            <p className="mt-[5px] text-[12.5px] text-[#6c6c74]">
              {formatWeekRangeLabel(weekRange)} · hours logged per track
            </p>
          </div>
          <div className="text-right">
            <div className="text-[26px] font-semibold text-[#f2f2f3]" style={mono}>
              {formatHoursCompact(totalLogged)}
              {commitmentSum > 0 && (
                <span className="text-sm font-medium text-[#6c6c74]">
                  &nbsp;/&nbsp;{formatHoursCompact(commitmentSum)}h
                </span>
              )}
              {commitmentSum <= 0 && (
                <span className="text-sm font-medium text-[#6c6c74]">h</span>
              )}
            </div>
            {goalPct != null && (
              <p
                className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.6px]"
                style={{ color: PURPLE_SOFT }}
              >
                {goalPct}% of weekly goal
              </p>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="relative z-[1] mt-[26px] flex">
          <div
            className="flex flex-col justify-between pr-2.5"
            style={{ height: CHART_H + CHART_PAD_BOTTOM, paddingBottom: CHART_PAD_BOTTOM }}
          >
            {ticks.map((t) => (
              <span
                key={t}
                className="text-[10.5px] text-[#6c6c74]"
                style={mono}
              >
                {t}h
              </span>
            ))}
          </div>

          <div
            className="relative flex flex-1 items-end gap-3.5 border-l pl-4"
            style={{
              height: CHART_H + CHART_PAD_BOTTOM,
              paddingBottom: CHART_PAD_BOTTOM,
              borderColor: "#242429",
            }}
          >
            {ticks.map((t) => (
              <div
                key={`g-${t}`}
                className="pointer-events-none absolute left-0 right-0 h-px opacity-55"
                style={{
                  bottom: CHART_PAD_BOTTOM + (t / yMax) * CHART_H,
                  background: "#242429",
                }}
              />
            ))}

            {goalLineBottom != null && paceLine != null && (
              <div
                className="pointer-events-none absolute left-0 right-0 z-[2]"
                style={{
                  bottom: goalLineBottom,
                  borderTop: `1.5px dashed rgba(156,151,216,0.55)`,
                }}
              >
                <span
                  className="absolute right-0 -top-[17px] rounded border px-1.5 py-px text-[9.5px]"
                  style={{
                    ...mono,
                    color: LAVENDER,
                    background: "#1b1b1f",
                    borderColor: "#242429",
                  }}
                >
                  {formatHoursCompact(paceLine)}h/day avg
                </span>
              </div>
            )}

            {dayDates.map((date, i) => {
              const isToday = isSameLocalDay(date, today);
              const total = dayTotals[i] ?? 0;
              const barH = total > 0 ? Math.max(2, (total / yMax) * CHART_H) : isToday ? 2 : 0;

              return (
                <div
                  key={WEEK_DAY_LABELS[i]}
                  className="relative flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div
                    className={cn(
                      "absolute -top-[18px] text-[9.5px]",
                      isToday ? "font-semibold text-[#f2f2f3]" : "text-[#a8a8ae]"
                    )}
                    style={mono}
                  >
                    {formatHoursCompact(total)}h
                  </div>

                  <div
                    className={cn(
                      "flex w-[26px] flex-col-reverse overflow-hidden rounded-[5px]",
                      isToday && total <= 0 && "rounded-md"
                    )}
                    style={{
                      height: barH || (isToday ? 2 : 0),
                      background: isToday && total <= 0 ? "#1b1b1f" : undefined,
                      outline:
                        isToday && total <= 0
                          ? "1.5px dashed rgba(255,255,255,0.28)"
                          : undefined,
                      outlineOffset: isToday && total <= 0 ? 2 : undefined,
                    }}
                  >
                    {tracks.map((track) => {
                      const h = hoursByTrack[track.id]?.[i] ?? 0;
                      if (h <= 0 || total <= 0) return null;
                      const pct = (h / total) * 100;
                      return (
                        <div
                          key={track.id}
                          className="w-full"
                          style={{
                            height: `${pct}%`,
                            background: trackAccentColor(track),
                            minHeight: pct > 0 ? 2 : 0,
                          }}
                          title={`${track.name}: ${formatHoursCompact(h)}h`}
                        />
                      );
                    })}
                  </div>

                  <div
                    className={cn(
                      "absolute -bottom-[22px] text-[10.5px]",
                      isToday ? "font-semibold text-[#f2f2f3]" : "text-[#6c6c74]"
                    )}
                    style={mono}
                  >
                    {WEEK_DAY_LABELS[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div
          className="relative z-[1] mt-10 flex flex-wrap gap-2.5 border-t pt-5"
          style={{ borderColor: "#242429" }}
        >
          {tracks.map((track) => {
            const logged = getLoggedThisWeek(sessions, track.id, weekRange);
            return (
              <div
                key={track.id}
                className="flex min-w-[150px] flex-1 items-center gap-2 rounded-[10px] border px-3 py-2"
                style={{ background: "#1b1b1f", borderColor: "#242429" }}
              >
                <span
                  className="h-[9px] w-[9px] shrink-0 rounded-full"
                  style={{ background: trackAccentColor(track) }}
                />
                <div className="flex min-w-0 flex-col gap-px">
                  <span className="truncate text-xs font-medium text-[#a8a8ae]">
                    {track.name}
                  </span>
                  <span className="text-[13px] font-semibold text-[#f2f2f3]" style={mono}>
                    {formatHoursCompact(logged)}h
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Goal cards — one per track with a commitment set */}
        <div className="relative z-[1] mt-[22px]">
          {commitmentTracks.length === 0 ? (
            <div
              className="rounded-xl border px-[18px] py-4 text-[12.5px] text-[#6c6c74]"
              style={{ background: "#1b1b1f", borderColor: "#242429" }}
            >
              No weekly commitments set yet.{" "}
              <Link
                href="/settings"
                className="font-medium text-[#8B84D6] underline-offset-2 hover:underline"
              >
                Add one for any track in Settings
              </Link>
              .
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-4",
                commitmentTracks.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2"
              )}
            >
              {commitmentTracks.map((track) => {
                const commitment = track.weeklyCommitmentHours ?? 0;
                const logged = getLoggedThisWeek(sessions, track.id, weekRange);
                const pct = Math.min(100, (logged / commitment) * 100);
                const remaining = Math.max(0, commitment - logged);
                const met = logged >= commitment;
                const color = trackAccentColor(track);
                const onPace =
                  !met &&
                  daysLeft > 0 &&
                  remaining / daysLeft <= commitment / 7;

                return (
                  <div
                    key={track.id}
                    className="rounded-xl border px-[18px] py-4"
                    style={{ background: "#1b1b1f", borderColor: "#242429" }}
                  >
                    <div className="mb-2.5 flex items-baseline justify-between gap-2">
                      <span className="text-[12.5px] font-medium text-[#a8a8ae]">
                        Weekly commitment · {track.name}
                      </span>
                      <span className="shrink-0 text-[13px] font-semibold text-[#f2f2f3]" style={mono}>
                        {formatHoursCompact(logged)}{" "}
                        <span className="font-medium text-[#6c6c74]">
                          / {formatHoursCompact(commitment)}h
                        </span>
                      </span>
                    </div>
                    <div
                      className="h-[7px] overflow-hidden rounded-[5px] border"
                      style={{ background: "#131316", borderColor: "#242429" }}
                    >
                      <div
                        className="h-full rounded-[5px] transition-[width] duration-300"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <p className="mt-[7px] text-[10.5px] text-[#6c6c74]">
                      {met
                        ? "Goal met 🎯"
                        : onPace
                          ? `${formatHoursCompact(remaining)}h remaining · on pace`
                          : `${formatHoursCompact(remaining)}h remaining · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
