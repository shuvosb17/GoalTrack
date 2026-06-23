"use client";

import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCatalogBySection } from "@/lib/pattern-notes/catalog";
import { usePatternNotesStore } from "@/stores/pattern-notes-store";
import { cn } from "@/lib/utils";

interface PatternNotesSidebarProps {
  activeSlug: string;
  onSelect: (slug: string) => void;
  mobile?: boolean;
  onClose?: () => void;
}

export function PatternNotesSidebar({
  activeSlug,
  onSelect,
  mobile,
  onClose,
}: PatternNotesSidebarProps) {
  const [search, setSearch] = useState("");
  const isRead = usePatternNotesStore((s) => s.isRead);
  const foundation = getCatalogBySection("foundation");
  const advanced = getCatalogBySection("advanced");

  const filter = useMemo(
    () => (title: string) =>
      !search.trim() || title.toLowerCase().includes(search.toLowerCase()),
    [search]
  );

  const sections = useMemo(
    () => [
      { label: "Foundation", items: foundation.filter((p) => filter(p.title)) },
      { label: "Advanced", items: advanced.filter((p) => filter(p.title)) },
    ],
    [foundation, advanced, filter]
  );

  return (
    <aside
      className={cn(
        "flex flex-col",
        mobile ? "h-full" : "w-56 shrink-0 border-r border-white/[0.06] pr-3"
      )}
    >
      {mobile && (
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">Patterns</span>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patterns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 pl-8 text-xs"
        />
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto">
        {sections.map((section) =>
          section.items.length === 0 ? null : (
            <div key={section.label}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(item.slug);
                        onClose?.();
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                        activeSlug === item.slug
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      {isRead(item.slug) && (
                        <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
    </aside>
  );
}
