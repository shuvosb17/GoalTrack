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
  subtitle?: string;
}

function mix(accent: string, pct: number) {
  return `color-mix(in srgb, ${accent} ${pct}%, transparent)`;
}

const NODE_MIN_WIDTH = 132;

export function SprintLane({ label, accent, items, subtitle }: SprintLaneProps) {
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
  const trackWidth = Math.max(total * NODE_MIN_WIDTH, 100);

  return (
    <div className="overflow-hidden rounded-2xl border-[0.5px] border-white/[0.08] bg-[#0a0a0e]">
      <div className="border-b border-white/[0.06] px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: accent, boxShadow: `0 0 12px ${mix(accent, 65)}` }}
              />
              <h3 className="text-sm font-semibold">{label}</h3>
            </div>
            {subtitle && <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums"
            style={{ color: accent, backgroundColor: mix(accent, 14), border: `1px solid ${mix(accent, 28)}` }}
          >
            {unlockedCount}/{total}
            {complete ? " · FINISH" : ""}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:thin]">
        <div className="relative px-5 py-8" style={{ minWidth: trackWidth }}>
          {/* Lane surface */}
          <div
            className="pointer-events-none absolute inset-x-5 top-[46px] h-[52px] rounded-xl border border-white/[0.05]"
            style={{
              background: `linear-gradient(180deg, ${mix(accent, 6)} 0%, transparent 100%)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-5 top-[46px] h-[52px] rounded-xl opacity-[0.06]"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 24px, rgba(255,255,255,0.8) 24px, rgba(255,255,255,0.8) 48px)`,
            }}
          />

          {/* Track rails */}
          <div
            className="absolute top-[68px] h-[3px] rounded-full bg-white/[0.08]"
            style={{ left: `${NODE_MIN_WIDTH / 2}px`, right: `${NODE_MIN_WIDTH / 2}px` }}
          />
          <motion.div
            className="absolute top-[68px] h-[3px] rounded-full"
            style={{
              left: `${NODE_MIN_WIDTH / 2}px`,
              background: `linear-gradient(90deg, ${mix(accent, 50)}, ${accent})`,
              boxShadow: `0 0 16px ${mix(accent, 50)}`,
            }}
            initial={{ width: 0 }}
            animate={{
              width:
                total > 1
                  ? `calc((100% - ${NODE_MIN_WIDTH}px) * ${fillPercent / 100})`
                  : fillPercent >= 100
                    ? `calc(100% - ${NODE_MIN_WIDTH}px)`
                    : 0,
            }}
            transition={{ duration: 0.85, ease: "easeOut" }}
          />

          <div className="relative flex" style={{ minWidth: trackWidth - 40 }}>
            {items.map((item, i) => {
              const isCurrent = i === currentIndex;
              const state = item.unlocked ? "unlocked" : isCurrent ? "current" : "locked";
              return (
                <SprintNode
                  key={item.ach.id}
                  item={item}
                  state={state}
                  accent={accent}
                  index={i}
                  isLast={i === total - 1}
                />
              );
            })}
          </div>
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
  isLast,
}: {
  item: SprintLaneItem;
  state: "unlocked" | "current" | "locked";
  accent: string;
  index: number;
  isLast: boolean;
}) {
  return (
    <motion.div
      className="relative flex shrink-0 flex-col items-center px-1 text-center"
      style={{ width: NODE_MIN_WIDTH }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      {isLast && (
        <span className="absolute -right-1 top-8 text-base opacity-70">🏁</span>
      )}

      <div className="relative flex h-[60px] w-[60px] items-center justify-center">
        {state === "current" && (
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <ProgressRing percent={item.progress.percent} accent={accent} />
          </div>
        )}
        <div
          className={cn(
            "relative z-10 flex h-11 w-11 items-center justify-center rounded-full transition-all",
            state === "locked" && "bg-white/[0.03]"
          )}
          style={
            state === "unlocked"
              ? {
                  backgroundColor: mix(accent, 18),
                  border: `2px solid ${mix(accent, 55)}`,
                  boxShadow: `0 0 20px ${mix(accent, 35)}`,
                }
              : state === "current"
                ? { backgroundColor: "#0a0a0e", border: `2px solid ${mix(accent, 40)}` }
                : { border: "1.5px solid rgba(255,255,255,0.08)" }
          }
        >
          {state === "locked" ? (
            <Lock className="h-4 w-4 text-muted-foreground/60" />
          ) : (
            <span className="text-xl">{item.ach.icon}</span>
          )}
          {state === "unlocked" && (
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full"
              style={{ backgroundColor: accent }}
            >
              <Check className="h-2.5 w-2.5 text-black" strokeWidth={3} />
            </span>
          )}
        </div>
      </div>

      <p
        className={cn(
          "mt-3 line-clamp-2 min-h-[2rem] text-[11px] font-semibold leading-tight",
          state === "locked" ? "text-muted-foreground/55" : "text-foreground/95"
        )}
      >
        {item.ach.title}
      </p>
      {state === "current" ? (
        <div
          className="mt-1.5 rounded-md px-2 py-1 text-[10px] font-medium tabular-nums"
          style={{ color: accent, backgroundColor: mix(accent, 12) }}
        >
          {item.progress.current}
          {item.progress.unit ? ` ${item.progress.unit}` : ""} / {item.progress.target}
        </div>
      ) : state === "unlocked" ? (
        <p className="mt-1.5 text-[10px] font-medium" style={{ color: mix(accent, 80) }}>
          Cleared
        </p>
      ) : (
        <p className="mt-1.5 text-[10px] text-muted-foreground/50">Locked</p>
      )}
    </motion.div>
  );
}

const RING_R = 28;
const RING_C = 2 * Math.PI * RING_R;

function ProgressRing({ percent, accent }: { percent: number; accent: string }) {
  const pct = Math.min(100, Math.max(0, percent));
  const offset = RING_C * (1 - pct / 100);
  return (
    <svg width={60} height={60} viewBox="0 0 60 60" className="pointer-events-none">
      <circle cx={30} cy={30} r={RING_R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={2} />
      <circle
        cx={30}
        cy={30}
        r={RING_R}
        fill="none"
        stroke={accent}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={RING_C}
        strokeDashoffset={offset}
        transform="rotate(-90 30 30)"
      />
    </svg>
  );
}
