import {
  differenceInCalendarDays,
  eachMonthOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
} from "date-fns";
import type { LearningSession, Track } from "./types";
import { parseLocalDate, todayISO } from "./utils";
import type { AnnualReport } from "./review";

const MS_PER_HOUR = 3600000;

// ─── Learning curve (cumulative, month by month) ─────────────────────────

export type MonthMomentum = "accelerating" | "steady" | "slowing" | "idle" | "upcoming";

export interface LearningCurvePoint {
  label: string;
  monthKey: string;
  hours: number;
  cumulativeHours: number;
  activeDays: number;
  deltaHours: number;
  momentum: MonthMomentum;
  isFuture: boolean;
}

export const MOMENTUM_COLORS: Record<MonthMomentum, string> = {
  accelerating: "#34d399",
  steady: "#60a5fa",
  slowing: "#fbbf24",
  idle: "#52525b",
  upcoming: "#3f3f46",
};

export const MOMENTUM_LABELS: Record<MonthMomentum, string> = {
  accelerating: "Accelerating",
  steady: "Steady",
  slowing: "Slowing",
  idle: "Idle",
  upcoming: "Upcoming",
};

function classifyMomentum(hours: number, prevHours: number): MonthMomentum {
  if (hours < 1) return "idle";
  if (prevHours < 1) return "accelerating";
  const delta = (hours - prevHours) / prevHours;
  if (delta >= 0.15) return "accelerating";
  if (delta <= -0.15) return "slowing";
  return "steady";
}

export function buildLearningCurve(
  sessions: LearningSession[],
  yearStart: string,
  yearEnd: string
): LearningCurvePoint[] {
  const start = parseLocalDate(yearStart);
  const end = parseLocalDate(yearEnd);
  const today = parseLocalDate(todayISO());
  const windowSessions = sessions.filter((s) => s.date >= yearStart && s.date <= yearEnd);

  let cumulative = 0;
  let prevHours = 0;

  return eachMonthOfInterval({ start, end }).map((month) => {
    const monthKey = format(month, "yyyy-MM");
    const monthSessions = windowSessions.filter((s) => s.date.startsWith(monthKey));
    const hours = monthSessions.reduce((sum, s) => sum + s.duration, 0) / MS_PER_HOUR;
    const activeDays = new Set(monthSessions.map((s) => s.date)).size;
    const isFuture = startOfMonth(month) > today;

    cumulative += hours;
    const point: LearningCurvePoint = {
      label: format(month, "MMM"),
      monthKey,
      hours: Math.round(hours * 10) / 10,
      cumulativeHours: Math.round(cumulative * 10) / 10,
      activeDays,
      deltaHours: Math.round((hours - prevHours) * 10) / 10,
      momentum: isFuture ? "upcoming" : classifyMomentum(hours, prevHours),
      isFuture,
    };
    if (!isFuture) prevHours = hours;
    return point;
  });
}

export interface LearningCurveSummary {
  totalHours: number;
  activeMonths: number;
  avgPerActiveMonth: number;
  peakMonth: { label: string; hours: number } | null;
  shape: "front-loaded" | "back-loaded" | "evenly paced" | "just started";
}

export function getLearningCurveSummary(points: LearningCurvePoint[]): LearningCurveSummary {
  const elapsed = points.filter((p) => !p.isFuture);
  const active = elapsed.filter((p) => p.hours >= 1);
  const totalHours = elapsed.length > 0 ? elapsed[elapsed.length - 1].cumulativeHours : 0;
  const peak = [...elapsed].sort((a, b) => b.hours - a.hours)[0];

  let shape: LearningCurveSummary["shape"] = "just started";
  if (elapsed.length >= 2 && totalHours > 0) {
    const mid = Math.ceil(elapsed.length / 2);
    const firstHalf = elapsed.slice(0, mid).reduce((s, p) => s + p.hours, 0);
    const secondHalf = elapsed.slice(mid).reduce((s, p) => s + p.hours, 0);
    if (firstHalf > secondHalf * 1.4) shape = "front-loaded";
    else if (secondHalf > firstHalf * 1.4) shape = "back-loaded";
    else shape = "evenly paced";
  }

  return {
    totalHours: Math.round(totalHours),
    activeMonths: active.length,
    avgPerActiveMonth: active.length > 0 ? Math.round(totalHours / active.length) : 0,
    peakMonth: peak && peak.hours > 0 ? { label: peak.label, hours: peak.hours } : null,
    shape,
  };
}

