"use client";

import { useEffect, useMemo } from "react";
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
}

export function TrackEstimationPanel({ filterTrackId }: TrackEstimationPanelProps) {
  const tracks = useTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const subtopics = useAllSubtopics();
  const sessions = useSessions();
  const estimates = useTrackEstimates();

  useEffect(() => {
    if (tracks.length > 0) ensureTrackEstimates(tracks);
  }, [tracks]);

  const stats = useMemo(
    () => buildAllTrackEstimations(tracks, estimates, modules, topics, subtopics, sessions),
    [tracks, estimates, modules, topics, subtopics, sessions]
  );

  const visible = filterTrackId ? stats.filter((s) => s.track.id === filterTrackId) : stats;
  const isSingleTrackView = visible.length === 1;

  const handleMonths = async (trackId: string, months: number) => {
    await upsertTrackEstimate(trackId, months);
  };

  if (visible.length === 0) return null;

  return (
    <section className="w-full space-y-5">
      <div
        className={cn(
          "grid w-full gap-5",
          isSingleTrackView ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
        )}
      >
        {visible.map((s, i) => (
          <motion.div
            key={s.track.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="min-w-0 w-full"
          >
            <TrackProgressWidget
              stats={s}
              onMonthsChange={(months) => void handleMonths(s.track.id, months)}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
