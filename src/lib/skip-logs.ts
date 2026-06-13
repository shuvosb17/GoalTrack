import { v4 as uuid } from "uuid";
import { db } from "./db";
import type { SkipLog, SkipReason } from "./types/metrics";
import { nowISO } from "./utils";

export async function upsertSkipLog(date: string, reason: SkipReason): Promise<SkipLog> {
  const existing = await db.skipLogs.where("date").equals(date).first();
  const entry: SkipLog = {
    id: existing?.id ?? uuid(),
    date,
    reason,
    loggedAt: nowISO(),
  };
  await db.skipLogs.put(entry);
  return entry;
}

export function sortSkipLogsNewestFirst(logs: SkipLog[]): SkipLog[] {
  return [...logs].sort((a, b) => b.date.localeCompare(a.date));
}
