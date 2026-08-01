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
  const gradientId = `sparkline-${color.replace("#", "")}`;

  const points = values.map((v, i) => {
    const x = padX + (values.length <= 1 ? innerW / 2 : (i / (values.length - 1)) * innerW);
    const y = padY + innerH - (v / max) * innerH;
    return `${x},${y}`;
  });

  const linePoints = points.join(" ");
  const areaPoints =
    values.length > 0
      ? `${padX},${padY + innerH} ${linePoints} ${padX + innerW},${padY + innerH}`
      : "";

  const hasData = values.some((v) => v > 0);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 opacity-90"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {hasData ? (
        <>
          <polygon points={areaPoints} fill={`url(#${gradientId})`} />
          <polyline
            points={linePoints}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <line
          x1={padX}
          y1={height / 2}
          x2={width - padX}
          y2={height / 2}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
