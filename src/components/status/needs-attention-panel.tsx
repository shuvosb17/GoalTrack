"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Check, ChevronRight } from "lucide-react";
import type { Module, Subtopic, Topic, UrgencyAlert } from "@/lib/types";
import {
  enrichUrgencyAlert,
  groupUrgencyAlerts,
  SEVERITY_COLORS,
  type EnrichedUrgencyAlert,
} from "@/lib/urgency-alerts";
import { updateSubtopicStatus, updateTopicStatus } from "@/lib/crud";
import { cn } from "@/lib/utils";

interface NeedsAttentionPanelProps {
  alerts: UrgencyAlert[];
  topics: Topic[];
  modules: Module[];
  subtopics: Subtopic[];
  criticalCount: number;
  maxItems?: number;
}

function markAlertComplete(alert: EnrichedUrgencyAlert, subtopics: Subtopic[]) {
  if (alert.subtopicId) {
    const sub = subtopics.find((s) => s.id === alert.subtopicId);
    void updateSubtopicStatus(alert.subtopicId, "completed", sub?.dueDate);
  } else {
    void updateTopicStatus(alert.topicId, "completed");
  }
}

export function NeedsAttentionPanel({
  alerts,
  topics,
  modules,
  subtopics,
  criticalCount,
  maxItems = 6,
}: NeedsAttentionPanelProps) {
  if (alerts.length === 0) return null;

  const enriched = alerts.slice(0, maxItems).map((alert) => {
    const topic = topics.find((t) => t.id === alert.topicId);
    const mod = modules.find((m) => m.id === topic?.moduleId);
    return enrichUrgencyAlert(
      alert,
      mod?.name ?? "Unknown",
      topic?.trackId ?? ""
    );
  });

  const groups = groupUrgencyAlerts(enriched);

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="rounded-xl border-[0.5px] border-white/[0.08] bg-white/[0.02] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            Needs attention
          </div>
          {criticalCount > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ color: "#E24B4A", backgroundColor: "rgba(226,75,74,0.12)" }}
            >
              {criticalCount} critical
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {groups.map((group, gi) => {
            const groupColors = SEVERITY_COLORS[group.severity];
            return (
              <motion.div
                key={group.path}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: gi * 0.04 }}
                className="overflow-hidden rounded-r-xl border-l-[3px]"
                style={{
                  borderLeftColor: groupColors.text,
                  backgroundColor: "#15151a",
                }}
              >
                <div className="px-3.5 pb-2 pt-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-foreground">
                      {group.path}
                    </p>
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: groupColors.text, backgroundColor: groupColors.bg }}
                    >
                      {groupColors.label}
                    </span>
                  </div>
                  {group.items.length > 1 && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {group.items.length} items overdue
                    </p>
                  )}
                </div>

                <div>
                  {group.items.map((alert, ii) => {
                    const rowColors = SEVERITY_COLORS[alert.severity];
                    const href = `/tracks?track=${alert.trackId}&topic=${alert.topicId}`;
                    const isLast = ii === group.items.length - 1;

                    return (
                      <div
                        key={alert.id}
                        className={cn(
                          "flex items-center gap-2 px-3.5 py-2.5",
                          !isLast && "border-b border-white/[0.06]"
                        )}
                      >
                        <Link
                          href={href}
                          className="flex min-w-0 flex-1 items-center gap-2.5"
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: rowColors.text }}
                          />
                          <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                            {alert.itemTitle}
                          </span>
                        </Link>
                        <span
                          className="shrink-0 text-[11px] tabular-nums"
                          style={{ color: rowColors.text }}
                        >
                          {alert.urgencyLabel}
                        </span>
                        <button
                          type="button"
                          aria-label={`Mark ${alert.itemTitle} complete`}
                          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.02] text-muted-foreground transition-colors hover:border-white/[0.18] hover:text-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markAlertComplete(alert, subtopics);
                          }}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <Link href={href} className="shrink-0 text-muted-foreground/60 hover:text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
