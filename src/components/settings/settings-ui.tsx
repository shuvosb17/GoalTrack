import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Settings tokens aligned with the app's existing dark theme. */
export const settingsTheme = {
  page: "bg-background",
  sectionLabel: "px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80",
  group: "glass-card overflow-hidden rounded-2xl",
  groupInset: "rounded-xl border border-white/[0.06] bg-secondary/30",
  row: "flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
  rowHover: "transition-colors hover:bg-white/[0.03]",
  divider: "mx-4 h-px bg-white/[0.06]",
  title: "text-[15px] font-medium text-foreground",
  subtitle: "text-[13px] leading-relaxed text-muted-foreground",
  accent: "text-primary",
  accentBg: "bg-primary/15 text-primary",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
  iconWrap:
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary",
  input:
    "h-11 rounded-xl border border-white/[0.06] bg-secondary/60 px-3.5 text-[15px] text-foreground placeholder:text-muted-foreground shadow-none transition-colors focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20",
  textarea:
    "min-h-[180px] rounded-xl border border-white/[0.06] bg-secondary/60 px-3.5 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground shadow-none focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20",
  btnPrimary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50",
  btnSecondary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-secondary/60 px-5 text-[14px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50",
  btnGhost:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50",
  btnDanger:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-destructive/15 px-3 text-[12px] font-medium text-red-400 transition-colors hover:bg-destructive/20",
  pill:
    "inline-flex items-center rounded-full bg-secondary/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground",
} as const;

export function SettingsPageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-3xl space-y-6 pb-10", className)}>
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
    <header className="glass-card relative overflow-hidden rounded-2xl px-5 py-6 sm:px-6">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        {icon ? <div className={settingsTheme.iconWrap}>{icon}</div> : null}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{subtitle}</p>
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
    <section className={cn("space-y-2", className)}>
      {label ? <p className={settingsTheme.sectionLabel}>{label}</p> : null}
      {children}
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
}: {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(settingsTheme.group, className)}>
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? <div className={settingsTheme.iconWrap}>{icon}</div> : null}
          <div className="min-w-0">
            <h2 className={settingsTheme.title}>{title}</h2>
            {description ? (
              <p className="mt-1 text-[13px] leading-relaxed text-[#6d7f8f]">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="px-4 py-4">{children}</div>
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
  const tones = {
    warning: "border-amber-500/20 bg-amber-500/8",
    info: "border-primary/20 bg-primary/8",
    success: "border-emerald-500/20 bg-emerald-500/8",
  };
  const titleColors = {
    warning: "text-amber-400",
    info: "text-primary",
    success: "text-emerald-400",
  };

  return (
    <div className={cn("rounded-2xl border px-4 py-4 sm:px-5", tones[tone])}>
      <div className="flex gap-3">
        {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
        <div className="space-y-2 text-[13px] leading-relaxed text-muted-foreground">
          <p className={cn("font-medium", titleColors[tone])}>{title}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function SettingsGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(settingsTheme.group, className)}>{children}</div>;
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
    <>
      <div className={cn(settingsTheme.row, settingsTheme.rowHover, className)}>
        {(label || hint) && (
          <div className="min-w-0 flex-1">
            {label ? <p className="text-[14px] font-medium text-foreground">{label}</p> : null}
            {hint ? <p className="mt-0.5 text-[12px] text-muted-foreground">{hint}</p> : null}
          </div>
        )}
        <div className={cn(!label && !hint ? "w-full" : "w-full sm:w-auto sm:min-w-[12rem]")}>
          {children}
        </div>
      </div>
      {!noDivider ? <div className={settingsTheme.divider} /> : null}
    </>
  );
}

export function SettingsFieldLabel({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="mb-1.5 block">
      <span className="text-[12px] font-medium text-muted-foreground">{children}</span>
      {hint ? <span className="mt-0.5 block text-[11px] text-muted-foreground/70">{hint}</span> : null}
    </label>
  );
}

export function SettingsInputClass() {
  return settingsTheme.input;
}

export function SettingsActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap gap-2.5", className)}>{children}</div>;
}

export function SettingsEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="py-8 text-center text-[13px] text-muted-foreground">{children}</p>
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
    <div className={cn("max-h-[28rem] space-y-2 overflow-y-auto overscroll-contain pr-1 settings-scroll", className)}>
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
        "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.05] bg-secondary/40 px-3 py-2.5",
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {actions ? <div className="flex shrink-0 gap-1.5">{actions}</div> : null}
    </div>
  );
}
