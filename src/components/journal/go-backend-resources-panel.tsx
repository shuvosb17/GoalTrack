"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Film,
  FileText,
  GraduationCap,
  Layers,
  Newspaper,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InlineCodeText } from "@/components/shared/inline-code-text";
import {
  buildGoBackendResourceCatalog,
  flattenGoResourceSubtopics,
} from "@/lib/go-backend-resources";
import type { GoResourceLink, GoResourceSubtopic, GoResourceType } from "@/lib/go-backend-resources";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  GoResourceType,
  { label: string; icon: typeof FileText; className: string }
> = {
  doc: { label: "Docs", icon: FileText, className: "text-sky-300/90 bg-sky-500/10 border-sky-500/20" },
  video: { label: "Video", icon: Film, className: "text-rose-300/90 bg-rose-500/10 border-rose-500/20" },
  blog: { label: "Blog", icon: Newspaper, className: "text-amber-300/90 bg-amber-500/10 border-amber-500/20" },
  course: { label: "Course", icon: GraduationCap, className: "text-emerald-300/90 bg-emerald-500/10 border-emerald-500/20" },
};

function matchesSearch(item: GoResourceSubtopic, query: string): boolean {
  if (!query) return true;
  const haystack = [
    item.moduleName,
    item.topicName,
    item.subtopicName,
    ...item.links.map((l) => `${l.title} ${l.source}`),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function ResourceLinkRow({ link }: { link: GoResourceLink }) {
  const meta = TYPE_META[link.type];
  const Icon = meta.icon;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
          meta.className
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground group-hover:text-violet-100">
            {link.title}
          </span>
          <Badge variant="outline" className="h-5 border-white/[0.08] px-1.5 text-[9px]">
            {meta.label}
          </Badge>
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
          {link.source}
        </span>
      </span>
      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

export function GoBackendResourcesPanel() {
  const catalog = useMemo(() => buildGoBackendResourceCatalog(), []);
  const allSubtopics = useMemo(() => flattenGoResourceSubtopics(catalog), [catalog]);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    () => new Set([0])
  );
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(
    () => new Set(["m0-t0"])
  );

  const query = search.trim().toLowerCase();

  const topicOptions = useMemo(() => {
    if (moduleFilter === "all") return [];
    const mod = catalog.find((m) => String(m.index) === moduleFilter);
    return mod?.topics ?? [];
  }, [catalog, moduleFilter]);

  const filtered = useMemo(() => {
    return allSubtopics.filter((item) => {
      if (moduleFilter !== "all" && String(item.moduleIndex) !== moduleFilter) return false;
      if (topicFilter !== "all" && String(item.topicIndex) !== topicFilter) return false;
      return matchesSearch(item, query);
    });
  }, [allSubtopics, moduleFilter, topicFilter, query]);

  const filteredByModule = useMemo(() => {
    const map = new Map<number, GoResourceSubtopic[]>();
    for (const item of filtered) {
      const list = map.get(item.moduleIndex) ?? [];
      list.push(item);
      map.set(item.moduleIndex, list);
    }
    return map;
  }, [filtered]);

  const stats = useMemo(
    () => ({
      modules: catalog.length,
      subtopics: allSubtopics.length,
      links: allSubtopics.reduce((sum, s) => sum + s.links.length, 0),
      showing: filtered.length,
    }),
    [catalog, allSubtopics, filtered]
  );

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleTopic = (key: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Modules", value: stats.modules },
          { label: "Subtopics", value: stats.subtopics },
          { label: "Curated links", value: stats.links },
          { label: "Showing", value: stats.showing },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-center"
          >
            <p className="text-2xl font-medium tabular-nums">{stat.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.015] p-4 lg:flex-row lg:items-end">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search module, topic, subtopic, or resource…"
            className="h-10 border-white/[0.08] bg-white/[0.03] pl-9"
          />
        </div>
        <Select
          value={moduleFilter}
          onValueChange={(v) => {
            setModuleFilter(v);
            setTopicFilter("all");
          }}
        >
          <SelectTrigger className="h-10 w-full border-white/[0.08] bg-white/[0.03] lg:w-[280px]">
            <SelectValue placeholder="All modules" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modules</SelectItem>
            {catalog.map((mod) => (
              <SelectItem key={mod.index} value={String(mod.index)}>
                {mod.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={topicFilter}
          onValueChange={setTopicFilter}
          disabled={moduleFilter === "all"}
        >
          <SelectTrigger className="h-10 w-full border-white/[0.08] bg-white/[0.03] lg:w-[260px]">
            <SelectValue placeholder={moduleFilter === "all" ? "Pick a module first" : "All topics"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All topics in module</SelectItem>
            {topicOptions.map((topic) => (
              <SelectItem key={topic.index} value={String(topic.index)}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.08] py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">No resources match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {catalog.map((mod) => {
            const modItems = filteredByModule.get(mod.index);
            if (!modItems?.length) return null;
            const modOpen = expandedModules.has(mod.index) || query.length > 0 || moduleFilter !== "all";

            const topicsInView = mod.topics
              .map((topic) => ({
                topic,
                items: modItems.filter((i) => i.topicIndex === topic.index),
              }))
              .filter((g) => g.items.length > 0);

            return (
              <div
                key={mod.index}
                className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.015]"
              >
                <button
                  type="button"
                  onClick={() => toggleModule(mod.index)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03]"
                >
                  {modOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <Layers className="h-4 w-4 shrink-0 text-violet-400" />
                  <span className="min-w-0 flex-1 font-medium">{mod.name}</span>
                  {mod.ongoing && (
                    <Badge variant="outline" className="border-violet-500/30 text-[10px] text-violet-300">
                      Ongoing
                    </Badge>
                  )}
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {modItems.length} subtopic{modItems.length === 1 ? "" : "s"}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {modOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 border-t border-white/[0.06] px-3 py-3">
                        {topicsInView.map(({ topic, items }) => {
                          const topicKey = `m${mod.index}-t${topic.index}`;
                          const topicOpen =
                            expandedTopics.has(topicKey) ||
                            query.length > 0 ||
                            topicFilter !== "all";

                          return (
                            <div
                              key={topicKey}
                              className="rounded-lg border border-white/[0.06] bg-black/20"
                            >
                              <button
                                type="button"
                                onClick={() => toggleTopic(topicKey)}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-white/[0.03]"
                              >
                                {topicOpen ? (
                                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                                <span className="min-w-0 flex-1 text-sm font-medium">
                                  {topic.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {items.length}
                                </span>
                              </button>

                              {topicOpen && (
                                <div className="space-y-3 border-t border-white/[0.05] px-3 py-3">
                                  {items.map((item) => (
                                    <div key={item.id} className="space-y-2">
                                      <div className="text-sm">
                                        <InlineCodeText
                                          text={item.subtopicName}
                                          className="font-medium text-foreground"
                                        />
                                      </div>
                                      <div className="grid gap-2 sm:grid-cols-1 lg:grid-cols-1">
                                        {item.links.map((link) => (
                                          <ResourceLinkRow key={link.url} link={link} />
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
