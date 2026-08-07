import type { Bs23ReadinessReport } from "./readiness";
import type { Bs23CompetencyScore } from "./readiness";

export interface Bs23PlanItem {
  id: string;
  stageId: string;
  competencyId: string;
  title: string;
  action: string;
  hours: number;
  priority: number;
}

export interface Bs23WeeklyPlan {
  capacityHours: number;
  plannedHours: number;
  items: Bs23PlanItem[];
  cutList: string[];
}

const DRILL_ACTIONS: Record<string, string> = {
  oop_pillars: "Take CS OOP quiz + 20 output-tracing problems on paper",
  dbms_sql_joins: "Hand-write 10 JOIN queries without IDE",
  ds_algo_theory: "Timed MCQ mock (45 min) — score and log it",
  arrays_strings: "Solve 2 medium array problems on paper, explain complexity aloud",
  linked_lists: "Reverse + cycle detection on paper under 25 min",
  trees_graphs: "BFS/DFS template — 2 problems, no autocomplete",
  paper_solving: "Full written-style problem: pseudocode only, 35 min timer",
  erd_design: "Design e-ticketing ERD on paper in 30 min",
  star_stories: "Record one STAR answer; listen for filler words",
  mcq_speed: "Full-length timed MCQ mock — log score",
};

export function buildBs23WeeklyPlan(
  report: Bs23ReadinessReport,
  capacityHours: number
): Bs23WeeklyPlan {
  const items: Bs23PlanItem[] = [];
  let remaining = capacityHours;

  const candidates = [...report.weakestCompetencies].sort(
    (a, b) => priorityScore(b) - priorityScore(a)
  );

  for (const c of candidates) {
    if (remaining <= 0.5) break;
    const hours = Math.min(2.5, Math.max(1, remaining * 0.35));
    items.push({
      id: c.id,
      stageId: c.stageId,
      competencyId: c.id,
      title: c.name,
      action: DRILL_ACTIONS[c.id] ?? c.hint,
      hours: Math.round(hours * 10) / 10,
      priority: priorityScore(c),
    });
    remaining = Math.round((remaining - hours) * 10) / 10;
    if (items.length >= 6) break;
  }

  const plannedHours = Math.round(items.reduce((s, i) => s + i.hours, 0) * 10) / 10;

  const cutList: string[] = [];
  if (report.weeklyHoursActual < report.weeklyHoursRequired * 0.5) {
    cutList.push("Stop passive video watching — it does not increase readiness score");
  }
  const s4 = report.stages.find((s) => s.id === "S4");
  const s2 = report.stages.find((s) => s.id === "S2");
  if ((s2?.readiness ?? 0) < 50 && (s4?.readiness ?? 0) > 30) {
    cutList.push("Pause day-long prep until MCQ readiness exceeds 50%");
  }
  if (report.declaredStack === "go") {
    cutList.push("Go is not a BS23 stack option — pick Java, C#, or JavaScript for stack test");
  }

  return {
    capacityHours: Math.round(capacityHours * 10) / 10,
    plannedHours,
    items,
    cutList,
  };
}

function priorityScore(c: Bs23CompetencyScore): number {
  const gap = c.threshold - c.score;
  const evidencePenalty = c.evidenceCount < c.minEvidence ? 20 : 0;
  const stageBoost = c.stageId === "S2" ? 15 : c.stageId === "S3" ? 10 : 0;
  return gap * c.weight * 0.1 + evidencePenalty + stageBoost;
}
