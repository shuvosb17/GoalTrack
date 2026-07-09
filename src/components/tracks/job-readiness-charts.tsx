"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { JobPhaseId, JobReadinessReport } from "@/lib/job-readiness";
import { cn } from "@/lib/utils";

const PHASE_COLORS: Record<JobPhaseId, string> = {
  A: "#22c55e",
  B: "#eab308",
  C: "#3b82f6",
  D: "#94a3b8",
};

const PHASE_GLOW: Record<JobPhaseId, string> = {
  A: "rgba(34,197,94,0.45)",
  B: "rgba(234,179,8,0.45)",
  C: "rgba(59,130,246,0.45)",
  D: "rgba(148,163,184,0.35)",
};

const TOOLTIP_STYLE = {
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: 8,
  fontSize: 12,
};

interface JobReadinessChartsProps {
  report: JobReadinessReport;
}

function EmployabilityGauge({
  percent,
  readyToApply,
}: {
  percent: number;
  readyToApply: boolean;
}) {
  const size = 148;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const accent = readyToApply ? "#22c55e" : "#eab308";

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="absolute inset-2 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)` }}
        />
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={percent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-medium tabular-nums"
            style={{ color: accent }}
          >
            {percent}%
          </motion.span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Apply ready</span>
        </div>
      </div>
    </div>
  );
}

function PhaseJourneyTimeline({
  phases,
  currentPhase,
}: {
  phases: JobReadinessReport["phases"];
  currentPhase: JobPhaseId;
}) {
  const nodes = phases.filter((p) => p.id !== "D");
  const journeyProgress = Math.min(
    1,
    nodes.reduce((sum, p) => sum + p.percent, 0) / (nodes.length * 100)
  );

  return (
    <div className="relative px-2 py-4">
      <div className="absolute left-[12%] right-[12%] top-[2.15rem] h-0.5 bg-white/[0.06]" />
      <motion.div
        className="absolute left-[12%] top-[2.15rem] h-0.5 origin-left rounded-full"
        style={{
          background: `linear-gradient(90deg, ${PHASE_COLORS.A}, ${PHASE_COLORS.B}, ${PHASE_COLORS.C})`,
          width: "76%",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: journeyProgress }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <div className="relative grid grid-cols-3 gap-2">
        {nodes.map((phase) => {
          const active = phase.id === currentPhase;
          const color = PHASE_COLORS[phase.id];
          return (
            <div key={phase.id} className="flex flex-col items-center gap-2">
              <motion.div
                className={cn(
                  "relative flex h-14 w-14 items-center justify-center rounded-full border-2 bg-[#0f0f12]",
                  active && "ring-2 ring-offset-2 ring-offset-[#0f0f12]"
                )}
                style={{
                  borderColor: color,
                  boxShadow: active ? `0 0 24px ${PHASE_GLOW[phase.id]}` : undefined,
                  ...(active ? { outline: `2px solid ${color}44` } : {}),
                }}
                animate={active ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                transition={active ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : undefined}
              >
                <span className="text-lg font-semibold" style={{ color }}>
                  {phase.id}
                </span>
                <svg className="absolute inset-0 -rotate-90" width={56} height={56} aria-hidden="true">
                  <circle
                    cx={28}
                    cy={28}
                    r={24}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={3}
                  />
                  <motion.circle
                    cx={28}
                    cy={28}
                    r={24}
                    fill="none"
                    stroke={color}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 24}
                    initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - phase.percent / 100) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
              </motion.div>
              <div className="text-center">
                <p className="text-[11px] font-medium leading-tight">{phase.name}</p>
                <p className="mt-0.5 text-[10px] tabular-nums" style={{ color }}>
                  {phase.percent}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhaseBarChart({ phases }: { phases: JobReadinessReport["phases"] }) {
  const data = useMemo(
    () =>
      phases.map((p) => ({
        id: p.id,
        name: `Phase ${p.id}`,
        fullName: p.name,
        percent: p.percent,
        modules: p.modules.length,
        color: PHASE_COLORS[p.id],
      })),
    [phases]
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barCategoryGap="18%">
        <XAxis
          dataKey="name"
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#71717a", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: "#fafafa" }}
          formatter={(value, _name, props) => [
            `${value ?? 0}% · ${(props.payload as { modules: number }).modules} modules`,
            (props.payload as { fullName: string }).fullName,
          ]}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="percent" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((entry) => (
            <Cell
              key={entry.id}
              fill={entry.color}
              fillOpacity={0.85}
              stroke={entry.color}
              strokeOpacity={0.3}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChecklistProgressBars({
  checklist,
}: {
  checklist: JobReadinessReport["checklist"];
}) {
  return (
    <ul className="space-y-2.5">
      {checklist.map((item, i) => (
        <motion.li
          key={item.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className="space-y-1"
        >
          <div className="flex items-center justify-between gap-2 text-[12px]">
            <span className={cn("min-w-0 truncate", item.met ? "text-foreground" : "text-muted-foreground")}>
              {item.label}
            </span>
            <span
              className="shrink-0 tabular-nums text-[11px]"
              style={{ color: item.met ? "#86efac" : item.percent > 0 ? "#fde047" : "#71717a" }}
            >
              {item.percent}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: item.met
                  ? "linear-gradient(90deg, #22c55e, #86efac)"
                  : item.percent > 0
                    ? "linear-gradient(90deg, #ca8a04, #fde047)"
                    : "#3f3f46",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${item.percent}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
            />
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

export function JobReadinessCharts({ report }: JobReadinessChartsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,200px)_1fr]">
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-4">
          <EmployabilityGauge percent={report.employabilityPercent} readyToApply={report.readyToApply} />
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {report.checklist.filter((c) => c.met).length}/{report.checklist.length} checklist items met
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <h4 className="mb-1 text-xs font-medium text-muted-foreground">Phase progress</h4>
          <p className="mb-2 text-[10px] text-muted-foreground">Live completion across employability phases A–D</p>
          <PhaseBarChart phases={report.phases} />
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-r from-emerald-500/[0.04] via-yellow-500/[0.03] to-blue-500/[0.04] p-4">
        <h4 className="mb-1 text-xs font-medium text-muted-foreground">Career path journey</h4>
        <p className="mb-2 text-[10px] text-muted-foreground">
          Phase {report.currentPhase} active · updates as you complete subtopics
        </p>
        <PhaseJourneyTimeline phases={report.phases} currentPhase={report.currentPhase} />
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Checklist progress
        </h4>
        <ChecklistProgressBars checklist={report.checklist} />
      </div>
    </div>
  );
}
