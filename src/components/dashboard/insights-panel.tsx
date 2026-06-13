"use client";

import { motion } from "framer-motion";
import {
  IconBulb,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { renderInsightMessage } from "@/lib/insight-format";
import type { Insight } from "@/lib/types";
import type { TablerIcon } from "@tabler/icons-react";

const iconMap: Record<Insight["type"], TablerIcon> = {
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  success: IconCircleCheck,
  tip: IconBulb,
};

const styleMap: Record<Insight["type"], string> = {
  info: "border-l-blue-400 bg-blue-500/[0.04] text-blue-300/90",
  warning: "border-l-amber-400 bg-amber-500/[0.04] text-amber-300/90",
  success: "border-l-emerald-400 bg-emerald-500/[0.04] text-emerald-300/90",
  tip: "border-l-violet-400 bg-violet-500/[0.04] text-violet-300/90",
};

const iconColorMap: Record<Insight["type"], string> = {
  info: "text-blue-400",
  warning: "text-amber-400",
  success: "text-emerald-400",
  tip: "text-violet-400",
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="space-y-3">
      <h3 className="section-heading flex items-center gap-2 border-0 pb-0 text-sm text-muted-foreground">
        <IconBulb className="h-4 w-4 opacity-70" stroke={1.5} /> Smart Insights
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
              className={cn(
                "flex items-start gap-3 rounded-[10px] border-[0.5px] border-white/[0.06] border-l-2 p-3 text-sm",
                styleMap[insight.type]
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconColorMap[insight.type])} stroke={1.5} />
              <p className="leading-relaxed">{renderInsightMessage(insight.message)}</p>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
