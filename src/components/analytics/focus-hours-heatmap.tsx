"use client";

import { FOCUS_HEATMAP_DAY_INDEX, FOCUS_HEATMAP_DAYS } from "@/lib/analytics";

interface FocusHoursHeatmapProps {
  heatmap: number[][];
  maxHeat: number;
}

export function FocusHoursHeatmap({ heatmap, maxHeat }: FocusHoursHeatmapProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: "2rem repeat(24, minmax(14px, 1fr))",
          minWidth: "min(100%, 520px)",
        }}
      >
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div
            key={h}
            className="pb-0.5 text-center text-[8px] tabular-nums leading-none text-muted-foreground"
          >
            {h}
          </div>
        ))}

        {FOCUS_HEATMAP_DAYS.map((day, row) => {
          const dayIndex = FOCUS_HEATMAP_DAY_INDEX[row];
          return (
            <div key={day} className="contents">
              <div className="flex items-center justify-end pr-1.5 text-[10px] text-muted-foreground">
                {day}
              </div>
              {heatmap[dayIndex].map((val, hour) => (
                <div
                  key={`${day}-${hour}`}
                  title={`${day} ${hour}:00 — ${(val / 3600000).toFixed(1)}h`}
                  className="h-2.5 w-full rounded-[2px] ring-1 ring-inset ring-white/[0.03]"
                  style={{
                    background:
                      val > 0
                        ? `rgba(139, 92, 246, ${0.15 + (val / maxHeat) * 0.85})`
                        : "rgba(39, 39, 42, 0.85)",
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
