import { encryptWithPin, decryptWithPin, type EncryptedBackupEnvelope } from "./backup-crypto";
import { exportAllData, importAllData } from "./seed";
import type { BackupData } from "./auto-backup";

const CONFIG_KEYS = {
  repo: "goaltrack-github-repo",
  branch: "goaltrack-github-branch",
  path: "goaltrack-github-path",
  token: "goaltrack-github-token",
  lastSync: "goaltrack-github-last-sync",
} as const;

export interface GitHubSyncConfig {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  token?: string;
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
  token: string;
  lastSync: string | null;
} {
  return {
    repoInput: localStorage.getItem(CONFIG_KEYS.repo) ?? "shuvosb17/GoalTrack-Backup",
    branch: localStorage.getItem(CONFIG_KEYS.branch) ?? "main",
    path: localStorage.getItem(CONFIG_KEYS.path) ?? "backup.enc.json",
    token: localStorage.getItem(CONFIG_KEYS.token) ?? "",
    lastSync: localStorage.getItem(CONFIG_KEYS.lastSync),
  };
}

export function saveGitHubSyncConfig(input: {
  repoInput: string;
  branch: string;
  path: string;
  token: string;
}) {
  localStorage.setItem(CONFIG_KEYS.repo, input.repoInput.trim());
  localStorage.setItem(CONFIG_KEYS.branch, input.branch.trim() || "main");
  localStorage.setItem(CONFIG_KEYS.path, input.path.trim() || "backup.enc.json");
  if (input.token.trim()) {
    localStorage.setItem(CONFIG_KEYS.token, input.token.trim());
  }
}

export function resolveGitHubConfig(): GitHubSyncConfig {
  const saved = loadGitHubSyncConfig();
  const parsed = parseGitHubRepo(saved.repoInput);
  if (!parsed) throw new Error("Set a valid GitHub repo (e.g. username/goaltrack-data)");
  return {
    owner: parsed.owner,
    repo: parsed.repo,
    branch: saved.branch || "main",
    path: saved.path || "backup.enc.json",
    token: saved.token || undefined,
  };
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function fetchEncryptedBackupFromGitHub(config: GitHubSyncConfig): Promise<EncryptedBackupEnvelope> {
  const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.path}`;
  const headers: HeadersInit = config.token
    ? { Authorization: `Bearer ${config.token}`, Accept: "application/vnd.github+json" }
    : {};

  let text: string;
  const rawRes = await fetch(rawUrl, { headers });
  if (rawRes.ok) {
    text = await rawRes.text();
  } else if (config.token) {
    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`;
    const apiRes = await fetch(apiUrl, { headers });
    if (!apiRes.ok) {
      throw new Error(`Could not fetch backup from GitHub (${apiRes.status})`);
    }
    const json = await apiRes.json();
    text = base64ToUtf8(json.content.replace(/\n/g, ""));
  } else {
    throw new Error(
      rawRes.status === 404
        ? "Backup file not found. Run Backup to GitHub from your main device first."
        : `Could not fetch backup (${rawRes.status}). Add a GitHub token for private repos.`
    );
  }

  return JSON.parse(text) as EncryptedBackupEnvelope;
}

async function getFileSha(config: GitHubSyncConfig, token: string): Promise<string | undefined> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`Could not read existing backup (${res.status})`);
  const json = await res.json();
  return json.sha as string;
}

export async function pushEncryptedBackupToGitHub(
  config: GitHubSyncConfig,
  envelope: EncryptedBackupEnvelope,
  token: string
): Promise<void> {
  const content = JSON.stringify(envelope, null, 2);
  const sha = await getFileSha(config, token);
  const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `GoalTrack backup ${envelope.exportedAt}`,
      content: utf8ToBase64(content),
      branch: config.branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `GitHub upload failed (${res.status})`);
  }
}

export async function backupToGitHub(pin: string): Promise<void> {
  const config = resolveGitHubConfig();
  if (!config.token) {
    throw new Error("GitHub token is required to upload backups. Create a fine-grained token scoped to your data repo.");
  }
  const data = await exportAllData();
  const envelope = await encryptWithPin(JSON.stringify(data), pin);
  await pushEncryptedBackupToGitHub(config, envelope, config.token);
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
