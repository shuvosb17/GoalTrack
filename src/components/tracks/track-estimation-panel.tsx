"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Target, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/shared/circular-progress";
import { TrackEstimationChart } from "@/components/tracks/track-estimation-chart";
import {
  useTracks, useAllModules, useAllTopics, useAllSubtopics, useSessions, useTrackEstimates,
} from "@/hooks/use-data";
import {
  buildAllTrackEstimations,
  ensureTrackEstimates,
  upsertTrackEstimate,
  TRACK_ESTIMATE_MONTH_OPTIONS,
  PACE_STATUS_LABELS,
  PACE_STATUS_COLORS,
} from "@/lib/track-estimation";
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

  return (
    <section className="space-y-5">
      <div
        className={cn(
          "grid gap-5",
          isSingleTrackView
            ? "grid-cols-1 max-w-2xl"
            : "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
        )}
      >
        {visible.map((s, i) => (
          <motion.div
            key={s.track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent"
          >
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${s.track.color}50 0%, transparent 55%)` }}
            />
            <div className="relative p-4 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.track.icon}</span>
                    <h3 className="font-semibold truncate text-sm">{s.track.name}</h3>
                  </div>
                  <Badge
                    variant="outline"
                    className="mt-2 text-[10px]"
                    style={{ borderColor: `${PACE_STATUS_COLORS[s.paceStatus]}55`, color: PACE_STATUS_COLORS[s.paceStatus] }}
                  >
                    {PACE_STATUS_LABELS[s.paceStatus]}
                  </Badge>
                </div>
                <CircularProgress
                  value={s.successProbability}
                  size={64}
                  strokeWidth={5}
                  color={s.track.color}
                  sublabel="odds"
                />
              </div>

              <TrackEstimationChart data={s.chartData} color={s.track.color} />

              <div className="flex flex-wrap gap-1">
                {TRACK_ESTIMATE_MONTH_OPTIONS.map((m) => (
                  <Button
                    key={m}
                    type="button"
                    size="sm"
                    variant={s.targetMonths === m ? "default" : "outline"}
                    className="h-7 px-2 text-[10px]"
                    onClick={() => handleMonths(s.track.id, m)}
                  >
                    {m}mo
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-secondary/40 py-2 px-1">
                  <p className="text-lg font-bold" style={{ color: s.track.color }}>{s.currentProgress}%</p>
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                    <Target className="h-3 w-3" /> Now
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/40 py-2 px-1">
                  <p className="text-lg font-bold">{s.projectedProgressAtDeadline}%</p>
                  <p className="text-[10px] text-muted-foreground">By deadline</p>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 shrink-0" />
                  Due {format(parseISO(s.endDate), "MMM d, yyyy")}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 shrink-0" />
                  {s.hoursPerWeek.toFixed(1)}h/wk · Est. {s.projectedCompletionDate}
                </p>
              </div>

              <p className="text-xs leading-relaxed rounded-lg bg-secondary/30 border border-border/40 p-2.5 text-muted-foreground">
                {s.insight}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
