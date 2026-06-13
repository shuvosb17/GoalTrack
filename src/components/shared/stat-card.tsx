"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn("glass-card gradient-border group relative overflow-hidden p-5", className)}
    >
      {gradient && (
        <div
          className="absolute inset-0 opacity-[0.06] transition-opacity group-hover:opacity-[0.1]"
          style={{ background: gradient }}
        />
      )}
      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            {Icon && <Icon className="h-4 w-4 shrink-0 opacity-70" stroke={1.5} />}
            {title}
          </span>
        </div>
        <div
          className={cn("metric-value text-3xl tabular-nums", valueClassName)}
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </div>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
