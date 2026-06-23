import type { NoteBlock, PatternNoteArticle, PatternNoteContentInput } from "./types";

function h2(text: string): NoteBlock {
  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return { type: "heading", level: 2, text, id };
}

/** Build a full article from structured inputs using the standard template. */
export function buildPatternArticle(input: PatternNoteContentInput): PatternNoteArticle {
  const blocks: NoteBlock[] = [
    h2("Intuition"),
    { type: "prose", markdown: input.intuition },
    h2("Recognition signals"),
    {
      type: "prose",
      markdown: input.signals.map((s) => `- ${s}`).join("\n"),
    },
    h2("Core sub-patterns"),
    { type: "subpatterns", items: input.subpatterns },
    h2("Algorithm template"),
    {
      type: "code",
      language: input.templateCode.language,
      code: input.templateCode.code,
      caption: input.templateCode.caption,
    },
  ];

  if (input.viz) {
    blocks.push(h2("Visualization"), { type: "viz", viz: input.viz });
  }

  blocks.push(
    h2("Worked mental model"),
    { type: "prose", markdown: input.walkthrough },
    h2("Canonical problems"),
    { type: "problems", items: input.problems },
    h2("Pitfalls & interview tips"),
    {
      type: "callout",
      variant: "warning",
      title: "Watch out",
      markdown: input.pitfalls,
    },
    h2("Complexity cheat sheet"),
    { type: "complexity", rows: input.complexity }
  );

  return { meta: input.meta, summary: input.summary, blocks };
}
