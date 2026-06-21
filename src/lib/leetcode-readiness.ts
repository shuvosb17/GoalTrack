import type { LeetcodeProblem, CsReviewItem } from "./types";
import type { LeetCodeDifficulty } from "./types/metrics";
import {
  filterPatternsByTag,
  getPatternByName,
  LEETCODE_TIER_ORDER,
  LEETCODE_TIER_LABELS,
  type LeetcodeTagFilter,
} from "./leetcode-patterns";

export interface PatternCompletion {
  pattern: string;
  done: number;
  total: number;
  completion: number;
  importance: number;
}

export interface ReadinessResult {
  score: number;
  done: number;
  total: number;
  patternCompletions: PatternCompletion[];
}

export interface TierReadinessPoint {
  tier: string;
  value: number;
  fullMark: number;
}

export interface CumulativeSolvedPoint {
  date: string;
  count: number;
}

function patternInScope(patternName: string, tag: LeetcodeTagFilter): boolean {
  if (tag === "all") return true;
  const pattern = getPatternByName(patternName);
  return pattern?.tags.includes(tag) ?? false;
}

export function getProblemsForPattern(
  problems: LeetcodeProblem[],
  patternName: string
): LeetcodeProblem[] {
  return problems.filter((p) => p.pattern === patternName);
}

export function computePatternCompletion(
  problems: LeetcodeProblem[],
  patternName: string
): PatternCompletion {
  const scoped = getProblemsForPattern(problems, patternName);
  const done = scoped.filter((p) => p.done).length;
  const total = scoped.length;
  const importance = getPatternByName(patternName)?.importance ?? 1;
  return {
    pattern: patternName,
    done,
    total,
    completion: total > 0 ? done / total : 0,
    importance,
  };
}

export function computeWeightedReadiness(
  problems: LeetcodeProblem[],
  tag: LeetcodeTagFilter = "all",
  csItems?: CsReviewItem[],
  includeCs = false
): ReadinessResult {
  const patterns = filterPatternsByTag(tag);
  const patternCompletions = patterns.map((p) => computePatternCompletion(problems, p.name));

  let weightedSum = 0;
  let importanceSum = 0;

  for (const pc of patternCompletions) {
    weightedSum += pc.importance * pc.completion;
    importanceSum += pc.importance;
  }

  if (includeCs && csItems && csItems.length > 0) {
    const csDone = csItems.filter((i) => i.done).length;
    const csCompletion = csDone / csItems.length;
    weightedSum += 4 * csCompletion;
    importanceSum += 4;
  }

  const done = patternCompletions.reduce((sum, pc) => sum + pc.done, 0);
  const total = patternCompletions.reduce((sum, pc) => sum + pc.total, 0);

  return {
    score: importanceSum > 0 ? Math.round((weightedSum / importanceSum) * 100) : 0,
    done,
    total,
    patternCompletions,
  };
}

export function computeCsReadiness(csItems: CsReviewItem[]): ReadinessResult {
  const done = csItems.filter((i) => i.done).length;
  const total = csItems.length;
  return {
    score: total > 0 ? Math.round((done / total) * 100) : 0,
    done,
    total,
    patternCompletions: [],
  };
}

export function computeCombinedReadiness(
  problems: LeetcodeProblem[],
  csItems: CsReviewItem[],
  tag: LeetcodeTagFilter = "all"
): ReadinessResult {
  return computeWeightedReadiness(problems, tag, csItems, true);
}

export function computeTierReadiness(
  problems: LeetcodeProblem[],
  tag: LeetcodeTagFilter = "all"
): TierReadinessPoint[] {
  const patterns = filterPatternsByTag(tag);

  return LEETCODE_TIER_ORDER.map((tier) => {
    const tierPatterns = patterns.filter((p) => p.tier === tier);
    if (tierPatterns.length === 0) {
      return { tier: LEETCODE_TIER_LABELS[tier], value: 0, fullMark: 100 };
    }

    let weightedSum = 0;
    let importanceSum = 0;

    for (const pattern of tierPatterns) {
      const pc = computePatternCompletion(problems, pattern.name);
      weightedSum += pattern.importance * pc.completion;
      importanceSum += pattern.importance;
    }

    return {
      tier: LEETCODE_TIER_LABELS[tier],
      value: importanceSum > 0 ? Math.round((weightedSum / importanceSum) * 100) : 0,
      fullMark: 100,
    };
  });
}

export function computeCumulativeSolvedData(
  problems: LeetcodeProblem[]
): CumulativeSolvedPoint[] {
  const doneDates = problems
    .filter((p) => p.done && p.doneAt)
    .map((p) => p.doneAt!.slice(0, 10))
    .sort();

  if (doneDates.length === 0) return [];

  const countsByDay = new Map<string, number>();
  for (const date of doneDates) {
    countsByDay.set(date, (countsByDay.get(date) ?? 0) + 1);
  }

  const sortedDays = [...countsByDay.keys()].sort();
  let cumulative = 0;
  return sortedDays.map((date) => {
    cumulative += countsByDay.get(date) ?? 0;
    return { date, count: cumulative };
  });
}

export function countProblemsByDifficulty(
  problems: LeetcodeProblem[],
  tag: LeetcodeTagFilter = "all"
): Record<LeetCodeDifficulty, { done: number; total: number }> {
  const scoped = problems.filter((p) => patternInScope(p.pattern, tag));
  const result = {
    easy: { done: 0, total: 0 },
    medium: { done: 0, total: 0 },
    hard: { done: 0, total: 0 },
  };

  for (const p of scoped) {
    result[p.difficulty].total += 1;
    if (p.done) result[p.difficulty].done += 1;
  }

  return result;
}

export function pickMockRoundProblems(
  problems: LeetcodeProblem[],
  tag: LeetcodeTagFilter,
  count: number,
  pattern?: string
): LeetcodeProblem[] {
  let pool = problems.filter((p) => {
    if (pattern) return p.pattern === pattern;
    return patternInScope(p.pattern, tag);
  });

  if (!pattern) {
    pool = pool.filter((p) => p.difficulty === "medium");
  }

  const notDone = pool.filter((p) => !p.done);
  const done = pool.filter((p) => p.done);
  const shuffled = [...notDone, ...done].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function isProblemDueForReview(problem: LeetcodeProblem, today = new Date().toISOString().slice(0, 10)): boolean {
  if (!problem.done || !problem.nextReviewDue) return false;
  return problem.nextReviewDue <= today;
}
