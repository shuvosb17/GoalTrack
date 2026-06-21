import type { LeetcodeProblem } from "./types";
import { LEETCODE_PATTERNS } from "./leetcode-patterns";
import { computePatternCompletion, computeWeightedReadiness } from "./leetcode-readiness";

export function isInterviewReady(problems: LeetcodeProblem[]): boolean {
  const readiness = computeWeightedReadiness(problems, "BD-CORE");
  if (readiness.score < 85) return false;

  const foundationPatterns = LEETCODE_PATTERNS.filter((p) => p.tier === "foundation");
  for (const pattern of foundationPatterns) {
    const completion = computePatternCompletion(problems, pattern.name);
    if (completion.total > 0 && completion.done < completion.total) return false;
  }

  return true;
}
