"use client";

import type { Bs23Verdict } from "@/lib/bs23/verdict";
import { verdictAccent } from "@/lib/bs23/verdict";

export function VerdictBanner({ verdict }: { verdict: Bs23Verdict }) {
  const accent = verdictAccent(verdict.tone);

  return (
    <div
      className="glass-card overflow-hidden rounded-xl border p-5"
      style={{ borderColor: `${accent}55`, boxShadow: `0 0 24px ${accent}18` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Honest verdict
          </p>
          <p className="mt-2 text-lg font-medium leading-snug text-foreground">{verdict.headline}</p>
          <p className="mt-1.5 text-[13px] text-muted-foreground">{verdict.subheadline}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Biggest drag</p>
              <p className="mt-1 text-[13px] leading-relaxed text-foreground">{verdict.dragCause}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Do this instead</p>
              <p className="mt-1 text-[13px] leading-relaxed text-foreground">{verdict.correction}</p>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Offer probability</p>
          <p className="metric-value text-4xl tabular-nums" style={{ color: accent }}>
            {verdict.probabilityLabel}
          </p>
          {verdict.hoursGap > 0 && (
            <p className="mt-1 text-[11px] text-muted-foreground">+{verdict.hoursGap}h/wk short</p>
          )}
        </div>
      </div>
    </div>
  );
}
