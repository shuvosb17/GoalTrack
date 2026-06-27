import type { UrgencyAlert } from "./types";
import { getDaysUntilDue } from "./in-progress";

export type AlertSeverity = "low" | "medium" | "high";

export const SEVERITY_COLORS: Record<
  AlertSeverity,
  { text: string; bg: string; label: string }
> = {
  low: { text: "#FAC775", bg: "rgba(250,199,117,0.13)", label: "LOW" },
  medium: { text: "#D85A30", bg: "rgba(216,90,48,0.13)", label: "MEDIUM" },
  high: { text: "#E24B4A", bg: "rgba(226,75,74,0.13)", label: "HIGH" },
};

const SEVERITY_RANK: Record<AlertSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export interface EnrichedUrgencyAlert extends UrgencyAlert {
  moduleName: string;
  trackId: string;
  itemTitle: string;
  groupPath: string;
  daysRemaining: number | null;
  daysOverdue: number;
  severity: AlertSeverity;
  urgencyLabel: string;
}

export function severityFromDaysOverdue(daysOverdue: number): AlertSeverity {
  if (daysOverdue >= 4) return "high";
  if (daysOverdue >= 2) return "medium";
  return "low";
}

export function urgencyLabel(daysRemaining: number | null): string {
  if (daysRemaining === null) return "";
  if (daysRemaining < 0) {
    const days = Math.abs(daysRemaining);
    return `${days}d overdue`;
  }
  if (daysRemaining === 0) return "Due today";
  if (daysRemaining === 1) return "Due tomorrow";
  return `${daysRemaining}d left`;
}

export function enrichUrgencyAlert(
  alert: UrgencyAlert,
  moduleName: string,
  trackId: string
): EnrichedUrgencyAlert {
  const daysRemaining = getDaysUntilDue(alert.dueDate);
  const daysOverdue =
    daysRemaining !== null && daysRemaining < 0 ? Math.abs(daysRemaining) : 0;
  const itemTitle = alert.subtopicName ?? alert.topicName;
  const groupPath = alert.subtopicName
    ? `${alert.trackName} / ${moduleName} / ${alert.topicName}`
    : `${alert.trackName} / ${moduleName}`;

  return {
    ...alert,
    moduleName,
    trackId,
    itemTitle,
    groupPath,
    daysRemaining,
    daysOverdue,
    severity: severityFromDaysOverdue(daysOverdue),
    urgencyLabel: urgencyLabel(daysRemaining),
  };
}

export interface UrgencyAlertGroup {
  path: string;
  severity: AlertSeverity;
  items: EnrichedUrgencyAlert[];
}

export function groupUrgencyAlerts(alerts: EnrichedUrgencyAlert[]): UrgencyAlertGroup[] {
  const map = new Map<string, EnrichedUrgencyAlert[]>();

  for (const alert of alerts) {
    const list = map.get(alert.groupPath) ?? [];
    list.push(alert);
    map.set(alert.groupPath, list);
  }

  return Array.from(map.entries())
    .map(([path, items]) => {
      const severity = items.reduce<AlertSeverity>(
        (max, item) => (SEVERITY_RANK[item.severity] > SEVERITY_RANK[max] ? item.severity : max),
        "low"
      );
      return { path, severity, items };
    })
    .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
}
