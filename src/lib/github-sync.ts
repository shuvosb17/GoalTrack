import { encryptWithPin, decryptWithPin, type EncryptedBackupEnvelope } from "./backup-crypto";
import { exportAllData, importAllData } from "./seed";
import type { BackupData } from "./auto-backup";
import { fetchBackupTextFromGitHub, fetchBackupTextFromGitHubRaw } from "./github-backup-fetch";

const CONFIG_KEYS = {
  repo: "goaltrack-github-repo",
  branch: "goaltrack-github-branch",
  path: "goaltrack-github-path",
  lastSync: "goaltrack-github-last-sync",
} as const;

const FETCH_TIMEOUT_MS = 12_000;

export interface GitHubSyncConfig {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export function parseGitHubRepo(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/.]+)/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };
  const slashMatch = trimmed.match(/^([^/]+)\/([^/]+)$/);
  if (slashMatch) return { owner: slashMatch[1], repo: slashMatch[2] };
  return null;
}

export function loadGitHubSyncConfig(): {
  repoInput: string;
  branch: string;
  path: string;
  lastSync: string | null;
} {
  if (typeof window === "undefined") {
    return {
      repoInput: "shuvosb17/GoalTrack-Backup",
      branch: "main",
      path: "backup.enc.json",
      lastSync: null,
    };
  }
  return {
    repoInput: localStorage.getItem(CONFIG_KEYS.repo) ?? "shuvosb17/GoalTrack-Backup",
    branch: localStorage.getItem(CONFIG_KEYS.branch) ?? "main",
    path: localStorage.getItem(CONFIG_KEYS.path) ?? "backup.enc.json",
    lastSync: localStorage.getItem(CONFIG_KEYS.lastSync),
  };
}

export function saveGitHubSyncConfig(input: {
  repoInput: string;
  branch: string;
  path: string;
}) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONFIG_KEYS.repo, input.repoInput.trim());
  localStorage.setItem(CONFIG_KEYS.branch, input.branch.trim() || "main");
  localStorage.setItem(CONFIG_KEYS.path, input.path.trim() || "backup.enc.json");
}

export function resolveGitHubConfig(): GitHubSyncConfig {
  const saved = loadGitHubSyncConfig();
  const parsed = parseGitHubRepo(saved.repoInput);
  if (!parsed) throw new Error("Set a valid GitHub repo (e.g. shuvosb17/GoalTrack-Backup)");
  return {
    owner: parsed.owner,
    repo: parsed.repo,
    branch: saved.branch || "main",
    path: saved.path || "backup.enc.json",
  };
}

function apiQuery(config: GitHubSyncConfig): string {
  return new URLSearchParams({
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    path: config.path,
    _t: String(Date.now()),
  }).toString();
}

async function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, ms = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(`Request timed out after ${ms / 1000}s`);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function parseEnvelope(text: string): EncryptedBackupEnvelope {
  const envelope = JSON.parse(text) as EncryptedBackupEnvelope;
  if (!envelope?.v || !envelope?.salt || !envelope?.iv || !envelope?.data) {
    throw new Error("Invalid backup file format on GitHub");
  }
  return envelope;
}

async function fetchEnvelopeFromServerApi(config: GitHubSyncConfig): Promise<EncryptedBackupEnvelope> {
  const res = await fetchWithTimeout(`/api/github-backup?${apiQuery(config)}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Server fetch failed (${res.status})`);
  }
  return json as EncryptedBackupEnvelope;
}

async function fetchEnvelopeFromGitHubApi(config: GitHubSyncConfig): Promise<EncryptedBackupEnvelope> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const text = await fetchBackupTextFromGitHub(config, { signal: controller.signal });
    return parseEnvelope(text);
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS / 1000}s`);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchEnvelopeFromRaw(config: GitHubSyncConfig): Promise<EncryptedBackupEnvelope> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const text = await fetchBackupTextFromGitHubRaw(config, { signal: controller.signal });
    return parseEnvelope(text);
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Request timed out after 8s");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchEncryptedBackupFromGitHub(
  config: GitHubSyncConfig,
  onAttempt?: (label: string) => void
): Promise<EncryptedBackupEnvelope> {
  const attempts: Array<{ label: string; run: () => Promise<EncryptedBackupEnvelope> }> = [
    { label: "app server", run: () => fetchEnvelopeFromServerApi(config) },
    { label: "GitHub API", run: () => fetchEnvelopeFromGitHubApi(config) },
    { label: "GitHub raw URL", run: () => fetchEnvelopeFromRaw(config) },
  ];

  const errors: string[] = [];
  for (const attempt of attempts) {
    onAttempt?.(`Fetching backup via ${attempt.label}…`);
    try {
      return await attempt.run();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Fetch failed";
      errors.push(`${attempt.label}: ${message}`);
    }
  }

  throw new Error(errors.join(" · ") || "Could not fetch backup from GitHub");
}

export async function peekGitHubBackup(): Promise<{ exportedAt: string }> {
  const config = resolveGitHubConfig();
  const envelope = await fetchEncryptedBackupFromGitHub(config);
  return { exportedAt: envelope.exportedAt };
}

export async function backupToGitHub(pin: string): Promise<void> {
  const config = resolveGitHubConfig();
  const data = await exportAllData();
  const envelope = await encryptWithPin(JSON.stringify(data), pin);

  const res = await fetchWithTimeout("/api/github-backup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
      path: config.path,
      envelope,
    }),
  }, 30_000);

  const json = await res.json();
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Backup upload failed (${res.status})`);
  }

  localStorage.setItem(CONFIG_KEYS.lastSync, new Date().toISOString());
}

export async function importFromGitHub(
  pin: string,
  onProgress?: (message: string) => void
): Promise<BackupData> {
  const config = resolveGitHubConfig();
  onProgress?.("Connecting to GitHub…");
  const envelope = await fetchEncryptedBackupFromGitHub(config, onProgress);
  onProgress?.("Decrypting backup (may take up to 30s on mobile)…");
  const plaintext = await decryptWithPin(envelope, pin);
  onProgress?.("Importing data…");
  const data = JSON.parse(plaintext) as BackupData;
  if (!data.tracks) throw new Error("Invalid backup format");
  await importAllData(data);
  localStorage.setItem(CONFIG_KEYS.lastSync, envelope.exportedAt);
  return data;
}
