"use client";

import { useState, useRef } from "react";
import { v4 as uuid } from "uuid";
import {
  Settings,
  Download,
  Upload,
  Clock,
  Shield,
  AlertCircle,
  Target,
  BarChart3,
  History,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSettings, useTracks, useAllModules, useAllTopics, useSessions } from "@/hooks/use-data";
import { db } from "@/lib/db";
import { exportAllData, importAllData } from "@/lib/seed";
import { saveAutoBackup, getLastBackupTime } from "@/lib/auto-backup";
import {
  saveBackupToExportFolder,
  pickExportDirectory,
  getDefaultExportFolderHint,
} from "@/lib/export-folder";
import { nowISO, todayISO, formatDuration, cn } from "@/lib/utils";
import { getSuggestedDailyFromTarget } from "@/lib/metrics";
import { MdImportPanel } from "@/components/settings/md-import-panel";
import { GitHubBackupPanel } from "@/components/settings/github-backup-panel";
import { ArchivedItemsPanel } from "@/components/settings/archived-items-panel";
import { RecycleBinPanel } from "@/components/settings/recycle-bin-panel";
import {
  SettingsActions,
  SettingsField,
  SettingsGroup,
  SettingsHeader,
  SettingsHint,
  SettingsNotice,
  SettingsPageShell,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  SettingsStatus,
  settingsControlClass,
  settingsTheme,
} from "@/components/settings/settings-ui";
import { format, parseISO } from "date-fns";

