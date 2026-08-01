"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MiniSparkline } from "./mini-sparkline";
import type { TablerIcon } from "@tabler/icons-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: React.ReactNode;
  icon?: TablerIcon;
  gradient?: string;
  className?: string;
  valueClassName?: string;
  valueColor?: string;
  delay?: number;
  /** Last N data points — renders a sparkline when provided. */
  sparkline?: number[];
  sparklineColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  className,
  valueClassName,
  valueColor,
  delay = 0,
  sparkline,
  sparklineColor,
}: StatCardProps) {
  const lineColor = sparklineColor ?? valueColor ?? "#8b5cf6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn("ha-entity-tile group relative overflow-hidden p-4", className)}
    >
      {gradient && (
        <div
          className="absolute inset-0 opacity-[0.07] transition-opacity group-hover:opacity-[0.12]"
          style={{ background: gradient }}
        />
      )}
      <div className="relative z-10">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" stroke={1.5} />}
            {title}
          </span>
          {sparkline && sparkline.length > 0 && (
            <MiniSparkline values={sparkline} color={lineColor} />
          )}
        </div>
        <div
          className={cn("metric-value text-2xl tabular-nums sm:text-3xl", valueClassName)}
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </div>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
