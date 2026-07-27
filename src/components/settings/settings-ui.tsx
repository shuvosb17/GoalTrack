import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Telegram Night-inspired surface tokens (scoped to Settings). */
export const settingsTheme = {
  page: "bg-[#0e1621]",
  sectionLabel: "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6d7f8f] px-1",
  group: "overflow-hidden rounded-2xl bg-[#17212b] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]",
  groupInset: "rounded-xl bg-[#1c2733] border border-white/[0.04]",
  row: "flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
  rowHover: "transition-colors hover:bg-white/[0.03]",
  divider: "mx-4 h-px bg-white/[0.06]",
  title: "text-[15px] font-medium text-[#e8edf2]",
  subtitle: "text-[13px] leading-relaxed text-[#6d7f8f]",
  accent: "text-[#6ab3f3]",
  accentBg: "bg-[#2b5278]/40 text-[#6ab3f3]",
  success: "text-[#6dcc7f]",
  warning: "text-[#e8b339]",
  danger: "text-[#e17076]",
  iconWrap:
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2b5278]/35 text-[#6ab3f3]",
  input:
    "h-11 rounded-xl border border-white/[0.06] bg-[#242f3d] px-3.5 text-[15px] text-[#e8edf2] placeholder:text-[#5f6f7f] shadow-none transition-colors focus-visible:border-[#6ab3f3]/50 focus-visible:ring-2 focus-visible:ring-[#6ab3f3]/20",
  textarea:
    "min-h-[180px] rounded-xl border border-white/[0.06] bg-[#242f3d] px-3.5 py-3 text-sm font-mono text-[#e8edf2] placeholder:text-[#5f6f7f] shadow-none focus-visible:border-[#6ab3f3]/50 focus-visible:ring-2 focus-visible:ring-[#6ab3f3]/20",
  btnPrimary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2b5278] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#346391] disabled:opacity-50",
  btnSecondary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#242f3d] px-5 text-[14px] font-medium text-[#c5d0db] transition-colors hover:bg-[#2a3644] disabled:opacity-50",
  btnGhost:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-medium text-[#6ab3f3] transition-colors hover:bg-[#2b5278]/25 disabled:opacity-50",
  btnDanger:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#3d2024] px-3 text-[12px] font-medium text-[#e17076] transition-colors hover:bg-[#4a262b]",
  pill:
    "inline-flex items-center rounded-full bg-[#242f3d] px-2.5 py-0.5 text-[11px] font-medium text-[#6d7f8f]",
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
    <header className="relative overflow-hidden rounded-2xl bg-[#17212b] px-5 py-6 sm:px-6">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#2b5278]/25 blur-3xl"
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        {icon ? <div className={settingsTheme.iconWrap}>{icon}</div> : null}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-[#f4f8fc] sm:text-[28px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#6d7f8f]">{subtitle}</p>
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
    warning: "border-[#e8b339]/20 bg-[#2a2418]",
    info: "border-[#6ab3f3]/20 bg-[#172433]",
    success: "border-[#6dcc7f]/20 bg-[#15241c]",
  };
  const titleColors = {
    warning: "text-[#e8b339]",
    info: "text-[#6ab3f3]",
    success: "text-[#6dcc7f]",
  };

  return (
    <div className={cn("rounded-2xl border px-4 py-4 sm:px-5", tones[tone])}>
      <div className="flex gap-3">
        {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
        <div className="space-y-2 text-[13px] leading-relaxed text-[#8b9bab]">
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
            {label ? <p className="text-[14px] font-medium text-[#dce4ec]">{label}</p> : null}
            {hint ? <p className="mt-0.5 text-[12px] text-[#6d7f8f]">{hint}</p> : null}
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
      <span className="text-[12px] font-medium text-[#8b9bab]">{children}</span>
      {hint ? <span className="mt-0.5 block text-[11px] text-[#5f6f7f]">{hint}</span> : null}
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
    <p className="py-8 text-center text-[13px] text-[#6d7f8f]">{children}</p>
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
        "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.05] bg-[#1c2733] px-3 py-2.5",
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {actions ? <div className="flex shrink-0 gap-1.5">{actions}</div> : null}
    </div>
  );
}
