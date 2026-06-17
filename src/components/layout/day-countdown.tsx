"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildTimeBlockStates,
  calculateDayTime,
  DayTimer,
  formatTimeUnit,
  type TimeData,
  type TimeUnit,
} from "@/lib/day-timer";

const UNIT_STYLES: Record<
  TimeUnit,
  { bar: string; label: string }
> = {
  hours: { bar: "from-[#ff6b6b] to-[#ff8e8e]", label: "text-[#ff6b6b]" },
  minutes: { bar: "from-[#4ecdc4] to-[#6ee7df]", label: "text-[#4ecdc4]" },
  seconds: { bar: "from-[#ffe66d] to-[#fff0a0]", label: "text-[#ffe66d]" },
};

function TimeValue({ value }: { value: number }) {
  const [changing, setChanging] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setChanging(true);
      const id = window.setTimeout(() => setChanging(false), 150);
      prev.current = value;
      return () => clearTimeout(id);
    }
  }, [value]);

  return (
    <span
      className={cn(
        "block font-mono text-lg font-extrabold tabular-nums leading-none text-white transition-all duration-150",
        changing && "scale-110 opacity-70"
      )}
    >
      {formatTimeUnit(value)}
    </span>
  );
}

function TimeBlock({
  unit,
  value,
  tooltip,
}: {
  unit: TimeUnit;
  value: number;
  tooltip: string;
}) {
  const styles = UNIT_STYLES[unit];
  const label = unit;

  return (
    <div className="group relative min-w-0 overflow-hidden rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#0d0d15] to-[#14141c] px-1 py-1.5 text-center transition-colors hover:border-white/[0.08]">
      <div
        className={cn("absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r", styles.bar)}
        aria-hidden
      />
      <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2 scale-90 whitespace-nowrap rounded-lg border border-white/[0.05] bg-[#1e1e2e] px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
        {tooltip}
      </span>
      <TimeValue value={value} />
      <span
        className={cn(
          "mt-1 block text-[8px] font-bold uppercase tracking-[0.12em]",
          styles.label
        )}
      >
        {label.toUpperCase()}
      </span>
    </div>
  );
}

function SeparatorDots() {
  return (
    <div className="flex shrink-0 flex-col justify-center gap-1.5 self-center px-0.5">
      <span className="h-1 w-1 rounded-full bg-[#4a4a6a]" />
      <span className="h-1 w-1 rounded-full bg-[#4a4a6a]" />
    </div>
  );
}

export function DayCountdown() {
  const [time, setTime] = useState<TimeData>(() => calculateDayTime());
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<DayTimer | null>(null);

  useEffect(() => {
    setMounted(true);
    const timer = new DayTimer();
    timerRef.current = timer;
    const unsubscribe = timer.subscribe(setTime);
    timer.start();
    return () => {
      unsubscribe();
      timer.destroy();
      timerRef.current = null;
    };
  }, []);

  if (!mounted) {
    return <div className="h-[7.5rem] animate-pulse rounded-xl bg-white/[0.03]" />;
  }

  const blocks = buildTimeBlockStates(time);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Moon
          className="h-3.5 w-3.5 shrink-0 text-[#8b9dc3]"
          strokeWidth={2}
          aria-hidden
        />
        <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8b9dc3]">
          Time Remaining Today
        </span>
      </div>

      <div className="flex items-stretch gap-1">
        {blocks.map((block, i) => (
          <Fragment key={block.unit}>
            <div className="min-w-0 flex-1">
              <TimeBlock unit={block.unit} value={block.value} tooltip={block.tooltip} />
            </div>
            {i < blocks.length - 1 && <SeparatorDots />}
          </Fragment>
        ))}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[9px] font-semibold text-[#5a5a7a]">Day Progress</span>
          <span className="font-mono text-[11px] font-extrabold tabular-nums text-[#ff6b6b]">
            {time.progress.toFixed(1)}%
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[#1a1a2e]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] transition-[width] duration-1000 ease-linear"
            style={{ width: `${time.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
