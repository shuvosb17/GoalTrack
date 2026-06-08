"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useAchievements, useMilestones, useSessions, useAllSubtopics, useAllModules, useTracks,
} from "@/hooks/use-data";
import { checkAchievements } from "@/lib/achievements";
import { format, parseISO } from "date-fns";

export default function AchievementsPage() {
  const achievements = useAchievements();
  const milestones = useMilestones();
  const sessions = useSessions();
  const subtopics = useAllSubtopics();
  const modules = useAllModules();
  const tracks = useTracks();

  useEffect(() => {
    checkAchievements(sessions, subtopics, modules, tracks);
  }, [sessions, subtopics, modules, tracks]);

  const unlocked = achievements.filter((a) => a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:gap-3 sm:text-3xl">
          <Trophy className="h-8 w-8 text-primary" /> Achievements
        </h1>
        <p className="text-muted-foreground mt-1">
          {unlocked.length} of {achievements.length} unlocked
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unlocked.map((ach, i) => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6 text-center">
                <span className="text-4xl">{ach.icon}</span>
                <h3 className="font-semibold mt-3">{ach.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{ach.description}</p>
                {ach.unlockedAt && (
                  <Badge variant="success" className="mt-3">
                    Unlocked {format(parseISO(ach.unlockedAt), "MMM d, yyyy")}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {locked.map((ach) => (
          <Card key={ach.id} className="opacity-50">
            <CardContent className="pt-6 text-center">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className="font-semibold mt-3 text-muted-foreground">{ach.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{ach.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Milestone Timeline */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Milestone Timeline</h2>
        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Milestones will appear as you progress.</p>
        ) : (
          <div className="relative pl-8 space-y-6">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
            {milestones.map((ms, i) => (
              <motion.div
                key={ms.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <div className="absolute -left-5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                <div className="glass-card rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{ms.title}</h4>
                    <span className="text-xs text-muted-foreground">{format(parseISO(ms.date), "MMM d, yyyy")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{ms.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
