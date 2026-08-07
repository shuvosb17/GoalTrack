import { format } from "date-fns";
import type { Bs23ReadinessReport } from "./readiness";
import { parseLocalDate } from "../utils";

export type Bs23VerdictTone = "critical" | "warning" | "neutral" | "caution";

export interface Bs23Verdict {
  tone: Bs23VerdictTone;
  headline: string;
  subheadline: string;
  dragCause: string;
  correction: string;
  probabilityLabel: string;
  hoursGap: number;
}

export function buildBs23Verdict(report: Bs23ReadinessReport): Bs23Verdict {
  const s1 = report.stages.find((s) => s.id === "S1");
  const s2 = report.stages.find((s) => s.id === "S2");
  const prob = report.overallOfferProbability;
  const hoursGap = Math.max(0, report.weeklyHoursRequired - report.weeklyHoursActual);

  let tone: Bs23VerdictTone = "neutral";
  if (prob < 2 || report.totalDrillsLogged < 3) tone = "critical";
  else if (prob < 8 || (s2?.readiness ?? 0) < 40) tone = "warning";
  else if (prob < 15) tone = "caution";

  const mcqDateLabel = report.daysToMcq > 0
    ? `${report.daysToMcq} days to MCQ (${format(parseLocalDate(report.mcqDate), "MMM d")} target)`
    : "MCQ target date has passed";

  const headline =
    prob < 1
      ? `Offer probability: under 1%. You are not preparing — you are hoping.`
      : prob < 5
        ? `Offer probability: ~${prob.toFixed(1)}%. ${mcqDateLabel}.`
        : `Offer probability: ~${prob.toFixed(1)}%. ${mcqDateLabel}. Stage 2 readiness: ${s2?.readiness ?? 0}%.`;

  const subheadline =
    report.totalDrillsLogged === 0
      ? `${report.weeksToMcq.toFixed(0)} weeks to MCQ. Zero drills logged. Reading without evidence scores zero.`
      : `${report.totalDrillsLogged} drills logged · ${report.weeklyHoursActual}h/wk actual vs ${report.weeklyHoursRequired}h/wk required`;

  let dragCause: string;
  let correction: string;

  if (s1 && s1.readiness < s1.threshold) {
    dragCause = `Stage 1 (CV) at ${s1.readiness}% — you may not survive shortlisting.`;
    correction = "Finish resume + 2 deployed projects before opening another LeetCode problem.";
  } else if (report.weakestCompetencies[0]) {
    const w = report.weakestCompetencies[0];
    dragCause = `${w.name} is at ${w.score}% (need ${w.threshold}%). ${w.evidenceCount}/${w.minEvidence} evidence logged.`;
    correction = w.hint;
  } else if (hoursGap > 5) {
    dragCause = `You are ${hoursGap.toFixed(1)}h/week short of the pace required for December MCQ.`;
    correction = `Book ${Math.round((report.weeklyHoursRequired / 5) * 10) / 10}h/day, 5 days/week, starting today.`;
  } else {
    dragCause = "No single catastrophic gap — consistency is the risk.";
    correction = "Log one timed drill every day. Decay erases idle weeks.";
  }

  return {
    tone,
    headline,
    subheadline,
    dragCause,
    correction,
    probabilityLabel: `${prob.toFixed(1)}%`,
    hoursGap: Math.round(hoursGap * 10) / 10,
  };
}

export function verdictAccent(tone: Bs23VerdictTone): string {
  switch (tone) {
    case "critical":
      return "#ef4444";
    case "warning":
      return "#f97316";
    case "caution":
      return "#eab308";
    default:
      return "#8b5cf6";
  }
}
