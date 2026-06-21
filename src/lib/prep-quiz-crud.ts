import { v4 as uuid } from "uuid";
import { db } from "./db";
import type { PrepQuizAttempt, MockRoundSession } from "./types";
import { nowISO } from "./utils";
import type { PrepQuizSubjectType } from "./prep-quizzes";

export async function hasPassedQuiz(
  subjectType: PrepQuizSubjectType,
  subjectKey: string
): Promise<boolean> {
  const count = await db.prepQuizAttempts
    .where("subjectKey")
    .equals(subjectKey)
    .filter((a) => a.subjectType === subjectType && a.passed)
    .count();
  return count > 0;
}

export async function savePrepQuizAttempt(input: {
  subjectType: PrepQuizSubjectType;
  subjectKey: string;
  score: number;
  total: number;
  passed: boolean;
}): Promise<PrepQuizAttempt> {
  const attempt: PrepQuizAttempt = {
    id: uuid(),
    subjectType: input.subjectType,
    subjectKey: input.subjectKey,
    score: input.score,
    total: input.total,
    passed: input.passed,
    completedAt: nowISO(),
  };
  await db.prepQuizAttempts.add(attempt);
  return attempt;
}

export async function saveMockRoundSession(input: {
  mode: "global" | "pattern";
  pattern?: string;
  problemIds: string[];
  durationMinutes: number;
  startedAt: string;
  completedAt?: string;
}): Promise<MockRoundSession> {
  const session: MockRoundSession = {
    id: uuid(),
    mode: input.mode,
    pattern: input.pattern,
    problemIds: input.problemIds,
    durationMinutes: input.durationMinutes,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
  };
  await db.mockRoundSessions.add(session);
  return session;
}

export async function getPassedQuizKeys(
  subjectType: PrepQuizSubjectType
): Promise<Set<string>> {
  const attempts = await db.prepQuizAttempts
    .where("subjectType")
    .equals(subjectType)
    .filter((a) => a.passed)
    .toArray();
  return new Set(attempts.map((a) => a.subjectKey));
}
