"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGoalMilestones, useTracks, useAllModules, useAllTopics, useAllSubtopics,
} from "@/hooks/use-data";
import { buildAllGoalStats, buildPaceQuadrantData, deleteGoalMilestone } from "@/lib/goal-milestones";
import {
  buildDashboardSummary,
  buildGoalInsights,
  countByLifecycle,
  filterByLifecycle,
  needsAttentionGoals,
  sortGoalStats,
  GOAL_LIFECYCLE_TABS,
  type GoalLifecycleTab,
  type GoalSort,
} from "@/lib/goal-dashboard";
import { PaceMapChart } from "@/components/milestones/pace-map-chart";
import { GoalMilestoneCard } from "@/components/milestones/goal-milestone-card";
import { GoalMilestoneDialog } from "@/components/milestones/goal-milestone-dialog";
import { GoalDetailDialog } from "@/components/milestones/goal-detail-dialog";
import { GoalSummaryStats } from "@/components/milestones/goal-summary-stats";
import { GoalSmartInsights } from "@/components/milestones/goal-smart-insights";
import { GoalNeedsAttention } from "@/components/milestones/goal-needs-attention";
import { GoalFilterBar } from "@/components/milestones/goal-filter-bar";
import { SuggestedMilestones } from "@/components/milestones/suggested-milestones";
import type { GoalMilestone } from "@/lib/types";

export default function MilestonesPage() {
  const goals = useGoalMilestones();
  const tracks = useTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const subtopics = useAllSubtopics();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<GoalMilestone | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<GoalLifecycleTab>("ongoing");
  const [sort, setSort] = useState<GoalSort>("most_behind");

  const stats = useMemo(
    () => buildAllGoalStats(goals, tracks, modules, topics, subtopics),
    [goals, tracks, modules, topics, subtopics]
  );

  const quadrantPoints = useMemo(() => buildPaceQuadrantData(stats), [stats]);
  const summary = useMemo(() => buildDashboardSummary(stats), [stats]);
  const insights = useMemo(() => buildGoalInsights(stats), [stats]);
  const attention = useMemo(() => needsAttentionGoals(stats), [stats]);
  const lifecycleCounts = useMemo(() => countByLifecycle(stats), [stats]);

  const displayedGoals = useMemo(
    () => sortGoalStats(filterByLifecycle(stats, filter), sort),
    [stats, filter, sort]
  );

  const selectedStats = stats.find((s) => s.goal.id === selectedId) ?? null;
  const activeTabLabel =
    GOAL_LIFECYCLE_TABS.find((t) => t.id === filter)?.label ?? "Goals";

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openDetail = (id: string) => {
    setSelectedId(id);
    setDetailOpen(true);
  };

  const openEdit = (goal: GoalMilestone) => {
    setEditing(goal);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete goal "${title}"?`)) return;
    await deleteGoalMilestone(id);
    setDetailOpen(false);
    setSelectedId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live tracking
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-[28px]">
            Goal Milestones
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">
            Track whether every goal is on pace against its planned timeline — recalculated
            the moment anything changes.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-10 gap-2 border-0 bg-violet-600 px-4 shadow-none hover:bg-violet-500"
        >
          <Plus className="h-4 w-4" /> Add Goal
        </Button>
      </div>

      <GoalSmartInsights insights={insights} />

      <GoalSummaryStats
        active={summary.active}
        ahead={summary.ahead}
        atRisk={summary.atRisk}
        avgProgress={summary.avgProgress}
      />

      <PaceMapChart
        points={quadrantPoints}
        onGoalClick={(id) => openDetail(id)}
      />

      <GoalNeedsAttention goals={attention} onOpen={openDetail} />

      <GoalFilterBar
        lifecycleTab={filter}
        sort={sort}
        counts={lifecycleCounts}
        onLifecycleChange={setFilter}
        onSortChange={setSort}
        shownCount={displayedGoals.length}
      />

      <div>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-medium text-foreground">{activeTabLabel} Goals</h2>
          <span className="text-xs text-muted-foreground">{displayedGoals.length} shown</span>
        </div>

        {displayedGoals.length === 0 ? (
          <div className="space-y-4">
            <SuggestedMilestones tracks={tracks} modules={modules} topics={topics} subtopics={subtopics} />
            <Card className="border border-dashed border-white/[0.08] bg-transparent">
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-sm text-muted-foreground">
                  No goals match this view. Create one to start your next learning sprint.
                </p>
                <Button onClick={openCreate} className="gap-2">
                  <Plus className="h-4 w-4" /> Create your first goal
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {displayedGoals.map((s) => (
              <GoalMilestoneCard
                key={s.goal.id}
                stats={s}
                onOpen={() => openDetail(s.goal.id)}
              />
            ))}
          </div>
        )}
      </div>

      <GoalDetailDialog
        stats={selectedStats}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={() => selectedStats && openEdit(selectedStats.goal)}
        onDelete={() =>
          selectedStats && handleDelete(selectedStats.goal.id, selectedStats.goal.title)
        }
      />

      <GoalMilestoneDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tracks={tracks}
        modules={modules}
        topics={topics}
        subtopics={subtopics}
        editing={editing}
      />
    </div>
  );
}
