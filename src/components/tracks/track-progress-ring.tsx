"use client";

const R = 18;
const C = 2 * Math.PI * R;

interface TrackProgressRingProps {
  percentage: number;
  accentColor: string;
  size?: number;
}

export function TrackProgressRing({
  percentage,
  accentColor,
  size = 48,
}: TrackProgressRingProps) {
  const pct = Math.min(100, Math.max(0, percentage));
  const offset = C * (1 - pct / 100);
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle
        cx={center}
        cy={center}
        r={R}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={4}
      />
      <circle
        cx={center}
        cy={center}
        r={R}
        fill="none"
        stroke={accentColor}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={11}
        fontFamily="var(--font-jetbrains-mono, ui-monospace, monospace)"
        fontWeight={500}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

export function JustStartedBadge({ accentColor }: { accentColor: string }) {
  return (
    <span
      className="inline-flex h-12 shrink-0 items-center rounded-full px-3 text-[11px] font-medium"
      style={{
        color: accentColor,
        backgroundColor: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${accentColor} 28%, transparent)`,
      }}
    >
      Just started
    </span>
  );
}
