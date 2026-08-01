"use client";

import { IconBulb } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface AnalyticsMetricCardProps {
  title: string;
  subtitle: string;
  insight: string;
  children: React.ReactNode;
  className?: string;
}

export function AnalyticsMetricCard({
  title,
  subtitle,
  insight,
  children,
  className,
}: AnalyticsMetricCardProps) {
  return (
    <div className={cn("glass-card overflow-hidden px-6 pb-6 pt-6", className)}>
      <header>
        <h3 className="text-[15px] font-medium tracking-tight text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </header>

      <div className="mt-5">{children}</div>

      <p className="mt-5 flex items-start gap-2 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-muted-foreground">
        <IconBulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" stroke={1.5} />
        {insight}
      </p>
    </div>
  );
}

export function monoClass() {
  return "font-[family-name:var(--font-jetbrains-mono)] tabular-nums";
}
