"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  SettingsField,
  SettingsPanel,
  SettingsStatus,
  settingsControlClass,
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
      icon={<FileText className="h-4 w-4" />}
    >
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v as "module" | "track");
          setPreview(null);
        }}
      >
        <TabsList className="h-11 w-full justify-start gap-1 rounded-lg border border-white/[0.06] bg-secondary/40 p-1 sm:w-auto">
          <TabsTrigger
            value="module"
            className="rounded-md px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Into module
          </TabsTrigger>
          <TabsTrigger
            value="track"
            className="rounded-md px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Into track
          </TabsTrigger>
        </TabsList>

        <TabsContent value="module" className="mt-4 space-y-2">
          <pre className="overflow-x-auto rounded-xl border border-white/[0.06] bg-secondary/30 p-4 text-xs leading-relaxed text-muted-foreground">
            {MD_IMPORT_EXAMPLE}
          </pre>
          <p className="text-xs text-muted-foreground">## Topic · - Subtopic</p>
        </TabsContent>

        <TabsContent value="track" className="mt-4 space-y-2">
          <pre className="overflow-x-auto rounded-xl border border-white/[0.06] bg-secondary/30 p-4 text-xs leading-relaxed text-muted-foreground">
            {MD_TRACK_EXAMPLE}
          </pre>
          <p className="text-xs text-muted-foreground"># Module · ## Topic · - Subtopic</p>
        </TabsContent>
      </Tabs>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <SettingsField label="Track">
          <Select
            value={trackId}
            onValueChange={(v) => {
              setTrackId(v);
              setModuleId("");
            }}
          >
            <SelectTrigger className={settingsControlClass}>
              <SelectValue placeholder="Select track" />
            </SelectTrigger>
            <SelectContent>
              {tracks.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.icon} {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsField>

        {mode === "module" && (
          <SettingsField label="Module">
            <Select value={moduleId} onValueChange={setModuleId} disabled={!trackId}>
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
      </div>

      <SettingsActions className="mt-5">
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          className="h-11 gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload .md
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".md,.markdown,.txt"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          variant="ghost"
          onClick={() => {
            setContent(mode === "module" ? MD_IMPORT_EXAMPLE : MD_TRACK_EXAMPLE);
          }}
          className="h-11 gap-2 text-primary hover:bg-primary/10 hover:text-primary"
        >
          Load example
        </Button>
      </SettingsActions>

      <Textarea
        placeholder="Paste markdown here…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={cn(settingsTheme.textarea, "mt-5")}
      />

      <SettingsActions className="mt-5">
        <Button
          variant="secondary"
          onClick={handlePreview}
          disabled={!content.trim()}
          className="h-11 gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Button
          onClick={handleImport}
          disabled={!preview || !trackId || (mode === "module" && !moduleId) || importing}
          className="h-11 gap-2"
        >
          {importing ? "Importing…" : "Import"}
        </Button>
      </SettingsActions>

      {preview && (
        <div className="mt-5 space-y-3 rounded-xl border border-white/[0.06] bg-secondary/25 p-4">
          <p className="text-sm font-medium text-foreground">Preview</p>
          {mode === "module" ? (
            preview.flatTopics.map((t, i) => (
              <div key={i} className="border-l-2 border-primary/35 pl-3">
                <p className="text-sm font-medium text-foreground/90">{t.name}</p>
                {t.subtopics.map((s, j) => (
                  <p key={j} className="pl-1 text-xs text-muted-foreground">
                    · {s}
                  </p>
                ))}
              </div>
            ))
          ) : (
            preview.modules.map((m, i) => (
              <div key={i} className="space-y-1.5">
                <p className="text-sm font-medium text-primary"># {m.name}</p>
                {m.topics.map((t, j) => (
                  <div key={j} className="pl-3">
                    <p className="text-sm font-medium text-foreground/90">## {t.name}</p>
                    {t.subtopics.map((s, k) => (
                      <p key={k} className="pl-1 text-xs text-muted-foreground">
                        · {s}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {result && (
        <SettingsStatus tone="success" className="mt-4">
          {result}
        </SettingsStatus>
      )}
    </SettingsPanel>
  );
}
