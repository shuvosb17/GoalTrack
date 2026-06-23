import type { NoteBlock, PatternNoteArticle, PatternNoteContentInput } from "./types";

function h2(text: string): NoteBlock {
  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return { type: "heading", level: 2, text, id };
}

function h3(text: string): NoteBlock {
  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return { type: "heading", level: 3, text, id };
}

/** Build a full article from structured inputs using the standard template. */
export function buildPatternArticle(input: PatternNoteContentInput): PatternNoteArticle {
  const blocks: NoteBlock[] = [
    h2("Intuition"),
    { type: "prose", markdown: input.intuition },
  ];

  if (input.deepDive) {
    blocks.push({ type: "prose", markdown: input.deepDive });
  }

  blocks.push(
    h2("Recognition signals"),
    {
      type: "prose",
      markdown: input.signals.map((s) => `- ${s}`).join("\n"),
    },
    h2("Core sub-patterns"),
    { type: "subpatterns", items: input.subpatterns },
    h2("Algorithm template (C++)"),
    {
      type: "code",
      language: input.templateCode.language,
      code: input.templateCode.code,
      caption: input.templateCode.caption ?? "Primary template — adapt variables and conditions to the problem.",
    }
  );

  if (input.variantCode) {
    blocks.push(
      h3(input.variantCode.title),
      {
        type: "code",
        language: input.variantCode.language,
        code: input.variantCode.code,
        caption: input.variantCode.caption,
      }
    );
  }

  if (input.viz) {
    blocks.push(h2("Visualization"), { type: "viz", viz: input.viz });
  }

  blocks.push(h2("Worked mental model"), { type: "prose", markdown: input.walkthrough });

  if (input.steps?.length) {
    blocks.push(
      h2("Step-by-step approach"),
      {
        type: "prose",
        markdown: input.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
      }
    );
  }

  blocks.push(
    h2("Canonical problems"),
    { type: "problems", items: input.problems },
    h2("Pitfalls & interview tips"),
    {
      type: "callout",
      variant: "warning",
      title: "Watch out",
      markdown: input.pitfalls,
    }
  );

  if (input.interviewTips) {
    blocks.push({
      type: "callout",
      variant: "tip",
      title: "Interview communication",
      markdown: input.interviewTips,
    });
  }

  blocks.push(h2("Complexity cheat sheet"), { type: "complexity", rows: input.complexity });

  return { meta: input.meta, summary: input.summary, blocks };
}
