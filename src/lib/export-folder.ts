import type { BackupData } from "./auto-backup";

const EXPORT_DIR_DB = "goaltrack-export-dir";
const EXPORT_DIR_STORE = "handles";
const EXPORT_DIR_KEY = "primary";

const DEFAULT_EXPORT_HINT =
  "E:\\Career Track\\Development\\Goaltrack Json Files";

type ExportResult = { ok: boolean; path?: string; error?: string };

function openExportDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(EXPORT_DIR_DB, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(EXPORT_DIR_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openExportDb();
    return await new Promise<FileSystemDirectoryHandle | null>((resolve, reject) => {
      const tx = db.transaction(EXPORT_DIR_STORE, "readonly");
      const req = tx.objectStore(EXPORT_DIR_STORE).get(EXPORT_DIR_KEY);
      req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function storeExportDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openExportDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(EXPORT_DIR_STORE, "readwrite");
    tx.objectStore(EXPORT_DIR_STORE).put(handle, EXPORT_DIR_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function pickExportDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof window === "undefined" || !("showDirectoryPicker" in window)) return null;
  try {
    const handle = await (
      window as Window & {
        showDirectoryPicker: (options?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
      }
    ).showDirectoryPicker({ mode: "readwrite" });
    await storeExportDirectoryHandle(handle);
    return handle;
  } catch {
    return null;
  }
}

async function writeToDirectoryHandle(
  handle: FileSystemDirectoryHandle,
  filename: string,
  contents: string
): Promise<ExportResult> {
  const fsHandle = handle as FileSystemDirectoryHandle & {
    requestPermission?: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>;
  };

  if (fsHandle.requestPermission) {
    const permission = await fsHandle.requestPermission({ mode: "readwrite" });
    if (permission !== "granted") {
      return { ok: false, error: "Write permission denied for export folder" };
    }
  }

  const fileHandle = await handle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(contents);
  await writable.close();

  return { ok: true, path: `${handle.name}\\${filename}` };
}

async function saveViaFileSystemAccess(
  data: BackupData,
  filename: string
): Promise<ExportResult> {
  if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
    return { ok: false, error: "Browser cannot write directly to a folder on this device" };
  }

  const json = JSON.stringify(data, null, 2);
  let handle = await getStoredDirectoryHandle();

  if (handle) {
    const result = await writeToDirectoryHandle(handle, filename, json);
    if (result.ok) return result;
  }

  handle = await pickExportDirectory();
  if (!handle) {
    return {
      ok: false,
      error: `Choose your export folder once (e.g. ${DEFAULT_EXPORT_HINT})`,
    };
  }

  return writeToDirectoryHandle(handle, filename, json);
}

async function saveViaLocalApi(data: BackupData, filename: string): Promise<ExportResult> {
  try {
    const res = await fetch("/api/export-backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, filename }),
    });
    const payload = (await res.json()) as { ok?: boolean; path?: string; error?: string };
    if (!res.ok) {
      return { ok: false, error: payload.error ?? "Local export service unavailable" };
    }
    return { ok: true, path: payload.path };
  } catch {
    return { ok: false, error: "Local export service unavailable" };
  }
}

/** Saves JSON to the configured export folder — no browser Downloads fallback. */
export async function saveBackupToExportFolder(
  data: BackupData,
  filename?: string
): Promise<ExportResult> {
  const name = filename ?? `goaltrack-backup-${new Date().toISOString().slice(0, 10)}.json`;

  const viaApi = await saveViaLocalApi(data, name);
  if (viaApi.ok) return viaApi;

  return saveViaFileSystemAccess(data, name);
}

export function getDefaultExportFolderHint() {
  return DEFAULT_EXPORT_HINT;
}
