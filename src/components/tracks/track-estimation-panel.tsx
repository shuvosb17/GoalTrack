"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  useTracks, useAllModules, useAllTopics, useAllSubtopics, useSessions, useTrackEstimates,
} from "@/hooks/use-data";
import {
  buildAllTrackEstimations,
  ensureTrackEstimates,
  upsertTrackEstimate,
} from "@/lib/track-estimation";
import { TrackProgressWidget } from "@/components/tracks/track-progress-widget";
import { cn } from "@/lib/utils";

interface TrackEstimationPanelProps {
  filterTrackId?: string;
  /** Omit a track from the all-tracks overview (e.g. LeetCode uses its own panel). */
  excludeTrackId?: string;
}

export function TrackEstimationPanel({ filterTrackId, excludeTrackId }: TrackEstimationPanelProps) {
  const tracks = useTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const subtopics = useAllSubtopics();
  const sessions = useSessions();
  const estimates = useTrackEstimates();
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);

  useEffect(() => {
    if (tracks.length > 0) ensureTrackEstimates(tracks);
  }, [tracks]);

  const stats = useMemo(
    () => buildAllTrackEstimations(tracks, estimates, modules, topics, subtopics, sessions),
    [tracks, estimates, modules, topics, subtopics, sessions]
  );

  const visible = useMemo(() => {
    let list = filterTrackId ? stats.filter((s) => s.track.id === filterTrackId) : stats;
    if (!filterTrackId && excludeTrackId) {
      list = list.filter((s) => s.track.id !== excludeTrackId);
    }
    return list;
  }, [stats, filterTrackId, excludeTrackId]);
  const isSingleTrackView = visible.length === 1;

  useEffect(() => {
    if (isSingleTrackView) setExpandedTrackId(null);
  }, [isSingleTrackView]);

  const handleMonths = async (trackId: string, months: number) => {
    await upsertTrackEstimate(trackId, months);
  };

  if (visible.length === 0) return null;

  if (isSingleTrackView) {
    return (
      <section className="w-full space-y-4">
        <TrackProgressWidget
          stats={visible[0]}
          variant="full"
          onMonthsChange={(months) => void handleMonths(visible[0].track.id, months)}
        />
      </section>
    );
  }

  return (
    <section className="w-full space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-[var(--color-text-primary)]">Track progress</h2>
          <p className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
            Overview of all tracks — expand one for the full chart and planner
          </p>
        </div>
        <p className="text-[12px] tabular-nums text-[var(--color-text-muted)]">
          {visible.length} tracks
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-2">
        {visible.map((s, i) => {
          const expanded = expandedTrackId === s.track.id;
          return (
            <motion.div
              key={s.track.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn("min-w-0 w-full", expanded && "xl:col-span-2")}
            >
              <TrackProgressWidget
                stats={s}
                variant={expanded ? "full" : "compact"}
                expanded={expanded}
                onToggleExpand={() =>
                  setExpandedTrackId((prev) => (prev === s.track.id ? null : s.track.id))
                }
                onMonthsChange={(months) => void handleMonths(s.track.id, months)}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
