"use client";

import { useMemo } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/settings/settings-ui";

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
      description="Restore archived modules, topics, and subtopics without changing study hours."
      icon={<Archive className="h-4 w-4" />}
    >
      {totalCount === 0 ? (
        <SettingsEmpty>Nothing archived.</SettingsEmpty>
      ) : (
        <SettingsScrollArea>
          {groups.map(({ track, modules: blocks }) => (
            <div
              key={track.id}
              className="rounded-xl border border-white/[0.06] bg-secondary/25 p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm">{track.icon}</span>
                <p className="text-sm font-semibold" style={{ color: track.color }}>
                  {track.name}
                </p>
              </div>

              <div className="space-y-3">
                {blocks.map(({ module: mod, archivedModule, topics: archTopics, subtopics: archSubs }) => (
                  <div
                    key={mod.id}
                    className="rounded-lg border border-white/[0.05] bg-background/40 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {mod.name}
                        </p>
                        {archivedModule && (
                          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                            Module archived
                          </p>
                        )}
                      </div>
                      {archivedModule && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 shrink-0 gap-1.5 text-xs"
                          onClick={() => void unarchiveModule(mod.id)}
                        >
                          <ArchiveRestore className="h-3.5 w-3.5" />
                          Restore
                        </Button>
                      )}
                    </div>

                    {archTopics.length > 0 && (
                      <ul className="mb-2 space-y-1">
                        {archTopics.map((topic) => (
                          <li
                            key={topic.id}
                            className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-white/[0.03]"
                          >
                            <span className="min-w-0 truncate">Topic · {topic.name}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
                              title="Restore topic"
                              onClick={() => void unarchiveTopic(topic.id)}
                            >
                              <ArchiveRestore className="h-3.5 w-3.5" />
                            </Button>
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
                              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-white/[0.03]"
                            >
                              <span className="min-w-0 truncate">
                                Subtopic · {sub.name}
                                {topic ? (
                                  <span className="text-muted-foreground/70"> · {topic.name}</span>
                                ) : null}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
                                title="Restore subtopic"
                                onClick={() => void unarchiveSubtopic(sub.id)}
                              >
                                <ArchiveRestore className="h-3.5 w-3.5" />
                              </Button>
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
