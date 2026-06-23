"use client";

import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function PatternNotesToc({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav className="hidden xl:block w-48 shrink-0">
      <div className="sticky top-24">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          On this page
        </p>
        <ul className="space-y-1 border-l border-white/[0.08]">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block border-l-2 border-transparent py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-primary/50",
                  item.level === 3 && "pl-4"
                )}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
