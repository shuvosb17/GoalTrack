import type { GoalMilestoneStats, GoalPaceStatus } from "./types";
import { getGoalRisk, projectGoalFinish } from "./goal-milestones";

export type GoalFilter = "all" | GoalPaceStatus;
export type GoalSort =
  | "most_behind"
  | "most_ahead"
  | "progress_desc"
  | "progress_asc"
  | "deadline";

export const GOAL_FILTER_LABELS: Record<GoalFilter, string> = {
  all: "All Goals",
  ahead: "Ahead of pace",
  on_track: "On track",
  behind: "Behind pace",
  completed: "Completed",
  overdue: "Overdue",
};

export const GOAL_SORT_LABELS: Record<GoalSort, string> = {
  most_behind: "Most Behind",
  most_ahead: "Most Ahead",
  progress_desc: "Highest Progress",
  progress_asc: "Lowest Progress",
  deadline: "Nearest Deadline",
};

export const PACE_PILL_LABELS: Record<GoalPaceStatus, string> = {
  ahead: "Ahead of pace",
  on_track: "On track",
  behind: "Behind pace",
  completed: "Completed",
  overdue: "Overdue",
};

export const PACE_PILL_COLORS: Record<GoalPaceStatus, string> = {
  ahead: "#22c55e",
  on_track: "#eab308",
  behind: "#ef4444",
  completed: "#22c55e",
  overdue: "#ef4444",
};

export function getRiskPillLabel(stats: GoalMilestoneStats): string {
  if (stats.paceStatus === "completed") return "Completed";
  if (stats.paceStatus === "overdue") return "Overdue";
  const risk = getGoalRisk(stats);
  if (risk === "critical") return "Critical";
  if (risk === "at_risk") return "Watch";
  return "Healthy";
}

export function getRiskPillColor(stats: GoalMilestoneStats): string {
  if (stats.paceStatus === "completed") return "#22c55e";
  if (stats.paceStatus === "overdue") return "#ef4444";
  const risk = getGoalRisk(stats);
  if (risk === "critical") return "#ef4444";
  if (risk === "at_risk") return "#eab308";
  return "#22c55e";
}

export function getCardAccentColor(stats: GoalMilestoneStats): string {
  if (stats.paceStatus === "completed") return "#22c55e";
  if (stats.paceStatus === "overdue") return "#ef4444";
  if (stats.paceStatus === "behind") return "#ef4444";
  if (stats.paceStatus === "on_track") return "#eab308";
  return "#22c55e";
}

export function filterGoalStats(
  stats: GoalMilestoneStats[],
  filter: GoalFilter
): GoalMilestoneStats[] {
  if (filter === "all") return stats;
  return stats.filter((s) => s.paceStatus === filter);
}

export function sortGoalStats(
  stats: GoalMilestoneStats[],
  sort: GoalSort
): GoalMilestoneStats[] {
  const list = [...stats];
  switch (sort) {
    case "most_behind":
      return list.sort((a, b) => a.paceDelta - b.paceDelta);
    case "most_ahead":
      return list.sort((a, b) => b.paceDelta - a.paceDelta);
    case "progress_desc":
      return list.sort((a, b) => b.currentProgress - a.currentProgress);
    case "progress_asc":
      return list.sort((a, b) => a.currentProgress - b.currentProgress);
    case "deadline":
      return list.sort(
        (a, b) =>
          new Date(a.goal.endDate).getTime() - new Date(b.goal.endDate).getTime()
      );
    default:
      return list;
  }
}

export interface GoalInsight {
  id: string;
  text: string;
}

export function buildGoalInsights(stats: GoalMilestoneStats[]): GoalInsight[] {
  const insights: GoalInsight[] = [];
  const behind = stats.filter((s) => s.paceStatus === "behind");
  const atRisk = stats.filter((s) => {
    const risk = getGoalRisk(s);
    return risk === "at_risk" || risk === "critical";
  });

  if (behind.length > 0) {
    insights.push({
      id: "behind-count",
      text: `${behind.length} goal${behind.length === 1 ? "" : "s"} ${behind.length === 1 ? "is" : "are"} behind pace — review your schedule.`,
    });
  }

  if (behind.length > 0) {
    const worst = [...behind].sort((a, b) => a.paceDelta - b.paceDelta)[0];
    insights.push({
      id: "worst-behind",
      text: `${worst.trackIcon} ${worst.goal.title} is the furthest behind at ${worst.paceDelta}% vs expected.`,
    });
  }

  if (atRisk.length > 0 && behind.length === 0) {
    insights.push({
      id: "at-risk",
      text: `${atRisk.length} goal${atRisk.length === 1 ? "" : "s"} need attention before deadlines slip.`,
    });
  }

  const noProjection = stats.filter((s) => {
    if (s.paceStatus === "completed") return false;
    return !projectGoalFinish(s).projectedDate && s.progressGained <= 0;
  });
  if (noProjection.length > 0) {
    insights.push({
      id: "no-velocity",
      text: `${noProjection.length} active goal${noProjection.length === 1 ? "" : "s"} have no progress velocity yet — log study time to unlock projections.`,
    });
  }

  return insights;
}

export function buildDashboardSummary(stats: GoalMilestoneStats[]) {
  const active = stats.filter(
    (s) => s.paceStatus !== "completed" && s.paceStatus !== "overdue"
  );
  const ahead = stats.filter(
    (s) => s.paceStatus === "ahead" || s.paceStatus === "completed"
  ).length;
  const atRisk = stats.filter((s) => {
    const risk = getGoalRisk(s);
    return risk === "at_risk" || risk === "critical";
  }).length;
  const avgProgress = stats.length
    ? Math.round(stats.reduce((sum, s) => sum + s.currentProgress, 0) / stats.length)
    : 0;

  return { active: active.length, ahead, atRisk, avgProgress, total: stats.length };
}

export function needsAttentionGoals(stats: GoalMilestoneStats[]): GoalMilestoneStats[] {
  return stats.filter((s) => {
    if (s.paceStatus === "completed") return false;
    const risk = getGoalRisk(s);
    return risk === "at_risk" || risk === "critical" || s.paceStatus === "behind";
  });
}

export function formatProjectionLine(stats: GoalMilestoneStats): string {
  const projection = projectGoalFinish(stats);
  if (projection.daysToFinish === 0) return "Goal reached";
  if (!projection.projectedDate) return "Projection unavailable — need more progress data";
  const dateLabel = new Date(projection.projectedDate + "T12:00:00").toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );
  if (projection.daysEarlyOrLate === null) return `Est. finish ${dateLabel}`;
  if (projection.daysEarlyOrLate > 0) {
    return `Est. finish ${dateLabel} • ${projection.daysEarlyOrLate}d ahead`;
  }
  if (projection.daysEarlyOrLate === 0) return `Est. finish ${dateLabel} • on deadline`;
  return `Est. finish ${dateLabel} • ${Math.abs(projection.daysEarlyOrLate)}d late`;
}
