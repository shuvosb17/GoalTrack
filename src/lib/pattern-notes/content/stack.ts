import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("stack")!;

export const article = buildPatternArticle({
  meta,
  summary: "LIFO structure for matching pairs, undo operations, and maintaining monotonic order.",
  intuition: "Stacks process **nested** or **sequential dependency** problems: parentheses, undo, next greater element. Monotonic stacks keep elements in sorted order to answer nearest greater/smaller in O(n).",
  signals: ["Matching brackets or tags", "Next greater/smaller element", "Histogram / rectangle area", "Evaluate expressions"],
  subpatterns: [
    { name: "Parentheses matching", description: "Push opens; pop and match closes." },
    { name: "Monotonic stack", description: "Pop smaller elements before pushing; tracks next warmer." },
    { name: "Expression evaluation", description: "Operands and operators on stack (RPN)." },
  ],
  templateCode: {
    language: "typescript",
    code: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  for (const ch of s) {
    if (ch in map) {
      if (stack.pop() !== map[ch]) return false;
    } else stack.push(ch);
  }
  return stack.length === 0;
}`,
  },
  viz: "stack-monotonic",
  walkthrough: "**Daily Temperatures**: for each day, pop stack while current temp > stack top; assign distance. Stack stores indices with decreasing temps.",
  problems: [
    { title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "easy", note: "Classic stack." },
    { title: "Daily Temperatures", slug: "daily-temperatures", difficulty: "medium", note: "Monotonic stack." },
    { title: "Next Greater Element", slug: "next-greater-element", difficulty: "easy", note: "Monotonic decreasing." },
    { title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram", difficulty: "hard", note: "Pop width calculation." },
  ],
  pitfalls: "Pop until invariant restored before push. For histogram, append sentinel height 0 to flush stack.",
  complexity: [{ operation: "Monotonic stack scan", time: "O(n)", space: "O(n)" }],
});
