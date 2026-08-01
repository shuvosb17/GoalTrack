"use client";

import { cn } from "@/lib/utils";

export interface HaStatusItem {
  id: string;
  label: string;
  value: string | number;
  accent?: string;
}

interface HaStatusStripProps {
  items: HaStatusItem[];
  className?: string;
}

/** HA-style key-value status row — label left, value right. */
export function HaStatusStrip({ items, className }: HaStatusStripProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("ha-status-strip", className)}>
      {items.map((item) => (
        <div key={item.id} className="ha-status-row">
          <span className="text-[11px] text-muted-foreground">{item.label}</span>
          <span
            className="text-sm font-medium tabular-nums text-foreground"
            style={item.accent ? { color: item.accent } : undefined}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
