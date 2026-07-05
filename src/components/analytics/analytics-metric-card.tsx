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
    <div
      className={cn(
        "rounded-2xl border border-[#232329] bg-[#131316] px-7 pt-[26px] pb-6",
        className
      )}
    >
      <header>
        <h3
          className="text-[15px] font-semibold tracking-tight text-[#EDEDF0]"
          style={{ fontFamily: "var(--font-space-grotesk), ui-sans-serif, sans-serif" }}
        >
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-[#9A9AA5]">{subtitle}</p>
      </header>

      <div className="mt-5">{children}</div>

      <p className="mt-5 flex items-start gap-2 border-t border-[#232329] pt-4 text-xs leading-relaxed text-[#9A9AA5]">
        <IconBulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9C97D8]" stroke={1.5} />
        {insight}
      </p>
    </div>
  );
}

export function monoClass() {
  return "font-[family-name:var(--font-jetbrains-mono)] tabular-nums";
}
