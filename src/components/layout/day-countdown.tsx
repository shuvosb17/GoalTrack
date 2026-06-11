"use client";

import { useEffect, useState } from "react";
import { Moon } from "lucide-react";

function getTimeLeft() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const diff = Math.max(0, end.getTime() - now.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  const dayProgress = 1 - diff / (24 * 60 * 60 * 1000);
  return { hours, minutes, seconds, dayProgress };
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
    return <div className="h-16 animate-pulse rounded-lg bg-white/[0.03]" />;
  }

  const segments = [
    { value: time.hours, label: "hrs" },
    { value: time.minutes, label: "min" },
    { value: time.seconds, label: "sec" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/80">
        <Moon className="h-2.5 w-2.5 text-violet-400/80" />
        <span>Time left today</span>
      </div>

      <div className="flex items-center justify-center gap-1">
        {segments.map((seg, i) => (
          <div key={seg.label} className="flex items-center gap-1">
            <div className="relative min-w-[2.5rem] overflow-hidden rounded-lg border border-white/[0.08] bg-black/50 px-1.5 py-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
              <p className="font-mono text-lg font-bold tabular-nums leading-none text-white">
                {pad(seg.value)}
              </p>
              <p className="mt-0.5 text-[8px] font-medium uppercase tracking-wider text-muted-foreground">
                {seg.label}
              </p>
            </div>
            {i < segments.length - 1 && (
              <span className="mb-3 font-mono text-sm text-violet-400/50">:</span>
            )}
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-[11rem]">
        <div className="h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 transition-[width] duration-1000 ease-out"
            style={{ width: `${time.dayProgress * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-center text-sm font-semibold tabular-nums text-muted-foreground">
          {Math.round(time.dayProgress * 100)}%
        </p>
      </div>
    </div>
  );
}
