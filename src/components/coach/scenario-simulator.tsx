"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { SlidersHorizontal } from "lucide-react";
import { CoachCard, CoachStat } from "./coach-card";
import { projectFinish, type GoCoachReport } from "@/lib/go-coach";
import { parseLocalDate } from "@/lib/utils";

interface ScenarioSimulatorProps {
  report: GoCoachReport;
  initialHoursPerDay: number;
  initialDaysPerWeek: number;
  /** Persists the simulated weekly hours so the plan card can use the same capacity. */
  onCommit: (hoursPerWeek: number) => void;
}

const PRESETS = [
  { label: "Weekend only", hoursPerDay: 4, daysPerWeek: 2 },
  { label: "Steady", hoursPerDay: 2, daysPerWeek: 5 },
  { label: "Hard push", hoursPerDay: 4, daysPerWeek: 6 },
  { label: "Full time", hoursPerDay: 6, daysPerWeek: 6 },
];

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </label>
        <span className="text-sm font-medium tabular-nums text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-violet-500"
      />
    </div>
  );
}

export function ScenarioSimulator({
  report,
  initialHoursPerDay,
  initialDaysPerWeek,
  onCommit,
}: ScenarioSimulatorProps) {
  const [hoursPerDay, setHoursPerDay] = useState(initialHoursPerDay);
  const [daysPerWeek, setDaysPerWeek] = useState(initialDaysPerWeek);

  const hoursPerWeek = Math.round(hoursPerDay * daysPerWeek * 10) / 10;

  const applyReady = useMemo(
    () => projectFinish(report.toApplyReady.hours, hoursPerWeek, new Date()),
    [report.toApplyReady.hours, hoursPerWeek]
  );
  const fullPath = useMemo(
    () => projectFinish(report.toFullPath.hours, hoursPerWeek, new Date()),
    [report.toFullPath.hours, hoursPerWeek]
  );

  const plan = report.targetPlan;
  const daysVsTarget =
    plan && applyReady.date
      ? differenceInCalendarDays(
          parseLocalDate(plan.targetDate),
          parseLocalDate(applyReady.date)
        )
      : null;

  const verdictText =
    daysVsTarget == null
      ? "Set a target apply date to see whether this scenario makes it."
      : daysVsTarget >= 0
        ? `This scenario lands ${daysVsTarget} day${daysVsTarget === 1 ? "" : "s"} before your target date.`
        : `This scenario misses your target date by ${Math.abs(daysVsTarget)} day${Math.abs(daysVsTarget) === 1 ? "" : "s"}.`;

  const verdictColor =
    daysVsTarget == null ? "#94a3b8" : daysVsTarget >= 0 ? "#22c55e" : "#ef4444";

  const deltaVsActual = Math.round((hoursPerWeek - report.recentVelocity.hoursPerWeek) * 10) / 10;

  return (
    <CoachCard
      title="Scenario simulator"
      subtitle="Move the sliders to see what a different study schedule actually buys you."
      icon={SlidersHorizontal}
      accent="#06b6d4"
      action={
        <button
          type="button"
          onClick={() => onCommit(hoursPerWeek)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] text-foreground transition-colors hover:bg-white/[0.08]"
        >
          Use {hoursPerWeek}h/wk as my plan
        </button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,18rem)_1fr]">
        <div className="space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <SliderRow
            label="Hours per study day"
            value={hoursPerDay}
            min={0.5}
            max={10}
            step={0.5}
            suffix="h"
            onChange={setHoursPerDay}
          />
          <SliderRow
            label="Study days per week"
            value={daysPerWeek}
            min={1}
            max={7}
            step={1}
            suffix=" days"
            onChange={setDaysPerWeek}
          />

          <div className="border-t border-white/[0.06] pt-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Weekly total
            </p>
            <p className="text-xl font-medium tabular-nums text-foreground">{hoursPerWeek}h</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {deltaVsActual >= 0 ? "+" : ""}
              {deltaVsActual}h vs your current 4-week average
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setHoursPerDay(preset.hoursPerDay);
                  setDaysPerWeek(preset.daysPerWeek);
                }}
                className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <CoachStat
              label="Apply-ready on"
              value={applyReady.date ? format(parseLocalDate(applyReady.date), "MMM d, yyyy") : "—"}
              hint={
                applyReady.weeks == null
                  ? "Increase the sliders above zero."
                  : `${applyReady.weeks} weeks · ${report.toApplyReady.hours}h of checklist work`
              }
              color={verdictColor}
            />
            <CoachStat
              label="Whole path done"
              value={fullPath.date ? format(parseLocalDate(fullPath.date), "MMM d, yyyy") : "—"}
              hint={
                fullPath.weeks == null
                  ? "Increase the sliders above zero."
                  : `${fullPath.weeks} weeks · ${report.toFullPath.hours}h across all 24 modules`
              }
            />
          </div>

          <div
            className="rounded-xl px-3.5 py-3 text-[13px] leading-relaxed"
            style={{
              background: `${verdictColor}12`,
              border: `0.5px solid ${verdictColor}44`,
              color: "var(--color-text-primary)",
            }}
          >
            {verdictText}
            {plan && (
              <span className="text-muted-foreground">
                {" "}
                Target is {format(parseLocalDate(plan.targetDate), "MMM d, yyyy")}, which needs{" "}
                {plan.requiredHoursPerWeek}h/week.
              </span>
            )}
          </div>
        </div>
      </div>
    </CoachCard>
  );
}
