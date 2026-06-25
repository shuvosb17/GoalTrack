import { parseInlineCodeSegments } from "@/lib/format-learning-text";
import { cn } from "@/lib/utils";

interface InlineCodeTextProps {
  text: string;
  className?: string;
  codeClassName?: string;
}

export function InlineCodeText({ text, className, codeClassName }: InlineCodeTextProps) {
  const segments = parseInlineCodeSegments(text);

  return (
    <span className={cn("leading-snug", className)}>
      {segments.map((segment, index) =>
        segment.type === "code" ? (
          <code
            key={index}
            className={cn(
              "mx-0.5 inline rounded bg-white/[0.07] px-1 py-px font-mono text-[0.82em] text-violet-200/95",
              codeClassName
            )}
          >
            {segment.value}
          </code>
        ) : (
          <span key={index}>{segment.value}</span>
        )
      )}
    </span>
  );
}
