"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Link2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { updateSubtopicStatus, updateTopicStatus } from "@/lib/crud";
import { getGoalScopeTopics } from "@/lib/goal-milestones";
import { getTopicProgress } from "@/lib/analytics";
import type { GoalMilestoneStats, Module, ProgressStatus, Subtopic, Topic } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS, todayISO } from "@/lib/utils";

interface GoalScopeSyncPanelProps {
  stats: GoalMilestoneStats;
  topics: Topic[];
  subtopics: Subtopic[];
  modules: Module[];
}

const ALL_STATUSES: ProgressStatus[] = ["not_started", "in_progress", "completed", "mastered"];

export function GoalScopeSyncPanel({ stats, topics, subtopics, modules }: GoalScopeSyncPanelProps) {
  const [open, setOpen] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const scopeTopics = getGoalScopeTopics(stats.goal, topics).sort((a, b) => a.order - b.order);
  const showTrackCompare = stats.scopeType !== "track" && stats.trackWideProgress !== stats.currentProgress;

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-border/40 bg-secondary/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-secondary/30 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2 min-w-0">
          <RefreshCw className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <span className="text-xs font-medium">Synced with Tracks</span>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {stats.topicsCompleted}/{stats.topicsTotal} topics
          </Badge>
          {stats.subtopicsTotal > 0 && (
            <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:inline-flex">
              {stats.subtopicsCompleted}/{stats.subtopicsTotal} items
            </Badge>
          )}
        </div>
        {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-border/30 pt-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Progress and status are read from the same data as Tracks. Update here or in Tracks — both stay in sync instantly.
          </p>

          {showTrackCompare && (
            <div className="flex items-center justify-between text-[11px] rounded-lg bg-background/50 px-3 py-2">
              <span className="text-muted-foreground">This scope</span>
              <span className="font-mono font-semibold" style={{ color: stats.trackColor }}>{stats.currentProgress}%</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">Full track</span>
              <span className="font-mono">{stats.trackWideProgress}%</span>
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {scopeTopics.map((topic) => {
              const topicSubs = subtopics
                .filter((s) => s.topicId === topic.id && !s.archived)
                .sort((a, b) => a.order - b.order);
              const topicProgress = getTopicProgress(topic, subtopics);
              const mod = modules.find((m) => m.id === topic.moduleId);
              const isExpanded = expandedTopics.has(topic.id);

              return (
                <div key={topic.id} className="rounded-lg border border-border/30 bg-background/40">
                  <div className="flex flex-wrap items-center gap-2 p-2.5">
                    {topicSubs.length > 0 && (
                      <button type="button" onClick={() => toggleTopic(topic.id)} className="shrink-0">
                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </button>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{topic.name}</p>
                      {mod && stats.scopeType !== "track" && (
                        <p className="text-[10px] text-muted-foreground truncate">{mod.name}</p>
                      )}
                    </div>
                    <span className="text-xs font-mono w-9 text-right">{topicProgress.percentage}%</span>
                    <Progress value={topicProgress.percentage} className="h-1 w-14 hidden sm:block" />
                    <Select
                      value={topic.status ?? "not_started"}
                      onValueChange={(v) => {
                        const status = v as ProgressStatus;
                        if (status === "in_progress") {
                          updateTopicStatus(topic.id, status, topic.dueDate ?? todayISO());
                        } else {
                          updateTopicStatus(topic.id, status);
                        }
                      }}
                    >
                      <SelectTrigger
                        className="h-7 w-[118px] text-[10px]"
                        style={{ color: STATUS_COLORS[topic.status ?? "not_started"] }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} style={{ color: STATUS_COLORS[s] }}>
                            {STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isExpanded && topicSubs.length > 0 && (
                    <div className="border-t border-border/20 px-2 pb-2 space-y-1">
                      {topicSubs.map((sub) => (
                        <div key={sub.id} className="flex flex-wrap items-center gap-2 py-1.5 pl-5">
                          <Select
                            value={sub.status}
                            onValueChange={(v) => updateSubtopicStatus(sub.id, v as ProgressStatus, sub.dueDate ?? todayISO())}
                          >
                            <SelectTrigger
                              className="h-7 w-[118px] text-[10px]"
                              style={{ color: STATUS_COLORS[sub.status] }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ALL_STATUSES.map((s) => (
                                <SelectItem key={s} value={s} style={{ color: STATUS_COLORS[s] }}>
                                  {STATUS_LABELS[s]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-xs flex-1 min-w-0 truncate text-muted-foreground">{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button asChild variant="outline" size="sm" className="w-full h-8 gap-1.5 text-xs">
            <Link href={`/tracks?track=${stats.goal.trackId}`}>
              <Link2 className="h-3 w-3" /> Open in Tracks
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
