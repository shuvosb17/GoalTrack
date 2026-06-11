"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Flame, Clock, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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

export function TrackCard({ track, progress, hours, remaining, streak, currentFocus, delay = 0 }: TrackCardProps) {
  return (
    <Link href={`/tracks?track=${track.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -4, scale: 1.02 }}
        className="glass-card group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl p-5"
      >
        <div
          className="absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10"
          style={{ background: `linear-gradient(135deg, ${track.color}, transparent)` }}
        />
        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-4 flex min-h-[4.75rem] items-start gap-3">
            <span className="shrink-0 text-2xl leading-none">{track.icon}</span>
            <div className="min-w-0 flex-1">
              <h3 className="min-h-[2.5rem] line-clamp-2 font-semibold leading-tight">
                {track.name}
              </h3>
              <p className="mt-0.5 h-4 truncate text-xs text-muted-foreground">
                {currentFocus ? `Focus: ${currentFocus}` : "\u00A0"}
              </p>
            </div>
            <span
              className="shrink-0 text-lg font-bold tabular-nums"
              style={{ color: track.color }}
            >
              {progress}%
            </span>
          </div>

          <Progress
            value={progress}
            className="mb-4 h-1.5 shrink-0"
            indicatorClassName="transition-all"
            style={{ ["--progress-color" as string]: track.color } as React.CSSProperties}
          />

          <div className="mt-auto flex items-end justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 leading-tight">
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatHours(hours * 3600000, 1)}h
                </p>
                <p className="text-[10px] text-muted-foreground">today</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3 shrink-0" />
              <span className="whitespace-nowrap">{remaining} left</span>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Flame className="h-3 w-3 shrink-0" />
              <span className="whitespace-nowrap">{streak}d</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
