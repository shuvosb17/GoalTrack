"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ExternalLink, Plus, Timer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeetcodeProblems, useCsReviewItems, usePrepQuizAttempts } from "@/hooks/use-data";
import {
  toggleLeetcodeProblem,
  addLeetcodeProblem,
  deleteLeetcodeProblem,
  toggleCsReviewItem,
} from "@/lib/crud";
import {
  LEETCODE_TAG_LABELS,
  LEETCODE_TIER_LABELS,
  LEETCODE_TIER_ORDER,
  filterPatternsByTag,
  groupPatternsByTier,
  type LeetcodeTagFilter,
  type LeetcodePatternDefinition,
} from "@/lib/leetcode-patterns";
import {
  computeWeightedReadiness,
  computeCsReadiness,
  computeCombinedReadiness,
  computeTierReadiness,
  computeCumulativeSolvedData,
  getProblemsForPattern,
  isProblemDueForReview,
} from "@/lib/leetcode-readiness";
import { isInterviewReady } from "@/lib/interview-readiness-check";
import { enqueueMockRoundPrompt } from "@/lib/mock-round-prompt";
import { LeetcodeReadinessCharts } from "@/components/tracks/leetcode-readiness-charts";
import type { LeetcodeProblem, LeetcodeTag } from "@/lib/types";
import type { LeetCodeDifficulty } from "@/lib/types/metrics";
import { cn } from "@/lib/utils";
import { getGuideSlugForPractice } from "@/lib/pattern-notes/catalog";

const ACCENT = "#534AB7";
const TAG_FILTERS: LeetcodeTagFilter[] = ["all", "BD-CORE", "BD-CP", "MAANG", "BD-ADV"];

const DIFFICULTY_COLORS: Record<LeetCodeDifficulty, string> = {
  easy: "#97C459",
  medium: "#FAC775",
  hard: "#f87171",
};

function ImportancePill({ level }: { level: number }) {
  return (
    <span
      className="rounded px-1.5 py-px text-[10px] font-semibold tabular-nums"
      style={{ background: `${ACCENT}33`, color: ACCENT }}
    >
      P{level}
    </span>
  );
}

function TagChip({ tag }: { tag: LeetcodeTag }) {
  return (
    <span className="rounded bg-white/[0.06] px-1.5 py-px text-[10px] text-muted-foreground">
      {LEETCODE_TAG_LABELS[tag]}
    </span>
  );
}

function QuizBadge({ passed, pending }: { passed?: boolean; pending?: boolean }) {
  if (passed) {
    return (
      <span className="rounded bg-[#97C459]/15 px-1.5 py-px text-[10px] text-[#97C459]">
        Quiz passed
      </span>
    );
  }
  if (pending) {
    return (
      <span className="rounded bg-amber-500/15 px-1.5 py-px text-[10px] text-amber-400">
        Quiz pending
      </span>
    );
  }
  return null;
}

