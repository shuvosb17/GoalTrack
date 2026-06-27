"use client";

import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatHoursShort } from "@/lib/utils";
import type { Track } from "@/lib/types";
import { TimerControls } from "@/components/timer/timer-controls";
import { TrackProgressRing, JustStartedBadge } from "./track-progress-ring";
import { TrackSparkline } from "./track-sparkline";
import { getTrackAccentColor, hexToRgba } from "@/lib/track-sparkline";

interface TrackRowProps {
  track: Track;
  progressPercent: number;
  loggedMs: number;
  sparklineValues: number[];
  expanded: boolean;
  onToggle: () => void;
  onAddModule: () => void;
}

export function TrackRow({
  track,
  progressPercent,
  loggedMs,
  sparklineValues,
  expanded,
  onToggle,
  onAddModule,
}: TrackRowProps) {
  const accent = getTrackAccentColor(track.name, track.color);
  const showRing = progressPercent >= 3;
  const hoursLabel = loggedMs > 0 ? formatHoursShort(loggedMs) : "0.0h";

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "flex cursor-pointer items-center gap-4 py-3.5 pl-[18px] pr-[18px] transition-colors",
        "rounded-r-xl border-l-[3px] hover:brightness-110"
      )}
      style={{
        borderLeftColor: accent,
        backgroundColor: hexToRgba(accent, 0.08),
      }}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {showRing ? (
        <TrackProgressRing percentage={progressPercent} accentColor={accent} />
      ) : (
        <JustStartedBadge accentColor={accent} />
      )}

      <span className="shrink-0 text-[18px] leading-none" style={{ color: accent }} aria-hidden>
        {track.icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium leading-tight text-foreground">
          {track.name}
        </p>
        <p className="text-xs text-muted-foreground">last 7 days</p>
      </div>

      <TrackSparkline values={sparklineValues} color={accent} />

      <span
        className="min-w-[3rem] shrink-0 text-right font-mono text-[13px] tabular-nums text-foreground"
        title="Total logged time"
      >
        {hoursLabel}
      </span>

      <div className="flex shrink-0 items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
        <TimerControls
          path={{ trackId: track.id }}
          label={track.name}
          compact
          hideLogged
        />
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          aria-label={`Add module to ${track.name}`}
          onClick={onAddModule}
        >
          <Plus className="h-4 w-4" />
        </button>
        <span className="flex h-8 w-8 items-center justify-center text-muted-foreground">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>
      </div>
    </div>
  );
}
