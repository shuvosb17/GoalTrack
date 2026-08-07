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
  const coveragePct = Math.round((report.totalTopicsDone / Math.max(report.totalTopics, 1)) * 100);

  let tone: Bs23VerdictTone = "neutral";
  if (prob < 2 || report.totalTopicsDone < 5) tone = "critical";
  else if (prob < 8 || (s2?.readiness ?? 0) < 40) tone = "warning";
  else if (prob < 15) tone = "caution";

  const mcqDateLabel = report.daysToMcq > 0
    ? `${report.daysToMcq} days to MCQ (${format(parseLocalDate(report.mcqDate), "MMM d")} target)`
    : "MCQ target date has passed";

  const headline =
    prob < 1
      ? `Offer probability: under 1%. ${coveragePct}% of syllabus covered — not enough.`
      : prob < 5
        ? `Offer probability: ~${prob.toFixed(1)}%. ${mcqDateLabel}.`
        : `Offer probability: ~${prob.toFixed(1)}%. ${mcqDateLabel}. Stage 2 readiness: ${s2?.readiness ?? 0}%.`;

  const subheadline =
    report.totalTopicsDone === 0
      ? `${report.weeksToMcq.toFixed(0)} weeks to MCQ. Zero topics ticked. Start with the first item in the checklist below.`
      : `${report.totalTopicsDone}/${report.totalTopics} topics done (${coveragePct}%) · ${report.weeklyHoursActual}h/wk actual vs ${report.weeklyHoursRequired}h/wk required`;

  const nextTopic = report.nextTopics[0];
  let dragCause: string;
  let correction: string;

  if (s1 && s1.readiness < s1.threshold) {
    dragCause = `Stage 1 (CV) at ${s1.readiness}% — ${s1.coverage}% syllabus coverage.`;
    correction = nextTopic
      ? `Next topic: "${nextTopic.title}" — ${nextTopic.detail}`
      : "Finish resume + 2 deployed projects before opening another LeetCode problem.";
  } else if (nextTopic) {
    const w = report.weakestCompetencies[0];
    dragCause = w
      ? `${w.name} at ${w.coverage}% coverage (${w.topicsDone}/${w.topicsTotal} topics).`
      : `Syllabus ${coveragePct}% complete — keep ticking topics in order.`;
    correction = `Next topic: "${nextTopic.title}" — ${nextTopic.detail}`;
  } else if (hoursGap > 5) {
    dragCause = `You are ${hoursGap.toFixed(1)}h/week short of the pace required for December MCQ.`;
    correction = `Book ${Math.round((report.weeklyHoursRequired / 5) * 10) / 10}h/day, 5 days/week, starting today.`;
  } else {
    dragCause = "Syllabus nearly complete — drills and mocks are the remaining risk.";
    correction = "Log one timed drill every day. Proof bonus decays without practice.";
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
