import { NextRequest, NextResponse } from "next/server";
import type { EncryptedBackupEnvelope } from "@/lib/backup-crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_OWNER = "shuvosb17";
const DEFAULT_REPO = "GoalTrack-Backup";
const DEFAULT_BRANCH = "main";
const DEFAULT_PATH = "backup.enc.json";

function resolveParams(searchParams: URLSearchParams) {
  return {
    owner: searchParams.get("owner") ?? DEFAULT_OWNER,
    repo: searchParams.get("repo") ?? DEFAULT_REPO,
    branch: searchParams.get("branch") ?? DEFAULT_BRANCH,
    path: searchParams.get("path") ?? DEFAULT_PATH,
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

async function fetchPublicBackup(owner: string, repo: string, branch: string, path: string): Promise<string> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  const apiRes = await fetch(apiUrl, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "GoalTrack" },
    cache: "no-store",
  });
  if (apiRes.ok) {
    const json = await apiRes.json();
    const downloadUrl = (json as { download_url?: string }).download_url;
    if (downloadUrl) {
      const dl = await fetch(downloadUrl, { cache: "no-store" });
      if (dl.ok) return dl.text();
    }
    const content = (json as { content?: string }).content?.replace(/\n/g, "") ?? "";
    return Buffer.from(content, "base64").toString("utf8");
  }

  if (apiRes.status === 404) {
    throw new Error("Backup file not found. Run Backup to GitHub from your main device first.");
  }
  throw new Error(`Could not fetch backup (${apiRes.status})`);
}

async function getFileSha(
  owner: string,
  repo: string,
  branch: string,
  path: string,
  token: string
): Promise<string | undefined> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "GoalTrack",
    },
  });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`Could not read existing backup (${res.status})`);
  const json = await res.json();
  return (json as { sha?: string }).sha;
}

/** Public repo import — no token required */
export async function GET(req: NextRequest) {
  try {
    const { owner, repo, branch, path } = resolveParams(req.nextUrl.searchParams);
    const text = await fetchPublicBackup(owner, repo, branch, path);
    const envelope = JSON.parse(text) as EncryptedBackupEnvelope;
    return NextResponse.json(envelope);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch backup";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/** Backup upload — uses server-side GITHUB_BACKUP_TOKEN (never exposed to browser) */
export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_BACKUP_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Backup upload is not configured. Add GITHUB_BACKUP_TOKEN in Vercel environment variables." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const envelope = body.envelope as EncryptedBackupEnvelope;
    const { owner, repo, branch, path } = {
      owner: body.owner ?? DEFAULT_OWNER,
      repo: body.repo ?? DEFAULT_REPO,
      branch: body.branch ?? DEFAULT_BRANCH,
      path: body.path ?? DEFAULT_PATH,
    };

    if (!envelope?.data || !envelope?.salt || !envelope?.iv) {
      return NextResponse.json({ error: "Invalid backup payload" }, { status: 400 });
    }

    const content = JSON.stringify(envelope, null, 2);
    const sha = await getFileSha(owner, repo, branch, path, token);
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "GoalTrack",
      },
      body: JSON.stringify({
        message: `GoalTrack backup ${envelope.exportedAt}`,
        content: utf8ToBase64(content),
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = (err as { message?: string }).message ?? `GitHub upload failed (${res.status})`;
      return NextResponse.json({ error: message }, { status: res.status });
    }

    return NextResponse.json({ ok: true, exportedAt: envelope.exportedAt });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Backup upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
