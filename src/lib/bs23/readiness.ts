import { differenceInCalendarDays, format, subDays, addDays } from "date-fns";
import type {
  AppSettings,
  Bs23Drill,
  Bs23TopicProgress,
  CsReviewItem,
  LearningSession,
  LeetcodeProblem,
  MockRoundSession,
  PrepQuizAttempt,
  Track,
} from "../types";
import type { Bs23StageId } from "../types";
import {
  BS23_STAGES,
  CS_CATEGORY_TO_COMPETENCY,
  LEETCODE_PATTERN_TO_COMPETENCY,
  type Bs23CompetencyDef,
  type Bs23StageDef,
} from "./stages";
import {
  BS23_SYLLABUS,
  computeCompetencyCoverage,
  computeStageCoverageSummary,
  getNextUnfinishedTopics,
  type Bs23StageCoverageSummary,
  type Bs23TopicDef,
  type Bs23TopicProgressMap,
} from "./syllabus";
import { parseLocalDate, todayISO } from "../utils";

/** Evidence half-life in days (~4 weeks) — applies to proof bonus only. */
export const DECAY_HALF_LIFE_DAYS = 28;
/** Max proof bonus multiplier from drills (25%). */
export const MAX_PROOF_BONUS = 0.25;
/** Days without activity before staleness note. */
export const STALENESS_DAYS = 42;
/** Difficulty multipliers for LeetCode-derived evidence. */
const DIFFICULTY_WEIGHT = { easy: 0.45, medium: 1, hard: 1.35 } as const;

export interface Bs23CompetencyScore {
  id: string;
  name: string;
  stageId: Bs23StageId;
  weight: number;
  score: number;
  coverage: number;
  proofBonus: number;
  topicsDone: number;
  topicsTotal: number;
  evidenceCount: number;
  minEvidence: number;
  threshold: number;
  met: boolean;
  lastEvidenceDate: string | null;
  staleNote: string | null;
  hint: string;
}

export interface Bs23StageScore {
  id: Bs23StageId;
  name: string;
  shortName: string;
  order: number;
  readiness: number;
  coverage: number;
  threshold: number;
  met: boolean;
  locked: boolean;
  passProbability: number;
  cumulativeProbability: number;
  accent: string;
  competencies: Bs23CompetencyScore[];
}

export interface Bs23ReadinessReport {
  generatedAt: string;
  weeksToMcq: number;
  weeksToDayLong: number;
  daysToMcq: number;
  overallOfferProbability: number;
  stages: Bs23StageScore[];
  weakestCompetencies: Bs23CompetencyScore[];
  nextTopics: Bs23TopicDef[];
  syllabusProgress: Bs23StageCoverageSummary[];
  totalTopics: number;
  totalTopicsDone: number;
  totalDrillsLogged: number;
  weeklyHoursActual: number;
  weeklyHoursRequired: number;
  gapMatrix: Array<{ id: string; name: string; weight: number; score: number; stageId: Bs23StageId }>;
  evidenceHeatmap: Array<{ week: string; count: number }>;
  burndown: Array<{ week: string; required: number; projected: number }>;
  declaredStack: AppSettings["bs23DeclaredStack"];
  mcqDate: string;
  dayLongDate: string;
}

export interface Bs23ReadinessInput {
  drills: Bs23Drill[];
  topicProgress: Bs23TopicProgress[];
  leetcodeProblems: LeetcodeProblem[];
  csReviewItems: CsReviewItem[];
  prepQuizAttempts: PrepQuizAttempt[];
  mockRoundSessions: MockRoundSession[];
  sessions: LearningSession[];
  tracks: Track[];
  settings: AppSettings | null;
  now?: Date;
}

interface EvidencePoint {
  score: number;
  date: string;
  weight: number;
}

function buildProgressMap(rows: Bs23TopicProgress[]): Bs23TopicProgressMap {
  const map: Bs23TopicProgressMap = {};
  for (const row of rows) {
    map[row.topicId] = row.status;
  }
  return map;
}

function decayWeight(dateStr: string, now: Date): number {
  const days = differenceInCalendarDays(now, parseLocalDate(dateStr));
  if (days < 0) return 1;
  return Math.pow(0.5, days / DECAY_HALF_LIFE_DAYS);
}

