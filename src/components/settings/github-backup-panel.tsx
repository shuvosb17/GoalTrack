"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudDownload, CloudUpload, Github, KeyRound, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  backupToGitHub,
  importFromGitHub,
  peekGitHubBackup,
  loadGitHubSyncConfig,
  saveGitHubSyncConfig,
} from "@/lib/github-sync";
import { saveAutoBackup } from "@/lib/auto-backup";
import { format, parseISO } from "date-fns";
import {
  SettingsActions,
  SettingsFieldLabel,
  SettingsInputClass,
  SettingsPanel,
  settingsTheme,
} from "@/components/settings/settings-ui";
import { cn } from "@/lib/utils";

const DEFAULT_REPO = "shuvosb17/GoalTrack-Backup";

export function GitHubBackupPanel() {
  const [repoInput, setRepoInput] = useState(DEFAULT_REPO);
  const [branch, setBranch] = useState("main");
  const [path, setPath] = useState("backup.enc.json");
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"backup" | "import" | "test" | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [confirmImport, setConfirmImport] = useState(false);

  useEffect(() => {
    const cfg = loadGitHubSyncConfig();
    setRepoInput(cfg.repoInput || DEFAULT_REPO);
    setBranch(cfg.branch);
    setPath(cfg.path);
    setLastSync(cfg.lastSync);
  }, []);

  const persistConfig = () => {
    saveGitHubSyncConfig({ repoInput, branch, path });
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

  const runImport = async () => {
    setConfirmImport(false);
    setError(null);
    setStatus("Starting import…");
    persistConfig();
    setBusy("import");
    try {
      await importFromGitHub(pin, (message) => setStatus(message));
      await saveAutoBackup();
      setLastSync(new Date().toISOString());
      setStatus("Import successful. Reloading…");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
      setStatus(null);
      setBusy(null);
    }
  };

  const handleTestConnection = async () => {
    setError(null);
    setStatus(null);
    persistConfig();
    setBusy("test");
    try {
      const peek = await peekGitHubBackup();
      setStatus(`Backup found on GitHub (saved ${format(parseISO(peek.exportedAt), "MMM d, yyyy h:mm a")}). Enter PIN and import.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach GitHub backup");
    } finally {
      setBusy(null);
    }
  };

  const handleImport = () => {
    setError(null);
    setStatus(null);
    if (!pin.trim()) {
      setError("Enter your backup PIN to decrypt and import.");
      return;
    }
    setConfirmImport(true);
  };

  const inputClass = SettingsInputClass();

  return (
    <>
      <SettingsPanel
        title="Cloud Sync (GitHub)"
        description={
          <>
            Your public repo{" "}
            <a
              href="https://github.com/shuvosb17/GoalTrack-Backup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GoalTrack-Backup
            </a>{" "}
            stores PIN-encrypted data. Import needs only your PIN — no GitHub token in the app.
          </>
        }
        icon={<Github className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SettingsFieldLabel>GitHub repo</SettingsFieldLabel>
            <Input
              className={inputClass}
              placeholder="username/repo or full URL"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onBlur={persistConfig}
            />
          </div>
          <div>
            <SettingsFieldLabel>Branch</SettingsFieldLabel>
            <Input
              className={inputClass}
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              onBlur={persistConfig}
            />
          </div>
          <div>
            <SettingsFieldLabel>Backup file</SettingsFieldLabel>
            <Input
              className={inputClass}
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onBlur={persistConfig}
            />
          </div>
          <div className="sm:col-span-2">
            <SettingsFieldLabel>
              <span className="inline-flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" /> Backup PIN
              </span>
            </SettingsFieldLabel>
            <Input
              type="password"
              className={inputClass}
              placeholder="Your private PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <SettingsActions className="mt-4">
          <button type="button" onClick={handleBackup} disabled={busy !== null} className={settingsTheme.btnPrimary}>
            {busy === "backup" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
            Backup to GitHub
          </button>
          <button type="button" onClick={handleImport} disabled={busy !== null} className={settingsTheme.btnSecondary}>
            {busy === "import" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudDownload className="h-4 w-4" />}
            Import from GitHub
          </button>
          <button type="button" onClick={handleTestConnection} disabled={busy !== null} className={settingsTheme.btnGhost}>
            {busy === "test" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
            Test connection
          </button>
        </SettingsActions>

        {lastSync && (
          <p className={cn("mt-3 flex items-center gap-1.5 text-[12px]", settingsTheme.success)}>
            <Cloud className="h-3.5 w-3.5" />
            Last GitHub sync: {format(parseISO(lastSync), "MMM d, yyyy h:mm a")}
          </p>
        )}
        {status && <p className={cn("mt-2 text-[13px]", settingsTheme.success)}>{status}</p>}
        {error && <p className={cn("mt-2 text-[13px]", settingsTheme.danger)}>{error}</p>}
      </SettingsPanel>

      <Dialog open={confirmImport} onOpenChange={setConfirmImport}>
        <DialogContent className="border-white/[0.08] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Import from GitHub?</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">
            This replaces all data in this browser with your GitHub backup. Continue?
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setConfirmImport(false)} className={cn(settingsTheme.btnSecondary, "flex-1")}>
              Cancel
            </button>
            <button type="button" onClick={runImport} disabled={busy === "import"} className={cn(settingsTheme.btnPrimary, "flex-1")}>
              {busy === "import" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
