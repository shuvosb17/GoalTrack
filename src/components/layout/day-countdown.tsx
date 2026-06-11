"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon } from "lucide-react";

function getTimeLeft() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const diff = Math.max(0, end.getTime() - now.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  const totalSeconds = Math.floor(diff / 1000);
  const dayProgress = 1 - diff / (24 * 60 * 60 * 1000);
  return { hours, minutes, seconds, totalSeconds, dayProgress };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function DayCountdown() {
  const [time, setTime] = useState(getTimeLeft);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => setTime(getTimeLeft());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-4 h-[72px] animate-pulse rounded-xl bg-white/[0.03]" />
    );
  }

  const segments = [
    { value: time.hours, label: "hrs" },
    { value: time.minutes, label: "min" },
    { value: time.seconds, label: "sec" },
  ];

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
        <Moon className="h-3 w-3 text-violet-400/80" />
        <span>Time left today</span>
      </div>

      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {segments.map((seg, i) => (
          <div key={seg.label} className="flex items-center gap-1.5 sm:gap-2">
            <motion.div
              key={`${seg.label}-${seg.value}`}
              initial={{ opacity: 0.6, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="relative min-w-[3.25rem] overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 px-2 py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />
              <p className="relative font-mono text-2xl font-bold tabular-nums leading-none tracking-tight text-white">
                {pad(seg.value)}
              </p>
              <p className="relative mt-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                {seg.label}
              </p>
            </motion.div>
            {i < segments.length - 1 && (
              <span className="mb-4 font-mono text-lg font-light text-violet-400/60 animate-pulse">:</span>
            )}
          </div>
        ))}
      </div>

      <div className="px-1">
        <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500"
            initial={false}
            animate={{ width: `${time.dayProgress * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="mt-1.5 text-[9px] text-muted-foreground/70">
          {Math.round(time.dayProgress * 100)}% of today elapsed
        </p>
      </div>
    </div>
  );
}