function PatternCard({
  pattern,
  problems,
  patternQuizPassed,
  highlighted,
  onReadGuide,
}: {
  pattern: LeetcodePatternDefinition;
  problems: LeetcodeProblem[];
  patternQuizPassed: boolean;
  highlighted?: boolean;
  onReadGuide?: (patternName: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const patternProblems = getProblemsForPattern(problems, pattern.name);
  const done = patternProblems.filter((p) => p.done).length;
  const total = patternProblems.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isComplete = total > 0 && done === total;

  async function handleAdd() {
    const title = newTitle.trim();
    if (!title) return;
    await addLeetcodeProblem({ pattern: pattern.name, title, difficulty: "medium" });
    setNewTitle("");
    setAdding(false);
  }

  return (
    <div
      data-pattern={pattern.name}
      className={cn(
        "rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.02] overflow-hidden transition-colors",
        highlighted && "ring-2 ring-primary/50"
      )}
    >
      <button
        type="button"
        className="flex w-full items-start gap-2 p-3 text-left hover:bg-white/[0.02]"
        onClick={() => setExpanded((e) => !e)}
      >
        <ChevronDown
          className={cn("mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium">{pattern.name}</span>
            <ImportancePill level={pattern.importance} />
            {pattern.tags.map((t) => (
              <TagChip key={t} tag={t} />
            ))}
            {isComplete && (
              <QuizBadge passed={patternQuizPassed} pending={!patternQuizPassed} />
            )}
            {onReadGuide && getGuideSlugForPractice(pattern.name) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReadGuide(pattern.name);
                }}
                className="rounded bg-violet-500/15 px-1.5 py-px text-[10px] text-violet-300 hover:bg-violet-500/25"
              >
                Read guide
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: ACCENT }}
              />
            </div>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {done}/{total}
            </span>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ul className="space-y-0.5 border-t border-white/[0.06] px-3 py-2">
              {patternProblems.map((problem) => {
                const due = isProblemDueForReview(problem);
                return (
                  <li key={problem.id} className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-white/[0.03]">
                    <button
                      type="button"
                      onClick={() => toggleLeetcodeProblem(problem.id)}
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        problem.done
                          ? "border-transparent text-white"
                          : "border-white/20 bg-transparent hover:border-white/40"
                      )}
                      style={problem.done ? { background: ACCENT } : undefined}
                      aria-label={problem.done ? "Mark unsolved" : "Mark solved"}
                    >
                      {problem.done && <Check className="h-2.5 w-2.5" />}
                    </button>
                    {problem.url ? (
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-0 flex-1 items-center gap-1 text-sm hover:underline"
                        style={{ color: problem.done ? "var(--muted-foreground)" : undefined }}
                      >
                        <span className={cn("truncate", problem.done && "line-through opacity-60")}>
                          {problem.title}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-40" />
                      </a>
                    ) : (
                      <span
                        className={cn("min-w-0 flex-1 truncate text-sm", problem.done && "line-through opacity-60 text-muted-foreground")}
                      >
                        {problem.title}
                      </span>
                    )}
                    {due && (
                      <span className="shrink-0 rounded bg-violet-500/20 px-1 py-px text-[9px] text-violet-300">
                        Revisit
                      </span>
                    )}
                    <span
                      className="shrink-0 text-[10px] font-medium uppercase"
                      style={{ color: DIFFICULTY_COLORS[problem.difficulty] }}
                    >
                      {problem.difficulty[0]}
                    </span>
                    {!problem.isCore && (
                      <button
                        type="button"
                        onClick={() => deleteLeetcodeProblem(problem.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-opacity"
                        aria-label="Delete custom problem"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-white/[0.06] px-3 py-2">
              {adding ? (
                <div className="flex gap-2">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Custom problem title"
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                  <Button size="sm" className="h-8" style={{ background: ACCENT }} onClick={handleAdd}>
                    Add
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setAdding(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-xs text-muted-foreground"
                  onClick={() => setAdding(true)}
                >
                  <Plus className="h-3 w-3" /> Add problem
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LeetCodePanel({
  highlightPattern,
  onReadGuide,
}: {
  highlightPattern?: string | null;
  onReadGuide?: (patternName: string) => void;
} = {}) {
  const problems = useLeetcodeProblems();
  const csItems = useCsReviewItems();
  const quizAttempts = usePrepQuizAttempts();
  const [tagFilter, setTagFilter] = useState<LeetcodeTagFilter>("all");
  const [revisitOnly, setRevisitOnly] = useState(false);

  const passedPatternKeys = useMemo(() => {
    const set = new Set<string>();
    for (const a of quizAttempts) {
      if (a.subjectType === "pattern" && a.passed) set.add(a.subjectKey);
    }
    return set;
  }, [quizAttempts]);

  const revisitProblems = useMemo(
    () => problems.filter((p) => isProblemDueForReview(p)),
    [problems]
  );

  const filteredPatterns = useMemo(() => filterPatternsByTag(tagFilter), [tagFilter]);
  const grouped = useMemo(() => groupPatternsByTier(filteredPatterns), [filteredPatterns]);

  const dsaReadiness = useMemo(
    () => computeWeightedReadiness(problems, tagFilter),
    [problems, tagFilter]
  );
  const csReadiness = useMemo(() => computeCsReadiness(csItems), [csItems]);
  const combinedReadiness = useMemo(
    () => computeCombinedReadiness(problems, csItems, tagFilter),
    [problems, csItems, tagFilter]
  );
  const tierData = useMemo(() => computeTierReadiness(problems, tagFilter), [problems, tagFilter]);
  const cumulativeData = useMemo(() => computeCumulativeSolvedData(problems), [problems]);
  const interviewReady = useMemo(() => isInterviewReady(problems), [problems]);

  const csByCategory = useMemo(() => {
    const cats = ["OOP", "DBMS", "DS"] as const;
    return cats.map((cat) => ({
      category: cat,
      items: csItems.filter((i) => i.category === cat),
    }));
  }, [csItems]);

  function startMockRound() {
    enqueueMockRoundPrompt({ mode: "global" });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card space-y-5 rounded-xl p-4 sm:p-5"
    >
      {interviewReady && (
        <div className="rounded-lg border border-[#97C459]/30 bg-[#97C459]/10 px-4 py-3 text-sm">
          <span className="font-medium text-[#97C459]">Interview Ready</span>
          <span className="text-muted-foreground">
            {" "}— BD-CORE readiness {dsaReadiness.score}% with all Foundation patterns complete.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold">Pattern Practice</h3>
          <p className="mt-0.5 text-xs text-muted-foreground max-w-lg">
            BD-first interview prep — Brain Station 23, Therap, Cefalo, bKash &amp; peers. MAANG as stretch target.
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-[#534AB7]/40 text-xs"
            onClick={startMockRound}
          >
            <Timer className="h-3.5 w-3.5" /> Mock Round
          </Button>
          <div className="text-center">
            <div className="metric-value text-3xl tabular-nums" style={{ color: ACCENT }}>
              {dsaReadiness.score}%
            </div>
            <p className="text-[11px] text-muted-foreground">DSA readiness</p>
            <p className="text-[10px] tabular-nums text-muted-foreground">
              {dsaReadiness.done}/{dsaReadiness.total} solved
            </p>
          </div>
          <div className="text-center">
            <div className="metric-value text-2xl tabular-nums">{csReadiness.score}%</div>
            <p className="text-[11px] text-muted-foreground">CS theory</p>
            <p className="text-[10px] tabular-nums text-muted-foreground">
              {csReadiness.done}/{csReadiness.total}
            </p>
          </div>
          <div className="text-center">
            <div className="metric-value text-2xl tabular-nums">{combinedReadiness.score}%</div>
            <p className="text-[11px] text-muted-foreground">Combined</p>
          </div>
        </div>
      </div>

      <LeetcodeReadinessCharts tierData={tierData} cumulativeData={cumulativeData} />

      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={tagFilter} onValueChange={(v) => setTagFilter(v as LeetcodeTagFilter)}>
          <TabsList className="h-auto flex-wrap justify-start gap-1">
            {TAG_FILTERS.map((tag) => (
              <TabsTrigger key={tag} value={tag} className="text-xs">
                {tag === "all" ? "All" : LEETCODE_TAG_LABELS[tag]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <button
          type="button"
          onClick={() => setRevisitOnly((v) => !v)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs transition-colors",
            revisitOnly
              ? "bg-violet-500/20 text-violet-200"
              : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
          )}
        >
          Needs Revisit{revisitProblems.length > 0 ? ` (${revisitProblems.length})` : ""}
        </button>
      </div>

      {revisitOnly ? (
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Due for review
          </h4>
          {revisitProblems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No problems due for revisit right now.</p>
          ) : (
            <ul className="space-y-1 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
              {revisitProblems.map((problem) => (
                <li key={problem.id} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{problem.pattern} ·</span>
                  <span className="truncate">{problem.title}</span>
                  <span className="ml-auto text-[10px] text-violet-300">due {problem.nextReviewDue}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <div className="space-y-6">
          {LEETCODE_TIER_ORDER.map((tier) => {
            const tierPatterns = grouped[tier];
            if (tierPatterns.length === 0) return null;
            return (
              <section key={tier}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {LEETCODE_TIER_LABELS[tier]}
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {tierPatterns.map((pattern) => (
                    <PatternCard
                      key={pattern.name}
                      pattern={pattern}
                      problems={problems}
                      patternQuizPassed={passedPatternKeys.has(pattern.name)}
                      highlighted={highlightPattern === pattern.name}
                      onReadGuide={onReadGuide}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <section className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-violet-200">CS Fundamentals</h4>
            <p className="text-xs text-muted-foreground">
              Check off a concept to unlock its quiz — MCQ screens at many BD companies
            </p>
          </div>
          <div className="text-right">
            <span className="metric-value text-xl tabular-nums" style={{ color: ACCENT }}>
              {csReadiness.score}%
            </span>
            <p className="text-[10px] tabular-nums text-muted-foreground">
              {csReadiness.done}/{csReadiness.total} reviewed
            </p>
          </div>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${csReadiness.score}%`, background: ACCENT }}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {csByCategory.map(({ category, items }) => (
            <div key={category}>
              <h5 className="mb-2 text-xs font-medium text-violet-300/80">{category}</h5>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-2 rounded-md px-1 py-1 hover:bg-white/[0.03]">
                    <button
                      type="button"
                      onClick={() => toggleCsReviewItem(item.id)}
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        item.done
                          ? "border-transparent text-white"
                          : "border-white/20 bg-transparent hover:border-white/40"
                      )}
                      style={item.done ? { background: ACCENT } : undefined}
                      aria-label={item.done ? "Mark unreviewed" : "Mark reviewed"}
                    >
                      {item.done && <Check className="h-2.5 w-2.5" />}
                    </button>
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-sm",
                        item.done && "line-through opacity-60 text-muted-foreground"
                      )}
                    >
                      {item.title}
                    </span>
                    {item.quizPassed ? (
                      <QuizBadge passed />
                    ) : item.done ? (
                      <QuizBadge pending />
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
