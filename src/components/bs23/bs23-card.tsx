import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Bs23CardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  accent?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Bs23Card({
  title,
  subtitle,
  icon: Icon,
  accent = "#8b5cf6",
  action,
  children,
  className,
}: Bs23CardProps) {
  return (
    <section className={cn("glass-card overflow-hidden rounded-xl", className)}>
      <div
        className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] px-[18px] py-3.5"
        style={{ background: `linear-gradient(135deg, ${accent}14 0%, transparent 55%)` }}
      >
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon className="h-4 w-4 shrink-0" style={{ color: accent }} />
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="p-[18px]">{children}</div>
    </section>
  );
}

export function Bs23Stat({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: string;
  hint?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className="mt-1 text-lg font-medium tabular-nums text-foreground"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}
