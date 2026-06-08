"use client";

import { useState } from "react";
import { Cloud, CloudDownload, CloudUpload, Github, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  backupToGitHub,
  importFromGitHub,
  loadGitHubSyncConfig,
  saveGitHubSyncConfig,
} from "@/lib/github-sync";
import { saveAutoBackup } from "@/lib/auto-backup";
import { format, parseISO } from "date-fns";

const DEFAULT_REPO = "shuvosb17/GoalTrack-Backup";

export function GitHubBackupPanel() {
  const initial = loadGitHubSyncConfig();
  const [repoInput, setRepoInput] = useState(initial.repoInput || DEFAULT_REPO);
  const [branch, setBranch] = useState(initial.branch);
  const [path, setPath] = useState(initial.path);
  const [token, setToken] = useState(initial.token);
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"backup" | "import" | null>(null);
  const [lastSync, setLastSync] = useState(initial.lastSync);

  const persistConfig = () => {
    saveGitHubSyncConfig({ repoInput, branch, path, token });
  };

  const handleBackup = async () => {
    setError(null);
    setStatus(null);
    if (!pin.trim()) {
      setError("Enter your backup PIN first.");
      return;
    }
    persistConfig();
    setBusy("backup");
    try {
      await backupToGitHub(pin);
      setLastSync(new Date().toISOString());
      setStatus("Backup uploaded to GitHub. Encrypted with your PIN.");
      setPin("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Backup failed");
    } finally {
      setBusy(null);
    }
  };

  const handleImport = async () => {
    setError(null);
    setStatus(null);
    if (!pin.trim()) {
      setError("Enter your backup PIN to decrypt and import.");
      return;
    }
    if (!window.confirm("Import replaces all data in this browser with the GitHub backup. Continue?")) {
      return;
    }
    persistConfig();
    setBusy("import");
    try {
      await importFromGitHub(pin);
      await saveAutoBackup();
      setLastSync(new Date().toISOString());
      setStatus("Import successful. Reloading…");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Github className="h-5 w-5 text-primary" /> Cloud Sync (GitHub)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sync encrypted backups to{" "}
          <a
            href="https://github.com/shuvosb17/GoalTrack-Backup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            your GitHub repo
          </a>
          . On mobile or another device, open Settings → enter your PIN → Import from GitHub.
          Data is encrypted before upload — only your PIN can decrypt it.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">GitHub repo</label>
            <Input
              className="h-11 mt-1"
              placeholder="username/repo or full URL"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onBlur={persistConfig}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Branch</label>
            <Input
              className="h-11 mt-1"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              onBlur={persistConfig}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Backup file</label>
            <Input
              className="h-11 mt-1"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onBlur={persistConfig}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">GitHub token (backup only)</label>
            <Input
              type="password"
              className="h-11 mt-1"
              placeholder="Fine-grained PAT with Contents read/write on this repo"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onBlur={persistConfig}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Required to upload backups from your main device. Import works without a token on a public repo.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <KeyRound className="h-3 w-3" /> Backup PIN
            </label>
            <Input
              type="password"
              inputMode="numeric"
              className="h-11 mt-1"
              placeholder="Your private PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleBackup} disabled={busy !== null} className="gap-2 h-11 px-6">
            {busy === "backup" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
            Backup to GitHub
          </Button>
          <Button variant="outline" onClick={handleImport} disabled={busy !== null} className="gap-2 h-11 px-6">
            {busy === "import" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudDownload className="h-4 w-4" />}
            Import from GitHub
          </Button>
        </div>

        {lastSync && (
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <Cloud className="h-3 w-3" />
            Last GitHub sync: {format(parseISO(lastSync), "MMM d, yyyy h:mm a")}
          </p>
        )}
        {status && <p className="text-sm text-emerald-400">{status}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
