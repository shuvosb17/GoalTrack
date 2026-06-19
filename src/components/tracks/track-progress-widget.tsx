"use client";

import { useState } from "react";
import { addDays, differenceInDays, format, parse, parseISO } from "date-fns";
import {
  IconBolt,
  IconTrendingUp,
  IconClock,
  IconFlag,
  IconCalendarCheck,
  IconCalendar,
  IconSparkles,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { TrackProgressChart } from "@/components/tracks/track-progress-chart";
import {
  PACE_STATUS_LABELS,
} from "@/lib/track-estimation";
import {
  sendPrompt,
  studyTipsPrompt,
  nextTopicsPrompt,
  weeklyPlanPrompt,
} from "@/lib/track-prompts";
import type { TrackEstimationStats, TrackPaceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const PURPLE = "#534AB7";
const PURPLE_LIGHT = "#EEEDFE";
const TEAL = "#0F6E56";
const TEAL_LIGHT = "#E1F5EE";
const TEAL_DARK = "#085041";
const AMBER = "#EF9F27";

const TAB_MONTHS = [3, 4, 5, 6, 9, 12] as const;

interface TrackProgressWidgetProps {
  stats: TrackEstimationStats;
  onMonthsChange: (months: number) => void;
}

function OddsRing({ value }: { value: number }) {
  const size = 72;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(83, 74, 183, 0.18)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={PURPLE}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[15px] font-medium" style={{ color: PURPLE }}>
            {value}%
          </span>
        </div>
      </div>
      <span className="text-[11px] text-[var(--color-text-muted)]">odds</span>
    </div>
  );
}

function paceBadgeStyle(status: TrackPaceStatus) {
  if (status === "ahead" || status === "completed") {
    return { bg: TEAL_LIGHT, text: TEAL, border: "rgba(15, 110, 86, 0.25)" };
  }
  if (status === "on_track") {
    return { bg: PURPLE_LIGHT, text: PURPLE, border: "rgba(83, 74, 183, 0.25)" };
  }
  if (status === "behind") {
    return { bg: "rgba(239, 159, 39, 0.12)", text: AMBER, border: "rgba(239, 159, 39, 0.25)" };
  }
  return { bg: "rgba(255,255,255,0.04)", text: "var(--color-text-muted)", border: "var(--color-border-tertiary)" };
}

function getEarlyDaysLabel(stats: TrackEstimationStats): string | null {
  if (stats.paceStatus !== "ahead" || stats.daysToComplete == null) return null;
  const finishDate = addDays(parseISO(format(new Date(), "yyyy-MM-dd")), stats.daysToComplete);
  const end = parseISO(stats.endDate);
  const marginDays = differenceInDays(end, finishDate);
  if (marginDays <= 0) return null;
  return `~${marginDays} days early`;
}

function parseFinishDate(raw: string): { short: string; year: string } | null {
  if (raw === "—" || raw === "Completed") return null;
  try {
    const d = parse(raw, "MMM d, yyyy", new Date());
    if (!Number.isNaN(d.getTime())) {
      return { short: format(d, "MMM d"), year: format(d, "yyyy") };
    }
  } catch {
    /* fall through */
  }
  const parts = raw.match(/(\w+)\s+(\d+),?\s+(\d{4})/);
  if (parts) return { short: `${parts[1]} ${parts[2]}`, year: parts[3] };
  return null;
}

export function TrackProgressWidget({ stats, onMonthsChange }: TrackProgressWidgetProps) {
  const [toast, setToast] = useState<string | null>(null);
  const badge = paceBadgeStyle(stats.paceStatus);
  const earlyLabel = getEarlyDaysLabel(stats);
  const finishParts = parseFinishDate(stats.projectedCompletionDate);
  const showTealInsight =
    stats.paceStatus === "ahead" || stats.paceStatus === "on_track" || stats.paceStatus === "completed";

  const handlePrompt = async (question: string) => {
    const ok = await sendPrompt(question);
    setToast(ok ? "Prompt copied to clipboard" : "Could not copy prompt");
    window.setTimeout(() => setToast(null), 2200);
  };

  const srSummary = `${stats.track.name} progress tracker. ${stats.currentProgress}% complete. ${PACE_STATUS_LABELS[stats.paceStatus]}. ${stats.successProbability}% odds of finishing on time.`;

  return (
    <article
      className="w-full rounded-[var(--border-radius-lg)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-6 font-[family-name:var(--font-sans)]"
      style={{ fontWeight: 400 }}
    >
      <h2 className="sr-only">{srSummary}</h2>

      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <IconBolt
              className="h-5 w-5 shrink-0"
              style={{ color: AMBER }}
              stroke={1.75}
              aria-hidden="true"
            />
            <h3
              className="truncate text-[20px] font-medium text-[var(--color-text-primary)]"
              style={{ fontWeight: 500 }}
            >
              {stats.track.name}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
              style={{
                background: badge.bg,
                color: badge.text,
                border: `0.5px solid ${badge.border}`,
                fontWeight: 500,
              }}
            >
              <IconTrendingUp className="h-3.5 w-3.5" stroke={1.75} aria-hidden="true" />
              {PACE_STATUS_LABELS[stats.paceStatus]}
            </span>
            {earlyLabel && (
              <span className="text-[12px] text-[var(--color-text-muted)]">{earlyLabel}</span>
            )}
          </div>
        </div>
        <OddsRing value={stats.successProbability} />
      </div>

      {/* Chart */}
      <div className="mb-4">
        <TrackProgressChart data={stats.chartData} trackName={stats.track.name} />
      </div>

      {/* Time window tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TAB_MONTHS.map((m) => {
          const active = stats.targetMonths === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onMonthsChange(m)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors duration-200",
                active
                  ? "border-transparent text-[#EEEDFE]"
                  : "border-[0.5px] border-[var(--color-border-tertiary)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border-secondary)]"
              )}
              style={
                active
                  ? { background: PURPLE, fontWeight: 500 }
                  : { fontWeight: 400 }
              }
            >
              {m}mo
            </button>
          );
        })}
        {!(TAB_MONTHS as readonly number[]).includes(stats.targetMonths) && (
          <button
            type="button"
            onClick={() => onMonthsChange(stats.targetMonths)}
            className="rounded-full border-transparent px-3 py-1.5 text-[12px] font-medium text-[#EEEDFE]"
            style={{ background: PURPLE, fontWeight: 500 }}
          >
            {stats.targetMonths}mo
          </button>
        )}
      </div>

      {/* Metric cards */}
      <div
        className="mb-4 flex flex-wrap gap-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-background-secondary)] p-3"
      >
        <div className="min-w-[120px] flex-1 rounded-[var(--border-radius-md)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-3">
          <IconClock className="mb-2 h-4 w-4 text-[var(--color-text-muted)]" stroke={1.5} aria-hidden="true" />
          <p className="text-[28px] font-medium leading-none" style={{ color: PURPLE, fontWeight: 500 }}>
            {stats.currentProgress}%
          </p>
          <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">Complete</p>
        </div>
        <div className="min-w-[120px] flex-1 rounded-[var(--border-radius-md)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-3">
          <IconFlag className="mb-2 h-4 w-4 text-[var(--color-text-muted)]" stroke={1.5} aria-hidden="true" />
          <p className="text-[28px] font-medium leading-none text-[var(--color-text-primary)]" style={{ fontWeight: 500 }}>
            {stats.projectedProgressAtDeadline}%
          </p>
          <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">Projected</p>
        </div>
        <div className="min-w-[120px] flex-1 rounded-[var(--border-radius-md)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-3">
          <IconCalendarCheck className="mb-2 h-4 w-4 text-[var(--color-text-muted)]" stroke={1.5} aria-hidden="true" />
          {finishParts ? (
            <>
              <p className="text-[20px] font-medium leading-none" style={{ color: TEAL, fontWeight: 500 }}>
                {finishParts.short}
              </p>
              <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">{finishParts.year}</p>
            </>
          ) : (
            <>
              <p className="text-[20px] font-medium leading-none text-[var(--color-text-muted)]" style={{ fontWeight: 500 }}>
                —
              </p>
              <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">Est. finish</p>
            </>
          )}
        </div>
      </div>

      {/* Info rows */}
      <div className="mb-3 space-y-2 text-[13px] text-[var(--color-text-muted)]">
        <p className="flex items-center gap-2">
          <IconCalendar className="h-4 w-4 shrink-0" stroke={1.5} aria-hidden="true" />
          Due {format(parseISO(stats.endDate), "MMM d, yyyy")}
        </p>
        <p className="flex items-center gap-2">
          <IconClock className="h-4 w-4 shrink-0" stroke={1.5} aria-hidden="true" />
          {stats.hoursPerWeek.toFixed(1)} h/wk
        </p>
      </div>

      {/* Insight callout */}
      {stats.insight && (
        <div
          className={cn(
            "mb-4 flex gap-2.5 rounded-[var(--border-radius-md)] p-3 text-[13px] leading-[1.5]",
            showTealInsight ? "" : "border-[0.5px] border-[var(--color-border-tertiary)] text-[var(--color-text-muted)]"
          )}
          style={
            showTealInsight
              ? { background: TEAL_LIGHT, color: TEAL_DARK }
              : undefined
          }
        >
          <IconSparkles className="mt-0.5 h-4 w-4 shrink-0" stroke={1.5} aria-hidden="true" />
          <p>
            {stats.insight}
            {showTealInsight && stats.paceStatus === "ahead" ? " Keep it up!" : ""}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2.5">
        {[
          { label: "Study tips", prompt: studyTipsPrompt(stats.track.name) },
          { label: "Next topics", prompt: nextTopicsPrompt(stats.track.name) },
          { label: "Weekly plan", prompt: weeklyPlanPrompt(stats.track.name) },
        ].map(({ label, prompt }) => (
          <button
            key={label}
            type="button"
            onClick={() => void handlePrompt(prompt)}
            className="flex min-w-[140px] flex-1 items-center justify-between rounded-[var(--border-radius-md)] border-[0.5px] border-[var(--color-border-secondary)] bg-transparent px-3 py-2.5 text-left text-[13px] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-tertiary)]"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
          >
            {label}
            <IconArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" stroke={1.5} aria-hidden="true" />
          </button>
        ))}
      </div>

      {toast && (
        <p
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-4 py-2 text-[13px] text-[var(--color-text-primary)]"
          role="status"
        >
          {toast}
        </p>
      )}
    </article>
  );
}
