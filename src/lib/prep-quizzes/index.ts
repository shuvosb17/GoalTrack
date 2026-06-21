import { CS_FUNDAMENTALS, LEETCODE_PATTERNS, coreCsItemKey } from "../leetcode-patterns";
import { CS_QUIZ_BANK } from "./cs-quiz-bank";
import { PATTERN_QUIZ_BANK } from "./pattern-quiz-bank";
import type { PrepQuizQuestion, PrepQuizSubjectType } from "./types";

export const PASS_THRESHOLD = 0.7;

export type { PrepQuizQuestion, PrepQuizSubjectType } from "./types";

const CS_QUIZZES: Record<string, PrepQuizQuestion[]> = Object.fromEntries(
  CS_FUNDAMENTALS.map((item) => {
    const key = coreCsItemKey(item.category, item.title);
    return [key, CS_QUIZ_BANK[key]];
  }).filter(([, quiz]) => quiz !== undefined)
);

const PATTERN_QUIZZES: Record<string, PrepQuizQuestion[]> = Object.fromEntries(
  LEETCODE_PATTERNS.map((pattern) => [pattern.name, PATTERN_QUIZ_BANK[pattern.name]]).filter(
    ([, quiz]) => quiz !== undefined
  )
);

export function getCsQuizKey(category: string, title: string): string {
  return coreCsItemKey(category, title);
}

export function getQuizForSubject(
  type: PrepQuizSubjectType,
  key: string
): PrepQuizQuestion[] | undefined {
  if (type === "cs") {
    return CS_QUIZZES[key];
  }
  return PATTERN_QUIZZES[key];
}

export function hasQuizForSubject(type: PrepQuizSubjectType, key: string): boolean {
  return getQuizForSubject(type, key) !== undefined;
}
