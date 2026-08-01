"use client";

import { cn } from "@/lib/utils";

interface HaProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  showGlow?: boolean;
}

export function HaProgressBar({
  value,
  max = 100,
  color = "#8b5cf6",
  className,
  showGlow = true,
}: HaProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={cn("ha-progress-track w-full", className)}>
      <div
        className="ha-progress-fill"
        style={{
          width: `${pct}%`,
          background: color,
          boxShadow: showGlow && pct > 0 ? `0 0 8px ${color}66` : undefined,
        }}
      />
    </div>
  );
}
