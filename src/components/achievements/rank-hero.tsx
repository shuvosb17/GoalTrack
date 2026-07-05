"use client";

import { motion } from "framer-motion";
import { ACHIEVEMENT_RANKS, type GoalSprintSnapshot } from "@/lib/achievements";
import { TIER_FORECAST_COLORS } from "@/lib/goal-forecast-ui";

interface RankHeroProps {
  sprint: GoalSprintSnapshot;
  unlockedCount: number;
  totalAchievements: number;
}

function mix(accent: string, pct: number) {
  return `color-mix(in srgb, ${accent} ${pct}%, transparent)`;
}

export function RankHero({ sprint, unlockedCount, totalAchievements }: RankHeroProps) {
  const { rank, tiered, loggedHours, runnerPercent, targetPercent, activeTierLabel, hoursToTarget, yearEndLabel, checkpoints } = sprint;
  const runnerPos = runnerPercent;

  const rankThresholds = [0, 10, tiered.minimum, tiered.target, tiered.stretch];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-[0.5px] p-5 sm:p-7"
      style={{
        borderColor: mix(rank.accent, 35),
        background: `radial-gradient(140% 120% at 0% 0%, ${mix(rank.accent, 12)}, transparent 50%), radial-gradient(100% 80% at 100% 100%, ${mix(TIER_FORECAST_COLORS.target.bar, 8)}, transparent 45%), #0c0c10`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.5) 48px, rgba(255,255,255,0.5) 49px)`,
        }}
      />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl text-4xl sm:h-20 sm:w-20"
            style={{
              backgroundColor: mix(rank.accent, 18),
              border: `2px solid ${mix(rank.accent, 50)}`,
              boxShadow: `0 0 40px ${mix(rank.accent, 32)}`,
            }}
          >
            {rank.icon}
          </motion.div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Sprint rank</p>
            <h2 className="mt-0.5 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: rank.accent }}>
              {rank.name}
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{activeTierLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              {rank.isMax ? (
                <>Legend status — all goal tiers conquered by {yearEndLabel}</>
              ) : (
                <>
                  <span className="font-medium text-foreground/90">{rank.toNext}h</span> to reach{" "}
                  <span className="font-semibold" style={{ color: rank.accent }}>{rank.nextName}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:gap-4">
          <Stat value={`${loggedHours}h`} label="Logged this year" accent={rank.accent} />
          <Stat value={`${tiered.target}h`} label="Your target" accent={TIER_FORECAST_COLORS.target.bar} />
          <Stat value={`${targetPercent}%`} label="Target progress" accent={TIER_FORECAST_COLORS.target.bar} />
          <Stat value={`${unlockedCount}/${totalAchievements}`} label="Badges unlocked" />
        </div>
      </div>

      {/* Long goal sprint track */}
      <div className="relative mt-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Goal sprint track</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              0h → {tiered.stretch}h stretch · {hoursToTarget > 0 ? `${hoursToTarget}h to target` : "Target reached"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <GoalPill label={`Min ${tiered.minimum}h`} color={TIER_FORECAST_COLORS.minimum.bar} active={loggedHours >= tiered.minimum} />
            <GoalPill label={`Target ${tiered.target}h`} color={TIER_FORECAST_COLORS.target.bar} active={loggedHours >= tiered.target} />
            <GoalPill label={`Stretch ${tiered.stretch}h`} color={TIER_FORECAST_COLORS.stretch.bar} active={loggedHours >= tiered.stretch} />
          </div>
        </div>

        <div className="relative h-[112px] rounded-xl border border-white/[0.06] bg-[#08080c]/80 px-2 pt-8 pb-10 sm:px-4">
          {/* Lane stripes */}
          <div
            className="pointer-events-none absolute inset-x-2 top-6 bottom-10 rounded-lg opacity-[0.07] sm:inset-x-4"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 28px, rgba(255,255,255,0.9) 28px, rgba(255,255,255,0.9) 56px)`,
            }}
          />

          {/* Track rail */}
          <div className="absolute left-4 right-4 top-[44px] h-2 rounded-full bg-white/[0.07]" />
          <motion.div
            className="absolute left-4 top-[44px] z-[1] h-2 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${mix(TIER_FORECAST_COLORS.minimum.bar, 70)}, ${TIER_FORECAST_COLORS.target.bar} 55%, ${TIER_FORECAST_COLORS.stretch.bar})`,
              boxShadow: `0 0 20px ${mix(rank.accent, 40)}`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `calc((100% - 2rem) * ${runnerPos / 100})` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Goal tier markers */}
          {checkpoints.filter((cp) => cp.isGoalTier).map((cp) => (
            <div
              key={`${cp.tier}-${cp.hours}`}
              className="absolute top-[44px] z-[2] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `calc(1rem + (100% - 2rem) * ${cp.percent / 100})` }}
            >
              <div
                className="h-4 w-1 rounded-full"
                style={{
                  backgroundColor: cp.reached ? cp.color : "rgba(255,255,255,0.2)",
                  boxShadow: cp.reached ? `0 0 12px ${mix(cp.color, 60)}` : "none",
                }}
              />
              <span
                className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold uppercase tracking-wide"
                style={{ color: cp.reached ? cp.color : "rgba(255,255,255,0.35)" }}
              >
                {cp.label}
              </span>
              <span className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] tabular-nums text-muted-foreground">
                {cp.hours}h
              </span>
            </div>
          ))}

          {/* Runner — faces right toward the finish line */}
          <motion.div
            className="absolute top-[44px] z-[5] flex -translate-x-1/2 -translate-y-[calc(50%+4px)] flex-col items-center"
            initial={{ left: "1rem", opacity: 0 }}
            animate={{ left: `calc(1rem + (100% - 2rem) * ${runnerPos / 100})`, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span
              className="inline-block text-2xl sm:text-3xl"
              style={{
                transform: "scaleX(-1)",
                filter: `drop-shadow(0 0 10px ${mix(rank.accent, 80)})`,
              }}
            >
              🏃
            </span>
          </motion.div>

          {/* Hours label below track to avoid overlapping runner */}
          <motion.div
            className="absolute top-[58px] z-[6] -translate-x-1/2"
            initial={{ left: "1rem", opacity: 0 }}
            animate={{ left: `calc(1rem + (100% - 2rem) * ${runnerPos / 100})`, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums"
              style={{ color: rank.accent, backgroundColor: mix(rank.accent, 16) }}
            >
              {loggedHours}h
            </span>
          </motion.div>

          {/* Rank checkpoints (small dots below track) */}
          <div className="absolute bottom-2 left-4 right-4 h-3">
            {ACHIEVEMENT_RANKS.map((r, i) => {
              const hours = rankThresholds[i] ?? 0;
              const pos = tiered.stretch > 0 ? (hours / tiered.stretch) * 100 : 0;
              const reached = i <= rank.index;
              return (
                <div
                  key={r.name}
                  className="absolute top-0 -translate-x-1/2"
                  style={{ left: `${pos}%` }}
                >
                  <div
                    className="h-2 w-2 rounded-full border"
                    style={{
                      backgroundColor: reached ? r.accent : "#121218",
                      borderColor: reached ? r.accent : "rgba(255,255,255,0.12)",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Finish line */}
          <div className="absolute right-3 top-4 bottom-8 w-px bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />
          <span className="absolute right-1 top-2 text-sm opacity-80">🏁</span>
        </div>

        <div className="relative mt-3 h-4 hidden sm:block">
          {ACHIEVEMENT_RANKS.map((r, i) => {
            const hours = rankThresholds[i] ?? 0;
            const pos = tiered.stretch > 0 ? (hours / tiered.stretch) * 100 : 0;
            const isFirst = i === 0;
            const isLast = i === ACHIEVEMENT_RANKS.length - 1;
            return (
              <span
                key={r.name}
                className="absolute text-[9.5px] font-medium"
                style={{
                  left: `${pos}%`,
                  transform: isFirst ? "none" : isLast ? "translateX(-100%)" : "translateX(-50%)",
                  color: i <= rank.index ? r.accent : "rgba(255,255,255,0.3)",
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

function Stat({ value, label, accent }: { value: string; label: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-center sm:px-4">
      <p className="metric-value text-lg tabular-nums sm:text-xl" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      <p className="mt-1 text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function GoalPill({ label, color, active }: { label: string; color: string; active: boolean }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 font-medium"
      style={{
        color: active ? color : "rgba(255,255,255,0.4)",
        backgroundColor: active ? mix(color, 14) : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? mix(color, 35) : "rgba(255,255,255,0.08)"}`,
      }}
    >
      {label}
    </span>
  );
}
