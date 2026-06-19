import { db } from "./db";
import { exportAllData, importAllData } from "./seed";

const BACKUP_KEY = "growth-os-auto-backup";
const BACKUP_TIME_KEY = "growth-os-auto-backup-time";

export type BackupData = Awaited<ReturnType<typeof exportAllData>>;

export function getLastBackupTime(): string | null {
  return localStorage.getItem(BACKUP_TIME_KEY);
}

export function loadAutoBackup(): BackupData | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BackupData;
  } catch {
    return null;
  }
}

export async function saveAutoBackup(): Promise<boolean> {
  try {
    const count = await db.tracks.count();
    if (count === 0) return false;
    const data = await exportAllData();
    localStorage.setItem(BACKUP_KEY, JSON.stringify(data));
    localStorage.setItem(BACKUP_TIME_KEY, new Date().toISOString());
    return true;
  } catch {
    return false;
  }
}

export async function tryRestoreAutoBackup(): Promise<boolean> {
  const count = await db.tracks.count();
  if (count > 0) return false;
  const backup = loadAutoBackup();
  if (!backup?.tracks?.length) return false;
  await importAllData(backup);
  return true;
}

export function downloadBackup(data: BackupData, filename?: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `goaltrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function saveBackupToExportFolder(
  data: BackupData,
  filename?: string
): Promise<{ ok: boolean; path?: string; error?: string }> {
  const name = filename ?? `goaltrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
  try {
    const res = await fetch("/api/export-backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, filename: name }),
    });
    const payload = (await res.json()) as { ok?: boolean; path?: string; error?: string };
    if (!res.ok) {
      return { ok: false, error: payload.error ?? "Could not save export file" };
    }
    return { ok: true, path: payload.path };
  } catch {
    return { ok: false, error: "Could not reach local export service" };
  }
}
