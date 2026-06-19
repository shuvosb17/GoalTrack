"use client";

import Link from "next/link";
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
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { TrackProgressChart } from "@/components/tracks/track-progress-chart";
import { PACE_STATUS_LABELS } from "@/lib/track-estimation";
import type { TrackEstimationStats, TrackPaceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const PURPLE = "#534AB7";
const TEAL_SOFT = "#6ee7b7";
const AMBER = "#EF9F27";

const TAB_MONTHS = [3, 4, 5, 6, 9, 12] as const;

interface TrackProgressWidgetProps {
  stats: TrackEstimationStats;
  onMonthsChange: (months: number) => void;
  variant?: "full" | "compact";
  expanded?: boolean;
  onToggleExpand?: () => void;
}

function OddsRing({ value, size = 72 }: { value: number; size?: number }) {
  const stroke = Math.max(4, Math.round(size * 0.083));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const fontSize = size <= 56 ? 13 : 15;

  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5">
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
          <span className="font-medium tabular-nums" style={{ color: PURPLE, fontSize }}>
            {value}%
          </span>
        </div>
      </div>
      <span className="text-[10px] text-[var(--color-text-muted)]">odds</span>
    </div>
  );
}

function paceBadgeStyle(status: TrackPaceStatus) {
  if (status === "ahead" || status === "completed") {
    return {
      bg: "rgba(15, 110, 86, 0.14)",
      text: TEAL_SOFT,
      border: "rgba(15, 110, 86, 0.32)",
    };
  }
  if (status === "on_track") {
    return {
      bg: "rgba(83, 74, 183, 0.14)",
      text: "#b8b0f0",
      border: "rgba(83, 74, 183, 0.32)",
    };
  }
  if (status === "behind") {
    return { bg: "rgba(239, 159, 39, 0.12)", text: "#f5cc84", border: "rgba(239, 159, 39, 0.28)" };
  }
  return { bg: "rgba(255,255,255,0.04)", text: "var(--color-text-muted)", border: "var(--color-border-tertiary)" };
}