function aggregateEvidence(points: EvidencePoint[], now: Date): { raw: number; count: number; lastDate: string | null } {
  if (points.length === 0) return { raw: 0, count: 0, lastDate: null };
  let weightedSum = 0;
  let weightTotal = 0;
  let lastDate: string | null = null;
  for (const p of points) {
    const w = decayWeight(p.date, now) * p.weight;
    weightedSum += p.score * w;
    weightTotal += w;
    if (!lastDate || p.date > lastDate) lastDate = p.date;
  }
  return {
    raw: weightTotal > 0 ? weightedSum / weightTotal : 0,
    count: points.length,
    lastDate,
  };
}

function computeProofBonus(points: EvidencePoint[], now: Date): number {
  if (points.length === 0) return 0;
  const { raw } = aggregateEvidence(points, now);
  const quality = Math.min(1, raw / 100);
  return Math.min(MAX_PROOF_BONUS, quality * MAX_PROOF_BONUS);
}

function drillDifficultyWeight(d?: Bs23Drill["difficulty"]): number {
  if (!d) return 1;
  return DIFFICULTY_WEIGHT[d];
}

function buildDrillEvidence(drills: Bs23Drill[]): Map<string, EvidencePoint[]> {
  const map = new Map<string, EvidencePoint[]>();
  for (const d of drills) {
    const list = map.get(d.competencyId) ?? [];
    list.push({
      score: d.scorePercent,
      date: d.date,
      weight: drillDifficultyWeight(d.difficulty) * (d.mode === "paper_dsa" || d.mode === "written_paper" ? 1.25 : 1),
    });
    map.set(d.competencyId, list);
  }
  return map;
}

function mergeLeetcodeEvidence(problems: LeetcodeProblem[], map: Map<string, EvidencePoint[]>, now: Date): void {
  const today = format(now, "yyyy-MM-dd");
  for (const p of problems) {
    if (!p.done) continue;
    const competencyId = LEETCODE_PATTERN_TO_COMPETENCY[p.pattern];
    if (!competencyId) continue;
    const diff = p.difficulty as keyof typeof DIFFICULTY_WEIGHT;
    const score = diff === "hard" ? 88 : diff === "medium" ? 78 : 55;
    const list = map.get(competencyId) ?? [];
    const date = p.doneAt?.slice(0, 10) ?? today;
    list.push({ score, date, weight: DIFFICULTY_WEIGHT[diff] ?? 0.5 });
    map.set(competencyId, list);
  }
}

function mergeCsReviewEvidence(items: CsReviewItem[], map: Map<string, EvidencePoint[]>, now: Date): void {
  const today = format(now, "yyyy-MM-dd");
  for (const item of items) {
    if (!item.done) continue;
    const competencyId = CS_CATEGORY_TO_COMPETENCY[item.category];
    if (!competencyId) continue;
    const list = map.get(competencyId) ?? [];
    list.push({ score: 75, date: today, weight: 0.8 });
    map.set(competencyId, list);
  }
}

function mergeQuizEvidence(attempts: PrepQuizAttempt[], map: Map<string, EvidencePoint[]>): void {
  for (const a of attempts) {
    if (a.subjectType !== "cs") continue;
    const pct = a.total > 0 ? (a.score / a.total) * 100 : 0;
    const key = a.subjectKey.toLowerCase();
    let competencyId = "ds_algo_theory";
    if (key.includes("oop")) competencyId = "oop_pillars";
    else if (key.includes("dbms") || key.includes("sql")) competencyId = "dbms_sql_joins";
    const list = map.get(competencyId) ?? [];
    list.push({
      score: pct,
      date: a.completedAt.slice(0, 10),
      weight: a.passed ? 1.1 : 0.7,
    });
    map.set(competencyId, list);
  }
}

function mergeMockRoundEvidence(sessions: MockRoundSession[], map: Map<string, EvidencePoint[]>): void {
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const target = s.mode === "global" ? "paper_solving" : "arrays_strings";
    const existing = map.get(target) ?? [];
    existing.push({
      score: Math.min(95, 60 + s.problemIds.length * 8),
      date: s.completedAt.slice(0, 10),
      weight: 1.2,
    });
    map.set(target, existing);
  }
}

function lastTopicActivityDate(
  competencyId: string,
  topicProgress: Bs23TopicProgress[],
  now: Date
): string | null {
  const today = format(now, "yyyy-MM-dd");
  let last: string | null = null;
  for (const row of topicProgress) {
    if (row.competencyId !== competencyId || row.status !== "done") continue;
    const d = row.completedAt?.slice(0, 10) ?? today;
    if (!last || d > last) last = d;
  }
  return last;
}

