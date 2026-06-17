export interface GitHubBackupLocation {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "GoalTrack",
  "Cache-Control": "no-cache",
} as const;

function decodeBase64Utf8(b64: string): string {
  const normalized = b64.replace(/\n/g, "");
  if (typeof Buffer !== "undefined") {
    return Buffer.from(normalized, "base64").toString("utf8");
  }
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function withCacheBuster(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}t=${Date.now()}`;
}

interface ContentsResponse {
  content?: string;
  encoding?: string;
  download_url?: string;
}

export async function resolveLatestCommitSha(
  owner: string,
  repo: string,
  branch: string,
  init?: { signal?: AbortSignal }
): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${encodeURIComponent(branch)}?per_page=1`;
  const res = await fetch(url, { headers: GITHUB_HEADERS, cache: "no-store", ...init });
  if (!res.ok) {
    throw new Error(`Could not resolve branch ${branch} (${res.status})`);
  }
  const json = (await res.json()) as { sha?: string };
  if (!json.sha) throw new Error(`Could not resolve latest commit for ${branch}`);
  return json.sha;
}

function textFromContentsResponse(json: ContentsResponse): string | null {
  if (json.encoding === "base64" && json.content) {
    return decodeBase64Utf8(json.content);
  }
  return null;
}

/** Fetch backup text from GitHub Contents API (fresh inline content, not CDN). */
export async function fetchBackupTextFromGitHub(
  location: GitHubBackupLocation,
  init?: { signal?: AbortSignal }
): Promise<string> {
  const { owner, repo, branch, path } = location;
  const commitSha = await resolveLatestCommitSha(owner, repo, branch, init);

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(commitSha)}`;
  const apiRes = await fetch(apiUrl, {
    headers: GITHUB_HEADERS,
    cache: "no-store",
    ...init,
  });

  if (apiRes.status === 404) {
    throw new Error("Backup file not found. Run Backup to GitHub from your main device first.");
  }
  if (!apiRes.ok) {
    throw new Error(`Could not fetch backup (${apiRes.status})`);
  }

  const json = (await apiRes.json()) as ContentsResponse;

  // Prefer inline API content — download_url/raw CDN can lag behind by hours.
  const inline = textFromContentsResponse(json);
  if (inline) return inline;

  if (json.download_url) {
    const dl = await fetch(withCacheBuster(json.download_url), {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
      ...init,
    });
    if (dl.ok) return dl.text();
  }

  throw new Error("Backup file had no readable content from GitHub");
}

/** Fallback: raw URL pinned to latest commit SHA with cache buster. */
export async function fetchBackupTextFromGitHubRaw(
  location: GitHubBackupLocation,
  init?: { signal?: AbortSignal }
): Promise<string> {
  const { owner, repo, branch, path } = location;
  const commitSha = await resolveLatestCommitSha(owner, repo, branch, init);
  const url = withCacheBuster(
    `https://raw.githubusercontent.com/${owner}/${repo}/${commitSha}/${path}`
  );
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
    ...init,
  });
  if (res.status === 404) {
    throw new Error("Backup file not found on GitHub");
  }
  if (!res.ok) {
    throw new Error(`Raw GitHub fetch failed (${res.status})`);
  }
  return res.text();
}
