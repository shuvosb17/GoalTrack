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
} from "lucide-react";
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
import { nowISO, todayISO, formatDuration } from "@/lib/utils";
import { getSuggestedDailyFromTarget } from "@/lib/metrics";
import { MdImportPanel } from "@/components/settings/md-import-panel";
import { GitHubBackupPanel } from "@/components/settings/github-backup-panel";
import { ArchivedItemsPanel } from "@/components/settings/archived-items-panel";
import { RecycleBinPanel } from "@/components/settings/recycle-bin-panel";
import {
  SettingsActions,
  SettingsFieldLabel,
  SettingsGroup,
  SettingsHeader,
  SettingsInputClass,
  SettingsNotice,
  SettingsPageShell,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  settingsTheme,
} from "@/components/settings/settings-ui";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

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
  const inputClass = SettingsInputClass();
  const selectTriggerClass = cn(inputClass, "w-full");

  return (
    <SettingsPageShell>
      <SettingsHeader
        title="Settings"
        subtitle="Configure goals, backups, and your learning workspace"
        icon={<Settings className="h-5 w-5" />}
      />

      <SettingsNotice
        tone="warning"
        icon={<AlertCircle className="h-5 w-5 text-[#e8b339]" />}
        title="Your data lives in this browser only"
      >
        <p>
          Chrome, Edge, Cursor browser, and Vercel each have <strong className="text-[#b8c5d1]">separate storage</strong>.
          Progress in one won&apos;t appear in another automatically.
        </p>
        <p>
          <strong className="text-[#b8c5d1]">For mobile / other devices:</strong> use Cloud Sync (GitHub) below — backup from your main device, then import with your PIN on any device.
        </p>
        <p>
          <strong className="text-[#b8c5d1]">Local backup:</strong> Export JSON before switching browsers. Auto-backup also saves locally every 45 seconds.
        </p>
        {lastBackup && (
          <p className={settingsTheme.success}>
            Last auto-backup: {format(parseISO(lastBackup), "MMM d, yyyy h:mm a")}
          </p>
        )}
      </SettingsNotice>

      <SettingsSection label="Data & sync">
        <SettingsPanel
          title="Backup & Restore"
          description="Export your full database as JSON to migrate between browsers or devices."
          icon={<Shield className="h-5 w-5" />}
        >
          <SettingsActions>
            <button type="button" onClick={handleExport} className={settingsTheme.btnPrimary}>
              <Download className="h-4 w-4" /> Export Full Backup
            </button>
            <button type="button" onClick={() => void handleChooseExportFolder()} className={settingsTheme.btnSecondary}>
              Choose export folder
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className={settingsTheme.btnSecondary}>
              <Upload className="h-4 w-4" /> Import Backup
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </SettingsActions>
          {exportNotice && (
            <p
              className={cn(
                "mt-3 text-[12px]",
                exportNotice.startsWith("Saved") || exportNotice.startsWith("Export folder")
                  ? settingsTheme.success
                  : settingsTheme.warning
              )}
            >
              {exportNotice}
            </p>
          )}
          <p className="mt-3 text-[12px] text-[#5f6f7f]">
            Exports save to <code className="rounded bg-[#242f3d] px-1.5 py-0.5 text-[11px] text-[#8b9bab]">{getDefaultExportFolderHint()}</code> when the local app is running.
            For the installed Edge app, use Choose export folder once and select that folder.
          </p>
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
          title="Track weekly commitments"
          description="Optional weekly hour goal per track for the dashboard distribution chart."
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <SettingsGroup>
            {tracks.map((track, index) => (
              <div key={track.id}>
                <SettingsRow
                  label={`${track.icon} ${track.name}`}
                  hint="Used for your weekly time distribution goal"
                  noDivider={index === tracks.length - 1}
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={80}
                      step={0.5}
                      className={cn(inputClass, "max-w-[8rem]")}
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
                    <span className="text-[13px] text-[#6d7f8f]">h / week</span>
                  </div>
                </SettingsRow>
              </div>
            ))}
            {tracks.length === 0 && (
              <p className="px-4 py-6 text-center text-[13px] text-[#6d7f8f]">No tracks yet.</p>
            )}
          </SettingsGroup>
        </SettingsPanel>

        <SettingsPanel
          title="Goals"
          description="Set your minimum, target, and stretch hour goals for the year."
          icon={<Target className="h-5 w-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <SettingsFieldLabel hint="Floor I'll definitely hit">Minimum goal (h)</SettingsFieldLabel>
              <Input
                type="number"
                className={inputClass}
                value={settings?.tieredGoal?.minimum ?? 300}
                onChange={(e) => settings && db.settings.put({
                  ...settings,
                  tieredGoal: { ...(settings.tieredGoal ?? { minimum: 300, target: 700, stretch: 2000, year: 2026 }), minimum: Number(e.target.value) },
                })}
              />
            </div>
            <div>
              <SettingsFieldLabel hint="What I'm actually aiming for">Target goal (h)</SettingsFieldLabel>
              <Input
                type="number"
                className={inputClass}
                value={settings?.tieredGoal?.target ?? 700}
                onChange={(e) => settings && db.settings.put({
                  ...settings,
                  tieredGoal: { ...(settings.tieredGoal ?? { minimum: 300, target: 700, stretch: 2000, year: 2026 }), target: Number(e.target.value) },
                })}
              />
            </div>
            <div>
              <SettingsFieldLabel hint="Best case / dream target">Stretch goal (h)</SettingsFieldLabel>
              <Input
                type="number"
                className={inputClass}
                value={settings?.tieredGoal?.stretch ?? settings?.yearlyHourGoal ?? 2000}
                onChange={(e) => {
                  if (!settings) return;
                  const stretch = Number(e.target.value);
                  db.settings.put({
                    ...settings,
                    yearlyHourGoal: stretch,
                    tieredGoal: { ...(settings.tieredGoal ?? { minimum: 300, target: 700, stretch: 2000, year: 2026 }), stretch },
                  });
                }}
              />
            </div>
          </div>
          <div className="mt-4">
            <SettingsFieldLabel>Daily hour goal</SettingsFieldLabel>
            <Input
              type="number"
              className={cn(inputClass, "max-w-[10rem]")}
              value={settings?.dailyHourGoal ?? 3}
              onChange={(e) => settings && db.settings.put({ ...settings, dailyHourGoal: Number(e.target.value) })}
            />
            {settings?.tieredGoal && (
              <p className="mt-3 rounded-xl bg-[#1c2733] px-3.5 py-3 text-[12px] leading-relaxed text-[#6d7f8f]">
                To hit your Target ({settings.tieredGoal.target}h), you need ~{getSuggestedDailyFromTarget(settings, sessions, settings.yearStart, settings.yearEnd).toFixed(1)}h/day on weekdays
                for the {Math.max(1, Math.round((new Date(settings.yearEnd).getTime() - Date.now()) / 6048e5))} weeks left.
                Your current daily goal is {settings.dailyHourGoal}h.
              </p>
            )}
          </div>
        </SettingsPanel>
      </SettingsSection>

      <SettingsSection label="Time tracking">
        <SettingsPanel
          title="Manual time entry"
          description="Log study time when you forgot to use the timer."
          icon={<Clock className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <Select value={manualEntry.trackId} onValueChange={(v) => setManualEntry({ ...manualEntry, trackId: v, moduleId: "", topicId: "" })}>
              <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Select track" /></SelectTrigger>
              <SelectContent>{tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            {trackModules.length > 0 && (
              <Select value={manualEntry.moduleId} onValueChange={(v) => setManualEntry({ ...manualEntry, moduleId: v, topicId: "" })}>
                <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Select module (optional)" /></SelectTrigger>
                <SelectContent>{trackModules.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            {moduleTopics.length > 0 && (
              <Select value={manualEntry.topicId} onValueChange={(v) => setManualEntry({ ...manualEntry, topicId: v })}>
                <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Select topic (optional)" /></SelectTrigger>
                <SelectContent>{moduleTopics.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <Input type="date" className={inputClass} value={manualEntry.date} onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" className={inputClass} placeholder="Hours" value={manualEntry.hours} onChange={(e) => setManualEntry({ ...manualEntry, hours: Number(e.target.value) })} />
              <Input type="number" className={inputClass} placeholder="Minutes" value={manualEntry.minutes} onChange={(e) => setManualEntry({ ...manualEntry, minutes: Number(e.target.value) })} />
            </div>
            <Input className={inputClass} placeholder="Notes (optional)" value={manualEntry.notes} onChange={(e) => setManualEntry({ ...manualEntry, notes: e.target.value })} />
            <button type="button" onClick={handleManualEntry} className={cn(settingsTheme.btnPrimary, "w-full")}>
              Add time entry
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel
          title="Recent sessions"
          description="Last 10 study sessions in this browser."
          icon={<History className="h-5 w-5" />}
        >
          <div className={settingsTheme.groupInset}>
            <div className="max-h-60 overflow-y-auto">
              {sessions.slice(-10).reverse().map((s, index, arr) => (
                <div key={s.id}>
                  <div className="flex items-center justify-between px-3.5 py-3 text-[13px] transition-colors hover:bg-white/[0.03]">
                    <span className="text-[#c5d0db]">
                      {s.date}
                      {s.manual && <span className="ml-1.5 text-[11px] text-[#6d7f8f]">(manual)</span>}
                    </span>
                    <span className="font-mono text-[13px] text-[#6ab3f3]">{formatDuration(s.duration)}</span>
                  </div>
                  {index < arr.length - 1 ? <div className="mx-3.5 h-px bg-white/[0.06]" /> : null}
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="px-3.5 py-6 text-center text-[13px] text-[#6d7f8f]">No sessions yet.</p>
              )}
            </div>
          </div>
        </SettingsPanel>
      </SettingsSection>
    </SettingsPageShell>
  );
}
