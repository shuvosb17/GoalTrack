"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";
import type { TrackEstimationPoint } from "@/lib/types";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const PURPLE = "#534AB7";
const GRID = "rgba(255,255,255,0.06)";
const MUTED = "#71717a";

interface TrackProgressChartProps {
  data: TrackEstimationPoint[];
  trackName: string;
}

function buildPaceSeries(points: TrackEstimationPoint[]): (number | null)[] {
  let lastActual: number | null = null;
  return points.map((p) => {
    if (p.actual !== undefined) {
      lastActual = p.actual;
      return p.actual;
    }
    if (p.projected !== undefined) {
      return p.projected;
    }
    return lastActual;
  });
}

export function TrackProgressChart({ data, trackName }: TrackProgressChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const labels = data.map((d) => d.label);
  const ariaSummary = data.length
    ? `${trackName} progress chart from ${labels[0]} to ${labels[labels.length - 1]}`
    : `${trackName} progress chart`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    chartRef.current?.destroy();

    const chartLabels = data.map((d) => d.label);
    const pace = buildPaceSeries(data);
    const plan = data.map((d) => d.target);

    chartRef.current = new Chart(canvas, {
      type: "line",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Your pace",
            data: pace,
            borderColor: PURPLE,
            backgroundColor: "rgba(83, 74, 183, 0.1)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 4,
            spanGaps: true,
          },
          {
            label: "Expected plan",
            data: plan,
            borderColor: MUTED,
            backgroundColor: "transparent",
            borderWidth: 1.5,
            borderDash: [5, 4],
            tension: 0.4,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#18181b",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            titleColor: "#fafafa",
            bodyColor: "#a1a1aa",
            padding: 10,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y ?? 0}%`,
            },
          },
        },
        scales: {
          x: { display: false },
          y: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              color: MUTED,
              font: { size: 10 },
              callback: (v) => `${v}%`,
            },
            grid: { color: GRID },
            border: { display: false },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, trackName]);

  return (
    <div>
      <div
        className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2"
        aria-hidden="true"
      >
        <span className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
          <span className="inline-block h-[2px] w-[18px] rounded-full bg-[#534AB7]" />
          Your pace
        </span>
        <span className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
          <span
            className="inline-block h-[2px] w-[18px] rounded-full"
            style={{
              background: `repeating-linear-gradient(90deg, ${MUTED} 0 4px, transparent 4px 8px)`,
            }}
          />
          Expected plan
        </span>
      </div>
      <div className="relative h-[180px] w-full">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={ariaSummary}
        />
      </div>
      <div
        className="mt-2 flex justify-between px-1 text-[11px] text-[var(--color-text-muted)]"
        aria-hidden="true"
      >
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
