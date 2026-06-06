"use client";

import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/types";

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  tip: Lightbulb,
};

const colorMap = {
  info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  tip: "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Lightbulb className="h-4 w-4" /> Smart Insights
      </h3>
      {insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">Start learning to unlock personalized insights.</p>
      ) : (
        insights.slice(0, 5).map((insight, i) => {
          const Icon = iconMap[insight.type];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn("flex items-start gap-3 p-3 rounded-lg border text-sm", colorMap[insight.type])}
            >
              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
              <p>{insight.message}</p>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
