"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MiniSparkline } from "./mini-sparkline";
import { HaProgressBar } from "./ha-progress-bar";

export type HaTileState = "default" | "active" | "warn" | "critical";

interface HaEntityTileProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: string;
  state?: HaTileState;
  sparkline?: number[];
  progress?: { value: number; max?: number; color?: string };
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
}

const STATE_CLASS: Record<HaTileState, string> = {
  default: "",
  active: "ha-entity-tile-active",
  warn: "ha-entity-tile-warn",
  critical: "ha-entity-tile-critical",
};

export function HaEntityTile({
  label,
  value,
  hint,
  icon,
  accent = "#8b5cf6",
  state = "default",
  sparkline,
  progress,
  footer,
  onClick,
  className,
}: HaEntityTileProps) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "ha-entity-tile flex h-full flex-col p-3.5 text-left",
        STATE_CLASS[state],
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {icon && <span className="shrink-0 opacity-80">{icon}</span>}
            <span className="truncate">{label}</span>
          </p>
          <p
            className="mt-1 text-xl font-medium tabular-nums leading-tight sm:text-2xl"
            style={accent ? { color: accent } : undefined}
          >
            {value}
          </p>
        </div>
        {sparkline && sparkline.length > 0 && (
          <MiniSparkline values={sparkline} color={accent} />
        )}
      </div>

      {progress != null && (
        <div className="mb-2">
          <HaProgressBar
            value={progress.value}
            max={progress.max}
            color={progress.color ?? accent}
          />
        </div>
      )}

      {hint && (
        <p className="mt-auto text-[11px] leading-snug text-muted-foreground">{hint}</p>
      )}
      {footer}
    </Tag>
  );
}
