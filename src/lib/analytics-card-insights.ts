import { subDays, format } from "date-fns";
import type { LearningSession, Track } from "./types";

export interface TimeDistributionTrack {
  name: string;
  hours: number;
  percentage: number;
  color: string;
}

export interface EfficiencyRow {
  name: string;
  percentage: number;
  hours: number;
  roi: number;
  color: string;
}

export function getTimeDistributionInsight(
  tracks: TimeDistributionTrack[],
  sessions: LearningSession[],
  allTracks: Track[]
): string {
  if (tracks.length === 0) {
    return "Log sessions to see where your hours go.";
  }

  const byHoursAsc = [...tracks].sort((a, b) => a.hours - b.hours);
  const recentCutoff = format(subDays(new Date(), 14), "yyyy-MM-dd");

  for (const track of byHoursAsc) {
    const trackId = allTracks.find((t) => t.name === track.name)?.id;
    if (!trackId || track.hours <= 0) continue;

    const recentHours =
      sessions
        .filter((s) => s.trackId === trackId && s.date >= recentCutoff)
        .reduce((sum, s) => sum + s.duration, 0) / 3600000;

    if (recentHours > 0) {
      return `${track.name} gets the fewest logged hours but you're still showing up — one focused block could rebalance your sprint.`;
    }
  }

  const top = [...tracks].sort((a, b) => b.hours - a.hours)[0];
  if (top && top.percentage >= 50) {
    return `${top.name} dominates your calendar at ${top.percentage}% — intentional depth, or time to diversify?`;
  }
  if (top) {
    return `Most hours flow through ${top.name} (${top.percentage}%). Shift a session if another track needs momentum.`;
  }

  return "Spread time across tracks for balanced growth.";
}

export function getEfficiencyRoiInsight(rows: EfficiencyRow[]): string {
  const active = rows.filter((r) => r.hours > 0);
  if (active.length < 2) {
    return "(progress × avg quality) ÷ hours — log time on multiple tracks to compare ROI.";
  }

  const sorted = [...active].sort((a, b) => b.roi - a.roi);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const multiple = (best.roi / Math.max(worst.roi, 0.1)).toFixed(0);

  return `${best.name} returns ${multiple}× the ROI of ${worst.name} per hour invested.`;
}
