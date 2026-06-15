"use client";

import { FOCUS_HEATMAP_DAY_INDEX, FOCUS_HEATMAP_DAYS } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface FocusHoursHeatmapProps {
  heatmap: number[][];
  maxHeat: number;
}

export function FocusHoursHeatmap({ heatmap, maxHeat }: FocusHoursHeatmapProps) {
  return (
    <div className="w-full">
      <div
        className="grid w-full gap-1"
        style={{ gridTemplateColumns: "2.75rem repeat(24, minmax(0, 1fr))" }}
      >
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div
            key={h}
            className="flex items-end justify-center pb-0.5 text-[9px] tabular-nums text-muted-foreground sm:text-[10px]"
          >
            {h % 3 === 0 ? h : ""}
          </div>
        ))}

        {FOCUS_HEATMAP_DAYS.map((day, row) => {
          const dayIndex = FOCUS_HEATMAP_DAY_INDEX[row];
          return (
            <div key={day} className="contents">
              <div className="flex items-center justify-end pr-2 text-[10px] font-medium text-muted-foreground sm:text-xs">
                {day}
              </div>
              {heatmap[dayIndex].map((val, hour) => (
                <div
                  key={`${day}-${hour}`}
                  title={`${day} ${hour}:00 — ${(val / 3600000).toFixed(1)}h`}
                  className={cn(
                    "aspect-square w-full min-h-[12px] rounded-[3px] ring-1 ring-inset ring-white/[0.04] transition-transform hover:scale-110 sm:min-h-[16px] sm:rounded-sm",
                    val > 0 && "cursor-default"
                  )}
                  style={{
                    background:
                      val > 0
                        ? `rgba(139, 92, 246, ${0.12 + (val / maxHeat) * 0.88})`
                        : "rgba(39, 39, 42, 0.9)",
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
