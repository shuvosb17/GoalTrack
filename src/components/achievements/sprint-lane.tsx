"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { getAchievementProgress } from "@/lib/achievements";
import type { Achievement } from "@/lib/types";

export interface SprintLaneItem {
  ach: Achievement;
  progress: ReturnType<typeof getAchievementProgress>;
  unlocked: boolean;
}

interface SprintLaneProps {
  label: string;
  accent: string;
  items: SprintLaneItem[];
}

function mix(accent: string, pct: number) {
  return `color-mix(in srgb, ${accent} ${pct}%, transparent)`;
}

export function SprintLane({ label, accent, items }: SprintLaneProps) {
  if (items.length === 0) return null;

  const total = items.length;
  const unlockedCount = items.filter((i) => i.unlocked).length;
  const currentIndex = items.findIndex((i) => !i.unlocked);
  const currentFraction =
    currentIndex >= 0 ? Math.min(1, items[currentIndex].progress.percent / 100) : 0;

  const fillNodeUnits =
    unlockedCount === 0 ? 0 : unlockedCount - 1 + (currentIndex >= 0 ? currentFraction : 0);
  const fillPercent =
    total > 1 ? Math.min(100, Math.max(0, (fillNodeUnits / (total - 1)) * 100)) : unlockedCount === total ? 100 : 0;

  const complete = unlockedCount === total;

  return (
    <div className="rounded-2xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: accent, boxShadow: `0 0 10px ${mix(accent, 60)}` }}
          />
          <h3 className="text-sm font-semibold">{label}</h3>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums"
          style={{ color: accent, backgroundColor: mix(accent, 14) }}
        >
          {unlockedCount}/{total}
          {complete ? " · done" : ""}
        </span>
      </div>

      <div className="relative px-1">
        {/* Track base line (spans node centers) */}
        <div
          className="absolute top-6 h-1 rounded-full bg-white/[0.06]"
          style={{ left: `${50 / total}%`, right: `${50 / total}%` }}
        />
        {/* Progress fill */}
        <motion.div
          className="absolute top-6 h-1 rounded-full"
          style={{
            left: `${50 / total}%`,
            background: `linear-gradient(90deg, ${mix(accent, 55)}, ${accent})`,
            boxShadow: `0 0 12px ${mix(accent, 45)}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `calc((100% - ${100 / total}%) * ${fillPercent / 100})` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />

        <div className="relative flex items-start justify-between">
          {items.map((item, i) => {
            const isCurrent = i === currentIndex;
            const state = item.unlocked ? "unlocked" : isCurrent ? "current" : "locked";
            return (
              <SprintNode key={item.ach.id} item={item} state={state} accent={accent} index={i} total={total} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SprintNode({
  item,
  state,
  accent,
  index,
  total,
}: {
  item: SprintLaneItem;
  state: "unlocked" | "current" | "locked";
  accent: string;
  index: number;
  total: number;
}) {
  const width = `${100 / total}%`;

  return (
    <motion.div
      className="flex flex-col items-center text-center"
      style={{ width }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="relative flex h-12 w-12 items-center justify-center">
        {state === "current" && (
          <ProgressRing percent={item.progress.percent} accent={accent} />
        )}
        <div
          className={cn(
            "relative z-10 flex h-11 w-11 items-center justify-center rounded-full transition-colors",
            state === "locked" && "bg-white/[0.03]"
          )}
          style={
            state === "unlocked"
              ? {
                  backgroundColor: mix(accent, 16),
                  border: `1.5px solid ${mix(accent, 55)}`,
                  boxShadow: `0 0 16px ${mix(accent, 30)}`,
                }
              : state === "current"
                ? { backgroundColor: "#0d0d12" }
                : { border: "1px solid rgba(255,255,255,0.08)" }
          }
        >
          {state === "locked" ? (
            <Lock className="h-4 w-4 text-muted-foreground/70" />
          ) : (
            <span className={cn("text-xl", state === "current" && "opacity-95")}>{item.ach.icon}</span>
          )}
          {state === "unlocked" && (
            <span
              className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full"
              style={{ backgroundColor: accent }}
            >
              <Check className="h-2.5 w-2.5 text-black" strokeWidth={3} />
            </span>
          )}
        </div>
      </div>

      <p
        className={cn(
          "mt-2 line-clamp-2 text-[10.5px] font-medium leading-tight",
          state === "locked" ? "text-muted-foreground/60" : "text-foreground/90"
        )}
      >
        {item.ach.title}
      </p>
      {state === "current" && (
        <p className="mt-0.5 text-[10px] tabular-nums" style={{ color: accent }}>
          {item.progress.current}
          {item.progress.unit ? ` ${item.progress.unit}` : ""} / {item.progress.target}
        </p>
      )}
    </motion.div>
  );
}

const RING_R = 21;
const RING_C = 2 * Math.PI * RING_R;

function ProgressRing({ percent, accent }: { percent: number; accent: string }) {
  const pct = Math.min(100, Math.max(0, percent));
  const offset = RING_C * (1 - pct / 100);
  return (
    <svg
      width={48}
      height={48}
      viewBox="0 0 48 48"
      className="absolute inset-0 animate-[pulse_2.4s_ease-in-out_infinite]"
    >
      <circle cx={24} cy={24} r={RING_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2.5} />
      <circle
        cx={24}
        cy={24}
        r={RING_R}
        fill="none"
        stroke={accent}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={RING_C}
        strokeDashoffset={offset}
        transform="rotate(-90 24 24)"
        style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
      />
    </svg>
  );
}
