"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  calculateDayChrono,
  CHRONO_ACCENT,
  CHRONO_RING_CIRCUMFERENCE,
  DayChronoTimer,
  padChrono,
  type ChronoMode,
  type DayChronoSnapshot,
} from "@/lib/day-chrono";

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border-none px-2 py-1 font-mono text-[9px] tracking-wider transition-colors",
        active ? "bg-[#1c1d20] text-[#e8e9eb]" : "bg-transparent text-[#6b6e76] hover:text-[#a0a3ab]"
      )}
    >
      {children}
    </button>
  );
}

export function DayCountdown() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<ChronoMode>("elapsed");
  const [snapshot, setSnapshot] = useState<DayChronoSnapshot>(() =>
    calculateDayChrono(undefined, "elapsed")
  );
  const [liveBright, setLiveBright] = useState(true);
  const modeRef = useRef<ChronoMode>("elapsed");
  const timerRef = useRef<DayChronoTimer | null>(null);

  useEffect(() => {
    modeRef.current = mode;
    setSnapshot(calculateDayChrono(undefined, mode));
  }, [mode]);

  useEffect(() => {
    setMounted(true);
    const timer = new DayChronoTimer();
    timerRef.current = timer;
    const unsubscribe = timer.subscribe((_data, tick) => {
      setSnapshot(calculateDayChrono(undefined, modeRef.current));
      setLiveBright(tick % 2 === 0);
    });
    timer.start();
    return () => {
      unsubscribe();
      timer.destroy();
      timerRef.current = null;
    };
  }, []);

  if (!mounted) {
    return <div className="h-[13.5rem] animate-pulse rounded-[14px] bg-[#111114]" />;
  }

  const pctLabel = `${snapshot.percent.toFixed(1)}%`;
  const ringOffset =
    CHRONO_RING_CIRCUMFERENCE -
    CHRONO_RING_CIRCUMFERENCE * (snapshot.percent / 100);

  return (
    <div
      className="w-full overflow-hidden rounded-[14px] border border-[#1c1d20] bg-[#070708] px-3 py-3 font-mono"
      style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full transition-opacity duration-300"
            style={{
              background: CHRONO_ACCENT,
              boxShadow: `0 0 6px ${CHRONO_ACCENT}`,
              opacity: liveBright ? 1 : 0.35,
            }}
            aria-hidden
          />
          <span className="truncate text-[8px] uppercase tracking-[0.16em] text-[#6b6e76]">
            Time elapsed today
          </span>
        </div>
        <div className="flex shrink-0 rounded-lg border border-[#232427] bg-[#111114] p-0.5">
          <ToggleButton active={mode === "left"} onClick={() => setMode("left")}>
            LEFT
          </ToggleButton>
          <ToggleButton active={mode === "elapsed"} onClick={() => setMode("elapsed")}>
            ELAPSED
          </ToggleButton>
        </div>
      </div>

      {/* Ring + digits */}
      <div className="mb-3 grid grid-cols-[auto_1fr] items-center gap-3">
        <div className="relative h-[72px] w-[72px] shrink-0">
          <svg
            viewBox="0 0 148 148"
            className="h-[72px] w-[72px] -rotate-90"
            aria-hidden
          >
            <circle
              cx="74"
              cy="74"
              r="64"
              fill="none"
              stroke="#181a1d"
              strokeWidth="10"
            />
            <circle
              cx="74"
              cy="74"
              r="64"
              fill="none"
              stroke={CHRONO_ACCENT}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CHRONO_RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              className="transition-[stroke-dashoffset] duration-[400ms] ease-out"
              style={{ filter: "drop-shadow(0 0 5px rgba(124, 255, 196, 0.45))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-semibold leading-none tracking-tight text-[#f2f3f4]">
              {pctLabel}
            </span>
            <span className="mt-0.5 text-[7px] tracking-[0.12em] text-[#54565d]">
              OF DAY
            </span>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-0.5">
          <div className="text-center">
            <div className="text-[22px] font-semibold leading-none tracking-tight text-[#f2f3f4]">
              {padChrono(snapshot.hours)}
            </div>
            <div className="mt-1 text-[7px] tracking-[0.14em] text-[#54565d]">HOURS</div>
          </div>
          <div className="pb-3 text-lg text-[#3a3d44]">:</div>
          <div className="text-center">
            <div className="text-[22px] font-semibold leading-none tracking-tight text-[#f2f3f4]">
              {padChrono(snapshot.minutes)}
            </div>
            <div className="mt-1 text-[7px] tracking-[0.14em] text-[#54565d]">MINUTES</div>
          </div>
          <div className="pb-3 text-lg text-[#3a3d44]">:</div>
          <div className="text-center">
            <div
              className="text-[22px] font-semibold leading-none tracking-tight"
              style={{
                color: CHRONO_ACCENT,
                textShadow: "0 0 12px rgba(124, 255, 196, 0.35)",
              }}
            >
              {padChrono(snapshot.seconds)}
            </div>
            <div className="mt-1 text-[7px] tracking-[0.14em] text-[#54565d]">SECONDS</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[8px] uppercase tracking-[0.1em] text-[#6b6e76]">
            Day progress
          </span>
          <span className="text-[11px] font-semibold" style={{ color: CHRONO_ACCENT }}>
            {pctLabel}
          </span>
        </div>
        <div className="h-[5px] overflow-hidden rounded-sm bg-[#181a1d]">
          <div
            className="h-full rounded-sm transition-[width] duration-[400ms] ease-out"
            style={{
              width: `${snapshot.percent}%`,
              background: CHRONO_ACCENT,
              boxShadow: "0 0 8px rgba(124, 255, 196, 0.5)",
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[8px] text-[#3a3d44]">
          <span>00:00</span>
          <span>23:59</span>
        </div>
      </div>
    </div>
  );
}
