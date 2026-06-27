"use client";

const SIZE = 88;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const CX = SIZE / 2;
const CY = SIZE / 2;

interface StatusDonutRingProps {
  counts: {
    completed: number;
    in_progress: number;
    mastered: number;
  };
  totalItems: number;
  startedPercent: number;
}

const SEGMENTS = [
  { key: "completed" as const, color: "#378ADD" },
  { key: "in_progress" as const, color: "#FAC775" },
  { key: "mastered" as const, color: "#7F77DD" },
];

export function StatusDonutRing({
  counts,
  totalItems,
  startedPercent,
}: StatusDonutRingProps) {
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
        />
        {totalItems > 0 &&
          SEGMENTS.map(({ key, color }) => {
            const count = counts[key];
            if (count <= 0) return null;
            const len = (count / totalItems) * C;
            const dashOffset = C * 0.25 - offset;
            offset += len;
            return (
              <circle
                key={key}
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke={color}
                strokeWidth={STROKE}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500"
              />
            );
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-medium tabular-nums text-foreground">
          {startedPercent}%
        </span>
        <span className="text-[9px] text-muted-foreground">started</span>
      </div>
    </div>
  );
}
