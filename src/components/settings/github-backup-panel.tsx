"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudDownload, CloudUpload, Github, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  SettingsField,
  SettingsPanel,
  SettingsStatus,
  settingsControlClass,
} from "@/components/settings/settings-ui";

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
      setStatus(
        `Backup found (saved ${format(parseISO(peek.exportedAt), "MMM d, yyyy h:mm a")}). Enter PIN and import.`
      );
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

  return (
    <>
      <SettingsPanel
        title="Cloud sync (GitHub)"
        description={
          <>
            PIN-encrypted backup in{" "}
            <a
              href="https://github.com/shuvosb17/GoalTrack-Backup"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              GoalTrack-Backup
            </a>
            . Import only needs your PIN — no GitHub token in the app.
          </>
        }
        icon={<Github className="h-4 w-4" />}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <SettingsField label="GitHub repo" className="sm:col-span-2">
            <Input
              className={settingsControlClass}
              placeholder="username/repo or full URL"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onBlur={persistConfig}
            />
          </SettingsField>

          <SettingsField label="Branch">
            <Input
              className={settingsControlClass}
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              onBlur={persistConfig}
            />
          </SettingsField>

          <SettingsField label="Backup file">
            <Input
              className={settingsControlClass}
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onBlur={persistConfig}
            />
          </SettingsField>

          <SettingsField
            label={
              <span className="inline-flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                Backup PIN
              </span>
            }
            className="sm:col-span-2"
          >
            <Input
              type="password"
              className={settingsControlClass}
              placeholder="Your private PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="off"
            />
          </SettingsField>
        </div>

        <SettingsActions className="mt-6">
          <Button onClick={handleBackup} disabled={busy !== null} className="h-11 gap-2 px-5">
            {busy === "backup" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CloudUpload className="h-4 w-4" />
            )}
            Backup to GitHub
          </Button>
          <Button
            variant="outline"
            onClick={handleImport}
            disabled={busy !== null}
            className="h-11 gap-2 px-5"
          >
            {busy === "import" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CloudDownload className="h-4 w-4" />
            )}
            Import from GitHub
          </Button>
          <Button
            variant="ghost"
            onClick={handleTestConnection}
            disabled={busy !== null}
            className="h-11 gap-2 px-4 text-primary hover:bg-primary/10 hover:text-primary"
          >
            {busy === "test" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Cloud className="h-4 w-4" />
            )}
            Test connection
          </Button>
        </SettingsActions>

        <div className="mt-4 space-y-1.5">
          {lastSync && (
            <SettingsStatus tone="success">
              <Cloud className="h-3.5 w-3.5" />
              Last sync: {format(parseISO(lastSync), "MMM d, yyyy h:mm a")}
            </SettingsStatus>
          )}
          {status && <SettingsStatus tone="success">{status}</SettingsStatus>}
          {error && <SettingsStatus tone="danger">{error}</SettingsStatus>}
        </div>
      </SettingsPanel>

      <Dialog open={confirmImport} onOpenChange={setConfirmImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from GitHub?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This replaces all data in this browser with your GitHub backup. Continue?
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setConfirmImport(false)}
              className="h-11 flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={runImport}
              disabled={busy === "import"}
              className="h-11 flex-1"
            >
              {busy === "import" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Import"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
