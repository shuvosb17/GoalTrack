"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const proseClass =
  "prose prose-invert prose-sm max-w-none prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-headings:text-foreground prose-a:text-primary";

export function ProseBlock({ markdown }: { markdown: string }) {
  return (
    <div className={proseClass}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}

export function CalloutBlock({
  variant,
  title,
  markdown,
}: {
  variant: "insight" | "tip" | "warning";
  title?: string;
  markdown: string;
}) {
  const styles = {
    insight: "border-violet-500/30 bg-violet-500/[0.06] text-violet-200",
    tip: "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200",
    warning: "border-amber-500/30 bg-amber-500/[0.06] text-amber-200",
  };
  return (
    <div className={cn("rounded-lg border px-4 py-3", styles[variant])}>
      {title && <p className="mb-1 text-sm font-medium">{title}</p>}
      <div className={cn(proseClass, "prose-p:text-inherit prose-li:text-inherit")}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}

export function CodeBlock({
  language,
  code,
  caption,
}: {
  language: string;
  code: string;
  caption?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.08]">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{language}</span>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-foreground/90">{code}</code>
      </pre>
      {caption && <p className="border-t border-white/[0.06] px-3 py-2 text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}

export function SubpatternsBlock({ items }: { items: { name: string; description: string }[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.name} className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export function ProblemsBlock({
  items,
}: {
  items: { title: string; slug: string; difficulty: string; note: string }[];
}) {
  const diffColor: Record<string, string> = {
    easy: "text-[#97C459]",
    medium: "text-[#FAC775]",
    hard: "text-red-400",
  };
  return (
    <ul className="space-y-2">
      {items.map((p) => (
        <li
          key={p.slug}
          className="flex flex-wrap items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
        >
          <a
            href={`https://leetcode.com/problems/${p.slug}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            {p.title}
          </a>
          <span className={cn("text-[10px] font-medium uppercase", diffColor[p.difficulty] ?? "")}>
            {p.difficulty}
          </span>
          <span className="w-full text-xs text-muted-foreground">{p.note}</span>
        </li>
      ))}
    </ul>
  );
}

export function ComplexityBlock({
  rows,
}: {
  rows: { operation: string; time: string; space: string }[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.03] text-left text-xs text-muted-foreground">
            <th className="px-3 py-2">Operation</th>
            <th className="px-3 py-2">Time</th>
            <th className="px-3 py-2">Space</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.operation} className="border-b border-white/[0.04]">
              <td className="px-3 py-2 font-medium">{row.operation}</td>
              <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.time}</td>
              <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.space}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
