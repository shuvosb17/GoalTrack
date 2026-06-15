"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconFlame, IconClock, IconTarget, IconPlayerPlay } from "@tabler/icons-react";
import { formatHours } from "@/lib/utils";
import type { Track } from "@/lib/types";
import type { TrackHealth, PinnedNextItem } from "@/lib/types/metrics";
import { TRACK_BAR_COLORS } from "@/lib/types/metrics";
import { cn } from "@/lib/utils";

interface TrackCardProps {
  track: Track;
  progress: number;
  hours: number;
  remaining: number;
  streak: number;
  currentFocus?: string;
  health?: TrackHealth;
  nextUp?: PinnedNextItem | null;
  nextUpHref?: string;
  leetCodeSummary?: string;
  delay?: number;
}

const HEALTH_DOT: Record<TrackHealth["status"], string> = {
  healthy: "bg-emerald-400",
  "at-risk": "bg-amber-400",
  neglected: "bg-red-400",
};

export function TrackCard({
  track,
  progress,
  hours,
  remaining,
  streak,
  currentFocus,
  health,
  nextUp,
  nextUpHref,
  leetCodeSummary,
  delay = 0,
}: TrackCardProps) {
  const router = useRouter();
  const barColor = TRACK_BAR_COLORS[track.name] ?? track.color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2 }}
      onClick={() => router.push(`/tracks?track=${track.id}`)}
      className="glass-card group relative flex h-full cursor-pointer flex-col overflow-hidden p-4"
    >
        <div
          className="absolute inset-0 opacity-[0.04] transition-opacity group-hover:opacity-[0.07]"
          style={{ background: `linear-gradient(135deg, ${barColor}, transparent)` }}
        />
        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-2 flex min-h-[3rem] items-start gap-2">
            <span className="shrink-0 text-xl leading-none">{track.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {health && (
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", HEALTH_DOT[health.status])} title={health.status} />
                )}
                <h3 className="line-clamp-2 text-sm font-medium leading-snug">{track.name}</h3>
              </div>
              {health?.status === "neglected" && health.daysSinceStudied > 0 && (
                <p className="mt-0.5 text-[10px] text-red-400">⚠ {health.daysSinceStudied}d ago</p>
              )}
              {currentFocus && health?.status !== "neglected" && (
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">Focus: {currentFocus}</p>
              )}
            </div>
            <span
              className="shrink-0 rounded px-1.5 py-px text-[11px] font-medium tabular-nums"
              style={{ background: "rgba(124,92,252,0.15)", color: "#c4b5fd" }}
            >
              {progress}%
            </span>
          </div>

          <div className="mb-2.5 h-[3px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: barColor }}
            />
          </div>

          {nextUp && nextUpHref && (
            <Link
              href={nextUpHref}
              onClick={(e) => e.stopPropagation()}
              className="mb-2 flex items-center gap-1 truncate text-[10px] text-violet-300/80 hover:text-violet-200"
            >
              <IconPlayerPlay className="h-2.5 w-2.5 shrink-0" stroke={1.5} />
              Next: {nextUp.label}
            </Link>
          )}

          <div className="mt-auto space-y-1">
            <div className="flex items-center justify-between gap-1.5 text-[11px] text-muted-foreground">
              <div className="flex min-w-0 items-center gap-1">
                <IconClock className="h-3 w-3 shrink-0" stroke={1.5} />
                <span className="truncate tabular-nums">
                  <span className="font-medium text-foreground">{formatHours(hours * 3600000, 1)}h</span> today
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <IconTarget className="h-3 w-3 shrink-0" stroke={1.5} />
                <span className="whitespace-nowrap">{remaining} left</span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <IconFlame className="h-3 w-3 shrink-0" stroke={1.5} />
                <span className="whitespace-nowrap">{streak}d</span>
              </div>
            </div>
            {leetCodeSummary && (
              <p className="truncate pl-4 text-[10px] text-muted-foreground" title={leetCodeSummary}>
                {leetCodeSummary}
              </p>
            )}
          </div>
        </div>
      </motion.div>
  );
}
