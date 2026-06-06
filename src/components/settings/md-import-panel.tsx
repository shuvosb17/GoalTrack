"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-primary" /> Import from Markdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste or upload a .md file to create topics and subtopics automatically.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs value={mode} onValueChange={(v) => { setMode(v as "module" | "track"); setPreview(null); }}>
          <TabsList className="h-11">
            <TabsTrigger value="module" className="text-sm px-4">Into Module</TabsTrigger>
            <TabsTrigger value="track" className="text-sm px-4">Into Track (full hierarchy)</TabsTrigger>
          </TabsList>
          <TabsContent value="module" className="mt-4">
            <pre className="text-xs bg-secondary/50 p-4 rounded-xl overflow-x-auto text-muted-foreground">{MD_IMPORT_EXAMPLE}</pre>
            <p className="text-xs text-muted-foreground mt-2">## = Topic · - bullet = Subtopic</p>
          </TabsContent>
          <TabsContent value="track" className="mt-4">
            <pre className="text-xs bg-secondary/50 p-4 rounded-xl overflow-x-auto text-muted-foreground">{MD_TRACK_EXAMPLE}</pre>
            <p className="text-xs text-muted-foreground mt-2"># = Module · ## = Topic · - bullet = Subtopic</p>
          </TabsContent>
        </Tabs>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Track</label>
            <Select value={trackId} onValueChange={(v) => { setTrackId(v); setModuleId(""); }}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select track" /></SelectTrigger>
              <SelectContent>{tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.icon} {t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {mode === "module" && (
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Module</label>
              <Select value={moduleId} onValueChange={setModuleId} disabled={!trackId}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select module" /></SelectTrigger>
                <SelectContent>{trackModules.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" /> Upload .md
          </Button>
          <input ref={fileRef} type="file" accept=".md,.markdown,.txt" className="hidden" onChange={handleFile} />
          <Button variant="outline" onClick={() => { setContent(mode === "module" ? MD_IMPORT_EXAMPLE : MD_TRACK_EXAMPLE); }} className="gap-2">
            Load Example
          </Button>
        </div>

        <Textarea
          placeholder="Paste markdown here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[180px] text-sm font-mono"
        />

        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePreview} className="gap-2" disabled={!content.trim()}>
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button
            onClick={handleImport}
            disabled={!preview || !trackId || (mode === "module" && !moduleId) || importing}
            className="gap-2"
          >
            {importing ? "Importing..." : "Import"}
          </Button>
        </div>

        {preview && (
          <div className="glass rounded-xl p-4 space-y-2 text-sm">
            <p className="font-medium">Preview</p>
            {mode === "module" ? (
              preview.flatTopics.map((t, i) => (
                <div key={i} className="pl-3 border-l-2 border-primary/30">
                  <p className="font-medium">{t.name}</p>
                  {t.subtopics.map((s, j) => <p key={j} className="text-muted-foreground text-xs pl-2">· {s}</p>)}
                </div>
              ))
            ) : (
              preview.modules.map((m, i) => (
                <div key={i}>
                  <p className="font-medium text-primary"># {m.name}</p>
                  {m.topics.map((t, j) => (
                    <div key={j} className="pl-4 mt-1">
                      <p className="font-medium">## {t.name}</p>
                      {t.subtopics.map((s, k) => <p key={k} className="text-muted-foreground text-xs pl-2">· {s}</p>)}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {result && <p className="text-sm text-emerald-400">{result}</p>}
      </CardContent>
    </Card>
  );
}
