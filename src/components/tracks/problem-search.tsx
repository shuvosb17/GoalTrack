"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InlineCodeText } from "@/components/shared/inline-code-text";
import { cn } from "@/lib/utils";

export interface ProblemSearchResult {
  subtopicId: string;
  name: string;
  moduleId: string;
  moduleName: string;
  topicId: string;
  topicName: string;
}

interface ProblemSearchProps {
  value: string;
  onChange: (value: string) => void;
  results: ProblemSearchResult[];
  onSelect: (result: ProblemSearchResult) => void;
  className?: string;
}

export function ProblemSearch({
  value,
  onChange,
  results,
  onSelect,
  className,
}: ProblemSearchProps) {
  const query = value.trim();
  const showResults = query.length > 0;

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search problems…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 pl-8 pr-8 text-xs"
          aria-label="Search problems"
        />
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-0.5 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => onChange("")}
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {showResults && (
        <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-border/50 bg-background/95 shadow-sm">
          {results.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-muted-foreground">
              No problems match “{query}”
            </p>
          ) : (
            <ul className="divide-y divide-border/40 py-0.5">
              {results.map((result) => (
                <li key={result.subtopicId}>
                  <button
                    type="button"
                    className="flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-secondary/40"
                    onClick={() => onSelect(result)}
                  >
                    <span className="text-sm text-foreground">
                      <InlineCodeText text={result.name} className="break-words" />
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {result.moduleName}
                      <span className="mx-1 text-muted-foreground/50">·</span>
                      {result.topicName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
