import { db } from "./db";

/**
 * One-off data corrections for time inflated by the timer double-count bug
 * (stale `startedAt` resurrecting a stopped timer). Each correction is guarded
 * by a localStorage flag so it applies exactly once per device.
 *
 * These are intentionally narrow and self-deleting in effect: once the flag is
 * set they never touch data again.
 */

interface TimeDeduction {
  /** Stable key so the correction runs only once. */
  flag: string;
  /** Subtopic name to match (case-insensitive). */
  subtopicName: string;
  /** Module name the subtopic must live under (case-insensitive), for safety. */
  moduleName: string;
  /** How much logged time to remove, in milliseconds. */
  deductMs: number;
}

const DEDUCTIONS: TimeDeduction[] = [
  {
    flag: "goaltrack-correction-conditionals-1.5h-v1",
    subtopicName: "Conditionals",
    moduleName: "Go",
    deductMs: 1.5 * 3600 * 1000,
  },
  {
    flag: "goaltrack-correction-stock-buy-sell-1.6h-v1",
    subtopicName: "Stock Buy & Sell",
    moduleName: "DSA Sheet | Apna College",
    deductMs: 1.6 * 3600 * 1000,
  },
];

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/\s+/g, " ")
    .trim();
}

async function applyDeduction(d: TimeDeduction): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(d.flag)) return;

  const [subtopics, modules] = await Promise.all([
    db.subtopics.toArray(),
    db.modules.toArray(),
  ]);

  const targetModule = normalizeName(d.moduleName);
  const moduleIds = new Set(
    modules
      .filter((m) => normalizeName(m.name) === targetModule)
      .map((m) => m.id)
  );

  const targetSub = normalizeName(d.subtopicName);
  const targets = subtopics.filter(
    (s) =>
      normalizeName(s.name) === targetSub &&
      (moduleIds.size === 0 || moduleIds.has(s.moduleId))
  );

  if (targets.length === 0) {
    // Don't set the flag — name/module may not have synced yet; retry next load.
    return;
  }

  const targetIds = new Set(targets.map((s) => s.id));
  const sessions = (await db.sessions.toArray())
    .filter((s) => s.subtopicId && targetIds.has(s.subtopicId))
    // Trim from the largest sessions first — the inflated one is the culprit.
    .sort((a, b) => b.duration - a.duration);

  let remaining = d.deductMs;
  for (const session of sessions) {
    if (remaining <= 0) break;
    const trim = Math.min(session.duration, remaining);
    const newDuration = session.duration - trim;
    remaining -= trim;

    if (newDuration <= 0) {
      await db.sessions.delete(session.id);
    } else {
      // Keep endTime; pull startTime forward so the record stays consistent.
      const startTime = session.endTime
        ? new Date(new Date(session.endTime).getTime() - newDuration).toISOString()
        : session.startTime;
      await db.sessions.update(session.id, { duration: newDuration, startTime });
    }
  }

  // Only lock the flag after we actually trimmed time.
  if (remaining < d.deductMs) {
    window.localStorage.setItem(d.flag, new Date().toISOString());
  }
}

export async function applySessionCorrections(): Promise<void> {
  for (const d of DEDUCTIONS) {
    try {
      await applyDeduction(d);
    } catch {
      // Never block app init on a correction failure.
    }
  }
}
