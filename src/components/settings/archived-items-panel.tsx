"use client";

import { useMemo } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

        // Orphan archived topics/subtopics if module missing from list (shouldn't happen)
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Archive className="h-5 w-5 text-primary" />
          Archived list
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Archived modules, topics, and subtopics — ordered by track, then module.
          Restore returns them to Tracks without changing study hours.
        </p>

        {totalCount === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nothing archived.</p>
        ) : (
          <div className="max-h-[28rem] space-y-4 overflow-y-auto overscroll-contain pr-1">
            {groups.map(({ track, modules: blocks }) => (
              <div key={track.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm">{track.icon}</span>
                  <p className="text-sm font-medium" style={{ color: track.color }}>
                    {track.name}
                  </p>
                </div>
                <div className="space-y-3 pl-1">
                  {blocks.map(({ module: mod, archivedModule, topics: archTopics, subtopics: archSubs }) => (
                    <div key={mod.id} className="rounded-md border border-white/[0.05] bg-black/20 p-2.5">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-medium">
                          {mod.name}
                          {archivedModule && (
                            <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                              module archived
                            </span>
                          )}
                        </p>
                        {archivedModule && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 shrink-0 gap-1 px-2 text-[11px]"
                            onClick={() => void unarchiveModule(mod.id)}
                          >
                            <ArchiveRestore className="h-3 w-3" /> Restore
                          </Button>
                        )}
                      </div>

                      {archTopics.length > 0 && (
                        <ul className="mb-2 space-y-1.5">
                          {archTopics.map((topic) => (
                            <li
                              key={topic.id}
                              className="flex items-center justify-between gap-2 rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-white/[0.03]"
                            >
                              <span className="min-w-0 truncate">Topic · {topic.name}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 shrink-0"
                                title="Restore topic"
                                onClick={() => void unarchiveTopic(topic.id)}
                              >
                                <ArchiveRestore className="h-3 w-3" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}

                      {archSubs.length > 0 && (
                        <ul className="space-y-1.5">
                          {archSubs.map((sub) => {
                            const topic = topics.find((t) => t.id === sub.topicId);
                            return (
                              <li
                                key={sub.id}
                                className="flex items-center justify-between gap-2 rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-white/[0.03]"
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
                                  className="h-6 w-6 shrink-0"
                                  title="Restore subtopic"
                                  onClick={() => void unarchiveSubtopic(sub.id)}
                                >
                                  <ArchiveRestore className="h-3 w-3" />
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
