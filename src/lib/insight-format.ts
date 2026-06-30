import React from "react";

const HIGHLIGHT_PATTERN =
  /(\d+(?:\.\d+)?%|\d[\d,]*(?:\.\d+)?h(?:\/week)?|\d{1,2}(?::\d{2})?(?:am|pm)?[–-]\d{1,2}(?::\d{2})?(?:am|pm)?|\d+ days|\d+ hours|\d+-day|between \d+:\d+ and \d+:\d+|\b(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)s?\b)/gi;

export function renderInsightMessage(message: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const re = new RegExp(HIGHLIGHT_PATTERN.source, HIGHLIGHT_PATTERN.flags);

  for (const match of message.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(message.slice(lastIndex, index));
    }
    parts.push(
      React.createElement(
        "strong",
        { key: index, className: "font-medium text-foreground" },
        match[0]
      )
    );
    lastIndex = index + match[0].length;
  }

  if (lastIndex < message.length) {
    parts.push(message.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [message];
}