function staleNoteFor(lastDate: string | null, now: Date): string | null {
  if (!lastDate) return null;
  const days = differenceInCalendarDays(now, parseLocalDate(lastDate));
  if (days >= STALENESS_DAYS) {
    return `No activity in ${days} days — revisit before the exam.`;
  }
  return null;
}

function scoreCompetency(
  def: Bs23CompetencyDef,
  stageId: Bs23StageId,
  coveragePct: number,
  topicsDone: number,
  topicsTotal: number,
  evidenceMap: Map<string, EvidencePoint[]>,
  topicProgress: Bs23TopicProgress[],
  now: Date
): Bs23CompetencyScore {
  const points = evidenceMap.get(def.id) ?? [];
  const { count, lastDate: drillLastDate } = aggregateEvidence(points, now);
  const proofBonus = computeProofBonus(points, now);
  const coverage = coveragePct;
  const score = Math.min(100, Math.round(coverage * (1 + proofBonus)));

  const topicLast = lastTopicActivityDate(def.id, topicProgress, now);
  const lastEvidenceDate =
    drillLastDate && topicLast
      ? drillLastDate > topicLast
        ? drillLastDate
        : topicLast
      : drillLastDate ?? topicLast;

  return {
    id: def.id,
    name: def.name,
    stageId,
    weight: def.weight,
    score,
    coverage: Math.round(coverage),
    proofBonus: Math.round(proofBonus * 1000) / 10,
    topicsDone,
    topicsTotal,
    evidenceCount: count,
    minEvidence: def.minEvidence,
    threshold: def.threshold,
    met: score >= def.threshold,
    lastEvidenceDate,
    staleNote: staleNoteFor(lastEvidenceDate, now),
    hint: def.hint,
  };
}

function scoreStage(
  stage: Bs23StageDef,
  competencyScores: Bs23CompetencyScore[],
  stageCoverage: number,
  locked: boolean,
  cumulativeIn: number
): Bs23StageScore {
  let weightedSum = 0;
  let weightTotal = 0;
  for (const c of competencyScores) {
    weightedSum += c.score * c.weight;
    weightTotal += c.weight;
  }
  const readiness = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;
  const met = !locked && readiness >= stage.passThreshold;
  const readinessFactor = Math.min(1, readiness / stage.passThreshold);
  const passProbability = locked ? 0 : stage.basePassRate * readinessFactor;
  const cumulativeProbability = locked ? cumulativeIn : cumulativeIn * passProbability;

  return {
    id: stage.id,
    name: stage.name,
    shortName: stage.shortName,
    order: stage.order,
    readiness,
    coverage: stageCoverage,
    threshold: stage.passThreshold,
    met,
    locked,
    passProbability: Math.round(passProbability * 1000) / 10,
    cumulativeProbability: Math.round(cumulativeProbability * 10000) / 100,
    accent: stage.accent,
    competencies: competencyScores,
  };
}

function computeWeeklyHours(sessions: LearningSession[], weeks: number, now: Date): number {
  const cutoff = subDays(now, weeks * 7);
  const ms = sessions
    .filter((s) => parseLocalDate(s.date) >= cutoff)
    .reduce((sum, s) => sum + s.duration, 0);
  return Math.round((ms / 3_600_000 / weeks) * 10) / 10;
}

function buildHeatmap(
  drills: Bs23Drill[],
  topicProgress: Bs23TopicProgress[],
  weeks: number,
  now: Date
): Array<{ week: string; count: number }> {
  const points: Array<{ week: string; count: number }> = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const start = subDays(now, (w + 1) * 7);
    const end = subDays(now, w * 7);
    const drillCount = drills.filter((d) => {
      const dt = parseLocalDate(d.date);
      return dt >= start && dt < end;
    }).length;
    const topicCount = topicProgress.filter((p) => {
      if (p.status !== "done" || !p.completedAt) return false;
      const dt = parseLocalDate(p.completedAt.slice(0, 10));
      return dt >= start && dt < end;
    }).length;
    points.push({ week: format(end, "MMM d"), count: drillCount + topicCount });
  }
  return points;
}

function buildBurndown(
  weeksToTarget: number,
  weeklyRequired: number,
  weeklyActual: number,
  now: Date
): Array<{ week: string; required: number; projected: number }> {
  const points: Array<{ week: string; required: number; projected: number }> = [];
  const horizon = Math.max(weeksToTarget, 4);
  for (let w = 0; w <= horizon; w++) {
    points.push({
      week: format(addDays(now, w * 7), "MMM d"),
      required: Math.max(0, Math.round((horizon - w) * weeklyRequired)),
      projected: Math.max(0, Math.round((horizon - w) * weeklyActual)),
    });
  }
  return points;
}

