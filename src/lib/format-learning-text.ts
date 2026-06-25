export interface TextSegment {
  type: "text" | "code";
  value: string;
}

/** Split markdown-style `inline code` markers into renderable segments. */
export function parseInlineCodeSegments(text: string): TextSegment[] {
  if (!text.includes("`")) {
    return [{ type: "text", value: text }];
  }

  const segments: TextSegment[] = [];
  const regex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "code", value: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }];
}

/** Plain label for timers/tooltips — no markdown markers. */
export function toPlainLearningLabel(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
