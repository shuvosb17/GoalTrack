"use client";

import Link from "next/link";
import { IconBulb } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Track } from "@/lib/types";

export function SuggestedMilestones({ tracks }: { tracks: Track[] }) {
  const suggestions = tracks.slice(0, 3).map((track) => ({
    track,
    title: `${track.name}: Reach next module by Sep 2026`,
    hint: track.name === "LeetCode" ? "Solve 50 problems by Sep 2026" : `Stay on pace in ${track.name}`,
  }));

  if (suggestions.length === 0) return null;

  return (
    <Card className="border-[0.5px] border-violet-500/20 bg-violet-500/[0.04]">
      <CardContent className="pt-6 space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium text-violet-300">
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
