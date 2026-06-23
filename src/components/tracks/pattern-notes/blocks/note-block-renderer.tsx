"use client";

import type { NoteBlock } from "@/lib/pattern-notes/types";
import {
  ProseBlock,
  CalloutBlock,
  CodeBlock,
  SubpatternsBlock,
  ProblemsBlock,
  ComplexityBlock,
} from "./note-blocks";
import { VizBlock } from "./viz-block";
import { cn } from "@/lib/utils";

export function NoteBlockRenderer({ block }: { block: NoteBlock }) {
  switch (block.type) {
    case "heading":
      if (block.level === 2) {
        return (
          <h2
            id={block.id}
            className={cn(
              "scroll-mt-24 text-lg font-semibold tracking-tight text-foreground",
              "border-b border-white/[0.06] pb-2 pt-6 first:pt-0"
            )}
          >
            {block.text}
          </h2>
        );
      }
      return (
        <h3 id={block.id} className="scroll-mt-24 pt-4 text-base font-medium text-foreground">
          {block.text}
        </h3>
      );
    case "prose":
      return <ProseBlock markdown={block.markdown} />;
    case "callout":
      return <CalloutBlock variant={block.variant} title={block.title} markdown={block.markdown} />;
    case "code":
      return <CodeBlock language={block.language} code={block.code} caption={block.caption} />;
    case "viz":
      return <VizBlock viz={block.viz} />;
    case "subpatterns":
      return <SubpatternsBlock items={block.items} />;
    case "problems":
      return <ProblemsBlock items={block.items} />;
    case "complexity":
      return <ComplexityBlock rows={block.rows} />;
    default:
      return null;
  }
}

export function extractHeadings(blocks: NoteBlock[]): { id: string; text: string; level: number }[] {
  return blocks
    .filter((b): b is Extract<NoteBlock, { type: "heading" }> => b.type === "heading")
    .map((b) => ({ id: b.id, text: b.text, level: b.level }));
}
