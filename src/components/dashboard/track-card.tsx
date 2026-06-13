"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IconFlame, IconClock, IconTarget } from "@tabler/icons-react";
import { formatHours } from "@/lib/utils";
import type { Track } from "@/lib/types";

interface TrackCardProps {
  track: Track;
  progress: number;
  hours: number;
  remaining: number;
  streak: number;
  currentFocus?: string;
  delay?: number;
}

export function TrackCard({
  track,
  progress,
  hours,
  remaining,
  streak,
  currentFocus,
  delay = 0,
}: TrackCardProps) {
  return (
    <Link href={`/tracks?track=${track.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -2 }}
        className="glass-card group relative flex h-full cursor-pointer flex-col overflow-hidden p-4"
      >
        <div
          className="absolute inset-0 opacity-[0.04] transition-opacity group-hover:opacity-[0.07]"
          style={{ background: `linear-gradient(135deg, ${track.color}, transparent)` }}
        />
        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-2.5 flex min-h-[3.25rem] items-start gap-2.5">
            <span className="shrink-0 text-xl leading-none">{track.icon}</span>
            <div className="min-w-0 flex-1">
              <h3 className="min-h-[2.25rem] line-clamp-2 text-sm font-medium leading-snug">
                {track.name}
              </h3>
              <p className="mt-0.5 h-3.5 truncate text-[10px] leading-3.5 text-muted-foreground">
                {currentFocus ? `Focus: ${currentFocus}` : "\u00A0"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <span
                className="metric-value text-base tabular-nums leading-none"
                style={{ color: track.color }}
              >
                {progress}%
              </span>
            </div>
          </div>

          <div className="mb-2.5 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: track.color }}
            />
          </div>

          <div className="mt-auto flex items-center justify-between gap-1.5 text-[11px] text-muted-foreground">
            <div className="flex min-w-0 items-center gap-1">
              <IconClock className="h-3 w-3 shrink-0" stroke={1.5} />
              <span className="truncate tabular-nums">
                <span className="font-medium text-foreground">
                  {formatHours(hours * 3600000, 1)}h
                </span>{" "}
                today
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
        </div>
      </motion.div>
    </Link>
  );
}
