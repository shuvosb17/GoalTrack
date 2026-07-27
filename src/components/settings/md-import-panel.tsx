"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Eye } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTracks, useAllModules } from "@/hooks/use-data";
import {
  previewMdImport, importMdIntoModule, importMdIntoTrack,
  MD_IMPORT_EXAMPLE, MD_TRACK_EXAMPLE,
} from "@/lib/md-import";
import { saveAutoBackup } from "@/lib/auto-backup";
import {
  SettingsActions,
  SettingsFieldLabel,
  SettingsInputClass,
  SettingsPanel,
  settingsTheme,
} from "@/components/settings/settings-ui";
import { cn } from "@/lib/utils";

export function MdImportPanel() {
  const tracks = useTracks();
  const modules = useAllModules();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"module" | "track">("module");
  const [trackId, setTrackId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof previewMdImport> | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const trackModules = modules.filter((m) => m.trackId === trackId && !m.archived);
  const inputClass = SettingsInputClass();
  const selectTriggerClass = cn(inputClass, "w-full");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setContent(text);
    setPreview(previewMdImport(text, mode));
    setResult(null);
  };

  const handlePreview = () => {
    if (!content.trim()) return;
    setPreview(previewMdImport(content, mode));
    setResult(null);
  };

  const handleImport = async () => {
    if (!trackId || !preview) return;
    setImporting(true);
    try {
      if (mode === "module") {
        if (!moduleId) return;
        const r = await importMdIntoModule(trackId, moduleId, preview.flatTopics);
        setResult(`Imported ${r.topics} topics and ${r.subtopics} subtopics.`);
      } else {
        const r = await importMdIntoTrack(trackId, preview.modules);
        setResult(`Imported ${r.modules} modules, ${r.topics} topics, ${r.subtopics} subtopics.`);
      }
      await saveAutoBackup();
      setContent("");
      setPreview(null);
    } finally {
      setImporting(false);
    }
  };

  return (
    <SettingsPanel
      title="Import from Markdown"
      description="Paste or upload a .md file to create topics and subtopics automatically."
      icon={<FileText className="h-5 w-5" />}
    >
      <Tabs value={mode} onValueChange={(v) => { setMode(v as "module" | "track"); setPreview(null); }}>
        <TabsList className="h-11 rounded-xl border border-white/[0.06] bg-secondary/60 p-1">
          <TabsTrigger
            value="module"
            className="rounded-lg px-4 text-[13px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Into Module
          </TabsTrigger>
          <TabsTrigger
            value="track"
            className="rounded-lg px-4 text-[13px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Into Track (full hierarchy)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="module" className="mt-4">
          <pre className="overflow-x-auto rounded-xl border border-white/[0.05] bg-secondary/40 p-4 text-xs text-muted-foreground">{MD_IMPORT_EXAMPLE}</pre>
          <p className="mt-2 text-[11px] text-muted-foreground/70">## = Topic · - bullet = Subtopic</p>
        </TabsContent>
        <TabsContent value="track" className="mt-4">
          <pre className="overflow-x-auto rounded-xl border border-white/[0.05] bg-secondary/40 p-4 text-xs text-muted-foreground">{MD_TRACK_EXAMPLE}</pre>
          <p className="mt-2 text-[11px] text-muted-foreground/70"># = Module · ## = Topic · - bullet = Subtopic</p>
        </TabsContent>
      </Tabs>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <SettingsFieldLabel>Track</SettingsFieldLabel>
          <Select value={trackId} onValueChange={(v) => { setTrackId(v); setModuleId(""); }}>
            <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Select track" /></SelectTrigger>
            <SelectContent>{tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.icon} {t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {mode === "module" && (
          <div>
            <SettingsFieldLabel>Module</SettingsFieldLabel>
            <Select value={moduleId} onValueChange={setModuleId} disabled={!trackId}>
              <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Select module" /></SelectTrigger>
              <SelectContent>{trackModules.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
      </div>

      <SettingsActions className="mt-4">
        <button type="button" onClick={() => fileRef.current?.click()} className={settingsTheme.btnSecondary}>
          <Upload className="h-4 w-4" /> Upload .md
        </button>
        <input ref={fileRef} type="file" accept=".md,.markdown,.txt" className="hidden" onChange={handleFile} />
        <button
          type="button"
          onClick={() => { setContent(mode === "module" ? MD_IMPORT_EXAMPLE : MD_TRACK_EXAMPLE); }}
          className={settingsTheme.btnGhost}
        >
          Load example
        </button>
      </SettingsActions>

      <Textarea
        placeholder="Paste markdown here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={cn(settingsTheme.textarea, "mt-4")}
      />

      <SettingsActions className="mt-4">
        <button type="button" onClick={handlePreview} className={settingsTheme.btnSecondary} disabled={!content.trim()}>
          <Eye className="h-4 w-4" /> Preview
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={!preview || !trackId || (mode === "module" && !moduleId) || importing}
          className={settingsTheme.btnPrimary}
        >
          {importing ? "Importing..." : "Import"}
        </button>
      </SettingsActions>

      {preview && (
        <div className="mt-4 space-y-2 rounded-xl border border-white/[0.05] bg-secondary/40 p-4 text-[13px]">
          <p className="font-medium text-foreground">Preview</p>
          {mode === "module" ? (
            preview.flatTopics.map((t, i) => (
              <div key={i} className="border-l-2 border-primary/40 pl-3">
                <p className="font-medium text-foreground/90">{t.name}</p>
                {t.subtopics.map((s, j) => <p key={j} className="pl-2 text-[11px] text-muted-foreground">· {s}</p>)}
              </div>
            ))
          ) : (
            preview.modules.map((m, i) => (
              <div key={i}>
                <p className="font-medium text-primary"># {m.name}</p>
                {m.topics.map((t, j) => (
                  <div key={j} className="mt-1 pl-4">
                    <p className="font-medium text-foreground/90">## {t.name}</p>
                    {t.subtopics.map((s, k) => <p key={k} className="pl-2 text-[11px] text-muted-foreground">· {s}</p>)}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {result && <p className={cn("mt-3 text-[13px]", settingsTheme.success)}>{result}</p>}
    </SettingsPanel>
  );
}
