import { encryptWithPin, decryptWithPin, type EncryptedBackupEnvelope } from "./backup-crypto";
import { exportAllData, importAllData } from "./seed";
import type { BackupData } from "./auto-backup";

const CONFIG_KEYS = {
  repo: "goaltrack-github-repo",
  branch: "goaltrack-github-branch",
  path: "goaltrack-github-path",
  lastSync: "goaltrack-github-last-sync",
} as const;

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
  }).toString();
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function fetchBackupTextFromRaw(config: GitHubSyncConfig): Promise<string> {
  const url = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.path}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? "Backup file not found. Run Backup to GitHub from your main device first."
        : `Could not fetch backup (${res.status})`
    );
  }
  return res.text();
}

async function fetchBackupTextFromGitHubApi(config: GitHubSyncConfig): Promise<string> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`;
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? "Backup file not found. Run Backup to GitHub from your main device first."
        : `Could not fetch backup (${res.status})`
    );
  }
  const json = await res.json();
  const content = (json as { content?: string }).content ?? "";
  return base64ToUtf8(content);
}

async function fetchBackupTextFromServerApi(config: GitHubSyncConfig): Promise<string> {
  const res = await fetch(`/api/github-backup?${apiQuery(config)}`, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Could not fetch backup (${res.status})`);
  }
  return JSON.stringify(json);
}

export async function fetchEncryptedBackupFromGitHub(config: GitHubSyncConfig): Promise<EncryptedBackupEnvelope> {
  let text: string | null = null;
  let lastError: Error | null = null;

  for (const attempt of [
    () => fetchBackupTextFromRaw(config),
    () => fetchBackupTextFromGitHubApi(config),
    () => fetchBackupTextFromServerApi(config),
  ]) {
    try {
      text = await attempt();
      break;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("Fetch failed");
    }
  }

  if (!text) {
    throw lastError ?? new Error("Could not fetch backup from GitHub");
  }

  try {
    return JSON.parse(text) as EncryptedBackupEnvelope;
  } catch {
    throw new Error("Invalid backup file format on GitHub");
  }
}

export async function backupToGitHub(pin: string): Promise<void> {
  const config = resolveGitHubConfig();
  const data = await exportAllData();
  const envelope = await encryptWithPin(JSON.stringify(data), pin);

  const res = await fetch("/api/github-backup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
      path: config.path,
      envelope,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Backup upload failed (${res.status})`);
  }

  localStorage.setItem(CONFIG_KEYS.lastSync, new Date().toISOString());
}

export async function importFromGitHub(pin: string): Promise<BackupData> {
  const config = resolveGitHubConfig();
  const envelope = await fetchEncryptedBackupFromGitHub(config);
  const plaintext = await decryptWithPin(envelope, pin);
  const data = JSON.parse(plaintext) as BackupData;
  if (!data.tracks) throw new Error("Invalid backup format");
  await importAllData(data);
  localStorage.setItem(CONFIG_KEYS.lastSync, envelope.exportedAt);
  return data;
}
