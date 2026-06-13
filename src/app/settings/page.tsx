"use client";

import { useState, useRef } from "react";
import { v4 as uuid } from "uuid";
import { Settings, Download, Upload, Clock, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSettings, useTracks, useAllModules, useAllTopics, useSessions } from "@/hooks/use-data";
import { db } from "@/lib/db";
import { exportAllData, importAllData } from "@/lib/seed";
import { saveAutoBackup, getLastBackupTime, downloadBackup } from "@/lib/auto-backup";
import { nowISO, todayISO, formatDuration } from "@/lib/utils";
import { MdImportPanel } from "@/components/settings/md-import-panel";
import { GitHubBackupPanel } from "@/components/settings/github-backup-panel";
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

  const handleExport = async () => {
    const data = await exportAllData();
    downloadBackup(data, `goaltrack-backup-${todayISO()}.json`);
    await saveAutoBackup();
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
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:gap-3 sm:text-3xl lg:text-4xl">
          <Settings className="h-7 w-7 shrink-0 text-primary sm:h-9 sm:w-9" /> Settings
        </h1>
        <p className="mt-2 text-base text-muted-foreground sm:text-lg">Configure your learning command center</p>
      </div>

      {/* Data safety notice */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <AlertCircle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-amber-300">Your data lives in this browser only</p>
              <p className="text-muted-foreground leading-relaxed">
                Chrome, Edge, Cursor browser, and Vercel each have <strong>separate storage</strong>.
                Progress in one won&apos;t appear in another automatically.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>For mobile / other devices:</strong> use <strong>Cloud Sync (GitHub)</strong> below — backup from your main device, then import with your PIN on any device.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Local backup:</strong> Export JSON before switching browsers. Auto-backup also saves locally every 45 seconds.
              </p>
              {lastBackup && (
                <p className="text-xs text-emerald-400">
                  Last auto-backup: {format(parseISO(lastBackup), "MMM d, yyyy h:mm a")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" /> Backup & Restore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export your full database (progress, sessions, journal, achievements) as JSON.
            Use this file to migrate to Vercel, another browser, or another device.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExport} className="gap-2 h-11 px-6">
              <Download className="h-4 w-4" /> Export Full Backup
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2 h-11 px-6">
              <Upload className="h-4 w-4" /> Import Backup
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </CardContent>
      </Card>

      <GitHubBackupPanel />

      <MdImportPanel />

      <Card>
        <CardHeader><CardTitle className="text-xl">Goals</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm text-muted-foreground">Minimum goal (h)</label>
              <p className="text-[10px] text-muted-foreground/70 mb-1">Floor I&apos;ll definitely hit</p>
              <Input
                type="number"
                className="h-11 mt-1"
                value={settings?.tieredGoal?.minimum ?? 300}
                onChange={(e) => settings && db.settings.put({
                  ...settings,
                  tieredGoal: { ...(settings.tieredGoal ?? { minimum: 300, target: 700, stretch: 2000, year: 2026 }), minimum: Number(e.target.value) },
                })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Target goal (h)</label>
              <p className="text-[10px] text-muted-foreground/70 mb-1">What I&apos;m actually aiming for</p>
              <Input
                type="number"
                className="h-11 mt-1"
                value={settings?.tieredGoal?.target ?? 700}
                onChange={(e) => settings && db.settings.put({
                  ...settings,
                  tieredGoal: { ...(settings.tieredGoal ?? { minimum: 300, target: 700, stretch: 2000, year: 2026 }), target: Number(e.target.value) },
                })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Stretch goal (h)</label>
              <p className="text-[10px] text-muted-foreground/70 mb-1">Best case / dream target</p>
              <Input
                type="number"
                className="h-11 mt-1"
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
          <div>
            <label className="text-sm text-muted-foreground">Daily Hour Goal</label>
            <Input
              type="number"
              className="h-11 mt-1"
              value={settings?.dailyHourGoal ?? 3}
              onChange={(e) => settings && db.settings.put({ ...settings, dailyHourGoal: Number(e.target.value) })}
            />
            {settings?.tieredGoal && (
              <p className="mt-2 text-xs text-muted-foreground">
                To hit your Target ({settings.tieredGoal.target}h), you need ~{((settings.tieredGoal.target / 29) / 5).toFixed(1)}h/day on weekdays.
                Your current daily goal is {settings.dailyHourGoal}h.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Clock className="h-5 w-5" /> Manual Time Entry</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={manualEntry.trackId} onValueChange={(v) => setManualEntry({ ...manualEntry, trackId: v, moduleId: "", topicId: "" })}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Select track" /></SelectTrigger>
            <SelectContent>{tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
          {trackModules.length > 0 && (
            <Select value={manualEntry.moduleId} onValueChange={(v) => setManualEntry({ ...manualEntry, moduleId: v, topicId: "" })}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select module (optional)" /></SelectTrigger>
              <SelectContent>{trackModules.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          {moduleTopics.length > 0 && (
            <Select value={manualEntry.topicId} onValueChange={(v) => setManualEntry({ ...manualEntry, topicId: v })}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select topic (optional)" /></SelectTrigger>
              <SelectContent>{moduleTopics.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Input type="date" className="h-11" value={manualEntry.date} onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })} />
          <div className="flex gap-2">
            <Input type="number" className="h-11" placeholder="Hours" value={manualEntry.hours} onChange={(e) => setManualEntry({ ...manualEntry, hours: Number(e.target.value) })} />
            <Input type="number" className="h-11" placeholder="Minutes" value={manualEntry.minutes} onChange={(e) => setManualEntry({ ...manualEntry, minutes: Number(e.target.value) })} />
          </div>
          <Input className="h-11" placeholder="Notes (optional)" value={manualEntry.notes} onChange={(e) => setManualEntry({ ...manualEntry, notes: e.target.value })} />
          <Button onClick={handleManualEntry} className="w-full h-11">Add Time Entry</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-xl">Recent Sessions</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-60 overflow-y-auto">
          {sessions.slice(-10).reverse().map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm p-3 rounded-lg hover:bg-secondary/30">
              <span>{s.date} {s.manual && <span className="text-xs text-muted-foreground">(manual)</span>}</span>
              <span className="font-mono">{formatDuration(s.duration)}</span>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
