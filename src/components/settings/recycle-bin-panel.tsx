"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { RotateCcw, Trash2, Trash } from "lucide-react";
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
import {
  SettingsEmpty,
  SettingsListItem,
  SettingsPanel,
  SettingsScrollArea,
  settingsTheme,
} from "@/components/settings/settings-ui";
import { cn } from "@/lib/utils";

export function RecycleBinPanel() {
  const tracks = useAllTracks();
  const deletedModules = useDeletedModules();
  const deletedTopics = useDeletedTopics();
  const deletedSubtopics = useDeletedSubtopics();

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

  const topicRoots = useMemo(
    () =>
      deletedTopics
        .filter((t) => !deletedModules.some((m) => m.id === t.moduleId))
        .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "")),
    [deletedTopics, deletedModules]
  );

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
    <SettingsPanel
      title="Recycle bin"
      description="Soft-deleted modules, topics, and subtopics. Restore brings them back to Tracks. Permanent delete removes the hierarchy only — study sessions and total hours are kept."
      icon={<Trash2 className="h-5 w-5" />}
      action={
        total > 0 ? (
          <button
            type="button"
            className={settingsTheme.btnDanger}
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
          </button>
        ) : undefined
      }
    >
      {total === 0 ? (
        <SettingsEmpty>Recycle bin is empty.</SettingsEmpty>
      ) : (
        <SettingsScrollArea>
          {moduleRoots.map((mod) => (
            <SettingsListItem
              key={mod.id}
              actions={
                <>
                  <button
                    type="button"
                    className={cn(settingsTheme.btnSecondary, "h-8 gap-1 px-2.5 text-[11px]")}
                    onClick={() => void restoreModule(mod.id)}
                  >
                    <RotateCcw className="h-3 w-3" /> Restore
                  </button>
                  <button
                    type="button"
                    className={cn(settingsTheme.btnDanger, "h-8")}
                    onClick={() => {
                      if (window.confirm(`Permanently delete module "${mod.name}"?`)) {
                        void purgeModule(mod.id);
                      }
                    }}
                  >
                    <Trash className="h-3 w-3" /> Delete
                  </button>
                </>
              }
            >
              <p className="truncate text-[13px] font-medium text-foreground">Module · {mod.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {trackName(mod.trackId)}
                {mod.deletedAt ? ` · ${formatDeleted(mod.deletedAt)}` : ""}
                {" · "}
                includes nested topics/subtopics
              </p>
            </SettingsListItem>
          ))}

          {topicRoots.map((topic) => (
            <SettingsListItem
              key={topic.id}
              actions={
                <>
                  <button
                    type="button"
                    className={cn(settingsTheme.btnSecondary, "h-8 gap-1 px-2.5 text-[11px]")}
                    onClick={() => void restoreTopic(topic.id)}
                  >
                    <RotateCcw className="h-3 w-3" /> Restore
                  </button>
                  <button
                    type="button"
                    className={cn(settingsTheme.btnDanger, "h-8")}
                    onClick={() => {
                      if (window.confirm(`Permanently delete topic "${topic.name}"?`)) {
                        void purgeTopic(topic.id);
                      }
                    }}
                  >
                    <Trash className="h-3 w-3" /> Delete
                  </button>
                </>
              }
            >
              <p className="truncate text-[13px] font-medium text-foreground">Topic · {topic.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {trackName(topic.trackId)} → {moduleName(topic.moduleId)}
                {topic.deletedAt ? ` · ${formatDeleted(topic.deletedAt)}` : ""}
              </p>
            </SettingsListItem>
          ))}

          {subtopicRoots.map((sub) => (
            <SettingsListItem
              key={sub.id}
              actions={
                <>
                  <button
                    type="button"
                    className={cn(settingsTheme.btnSecondary, "h-8 gap-1 px-2.5 text-[11px]")}
                    onClick={() => void restoreSubtopic(sub.id)}
                  >
                    <RotateCcw className="h-3 w-3" /> Restore
                  </button>
                  <button
                    type="button"
                    className={cn(settingsTheme.btnDanger, "h-8")}
                    onClick={() => {
                      if (window.confirm(`Permanently delete subtopic "${sub.name}"?`)) {
                        void purgeSubtopic(sub.id);
                      }
                    }}
                  >
                    <Trash className="h-3 w-3" /> Delete
                  </button>
                </>
              }
            >
              <p className="truncate text-[13px] font-medium text-foreground">Subtopic · {sub.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {trackName(sub.trackId)} → {moduleName(sub.moduleId)} → {topicName(sub.topicId)}
                {sub.deletedAt ? ` · ${formatDeleted(sub.deletedAt)}` : ""}
              </p>
            </SettingsListItem>
          ))}
        </SettingsScrollArea>
      )}
    </SettingsPanel>
  );
}
