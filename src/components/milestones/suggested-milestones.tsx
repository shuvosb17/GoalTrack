"use client";

import Link from "next/link";
import { useMemo } from "react";
import { addMonths, format } from "date-fns";
import { IconBulb } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTrackProgress } from "@/lib/analytics";
import { parseLocalDate, todayISO } from "@/lib/utils";
import type { Module, Subtopic, Topic, Track } from "@/lib/types";

interface SuggestedMilestonesProps {
  tracks: Track[];
  modules: Module[];
  topics: Topic[];
  subtopics: Subtopic[];
}

function suggestDeadlineMonths(currentPct: number): number {
  const remaining = Math.max(0, 100 - currentPct);
  if (remaining <= 10) return 1;
  if (remaining <= 25) return 2;
  if (remaining <= 50) return 4;
  return 6;
}

export function SuggestedMilestones({ tracks, modules, topics, subtopics }: SuggestedMilestonesProps) {
  const suggestions = useMemo(() => {
    return tracks
      .filter((t) => !t.archived)
      .slice(0, 3)
      .map((track) => {
        const trackModules = modules.filter((m) => m.trackId === track.id && !m.archived);
        const trackTopics = topics.filter((t) => trackModules.some((m) => m.id === t.moduleId) && !t.archived);
        const pct = getTrackProgress(track.id, trackTopics, subtopics, trackModules).percentage;
        const months = suggestDeadlineMonths(pct);
        const deadline = format(addMonths(parseLocalDate(todayISO()), months), "MMM yyyy");
        const nextTarget = Math.min(100, pct + Math.max(15, Math.round((100 - pct) / 3)));

        return {
          track,
          title: `${track.name}: Reach ${nextTarget}% by ${deadline}`,
          hint: track.name === "LeetCode"
            ? `At ${pct}% now — ~${months} mo at current pace`
            : `${pct}% complete · suggested ${months}-month sprint`,
        };
      });
  }, [tracks, modules, topics, subtopics]);

  if (suggestions.length === 0) return null;

  return (
    <Card className="border-[0.5px] border-white/[0.08] bg-white/[0.02]">
      <CardContent className="pt-6 space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <IconBulb className="h-4 w-4" stroke={1.5} /> Suggested milestones
        </p>
        <div className="space-y-2">
          {suggestions.map((s) => (
            <div key={s.track.id} className="flex items-center justify-between gap-3 rounded-lg border-[0.5px] border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </div>
              <Link href="/milestones">
                <Button size="sm" variant="outline" className="shrink-0 text-xs">Add</Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
