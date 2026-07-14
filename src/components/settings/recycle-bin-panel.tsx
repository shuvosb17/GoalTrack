"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { RotateCcw, Trash2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAllTracks,
  useDeletedModules,
  useDeletedTopics,
  useDeletedSubtopics,
} from "@/hooks/use-data";
import {
  restoreModule,
  restoreTopic,
  restoreSubtopic,
  purgeModule,
  purgeTopic,
  purgeSubtopic,
  emptyRecycleBin,
} from "@/lib/crud";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export function RecycleBinPanel() {
  const tracks = useAllTracks();
  const deletedModules = useDeletedModules();
  const deletedTopics = useDeletedTopics();
  const deletedSubtopics = useDeletedSubtopics();

  // Need all modules/topics (including deleted parents) for labels
  const allModules = useLiveQuery(() => db.modules.toArray(), []) ?? [];
  const allTopics = useLiveQuery(() => db.topics.toArray(), []) ?? [];

  const trackName = (trackId: string) =>
    tracks.find((t) => t.id === trackId)?.name ?? "Unknown track";
  const moduleName = (moduleId: string) =>
    allModules.find((m) => m.id === moduleId)?.name ?? "Unknown module";
  const topicName = (topicId: string) =>
    allTopics.find((t) => t.id === topicId)?.name ?? "Unknown topic";

  const moduleRoots = useMemo(
    () =>
      [...deletedModules].sort(
        (a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "")
      ),
    [deletedModules]
  );

  // Topics deleted without their module also being in bin as cascade root display —
  // show topics whose module is NOT deleted (standalone topic deletes)
  const topicRoots = useMemo(
    () =>
      deletedTopics
        .filter((t) => !deletedModules.some((m) => m.id === t.moduleId))
        .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "")),
    [deletedTopics, deletedModules]
  );

  // Subtopics deleted without parent topic deleted
  const subtopicRoots = useMemo(
    () =>
      deletedSubtopics
        .filter((s) => !deletedTopics.some((t) => t.id === s.topicId))
        .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "")),
    [deletedSubtopics, deletedTopics]
  );

  const total =
    moduleRoots.length + topicRoots.length + subtopicRoots.length;

  const formatDeleted = (iso?: string) => {
    if (!iso) return "";
    try {
      return format(parseISO(iso), "MMM d, yyyy h:mm a");
    } catch {
      return iso;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Trash2 className="h-5 w-5 text-primary" />
            Recycle bin
          </CardTitle>
          {total > 0 && (
            <Button
              size="sm"
              variant="destructive"
              className="h-8 gap-1.5"
              onClick={() => {
                if (
                  window.confirm(
                    "Permanently delete everything in the Recycle Bin? Study time logs stay. This cannot be undone."
                  )
                ) {
                  void emptyRecycleBin();
                }
              }}
            >
              <Trash className="h-3.5 w-3.5" /> Empty bin
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Soft-deleted modules, topics, and subtopics. Restore brings them back to Tracks.
          Permanent delete removes the hierarchy only — study sessions and total hours are kept.
        </p>

        {total === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Recycle bin is empty.</p>
        ) : (
          <div className="max-h-[28rem] space-y-2 overflow-y-auto overscroll-contain pr-1">
            {moduleRoots.map((mod) => (
              <div
                key={mod.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Module · {mod.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {trackName(mod.trackId)}
                    {mod.deletedAt ? ` · ${formatDeleted(mod.deletedAt)}` : ""}
                    {" · "}
                    includes nested topics/subtopics
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 px-2 text-[11px]"
                    onClick={() => void restoreModule(mod.id)}
                  >
                    <RotateCcw className="h-3 w-3" /> Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 px-2 text-[11px] text-destructive hover:text-destructive"
                    onClick={() => {
                      if (window.confirm(`Permanently delete module "${mod.name}"?`)) {
                        void purgeModule(mod.id);
                      }
                    }}
                  >
                    <Trash className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </div>
            ))}

            {topicRoots.map((topic) => (
              <div
                key={topic.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Topic · {topic.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {trackName(topic.trackId)} → {moduleName(topic.moduleId)}
                    {topic.deletedAt ? ` · ${formatDeleted(topic.deletedAt)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 px-2 text-[11px]"
                    onClick={() => void restoreTopic(topic.id)}
                  >
                    <RotateCcw className="h-3 w-3" /> Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 px-2 text-[11px] text-destructive hover:text-destructive"
                    onClick={() => {
                      if (window.confirm(`Permanently delete topic "${topic.name}"?`)) {
                        void purgeTopic(topic.id);
                      }
                    }}
                  >
                    <Trash className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </div>
            ))}

            {subtopicRoots.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Subtopic · {sub.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {trackName(sub.trackId)} → {moduleName(sub.moduleId)} → {topicName(sub.topicId)}
                    {sub.deletedAt ? ` · ${formatDeleted(sub.deletedAt)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 px-2 text-[11px]"
                    onClick={() => void restoreSubtopic(sub.id)}
                  >
                    <RotateCcw className="h-3 w-3" /> Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 px-2 text-[11px] text-destructive hover:text-destructive"
                    onClick={() => {
                      if (window.confirm(`Permanently delete subtopic "${sub.name}"?`)) {
                        void purgeSubtopic(sub.id);
                      }
                    }}
                  >
                    <Trash className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