export default function SettingsPage() {
  const settings = useSettings();
  const tracks = useTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const sessions = useSessions();
  const fileRef = useRef<HTMLInputElement>(null);
  const lastBackup = getLastBackupTime();

  const [manualEntry, setManualEntry] = useState({
    trackId: "", moduleId: "", topicId: "", subtopicId: "",
    hours: 1, minutes: 0, date: todayISO(), notes: "",
  });

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExport = async () => {
    const data = await exportAllData();
    const filename = `goaltrack-backup-${todayISO()}.json`;
    const saved = await saveBackupToExportFolder(data, filename);
    await saveAutoBackup();
    if (saved.ok) {
      setExportNotice(`Saved to ${saved.path ?? getDefaultExportFolderHint()}`);
    } else {
      setExportNotice(saved.error ?? "Export failed");
    }
    window.setTimeout(() => setExportNotice(null), 5000);
  };

  const handleChooseExportFolder = async () => {
    const handle = await pickExportDirectory();
    if (handle) {
      setExportNotice(`Export folder set to "${handle.name}". Future exports save here.`);
      window.setTimeout(() => setExportNotice(null), 5000);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    await importAllData(data);
    await saveAutoBackup();
    window.location.reload();
  };

  const handleManualEntry = async () => {
    if (!manualEntry.trackId) return;
    const duration = (manualEntry.hours * 3600 + manualEntry.minutes * 60) * 1000;
    const start = new Date(`${manualEntry.date}T09:00:00`);
    await db.sessions.add({
      id: uuid(),
      trackId: manualEntry.trackId,
      moduleId: manualEntry.moduleId || undefined,
      topicId: manualEntry.topicId || undefined,
      subtopicId: manualEntry.subtopicId || undefined,
      startTime: start.toISOString(),
      endTime: new Date(start.getTime() + duration).toISOString(),
      duration,
      date: manualEntry.date,
      notes: manualEntry.notes || undefined,
      manual: true,
      createdAt: nowISO(),
    });
    await saveAutoBackup();
    setManualEntry({ ...manualEntry, hours: 1, minutes: 0, notes: "" });
  };

  const trackModules = modules.filter((m) => m.trackId === manualEntry.trackId);
  const moduleTopics = topics.filter((t) => t.moduleId === manualEntry.moduleId);

  return (
    <SettingsPageShell>
      <SettingsHeader
        title="Settings"
        subtitle="Backups, goals, imports, and study time"
        icon={<Settings className="h-5 w-5" />}
      />

      <SettingsNotice
        tone="warning"
        icon={<AlertCircle className="h-5 w-5 text-amber-400" />}
        title="Data stays in this browser"
      >
        <p>
          Chrome, Edge, and Vercel each keep separate storage. Use{" "}
          <span className="font-medium text-foreground/90">Cloud Sync</span> for other devices,
          or export a JSON backup before switching browsers.
        </p>
        {lastBackup && (
          <SettingsStatus tone="success">
            Last auto-backup: {format(parseISO(lastBackup), "MMM d, yyyy h:mm a")}
          </SettingsStatus>
        )}
      </SettingsNotice>

      <SettingsSection label="Data & sync">
        <SettingsPanel
          title="Backup & restore"
          description="Export your full database as JSON, or import a previous backup into this browser."
          icon={<Shield className="h-4 w-4" />}
        >
          <SettingsActions>
            <Button onClick={handleExport} className="h-11 gap-2 px-5">
              <Download className="h-4 w-4" />
              Export full backup
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleChooseExportFolder()}
              className="h-11 gap-2 px-5"
            >
              <FolderOpen className="h-4 w-4" />
              Choose export folder
            </Button>
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="h-11 gap-2 px-5"
            >
              <Upload className="h-4 w-4" />
              Import backup
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </SettingsActions>

          {exportNotice && (
            <SettingsStatus
              className="mt-4"
              tone={
                exportNotice.startsWith("Saved") || exportNotice.startsWith("Export folder")
                  ? "success"
                  : "warning"
              }
            >
              {exportNotice}
            </SettingsStatus>
          )}

          <SettingsHint className="mt-4">
            Default folder:{" "}
            <code className="rounded-md bg-secondary/70 px-1.5 py-0.5 text-[11px] text-foreground/80">
              {getDefaultExportFolderHint()}
            </code>
            . On the Edge app, choose a folder once so exports land in the right place.
          </SettingsHint>
        </SettingsPanel>

        <GitHubBackupPanel />
      </SettingsSection>

      <SettingsSection label="Import">
        <MdImportPanel />
      </SettingsSection>

      <SettingsSection label="Organization">
        <ArchivedItemsPanel />
        <RecycleBinPanel />
      </SettingsSection>

      <SettingsSection label="Goals & planning">
        <SettingsPanel
          title="Weekly track commitments"
          description="Optional hours-per-week targets used by the dashboard time distribution chart."
          icon={<BarChart3 className="h-4 w-4" />}
        >
          {tracks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tracks yet.</p>
          ) : (
            <SettingsGroup>
              {tracks.map((track, index) => (
                <SettingsRow
                  key={track.id}
                  label={`${track.icon} ${track.name}`}
                  hint="Hours per week"
                  noDivider={index === tracks.length - 1}
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={80}
                      step={0.5}
                      className={cn(settingsControlClass, "max-w-[7.5rem]")}
                      value={track.weeklyCommitmentHours ?? ""}
                      placeholder="—"
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          void db.tracks.put({
                            ...track,
                            weeklyCommitmentHours: undefined,
                            updatedAt: nowISO(),
                          });
                          return;
                        }
                        const n = Number(raw);
                        if (Number.isNaN(n)) return;
                        const clamped = Math.min(80, Math.max(0, n));
                        void db.tracks.put({
                          ...track,
                          weeklyCommitmentHours: clamped === 0 ? undefined : clamped,
                          updatedAt: nowISO(),
                        });
                      }}
                    />
                    <span className="shrink-0 text-sm text-muted-foreground">h</span>
                  </div>
                </SettingsRow>
              ))}
            </SettingsGroup>
          )}
        </SettingsPanel>

        <SettingsPanel
          title="Yearly goals"
          description="Set floor, target, and stretch hour goals for the year."
          icon={<Target className="h-4 w-4" />}
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <SettingsField label="Minimum" hint="Floor you'll hit">
              <Input
                type="number"
                className={settingsControlClass}
                value={settings?.tieredGoal?.minimum ?? 300}
                onChange={(e) =>
                  settings &&
                  db.settings.put({
                    ...settings,
                    tieredGoal: {
                      ...(settings.tieredGoal ?? {
                        minimum: 300,
                        target: 700,
                        stretch: 2000,
                        year: 2026,
                      }),
                      minimum: Number(e.target.value),
                    },
                  })
                }
              />
            </SettingsField>
            <SettingsField label="Target" hint="Primary aim">
              <Input
                type="number"
                className={settingsControlClass}
                value={settings?.tieredGoal?.target ?? 700}
                onChange={(e) =>
                  settings &&
                  db.settings.put({
                    ...settings,
                    tieredGoal: {
                      ...(settings.tieredGoal ?? {
                        minimum: 300,
                        target: 700,
                        stretch: 2000,
                        year: 2026,
                      }),
                      target: Number(e.target.value),
                    },
                  })
                }
              />
            </SettingsField>
            <SettingsField label="Stretch" hint="Best-case dream">
              <Input
                type="number"
                className={settingsControlClass}
                value={settings?.tieredGoal?.stretch ?? settings?.yearlyHourGoal ?? 2000}
                onChange={(e) => {
                  if (!settings) return;
                  const stretch = Number(e.target.value);
                  db.settings.put({
                    ...settings,
                    yearlyHourGoal: stretch,
                    tieredGoal: {
                      ...(settings.tieredGoal ?? {
                        minimum: 300,
                        target: 700,
                        stretch: 2000,
                        year: 2026,
                      }),
                      stretch,
                    },
                  });
                }}
              />
            </SettingsField>
          </div>

          <div className="mt-5 max-w-xs">
            <SettingsField label="Daily hour goal">
              <Input
                type="number"
                className={settingsControlClass}
                value={settings?.dailyHourGoal ?? 3}
                onChange={(e) =>
                  settings &&
                  db.settings.put({
                    ...settings,
                    dailyHourGoal: Number(e.target.value),
                  })
                }
              />
            </SettingsField>
          </div>

          {settings?.tieredGoal && (
            <div className="mt-5 rounded-xl border border-white/[0.06] bg-secondary/25 px-4 py-3.5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                To hit your target ({settings.tieredGoal.target}h), plan about{" "}
                <span className="font-medium text-foreground">
                  {getSuggestedDailyFromTarget(
                    settings,
                    sessions,
                    settings.yearStart,
                    settings.yearEnd
                  ).toFixed(1)}
                  h/day
                </span>{" "}
                on weekdays for the{" "}
                {Math.max(
                  1,
                  Math.round(
                    (new Date(settings.yearEnd).getTime() - Date.now()) / 6048e5
                  )
                )}{" "}
                weeks left. Current daily goal: {settings.dailyHourGoal}h.
              </p>
            </div>
          )}
        </SettingsPanel>
      </SettingsSection>

      <SettingsSection label="Time tracking">
        <SettingsPanel
          title="Manual time entry"
          description="Log study time when you forgot to start the timer."
          icon={<Clock className="h-4 w-4" />}
        >
          <div className="mx-auto max-w-xl space-y-4">
            <SettingsField label="Track">
              <Select
                value={manualEntry.trackId}
                onValueChange={(v) =>
                  setManualEntry({
                    ...manualEntry,
                    trackId: v,
                    moduleId: "",
                    topicId: "",
                  })
                }
              >
                <SelectTrigger className={settingsControlClass}>
                  <SelectValue placeholder="Select track" />
                </SelectTrigger>
                <SelectContent>
                  {tracks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsField>

            {trackModules.length > 0 && (
              <SettingsField label="Module" hint="Optional">
                <Select
                  value={manualEntry.moduleId}
                  onValueChange={(v) =>
                    setManualEntry({ ...manualEntry, moduleId: v, topicId: "" })
                  }
                >
                  <SelectTrigger className={settingsControlClass}>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {trackModules.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingsField>
            )}

            {moduleTopics.length > 0 && (
              <SettingsField label="Topic" hint="Optional">
                <Select
                  value={manualEntry.topicId}
                  onValueChange={(v) =>
                    setManualEntry({ ...manualEntry, topicId: v })
                  }
                >
                  <SelectTrigger className={settingsControlClass}>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {moduleTopics.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingsField>
            )}

            <SettingsField label="Date">
              <Input
                type="date"
                className={settingsControlClass}
                value={manualEntry.date}
                onChange={(e) =>
                  setManualEntry({ ...manualEntry, date: e.target.value })
                }
              />
            </SettingsField>

            <div className="grid grid-cols-2 gap-3">
              <SettingsField label="Hours">
                <Input
                  type="number"
                  className={settingsControlClass}
                  value={manualEntry.hours}
                  onChange={(e) =>
                    setManualEntry({
                      ...manualEntry,
                      hours: Number(e.target.value),
                    })
                  }
                />
              </SettingsField>
              <SettingsField label="Minutes">
                <Input
                  type="number"
                  className={settingsControlClass}
                  value={manualEntry.minutes}
                  onChange={(e) =>
                    setManualEntry({
                      ...manualEntry,
                      minutes: Number(e.target.value),
                    })
                  }
                />
              </SettingsField>
            </div>

            <SettingsField label="Notes" hint="Optional">
              <Input
                className={settingsControlClass}
                placeholder="What did you work on?"
                value={manualEntry.notes}
                onChange={(e) =>
                  setManualEntry({ ...manualEntry, notes: e.target.value })
                }
              />
            </SettingsField>

            <Button onClick={handleManualEntry} className="h-11 w-full">
              Add time entry
            </Button>
          </div>
        </SettingsPanel>

        <SettingsPanel
          title="Recent sessions"
          description="Last 10 sessions logged in this browser."
          icon={<History className="h-4 w-4" />}
        >
          <div className={settingsTheme.groupInset}>
            {sessions.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No sessions yet.
              </p>
            ) : (
              <ul>
                {sessions
                  .slice(-10)
                  .reverse()
                  .map((s, index, arr) => (
                    <li
                      key={s.id}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3.5 text-sm",
                        index < arr.length - 1 && "border-b border-white/[0.06]"
                      )}
                    >
                      <span className="text-foreground/90">
                        {s.date}
                        {s.manual ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            manual
                          </span>
                        ) : null}
                      </span>
                      <span className="font-mono text-sm text-primary">
                        {formatDuration(s.duration)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </SettingsPanel>
      </SettingsSection>
    </SettingsPageShell>
  );
}
