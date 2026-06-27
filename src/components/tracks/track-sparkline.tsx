"use client";

interface TrackSparklineProps {
  values: number[];
  color: string;
  width?: number;
  height?: number;
}

export function TrackSparkline({
  values,
  color,
  width = 70,
  height = 24,
}: TrackSparklineProps) {
  const max = Math.max(...values, 0.001);
  const padX = 2;
  const padY = 2;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = values.map((v, i) => {
    const x = padX + (values.length <= 1 ? innerW / 2 : (i / (values.length - 1)) * innerW);
    const y = padY + innerH - (v / max) * innerH;
    return `${x},${y}`;
  });

  const linePoints = points.join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
      aria-hidden
    >
      {values.some((v) => v > 0) ? (
        <polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <line
          x1={padX}
          y1={height / 2}
          x2={width - padX}
          y2={height / 2}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