function insightCalloutStyle(status: TrackPaceStatus) {
  if (status === "ahead" || status === "completed") {
    return {
      background: "rgba(15, 110, 86, 0.1)",
      borderColor: "rgba(15, 110, 86, 0.24)",
      color: "#a7f3d0",
      iconColor: TEAL_SOFT,
    };
  }
  if (status === "on_track") {
    return {
      background: "rgba(83, 74, 183, 0.1)",
      borderColor: "rgba(83, 74, 183, 0.24)",
      color: "#c4b5fd",
      iconColor: "#a89cf0",
    };
  }
  if (status === "behind") {
    return {
      background: "rgba(239, 159, 39, 0.08)",
      borderColor: "rgba(239, 159, 39, 0.22)",
      color: "#f5cc84",
      iconColor: AMBER,
    };
  }
  return {
    background: "var(--color-background-secondary)",
    borderColor: "var(--color-border-tertiary)",
    color: "var(--color-text-muted)",
    iconColor: "var(--color-text-muted)",
  };
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

function PaceBars({ stats }: { stats: TrackEstimationStats }) {
  const expectedProgress = Math.max(0, Math.min(100, stats.currentProgress - stats.paceDelta));

  return (
    <div className="space-y-2.5" aria-hidden="true">
      <div>
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-[var(--color-text-muted)]">Your pace</span>
          <span className="font-medium tabular-nums" style={{ color: PURPLE }}>
            {stats.currentProgress}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.currentProgress}%`, background: PURPLE }}
          />
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-[var(--color-text-muted)]">Expected plan</span>
          <span className="font-medium tabular-nums text-[var(--color-text-muted)]">
            {expectedProgress}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[#71717a]/70 transition-all duration-500"
            style={{ width: `${expectedProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function CompactStatsRow({ stats }: { stats: TrackEstimationStats }) {
  const finishParts = parseFinishDate(stats.projectedCompletionDate);

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-[var(--border-radius-md)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-2.5 py-2">
        <p className="text-[10px] text-[var(--color-text-muted)]">Now</p>
        <p className="text-[18px] font-medium tabular-nums leading-tight" style={{ color: PURPLE, fontWeight: 500 }}>
          {stats.currentProgress}%
        </p>
      </div>
      <div className="rounded-[var(--border-radius-md)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-2.5 py-2">
        <p className="text-[10px] text-[var(--color-text-muted)]">Projected</p>
        <p className="text-[18px] font-medium tabular-nums leading-tight text-[var(--color-text-primary)]" style={{ fontWeight: 500 }}>
          {stats.projectedProgressAtDeadline}%
        </p>
      </div>
      <div className="rounded-[var(--border-radius-md)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-2.5 py-2">
        <p className="text-[10px] text-[var(--color-text-muted)]">Due</p>
        <p className="text-[13px] font-medium leading-tight text-[var(--color-text-primary)]" style={{ fontWeight: 500 }}>
          {format(parseISO(stats.endDate), "MMM d")}
        </p>
        {finishParts && (
          <p className="text-[10px] tabular-nums" style={{ color: TEAL_SOFT }}>
            Est. {finishParts.short}
          </p>
        )}
      </div>
    </div>
  );
}

function TrackProgressCompact({
  stats,
  expanded,
  onToggleExpand,
}: {
  stats: TrackEstimationStats;
  expanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const badge = paceBadgeStyle(stats.paceStatus);
  const earlyLabel = getEarlyDaysLabel(stats);
  const srSummary = `${stats.track.name}: ${stats.currentProgress}% complete, ${stats.successProbability}% odds.`;

  return (
    <article
      className="w-full rounded-[var(--border-radius-lg)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-4 font-[family-name:var(--font-sans)]"
      style={{ fontWeight: 400 }}
    >
      <h2 className="sr-only">{srSummary}</h2>

      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{stats.track.icon}</span>
            <h3
              className="truncate text-[16px] font-medium text-[var(--color-text-primary)]"
              style={{ fontWeight: 500 }}
            >
              {stats.track.name}
            </h3>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{
                background: badge.bg,
                color: badge.text,
                border: `0.5px solid ${badge.border}`,
                fontWeight: 500,
              }}
            >
              <IconTrendingUp className="h-3 w-3" stroke={1.75} aria-hidden="true" />
              {PACE_STATUS_LABELS[stats.paceStatus]}
            </span>
            {earlyLabel && (
              <span className="text-[11px] text-[var(--color-text-muted)]">{earlyLabel}</span>
            )}
          </div>
        </div>
        <OddsRing value={stats.successProbability} size={56} />
      </div>

      <div className="mb-3">
        <PaceBars stats={stats} />
      </div>

      <CompactStatsRow stats={stats} />

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--color-border-tertiary)] pt-3">
        <p className="truncate text-[12px] text-[var(--color-text-muted)]">
          {stats.hoursPerWeek.toFixed(1)} h/wk · {stats.targetMonths}mo window
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href={`/tracks?track=${stats.track.id}`}
            className="inline-flex items-center gap-1 rounded-[var(--border-radius-md)] border-[0.5px] border-[var(--color-border-secondary)] px-2.5 py-1.5 text-[12px] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-tertiary)]"
          >
            Open
            <IconArrowUpRight className="h-3 w-3" stroke={1.5} aria-hidden="true" />
          </Link>
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="inline-flex items-center gap-1 rounded-[var(--border-radius-md)] border-[0.5px] border-[var(--color-border-secondary)] px-2.5 py-1.5 text-[12px] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-tertiary)]"
              aria-expanded={expanded}
            >
              {expanded ? "Collapse" : "Expand"}
              {expanded ? (
                <IconChevronUp className="h-3 w-3" stroke={1.5} aria-hidden="true" />
              ) : (
                <IconChevronDown className="h-3 w-3" stroke={1.5} aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function TrackProgressFull({
  stats,
  onMonthsChange,
  onToggleExpand,
}: {
  stats: TrackEstimationStats;
  onMonthsChange: (months: number) => void;
  onToggleExpand?: () => void;
}) {
  const badge = paceBadgeStyle(stats.paceStatus);
  const earlyLabel = getEarlyDaysLabel(stats);
  const finishParts = parseFinishDate(stats.projectedCompletionDate);
  const insightStyle = insightCalloutStyle(stats.paceStatus);

  const srSummary = `${stats.track.name} progress tracker. ${stats.currentProgress}% complete. ${PACE_STATUS_LABELS[stats.paceStatus]}. ${stats.successProbability}% odds of finishing on time.`;

  return (
    <article
      className="w-full rounded-[var(--border-radius-lg)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-6 font-[family-name:var(--font-sans)]"
      style={{ fontWeight: 400 }}
    >
      <h2 className="sr-only">{srSummary}</h2>

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
        <div className="flex shrink-0 items-start gap-2">
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="inline-flex items-center gap-1 rounded-[var(--border-radius-md)] border-[0.5px] border-[var(--color-border-secondary)] px-2.5 py-1.5 text-[12px] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-tertiary)]"
              aria-expanded="true"
            >
              Collapse
              <IconChevronUp className="h-3.5 w-3.5" stroke={1.5} aria-hidden="true" />
            </button>
          )}
          <OddsRing value={stats.successProbability} />
        </div>
      </div>

      <div className="mb-4">
        <TrackProgressChart data={stats.chartData} trackName={stats.track.name} />
      </div>

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
              style={active ? { background: PURPLE, fontWeight: 500 } : { fontWeight: 400 }}
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

      <div className="mb-4 flex flex-wrap gap-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-background-secondary)] p-3">
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
              <p className="text-[20px] font-medium leading-none" style={{ color: TEAL_SOFT, fontWeight: 500 }}>
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

      {stats.insight && (
        <div
          className="mb-4 flex gap-2.5 rounded-[var(--border-radius-md)] border-[0.5px] p-3 text-[13px] leading-[1.5]"
          style={{
            background: insightStyle.background,
            borderColor: insightStyle.borderColor,
            color: insightStyle.color,
          }}
        >
          <IconSparkles
            className="mt-0.5 h-4 w-4 shrink-0"
            stroke={1.5}
            aria-hidden="true"
            style={{ color: insightStyle.iconColor }}
          />
          <p>
            {stats.insight}
            {stats.paceStatus === "ahead" ? " Keep it up!" : ""}
          </p>
        </div>
      )}

    </article>
  );
}

export function TrackProgressWidget({
  stats,
  onMonthsChange,
  variant = "full",
  expanded,
  onToggleExpand,
}: TrackProgressWidgetProps) {
  if (variant === "compact") {
    return (
      <TrackProgressCompact
        stats={stats}
        expanded={expanded}
        onToggleExpand={onToggleExpand}
      />
    );
  }

  return (
    <TrackProgressFull
      stats={stats}
      onMonthsChange={onMonthsChange}
      onToggleExpand={onToggleExpand}
    />
  );
}
