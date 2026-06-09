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
    <Link href={`/tracks?track=${track.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -4, scale: 1.02 }}
        className="glass-card rounded-xl p-5 cursor-pointer group relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
          style={{ background: `linear-gradient(135deg, ${track.color}, transparent)` }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{track.icon}</span>
            <div className="flex-1">
              <h3 className="font-semibold">{track.name}</h3>
              {currentFocus && (
                <p className="text-xs text-muted-foreground truncate">Focus: {currentFocus}</p>
              )}
            </div>
            <span className="text-lg font-bold" style={{ color: track.color }}>{progress}%</span>
          </div>

          <Progress value={progress} className="h-1.5 mb-4" indicatorClassName="transition-all" style={{ ["--progress-color" as string]: track.color } as React.CSSProperties} />

          <div className="flex items-end justify-between gap-3">
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
