"use client";

import { motion } from "framer-motion";
import { ACHIEVEMENT_RANKS, type AchievementRank } from "@/lib/achievements";

interface RankHeroProps {
  rank: AchievementRank;
  unlockedCount: number;
  total: number;
  completionPct: number;
}

function mix(accent: string, pct: number) {
  return `color-mix(in srgb, ${accent} ${pct}%, transparent)`;
}

export function RankHero({ rank, unlockedCount, total, completionPct }: RankHeroProps) {
  const runnerPos = Math.min(100, Math.max(0, completionPct));

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-[0.5px] p-5 sm:p-6"
      style={{
        borderColor: mix(rank.accent, 30),
        background: `radial-gradient(120% 140% at 0% 0%, ${mix(rank.accent, 10)}, transparent 55%), #101014`,
      }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Rank badge */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl sm:h-20 sm:w-20 sm:text-4xl"
            style={{
              backgroundColor: mix(rank.accent, 16),
              border: `1.5px solid ${mix(rank.accent, 45)}`,
              boxShadow: `0 0 30px ${mix(rank.accent, 28)}`,
            }}
          >
            {rank.icon}
          </motion.div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Current rank</p>
            <h2 className="mt-0.5 text-2xl font-semibold sm:text-3xl" style={{ color: rank.accent }}>
              {rank.name}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {rank.isMax ? (
                <span>Top rank reached — {unlockedCount}/{total} unlocked</span>
              ) : (
                <span>
                  <span className="font-medium text-foreground/90">{rank.toNext} more</span> to reach{" "}
                  <span className="font-medium" style={{ color: rank.accent }}>{rank.nextName}</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Compact stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          <Stat value={`${unlockedCount}/${total}`} label="Unlocked" />
          <Stat value={`${completionPct}%`} label="Completion" />
          <Stat value={rank.isMax ? "MAX" : `${rank.percentToNext}%`} label="To next rank" />
        </div>
      </div>

      {/* Overall sprint track */}
      <div className="mt-8">
        <div className="relative mx-1 mt-2">
          <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/[0.06]" />
          <motion.div
            className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${mix(rank.accent, 45)}, ${rank.accent})`,
              boxShadow: `0 0 14px ${mix(rank.accent, 45)}`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${runnerPos}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Rank checkpoints */}
          <div className="relative flex h-6 items-center">
            {ACHIEVEMENT_RANKS.map((r, i) => {
              const pos = total > 0 ? Math.min(100, (r.minUnlocked / total) * 100) : 0;
              const reached = i <= rank.index;
              return (
                <div
                  key={r.name}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${pos}%` }}
                >
                  <div
                    className="h-3 w-3 rounded-full border transition-colors"
                    style={{
                      backgroundColor: reached ? r.accent : "#15151a",
                      borderColor: reached ? r.accent : "rgba(255,255,255,0.15)",
                      boxShadow: reached ? `0 0 10px ${mix(r.accent, 60)}` : "none",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Runner marker */}
          <motion.div
            className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-lg"
            initial={{ left: 0, opacity: 0 }}
            animate={{ left: `${runnerPos}%`, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${mix(rank.accent, 70)})` }}
          >
            🏃
          </motion.div>
        </div>

        <div className="relative mt-2 h-4">
          {ACHIEVEMENT_RANKS.map((r, i) => {
            const pos = total > 0 ? Math.min(100, (r.minUnlocked / total) * 100) : 0;
            const isFirst = i === 0;
            const isLast = i === ACHIEVEMENT_RANKS.length - 1;
            return (
              <span
                key={r.name}
                className="absolute text-[9.5px] font-medium sm:text-[10px]"
                style={{
                  left: `${pos}%`,
                  transform: isFirst ? "none" : isLast ? "translateX(-100%)" : "translateX(-50%)",
                  color: i <= rank.index ? r.accent : "rgba(255,255,255,0.35)",
                }}
              >
                {r.name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center lg:text-right">
      <p className="metric-value text-xl tabular-nums sm:text-2xl">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