export function buildBs23ReadinessReport(input: Bs23ReadinessInput): Bs23ReadinessReport {
  const now = input.now ?? new Date();
  const mcqDate = input.settings?.bs23McqDate ?? "2026-12-15";
  const dayLongDate = input.settings?.bs23DayLongDate ?? "2027-01-26";
  const daysToMcq = differenceInCalendarDays(parseLocalDate(mcqDate), now);
  const weeksToMcq = Math.max(daysToMcq / 7, 0);
  const weeksToDayLong = Math.max(differenceInCalendarDays(parseLocalDate(dayLongDate), now) / 7, 0);

  const progressMap = buildProgressMap(input.topicProgress);
  const competencyCoverage = computeCompetencyCoverage(progressMap);
  const coverageByCompetency = new Map(competencyCoverage.map((c) => [c.competencyId, c]));
  const syllabusProgress = computeStageCoverageSummary(progressMap);

  const evidenceMap = buildDrillEvidence(input.drills);
  mergeLeetcodeEvidence(input.leetcodeProblems, evidenceMap, now);
  mergeCsReviewEvidence(input.csReviewItems, evidenceMap, now);
  mergeQuizEvidence(input.prepQuizAttempts, evidenceMap);
  mergeMockRoundEvidence(input.mockRoundSessions, evidenceMap);

  const stages: Bs23StageScore[] = [];
  let cumulative = 1;
  let previousMet = true;

  for (const stage of BS23_STAGES) {
    const locked = !previousMet;
    const stageSummary = syllabusProgress.find((s) => s.stageId === stage.id);
    const competencyScores = stage.competencies.map((c) => {
      const cov = coverageByCompetency.get(c.id);
      return scoreCompetency(
        c,
        stage.id,
        cov?.coverage ?? 0,
        cov?.completedTopics ?? 0,
        cov?.totalTopics ?? 0,
        evidenceMap,
        input.topicProgress,
        now
      );
    });
    const stageScore = scoreStage(
      stage,
      competencyScores,
      stageSummary?.coverage ?? 0,
      locked,
      cumulative
    );
    stages.push(stageScore);
    cumulative = stageScore.cumulativeProbability / 100;
    previousMet = stageScore.met;
  }

  const allCompetencies = stages.flatMap((s) => s.competencies);
  const weakestCompetencies = [...allCompetencies]
    .filter((c) => !c.met)
    .sort((a, b) => a.coverage - b.coverage || b.weight - a.weight)
    .slice(0, 8);

  const gapMatrix = allCompetencies.map((c) => ({
    id: c.id,
    name: c.name,
    weight: c.weight,
    score: c.score,
    stageId: c.stageId,
  }));

  const totalTopicsDone = competencyCoverage.reduce((s, c) => s + c.completedTopics, 0);
  const totalTopics = BS23_SYLLABUS.length;

  const weeklyHoursActual = computeWeeklyHours(input.sessions, 4, now);
  const s2Readiness = stages.find((s) => s.id === "S2")?.readiness ?? 0;
  const gap = Math.max(0, 70 - s2Readiness);
  const weeklyHoursRequired = Math.max(8, Math.round((gap / 10 + 10) * 10) / 10);
  const heatmapWeeks = Math.min(Math.max(Math.ceil(weeksToMcq), 8), 20);

  return {
    generatedAt: todayISO(),
    weeksToMcq: Math.round(weeksToMcq * 10) / 10,
    weeksToDayLong: Math.round(weeksToDayLong * 10) / 10,
    daysToMcq,
    overallOfferProbability: stages[stages.length - 1]?.cumulativeProbability ?? 0,
    stages,
    weakestCompetencies,
    nextTopics: getNextUnfinishedTopics(progressMap, 10),
    syllabusProgress,
    totalTopics,
    totalTopicsDone,
    totalDrillsLogged: input.drills.length,
    weeklyHoursActual,
    weeklyHoursRequired,
    gapMatrix,
    evidenceHeatmap: buildHeatmap(input.drills, input.topicProgress, heatmapWeeks, now),
    burndown: buildBurndown(Math.ceil(weeksToMcq), weeklyHoursRequired, weeklyHoursActual, now),
    declaredStack: input.settings?.bs23DeclaredStack,
    mcqDate,
    dayLongDate,
  };
}
