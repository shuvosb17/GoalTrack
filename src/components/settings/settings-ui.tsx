import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Settings layout primitives — same dark tokens as the rest of GoalTrack,
 * with Telegram-like grouping (section labels + stacked panels) and
 * consistent spacing/typography.
 */
export function SettingsPageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-4xl space-y-8 pb-12", className)}>
      {children}
    </div>
  );
}

export function SettingsHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <header className="space-y-2">
      <div className="flex items-center gap-3">
        {icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function SettingsSection({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      {label ? (
        <h2 className="px-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
          {label}
        </h2>
      ) : null}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SettingsPanel({
  title,
  description,
  icon,
  children,
  action,
  className,
  bodyClassName,
}: {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn("glass-card overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-5 sm:px-6">
        <div className="flex min-w-0 items-start gap-3.5">
          {icon ? (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            {description ? (
              <div className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {description}
              </div>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn("px-5 py-5 sm:px-6", bodyClassName)}>{children}</div>
    </div>
  );
}

export function SettingsNotice({
  tone = "warning",
  icon,
  title,
  children,
}: {
  tone?: "warning" | "info" | "success";
  icon?: ReactNode;
  title: string;
  children: ReactNode;
}) {
  const shell = {
    warning: "border-amber-500/25 bg-amber-500/5",
    info: "border-primary/25 bg-primary/5",
    success: "border-emerald-500/25 bg-emerald-500/5",
  };
  const titleTone = {
    warning: "text-amber-300",
    info: "text-primary",
    success: "text-emerald-400",
  };

  return (
    <aside className={cn("rounded-xl border px-5 py-4", shell[tone])}>
      <div className="flex gap-3.5">
        {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
        <div className="min-w-0 space-y-2">
          <p className={cn("text-sm font-semibold", titleTone[tone])}>{title}</p>
          <div className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function SettingsField({
  label,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div>
        <label className="block text-sm font-medium text-foreground/90">{label}</label>
        {hint ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** @deprecated Prefer SettingsField */
export function SettingsFieldLabel({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-2">
      <span className="block text-sm font-medium text-foreground/90">{children}</span>
      {hint ? <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

export function SettingsRow({
  label,
  hint,
  children,
  className,
  noDivider,
}: {
  label?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  noDivider?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        !noDivider && "border-b border-white/[0.06]",
        "transition-colors hover:bg-white/[0.02]",
        className
      )}
    >
      {(label || hint) && (
        <div className="min-w-0 flex-1">
          {label ? <p className="text-sm font-medium text-foreground">{label}</p> : null}
          {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      )}
      <div className={cn(!label && !hint ? "w-full" : "w-full sm:w-48")}>{children}</div>
    </div>
  );
}

export function SettingsGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/[0.06] bg-secondary/20",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SettingsActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      {children}
    </div>
  );
}

export function SettingsHint({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function SettingsStatus({
  tone = "success",
  children,
  className,
}: {
  tone?: "success" | "warning" | "danger" | "muted";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-destructive",
    muted: "text-muted-foreground",
  };
  return (
    <p className={cn("flex items-center gap-1.5 text-xs", tones[tone], className)}>
      {children}
    </p>
  );
}

export function SettingsEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-white/[0.08] bg-secondary/10 px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

export function SettingsScrollArea({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "settings-scroll max-h-[28rem] space-y-2.5 overflow-y-auto overscroll-contain pr-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SettingsListItem({
  children,
  actions,
  className,
}: {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-secondary/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

/** Shared control classes for inputs/selects inside Settings */
export const settingsControlClass =
  "h-11 w-full rounded-lg border border-white/[0.07] bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20";

export function SettingsInputClass() {
  return settingsControlClass;
}

/** Kept for panels still referencing theme button helpers — prefer Button */
export const settingsTheme = {
  groupInset: "rounded-xl border border-white/[0.06] bg-secondary/25",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-destructive",
  btnPrimary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:opacity-50",
  btnSecondary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50",
  btnGhost:
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50",
  btnDanger:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-destructive/15 px-3 text-xs font-medium text-red-400 transition-colors hover:bg-destructive/25",
  input: settingsControlClass,
  textarea:
    "min-h-[160px] w-full rounded-lg border border-white/[0.07] bg-secondary/50 px-3.5 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20",
} as const;
