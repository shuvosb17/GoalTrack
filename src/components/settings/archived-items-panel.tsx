"use client";

import { useMemo } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import {
  useAllTracks,
  useAllModules,
  useAllTopics,
  useAllSubtopics,
} from "@/hooks/use-data";
import {
  unarchiveModule,
  unarchiveTopic,
  unarchiveSubtopic,
} from "@/lib/crud";
import {
  SettingsEmpty,
  SettingsPanel,
  SettingsScrollArea,
  settingsTheme,
} from "@/components/settings/settings-ui";
import { cn } from "@/lib/utils";

export function ArchivedItemsPanel() {
  const tracks = useAllTracks();
  const modules = useAllModules();
  const topics = useAllTopics();
  const subtopics = useAllSubtopics();

  const groups = useMemo(() => {
    const trackOrder = [...tracks].sort((a, b) => a.order - b.order);
    return trackOrder
      .map((track) => {
        const trackModules = modules
          .filter((m) => m.trackId === track.id)
          .sort((a, b) => a.order - b.order);

        const moduleBlocks = trackModules
          .map((mod) => {
            const archivedModule = mod.archived;
            const archivedTopics = topics
              .filter((t) => t.moduleId === mod.id && t.archived)
              .sort((a, b) => a.order - b.order);
            const archivedSubs = subtopics
              .filter((s) => s.moduleId === mod.id && s.archived)
              .sort((a, b) => a.order - b.order);

            if (!archivedModule && archivedTopics.length === 0 && archivedSubs.length === 0) {
              return null;
            }

            return {
              module: mod,
              archivedModule,
              topics: archivedTopics,
              subtopics: archivedSubs,
            };
          })
          .filter(Boolean) as Array<{
            module: (typeof modules)[number];
            archivedModule: boolean;
            topics: typeof topics;
            subtopics: typeof subtopics;
          }>;

        if (moduleBlocks.length === 0) return null;
        return { track, modules: moduleBlocks };
      })
      .filter(Boolean) as Array<{
        track: (typeof tracks)[number];
        modules: Array<{
          module: (typeof modules)[number];
          archivedModule: boolean;
          topics: typeof topics;
          subtopics: typeof subtopics;
        }>;
      }>;
  }, [tracks, modules, topics, subtopics]);

  const totalCount = useMemo(() => {
    let n = 0;
    for (const g of groups) {
      for (const block of g.modules) {
        if (block.archivedModule) n += 1;
        n += block.topics.length + block.subtopics.length;
      }
    }
    return n;
  }, [groups]);

  return (
    <SettingsPanel
      title="Archived list"
      description="Archived modules, topics, and subtopics — ordered by track, then module. Restore returns them to Tracks without changing study hours."
      icon={<Archive className="h-5 w-5" />}
    >
      {totalCount === 0 ? (
        <SettingsEmpty>Nothing archived.</SettingsEmpty>
      ) : (
        <SettingsScrollArea>
          {groups.map(({ track, modules: blocks }) => (
            <div key={track.id} className="rounded-xl border border-white/[0.05] bg-secondary/40 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm">{track.icon}</span>
                <p className="text-[13px] font-medium" style={{ color: track.color }}>
                  {track.name}
                </p>
              </div>
              <div className="space-y-3 pl-1">
                {blocks.map(({ module: mod, archivedModule, topics: archTopics, subtopics: archSubs }) => (
                  <div key={mod.id} className="rounded-lg border border-white/[0.04] bg-secondary/60 p-2.5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-[13px] font-medium text-foreground">
                        {mod.name}
                        {archivedModule && (
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                            module archived
                          </span>
                        )}
                      </p>
                      {archivedModule && (
                        <button
                          type="button"
                          className={cn(settingsTheme.btnSecondary, "h-8 gap-1 px-2.5 text-[11px]")}
                          onClick={() => void unarchiveModule(mod.id)}
                        >
                          <ArchiveRestore className="h-3 w-3" /> Restore
                        </button>
                      )}
                    </div>

                    {archTopics.length > 0 && (
                      <ul className="mb-2 space-y-1">
                        {archTopics.map((topic) => (
                          <li
                            key={topic.id}
                            className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-white/[0.03]"
                          >
                            <span className="min-w-0 truncate">Topic · {topic.name}</span>
                            <button
                              type="button"
                              title="Restore topic"
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-primary/10"
                              onClick={() => void unarchiveTopic(topic.id)}
                            >
                              <ArchiveRestore className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {archSubs.length > 0 && (
                      <ul className="space-y-1">
                        {archSubs.map((sub) => {
                          const topic = topics.find((t) => t.id === sub.topicId);
                          return (
                            <li
                              key={sub.id}
                              className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-white/[0.03]"
                            >
                              <span className="min-w-0 truncate">
                                Subtopic · {sub.name}
                                {topic ? (
                                  <span className="text-muted-foreground/70"> · {topic.name}</span>
                                ) : null}
                              </span>
                              <button
                                type="button"
                                title="Restore subtopic"
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-primary/10"
                                onClick={() => void unarchiveSubtopic(sub.id)}
                              >
                                <ArchiveRestore className="h-3.5 w-3.5" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </SettingsScrollArea>
      )}
    </SettingsPanel>
  );
}
