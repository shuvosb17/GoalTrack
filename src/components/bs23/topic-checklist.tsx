"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { BS23_STAGES } from "@/lib/bs23/stages";
import { getTopicsByStage } from "@/lib/bs23/syllabus";
import { toggleBs23Topic } from "@/lib/bs23-crud";
import type { Bs23StageCoverageSummary } from "@/lib/bs23/syllabus";
import type { Bs23StageId, Bs23TopicProgress } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TopicChecklistProps {
  topicProgress: Bs23TopicProgress[];
  syllabusProgress: Bs23StageCoverageSummary[];
}

export function TopicChecklist({ topicProgress, syllabusProgress }: TopicChecklistProps) {
  const [activeStage, setActiveStage] = useState<Bs23StageId>("S2");
  const [search, setSearch] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const statusMap = useMemo(() => {
    const map = new Map<string, Bs23TopicProgress["status"]>();
    for (const row of topicProgress) {
      map.set(row.topicId, row.status);
    }
    return map;
  }, [topicProgress]);

  const nextUnfinishedCompetency = useMemo(() => {
    for (const topic of getTopicsByStage(activeStage)) {
      if (statusMap.get(topic.id) !== "done") return topic.competencyId;
    }
    return null;
  }, [activeStage, statusMap]);

  function toggleCompetency(competencyId: string) {
    setExpanded((prev) => ({ ...prev, [competencyId]: !prev[competencyId] }));
  }

  function jumpToNext() {
    const stages: Bs23StageId[] = ["S1", "S2", "S3", "S4", "S5"];
    for (const stageId of stages) {
      const topics = getTopicsByStage(stageId);
      const next = topics.find((t) => statusMap.get(t.id) !== "done");
      if (next) {
        setActiveStage(stageId);
        setExpanded((prev) => ({ ...prev, [next.competencyId]: true }));
        setTimeout(() => {
          rowRefs.current[next.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        return;
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics…"
            className="h-9 pl-9 text-[13px]"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setHideCompleted((v) => !v)}
          className={hideCompleted ? "border-violet-500/40 bg-violet-500/10" : ""}
        >
          {hideCompleted ? "Showing incomplete" : "Hide completed"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={jumpToNext}>
          Jump to next
        </Button>
      </div>

      <Tabs value={activeStage} onValueChange={(v) => setActiveStage(v as Bs23StageId)}>
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {BS23_STAGES.map((stage) => {
            const summary = syllabusProgress.find((s) => s.stageId === stage.id);
            return (
              <TabsTrigger
                key={stage.id}
                value={stage.id}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs data-[state=active]:border-violet-500/40 data-[state=active]:bg-violet-500/10"
              >
                <span className="font-medium">{stage.shortName}</span>
                <span className="ml-2 tabular-nums text-muted-foreground">
                  {summary?.coverage ?? 0}%
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {BS23_STAGES.map((stage) => {
          const stageSummary = syllabusProgress.find((s) => s.stageId === stage.id);
          const topics = getTopicsByStage(stage.id);
          const q = search.trim().toLowerCase();

          return (
            <TabsContent key={stage.id} value={stage.id} className="mt-4 space-y-3">
              <p className="text-[13px] text-muted-foreground">{stage.description}</p>

              {stage.competencies.map((comp) => {
                const compSummary = stageSummary?.competencies.find(
                  (c) => c.competencyId === comp.id
                );
                const compTopics = topics.filter((t) => {
                  if (t.competencyId !== comp.id) return false;
                  if (hideCompleted && statusMap.get(t.id) === "done") return false;
                  if (!q) return true;
                  return (
                    t.title.toLowerCase().includes(q) ||
                    t.detail.toLowerCase().includes(q)
                  );
                });
                if (compTopics.length === 0 && q) return null;

                const isOpen = expanded[comp.id] ?? comp.id === nextUnfinishedCompetency;

                return (
                  <div
                    key={comp.id}
                    className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCompetency(comp.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03]"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13px] font-medium text-foreground">{comp.name}</span>
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {compSummary?.completedTopics ?? 0}/{compSummary?.totalTopics ?? 0}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-violet-500 transition-all"
                            style={{ width: `${compSummary?.coverage ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <span className="shrink-0 text-sm tabular-nums text-foreground">
                        {compSummary?.coverage ?? 0}%
                      </span>
                    </button>

                    {isOpen && (
                      <ul className="border-t border-white/[0.06] px-2 py-2">
                        {compTopics.map((topic) => {
                          const done = statusMap.get(topic.id) === "done";
                          const isNext =
                            topic.competencyId === nextUnfinishedCompetency &&
                            statusMap.get(topic.id) !== "done" &&
                            !getTopicsByStage(activeStage).some(
                              (t) =>
                                t.competencyId === topic.competencyId &&
                                t.order < topic.order &&
                                statusMap.get(t.id) !== "done"
                            );
                          return (
                            <li key={topic.id}>
                              <div
                                ref={(el) => {
                                  rowRefs.current[topic.id] = el;
                                }}
                                className={cn(
                                  "flex items-start gap-3 rounded-lg px-2 py-2 transition-colors",
                                  isNext && "bg-violet-500/[0.08] ring-1 ring-violet-500/25",
                                  done && "opacity-70"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={done}
                                  onChange={() => toggleBs23Topic(topic.id)}
                                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-white/20 accent-violet-500"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={cn(
                                        "text-[13px] text-foreground",
                                        done && "line-through"
                                      )}
                                    >
                                      {topic.title}
                                    </span>
                                    {topic.tier === "stretch" && (
                                      <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                                        stretch
                                      </Badge>
                                    )}
                                    {isNext && (
                                      <Badge className="h-5 bg-violet-500/20 px-1.5 text-[10px] text-violet-300">
                                        next
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                    {topic.detail}
                                  </p>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                        {compTopics.length === 0 && (
                          <li className="px-2 py-3 text-[12px] text-muted-foreground">
                            No topics match your filter.
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