// ─── Year chapters (3-month blocks of the window) ────────────────────────

export interface YearChapter {
  key: string;
  label: string;
  monthsLabel: string;
  hours: number;
  sessions: number;
  activeDays: number;
  avgPerActiveDay: number;
  topTrackName?: string;
  deltaVsPrevPct: number | null;
  status: "up" | "flat" | "down" | "upcoming";
}

export function buildYearChapters(
  sessions: LearningSession[],
  tracks: Track[],
  yearStart: string,
  yearEnd: string
): YearChapter[] {
  const months = eachMonthOfInterval({
    start: parseLocalDate(yearStart),
    end: parseLocalDate(yearEnd),
  });
  const today = parseLocalDate(todayISO());
  const trackById = new Map(tracks.map((t) => [t.id, t.name]));
  const windowSessions = sessions.filter((s) => s.date >= yearStart && s.date <= yearEnd);

  const chapters: YearChapter[] = [];
  for (let i = 0; i < months.length; i += 3) {
    const block = months.slice(i, i + 3);
    const blockStart = startOfMonth(block[0]);
    const blockEnd = endOfMonth(block[block.length - 1]);
    const startStr = format(blockStart, "yyyy-MM-dd");
    const endStr = format(blockEnd, "yyyy-MM-dd");
    const blockSessions = windowSessions.filter((s) => s.date >= startStr && s.date <= endStr);

    const hours = Math.round((blockSessions.reduce((s, x) => s + x.duration, 0) / MS_PER_HOUR) * 10) / 10;
    const activeDays = new Set(blockSessions.map((s) => s.date)).size;

    const byTrack = new Map<string, number>();
    for (const s of blockSessions) byTrack.set(s.trackId, (byTrack.get(s.trackId) ?? 0) + s.duration);
    const topTrackId = [...byTrack.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

    const prev = chapters[chapters.length - 1];
    const upcoming = blockStart > today;
    const deltaVsPrevPct =
      !upcoming && prev && prev.status !== "upcoming" && prev.hours > 0
        ? Math.round(((hours - prev.hours) / prev.hours) * 100)
        : null;

    let status: YearChapter["status"] = "flat";
    if (upcoming) status = "upcoming";
    else if (deltaVsPrevPct !== null && deltaVsPrevPct >= 10) status = "up";
    else if (deltaVsPrevPct !== null && deltaVsPrevPct <= -10) status = "down";

    chapters.push({
      key: `chapter-${chapters.length + 1}`,
      label: `Chapter ${chapters.length + 1}`,
      monthsLabel: block.length > 1
        ? `${format(blockStart, "MMM")} – ${format(blockEnd, "MMM yyyy")}`
        : format(blockStart, "MMM yyyy"),
      hours,
      sessions: blockSessions.length,
      activeDays,
      avgPerActiveDay: activeDays > 0 ? Math.round((hours / activeDays) * 10) / 10 : 0,
      topTrackName: topTrackId ? trackById.get(topTrackId) : undefined,
      deltaVsPrevPct,
      status,
    });
  }
  return chapters;
}

// ─── Weekday rhythm profile ──────────────────────────────────────────────

export interface RhythmDay {
  label: string;
  hours: number;
  share: number;
}

export interface RhythmProfile {
  days: RhythmDay[];
  peak: RhythmDay | null;
  weekendShare: number;
  totalHours: number;
}

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function buildRhythmProfile(
  sessions: LearningSession[],
  yearStart: string,
  yearEnd: string
): RhythmProfile {
  const windowSessions = sessions.filter((s) => s.date >= yearStart && s.date <= yearEnd);
  const byWeekday = new Array(7).fill(0);
  for (const s of windowSessions) {
    byWeekday[getDay(parseLocalDate(s.date))] += s.duration;
  }
  const totalMs = byWeekday.reduce((a, b) => a + b, 0);
  const totalHours = totalMs / MS_PER_HOUR;

  const days: RhythmDay[] = WEEKDAY_ORDER.map((jsIdx, i) => {
    const hours = byWeekday[jsIdx] / MS_PER_HOUR;
    return {
      label: WEEKDAY_LABELS[i],
      hours: Math.round(hours * 10) / 10,
      share: totalMs > 0 ? Math.round((byWeekday[jsIdx] / totalMs) * 100) : 0,
    };
  });

  const peak = totalHours > 0 ? [...days].sort((a, b) => b.hours - a.hours)[0] : null;
  const weekendShare = days[5].share + days[6].share;

  return { days, peak, weekendShare, totalHours: Math.round(totalHours * 10) / 10 };
}

// ─── Session depth profile ───────────────────────────────────────────────

export interface DepthBucket {
  key: "quick" | "focused" | "deep";
  label: string;
  rangeLabel: string;
  count: number;
  hours: number;
  hoursShare: number;
}

export interface DepthProfile {
  buckets: DepthBucket[];
  totalSessions: number;
  deepShare: number;
  longestSession: { date: string; hours: number } | null;
}

export function buildDepthProfile(
  sessions: LearningSession[],
  yearStart: string,
  yearEnd: string
): DepthProfile {
  const windowSessions = sessions.filter((s) => s.date >= yearStart && s.date <= yearEnd);
  const defs = [
    { key: "quick" as const, label: "Quick touches", rangeLabel: "< 30 min", min: 0, max: 30 },
    { key: "focused" as const, label: "Focused blocks", rangeLabel: "30–90 min", min: 30, max: 90 },
    { key: "deep" as const, label: "Deep sessions", rangeLabel: "90+ min", min: 90, max: Infinity },
  ];

  const totals = defs.map(() => ({ count: 0, ms: 0 }));
  let longest: { date: string; hours: number } | null = null;

  for (const s of windowSessions) {
    const minutes = s.duration / 60000;
    const idx = defs.findIndex((d) => minutes >= d.min && minutes < d.max);
    if (idx >= 0) {
      totals[idx].count += 1;
      totals[idx].ms += s.duration;
    }
    const hours = s.duration / MS_PER_HOUR;
    if (!longest || hours > longest.hours) longest = { date: s.date, hours: Math.round(hours * 10) / 10 };
  }

  const totalMs = totals.reduce((a, t) => a + t.ms, 0);
  const buckets: DepthBucket[] = defs.map((d, i) => ({
    key: d.key,
    label: d.label,
    rangeLabel: d.rangeLabel,
    count: totals[i].count,
    hours: Math.round((totals[i].ms / MS_PER_HOUR) * 10) / 10,
    hoursShare: totalMs > 0 ? Math.round((totals[i].ms / totalMs) * 100) : 0,
  }));

  return {
    buckets,
    totalSessions: windowSessions.length,
    deepShare: buckets[2].hoursShare,
    longestSession: longest,
  };
}

// ─── Gaps & recovery ─────────────────────────────────────────────────────

export interface LearningGap {
  from: string;
  to: string;
  days: number;
}

export interface GapRecovery {
  activeDays: number;
  daysElapsed: number;
  coveragePct: number;
  breaks: LearningGap[];
  longestGap: LearningGap | null;
  idleDays: number;
  avgHoursPerActiveDay: number;
  recoveryPct: number | null;
}

export function buildGapRecovery(
  sessions: LearningSession[],
  yearStart: string,
  yearEnd: string
): GapRecovery {
  const today = todayISO();
  const effectiveEnd = yearEnd < today ? yearEnd : today;
  const windowSessions = sessions.filter((s) => s.date >= yearStart && s.date <= effectiveEnd);

  const hoursByDate = new Map<string, number>();
  for (const s of windowSessions) {
    hoursByDate.set(s.date, (hoursByDate.get(s.date) ?? 0) + s.duration / MS_PER_HOUR);
  }
  const activeDates = [...hoursByDate.keys()].sort();
  const daysElapsed = Math.max(
    1,
    differenceInCalendarDays(parseLocalDate(effectiveEnd), parseLocalDate(yearStart)) + 1
  );

  const breaks: LearningGap[] = [];
  for (let i = 1; i < activeDates.length; i++) {
    const gapDays =
      differenceInCalendarDays(parseLocalDate(activeDates[i]), parseLocalDate(activeDates[i - 1])) - 1;
    if (gapDays >= 3) {
      breaks.push({ from: activeDates[i - 1], to: activeDates[i], days: gapDays });
    }
  }
  const longestGap = [...breaks].sort((a, b) => b.days - a.days)[0] ?? null;

  const totalHours = [...hoursByDate.values()].reduce((a, b) => a + b, 0);
  const avgHoursPerActiveDay = activeDates.length > 0 ? totalHours / activeDates.length : 0;

  let recoveryPct: number | null = null;
  if (breaks.length > 0 && avgHoursPerActiveDay > 0) {
    const returnHours = breaks.map((g) => hoursByDate.get(g.to) ?? 0);
    const avgReturn = returnHours.reduce((a, b) => a + b, 0) / returnHours.length;
    recoveryPct = Math.round((avgReturn / avgHoursPerActiveDay) * 100);
  }

  return {
    activeDays: activeDates.length,
    daysElapsed,
    coveragePct: Math.round((activeDates.length / daysElapsed) * 100),
    breaks,
    longestGap,
    idleDays: daysElapsed - activeDates.length,
    avgHoursPerActiveDay: Math.round(avgHoursPerActiveDay * 10) / 10,
    recoveryPct,
  };
}

// ─── Next-year levers (distinct, improvement-focused) ────────────────────

export interface YearLever {
  id: string;
  title: string;
  detail: string;
  tone: "win" | "opportunity" | "risk";
}

export function buildYearLevers(
  rhythm: RhythmProfile,
  depth: DepthProfile,
  gaps: GapRecovery,
  summary: LearningCurveSummary
): YearLever[] {
  const levers: YearLever[] = [];

  if (rhythm.totalHours >= 5 && rhythm.peak && rhythm.peak.share >= 24) {
    levers.push({
      id: "peak-day",
      tone: "risk",
      title: `${rhythm.peak.label} carries ${rhythm.peak.share}% of your year`,
      detail: `A single weekday holds ${rhythm.peak.hours.toFixed(0)}h of your learning. Moving even a third of that load onto two other days makes the curve resilient when a busy ${rhythm.peak.label} strikes.`,
    });
  }

  if (rhythm.totalHours >= 5 && rhythm.weekendShare < 18) {
    levers.push({
      id: "weekend",
      tone: "opportunity",
      title: "Weekends are nearly untouched",
      detail: `Only ${rhythm.weekendShare}% of your hours land on Sat–Sun. One steady 90-minute weekend block adds roughly ${Math.round(1.5 * 52)}h over a full year.`,
    });
  }

  if (depth.totalSessions >= 10) {
    if (depth.deepShare >= 45) {
      levers.push({
        id: "deep-win",
        tone: "win",
        title: "Deep work is carrying the year",
        detail: `${depth.deepShare}% of your hours come from 90-minute-plus sessions. Protect those blocks — they are your highest-yield habit.`,
      });
    } else {
      levers.push({
        id: "deep",
        tone: "opportunity",
        title: "Deep blocks are your biggest lever",
        detail: `Sessions over 90 minutes produce ${depth.deepShare}% of your hours. Converting two short sessions a week into one deep block compounds fast.`,
      });
    }
  }

  if (gaps.breaks.length >= 2 && gaps.longestGap) {
    levers.push({
      id: "gaps",
      tone: "risk",
      title: `${gaps.breaks.length} breaks of 3+ days this year`,
      detail: `The longest stretch was ${gaps.longestGap.days} idle days. At your ${gaps.avgHoursPerActiveDay}h/active-day pace, those breaks cost real ground — a 15-minute minimum on hard days keeps the chain alive.`,
    });
  } else if (gaps.activeDays >= 14 && gaps.breaks.length <= 1) {
    levers.push({
      id: "no-gaps",
      tone: "win",
      title: "You rarely disappear",
      detail: `At most one break of 3+ days so far, with ${gaps.coveragePct}% day coverage. Consistency like this is what makes the cumulative curve bend upward.`,
    });
  }

  if (gaps.recoveryPct !== null) {
    if (gaps.recoveryPct >= 90) {
      levers.push({
        id: "recovery-win",
        tone: "win",
        title: "You come back at full strength",
        detail: `On the first day after a break you log ${gaps.recoveryPct}% of a normal day. Breaks aren't derailing you — keep re-entry friction low.`,
      });
    } else if (gaps.recoveryPct < 60) {
      levers.push({
        id: "recovery",
        tone: "opportunity",
        title: "Re-entry days run light",
        detail: `First days back after a break average only ${gaps.recoveryPct}% of your usual load. Plan an easy, pre-chosen task for return days to rebuild momentum faster.`,
      });
    }
  }

  if (summary.shape === "front-loaded") {
    levers.push({
      id: "shape",
      tone: "risk",
      title: "The year is front-loaded",
      detail: `Most hours landed early — momentum is fading. Lock one fixed weekly session now so the second half doesn't drift.`,
    });
  } else if (summary.shape === "back-loaded") {
    levers.push({
      id: "shape-win",
      tone: "win",
      title: "Momentum is building",
      detail: `Recent months outweigh the early ones — your learning curve is bending upward exactly when it should.`,
    });
  }

  return levers.slice(0, 5);
}

// ─── Printable report (PDF via print dialog) ─────────────────────────────

function esc(value: string | number | undefined | null): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildPrintableReportHtml(input: {
  report: AnnualReport;
  curve: LearningCurvePoint[];
  summary: LearningCurveSummary;
  chapters: YearChapter[];
  rhythm: RhythmProfile;
  depth: DepthProfile;
  gaps: GapRecovery;
  levers: YearLever[];
  narrative: string[];
}): string {
  const { report, curve, summary, chapters, rhythm, depth, gaps, levers, narrative } = input;
  const generated = format(new Date(), "MMM d, yyyy HH:mm");

  const monthRows = curve
    .filter((p) => !p.isFuture)
    .map(
      (p) => `<tr>
        <td>${esc(p.label)}</td>
        <td class="num">${p.hours.toFixed(1)}h</td>
        <td class="num">${p.cumulativeHours.toFixed(1)}h</td>
        <td class="num">${p.activeDays}</td>
        <td>${esc(MOMENTUM_LABELS[p.momentum])}</td>
      </tr>`
    )
    .join("");

  const chapterRows = chapters
    .map(
      (c) => `<tr>
        <td>${esc(c.label)} (${esc(c.monthsLabel)})</td>
        <td class="num">${c.status === "upcoming" ? "—" : `${c.hours.toFixed(1)}h`}</td>
        <td class="num">${c.status === "upcoming" ? "—" : c.sessions}</td>
        <td class="num">${c.status === "upcoming" ? "—" : c.activeDays}</td>
        <td>${esc(c.status === "upcoming" ? "Upcoming" : c.topTrackName ?? "—")}</td>
      </tr>`
    )
    .join("");

  const rhythmRows = rhythm.days
    .map((d) => `<tr><td>${esc(d.label)}</td><td class="num">${d.hours.toFixed(1)}h</td><td class="num">${d.share}%</td></tr>`)
    .join("");

  const depthRows = depth.buckets
    .map(
      (b) =>
        `<tr><td>${esc(b.label)} (${esc(b.rangeLabel)})</td><td class="num">${b.count}</td><td class="num">${b.hours.toFixed(1)}h</td><td class="num">${b.hoursShare}%</td></tr>`
    )
    .join("");

  const leverItems = levers
    .map((l) => `<li><strong>${esc(l.title)}.</strong> ${esc(l.detail)}</li>`)
    .join("");

  const narrativeParas = narrative.map((line) => `<p>${esc(line)}</p>`).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>GoalTrack Annual Review — ${esc(report.window.label)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #18181b; margin: 32px 40px; font-size: 13px; line-height: 1.55; }
  h1 { font-size: 22px; margin: 0 0 2px; }
  h2 { font-size: 14px; margin: 26px 0 8px; border-bottom: 1px solid #d4d4d8; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.06em; }
  .sub { color: #52525b; margin: 0 0 18px; }
  .kpis { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 14px; }
  .kpi { border: 1px solid #d4d4d8; border-radius: 8px; padding: 10px 16px; min-width: 130px; }
  .kpi .v { font-size: 20px; font-weight: 600; }
  .kpi .l { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #52525b; }
  table { border-collapse: collapse; width: 100%; margin-top: 6px; }
  th, td { border: 1px solid #d4d4d8; padding: 5px 9px; text-align: left; }
  th { background: #f4f4f5; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  ul { padding-left: 18px; margin: 6px 0; }
  li { margin-bottom: 6px; }
  .footer { margin-top: 28px; color: #71717a; font-size: 11px; border-top: 1px solid #e4e4e7; padding-top: 8px; }
  @media print { body { margin: 12mm 14mm; } }
</style>
</head>
<body>
  <h1>GoalTrack — Annual Review</h1>
  <p class="sub">${esc(report.window.label)} · Generated ${esc(generated)}</p>

  <div class="kpis">
    <div class="kpi"><div class="v">${report.totalHours.toFixed(0)}h</div><div class="l">Total hours</div></div>
    <div class="kpi"><div class="v">${report.totalSessions}</div><div class="l">Sessions</div></div>
    <div class="kpi"><div class="v">${gaps.activeDays}</div><div class="l">Active days (${gaps.coveragePct}%)</div></div>
    <div class="kpi"><div class="v">${depth.deepShare}%</div><div class="l">Deep-work share</div></div>
    <div class="kpi"><div class="v">${report.streaks.longest}d</div><div class="l">Longest streak</div></div>
  </div>

  <h2>Learning curve — month by month</h2>
  <p>Curve shape: <strong>${esc(summary.shape)}</strong>${summary.peakMonth ? ` · Peak month: <strong>${esc(summary.peakMonth.label)} (${summary.peakMonth.hours.toFixed(0)}h)</strong>` : ""} · Avg per active month: <strong>${summary.avgPerActiveMonth}h</strong></p>
  <table>
    <tr><th>Month</th><th>Hours</th><th>Cumulative</th><th>Active days</th><th>Momentum</th></tr>
    ${monthRows}
  </table>

  <h2>Chapters of the year</h2>
  <table>
    <tr><th>Chapter</th><th>Hours</th><th>Sessions</th><th>Active days</th><th>Dominant track</th></tr>
    ${chapterRows}
  </table>

  <h2>Weekly rhythm</h2>
  <p>${rhythm.peak ? `Busiest day: <strong>${esc(rhythm.peak.label)}</strong> (${rhythm.peak.share}% of hours). ` : ""}Weekend share: <strong>${rhythm.weekendShare}%</strong>.</p>
  <table>
    <tr><th>Day</th><th>Hours</th><th>Share</th></tr>
    ${rhythmRows}
  </table>

  <h2>Session depth</h2>
  <table>
    <tr><th>Type</th><th>Sessions</th><th>Hours</th><th>Share of hours</th></tr>
    ${depthRows}
  </table>
  ${depth.longestSession ? `<p>Longest single session: <strong>${depth.longestSession.hours.toFixed(1)}h</strong> on ${esc(depth.longestSession.date)}.</p>` : ""}

  <h2>Gaps &amp; recovery</h2>
  <p>
    ${gaps.breaks.length} break${gaps.breaks.length === 1 ? "" : "s"} of 3+ days${gaps.longestGap ? ` (longest: ${gaps.longestGap.days} days, ${esc(gaps.longestGap.from)} → ${esc(gaps.longestGap.to)})` : ""}.
    Idle days: ${gaps.idleDays}. Average on active days: ${gaps.avgHoursPerActiveDay}h.
    ${gaps.recoveryPct !== null ? `First-day-back intensity: ${gaps.recoveryPct}% of a normal day.` : ""}
  </p>

  <h2>Levers for next year</h2>
  <ul>${leverItems || "<li>Keep logging sessions — levers appear as data accumulates.</li>"}</ul>

  <h2>Your story</h2>
  ${narrativeParas}

  <div class="footer">GoalTrack · Learning Command Center — use your browser's “Save as PDF” option in the print dialog.</div>
  <script>window.onload = function () { setTimeout(function () { window.print(); }, 350); };</script>
</body>
</html>`;
}
