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

export function buildBs23WeeklyPlan(
  report: Bs23ReadinessReport,
  capacityHours: number
): Bs23WeeklyPlan {
  const items: Bs23PlanItem[] = [];
  let remaining = capacityHours;

  const nextTopics = report.nextTopics.slice(0, 8);
  for (const topic of nextTopics) {
    if (remaining <= 0.5) break;
    const hours = Math.min(2, Math.max(0.75, remaining * 0.25));
    items.push({
      id: topic.id,
      stageId: topic.stageId,
      competencyId: topic.competencyId,
      title: topic.title,
      action: topic.detail,
      hours: Math.round(hours * 10) / 10,
      priority: topic.tier === "core" ? 10 : 5,
    });
    remaining = Math.round((remaining - hours) * 10) / 10;
    if (items.length >= 6) break;
  }

  if (items.length < 3) {
    const candidates = [...report.weakestCompetencies].sort(
      (a, b) => priorityScore(b) - priorityScore(a)
    );
    for (const c of candidates) {
      if (remaining <= 0.5 || items.length >= 6) break;
      if (items.some((i) => i.competencyId === c.id)) continue;
      const hours = Math.min(2, Math.max(0.75, remaining * 0.25));
      items.push({
        id: c.id,
        stageId: c.stageId,
        competencyId: c.id,
        title: c.name,
        action: c.hint,
        hours: Math.round(hours * 10) / 10,
        priority: priorityScore(c),
      });
      remaining = Math.round((remaining - hours) * 10) / 10;
    }
  }

  const plannedHours = Math.round(items.reduce((s, i) => s + i.hours, 0) * 10) / 10;

  const cutList: string[] = [];
  if (report.weeklyHoursActual < report.weeklyHoursRequired * 0.5) {
    cutList.push("Stop passive video watching — tick syllabus topics instead");
  }
  const s4 = report.stages.find((s) => s.id === "S4");
  const s2 = report.stages.find((s) => s.id === "S2");
  if ((s2?.readiness ?? 0) < 50 && (s4?.readiness ?? 0) > 30) {
    cutList.push("Pause day-long topics until MCQ syllabus coverage exceeds 50%");
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
  const coveragePenalty = c.coverage < 50 ? 15 : 0;
  const stageBoost = c.stageId === "S2" ? 15 : c.stageId === "S3" ? 10 : 0;
  return gap * c.weight * 0.1 + coveragePenalty + stageBoost;
}
