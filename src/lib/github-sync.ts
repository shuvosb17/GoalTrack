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

export async function fetchEncryptedBackupFromGitHub(config: GitHubSyncConfig): Promise<EncryptedBackupEnvelope> {
  const res = await fetch(`/api/github-backup?${apiQuery(config)}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Could not fetch backup (${res.status})`);
  }
  return json as EncryptedBackupEnvelope;
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
