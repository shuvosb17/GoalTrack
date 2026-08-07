import type { Bs23StageId } from "../types";

export interface Bs23CompetencyDef {
  id: string;
  name: string;
  weight: number;
  /** Readiness % needed to count as "met" for this competency */
  threshold: number;
  /** Minimum logged drills before score can exceed volume cap */
  minEvidence: number;
  hint: string;
}

export interface Bs23StageDef {
  id: Bs23StageId;
  order: number;
  name: string;
  shortName: string;
  description: string;
  /** Stage-level readiness % to unlock next stage */
  passThreshold: number;
  /** Base pass rate at this gate (research: Tahanima, interview-questions-bangladesh, 2025 LinkedIn posts) */
  basePassRate: number;
  competencies: Bs23CompetencyDef[];
  accent: string;
}

export interface Bs23ArtifactDef {
  id: string;
  stageId: Bs23StageId;
  name: string;
  description: string;
}

export const BS23_ARTIFACTS: Bs23ArtifactDef[] = [
  { id: "resume_ats", stageId: "S1", name: "ATS-optimized resume", description: "One-page, keyword-rich, no graphics blocking parsers" },
  { id: "github_portfolio", stageId: "S1", name: "GitHub portfolio", description: "Pinned repos, READMEs, consistent commits" },
  { id: "project_1", stageId: "S1", name: "Deployed project #1", description: "Live URL + README explaining stack and trade-offs" },
  { id: "project_2", stageId: "S1", name: "Deployed project #2", description: "Different domain; shows breadth" },
  { id: "linkedin", stageId: "S1", name: "LinkedIn profile", description: "Headline, projects, open-to-work if applicable" },
  { id: "star_story_1", stageId: "S5", name: "STAR story — conflict", description: "Disagreement on technical decision" },
  { id: "star_story_2", stageId: "S5", name: "STAR story — deadline miss", description: "Missed deadline and what you learned" },
  { id: "star_story_3", stageId: "S5", name: "STAR story — hard bug", description: "Difficult debugging session" },
  { id: "star_story_4", stageId: "S5", name: "STAR story — learning fast", description: "New technology under time pressure" },
  { id: "star_story_5", stageId: "S5", name: "STAR story — teamwork", description: "Collaboration under pressure" },
  { id: "why_bs23", stageId: "S5", name: "Why BS23 script", description: "60-second answer: company, fintech depth, growth" },
];

export const BS23_STAGES: Bs23StageDef[] = [
  {
    id: "S1",
    order: 1,
    name: "CV Shortlisting",
    shortName: "CV",
    description: "Resume, portfolio, and project proof before you ever sit an exam.",
    passThreshold: 75,
    basePassRate: 0.12,
    accent: "#94a3b8",
    competencies: [
      { id: "resume_ats", name: "Resume / ATS", weight: 25, threshold: 80, minEvidence: 1, hint: "One page, action verbs, quantified impact" },
      { id: "github_portfolio", name: "GitHub portfolio", weight: 20, threshold: 75, minEvidence: 1, hint: "Pinned repos with README architecture sections" },
      { id: "deployed_projects", name: "Deployed projects", weight: 30, threshold: 80, minEvidence: 2, hint: "2+ live URLs; BS23 cares about proof, not tutorials" },
      { id: "linkedin", name: "LinkedIn / presence", weight: 10, threshold: 70, minEvidence: 1, hint: "Projects visible; headline matches target role" },
      { id: "cgpa_eligibility", name: "Academic eligibility", weight: 15, threshold: 100, minEvidence: 0, hint: "Meet stated CGPA requirement — non-negotiable gate" },
    ],
  },
  {
    id: "S2",
    order: 2,
    name: "Online MCQ",
    shortName: "MCQ",
    description: "Remote timed exam: OOP, DBMS, DS theory, output tracing, design patterns.",
    passThreshold: 70,
    basePassRate: 0.22,
    accent: "#3b82f6",
    competencies: [
      { id: "oop_pillars", name: "OOP pillars", weight: 15, threshold: 75, minEvidence: 3, hint: "Encapsulation, inheritance, polymorphism, abstraction with examples" },
      { id: "oop_advanced", name: "OOP advanced / SOLID", weight: 12, threshold: 70, minEvidence: 3, hint: "Abstract vs interface, SOLID, == vs .equals()" },
      { id: "dbms_normalization", name: "Normalization", weight: 10, threshold: 70, minEvidence: 3, hint: "1NF–BCNF; when to denormalize" },
      { id: "dbms_sql_joins", name: "SQL & joins", weight: 15, threshold: 75, minEvidence: 3, hint: "LEFT JOIN + GROUP BY, second highest salary" },
      { id: "dbms_indexing_acid", name: "Indexing & ACID", weight: 12, threshold: 70, minEvidence: 3, hint: "Clustered vs non-clustered, transaction properties" },
      { id: "ds_algo_theory", name: "DS & algo theory", weight: 15, threshold: 75, minEvidence: 3, hint: "ArrayList vs LinkedList insert, tree traversals, complexity" },
      { id: "output_tracing", name: "Output tracing", weight: 12, threshold: 70, minEvidence: 3, hint: "Inheritance + overriding snippets on paper" },
      { id: "design_patterns", name: "Design patterns", weight: 9, threshold: 65, minEvidence: 2, hint: "Identify Factory, Observer, Strategy from UML" },
      { id: "mcq_speed", name: "Timed speed", weight: 10, threshold: 70, minEvidence: 3, hint: "Full mock under exam time limit — speed is a skill" },
    ],
  },
  {
    id: "S3",
    order: 3,
    name: "Technical / Problem Solving",
    shortName: "Technical",
    description: "LeetCode-style easy–medium (1–2 hard), onsite written, paper solving without IDE.",
    passThreshold: 72,
    basePassRate: 0.28,
    accent: "#8b5cf6",
    competencies: [
      { id: "arrays_strings", name: "Arrays & strings", weight: 12, threshold: 75, minEvidence: 5, hint: "Two sum, move zeros, anagram grouping" },
      { id: "hashing", name: "Hashing", weight: 10, threshold: 70, minEvidence: 4, hint: "Frequency maps, complement lookups" },
      { id: "two_pointers_sliding", name: "Two pointers / sliding", weight: 10, threshold: 70, minEvidence: 4, hint: "Longest substring, container with most water" },
      { id: "linked_lists", name: "Linked lists", weight: 10, threshold: 75, minEvidence: 4, hint: "Reverse, cycle detect, merge sorted" },
      { id: "trees_graphs", name: "Trees & graphs", weight: 14, threshold: 72, minEvidence: 5, hint: "BFS/DFS, tree comparison, shortest path basics" },
      { id: "binary_search", name: "Binary search", weight: 8, threshold: 70, minEvidence: 3, hint: "Rotated sorted array, search boundaries" },
      { id: "stacks_queues", name: "Stacks & queues", weight: 8, threshold: 68, minEvidence: 3, hint: "Valid parentheses, monotonic stack intro" },
      { id: "basic_dp", name: "Basic DP", weight: 10, threshold: 65, minEvidence: 3, hint: "Coin change, LCS intro — 1–2 hard max" },
      { id: "complexity_explanation", name: "Complexity explanation", weight: 8, threshold: 75, minEvidence: 3, hint: "State time/space verbally after every solution" },
      { id: "paper_solving", name: "Paper solving (no IDE)", weight: 10, threshold: 70, minEvidence: 4, hint: "Write pseudocode on paper under timer — BS23 written is 55% of marks" },
    ],
  },
  {
    id: "S4",
    order: 4,
    name: "Day-Long Assessment",
    shortName: "Day-long",
    description: "Mohakhali office: personality tests, team system design on paper, stack test, mentor interview.",
    passThreshold: 68,
    basePassRate: 0.35,
    accent: "#f59e0b",
    competencies: [
      { id: "requirement_analysis", name: "Requirement analysis", weight: 12, threshold: 70, minEvidence: 2, hint: "Break scenario into actors, constraints, edge cases" },
      { id: "erd_design", name: "ERD design", weight: 14, threshold: 72, minEvidence: 3, hint: "E-commerce / ticketing ERD on paper in 30 min" },
      { id: "architecture_flow", name: "Architecture flow", weight: 12, threshold: 68, minEvidence: 2, hint: "Context diagram + component flow" },
      { id: "flowcharts", name: "Flowcharts", weight: 10, threshold: 70, minEvidence: 2, hint: "Registration/login flows with constraints" },
      { id: "pseudocode", name: "Pseudocode", weight: 10, threshold: 70, minEvidence: 2, hint: "Roles & permissions logic on paper" },
      { id: "sql_handwrite", name: "Hand-written SQL", weight: 12, threshold: 72, minEvidence: 3, hint: "Queries against your own ERD design" },
      { id: "teamwork_leadership", name: "Teamwork / OwnPATH", weight: 10, threshold: 65, minEvidence: 1, hint: "Practice assigning OwnPATH roles in mock teams" },
      { id: "presentation", name: "Group presentation", weight: 8, threshold: 65, minEvidence: 2, hint: "10-min solution pitch to panel" },
      { id: "stack_specific_test", name: "Stack-specific test", weight: 8, threshold: 70, minEvidence: 2, hint: "20-min test on declared language — 15 core questions" },
      { id: "full_day_stamina", name: "Full-day stamina", weight: 4, threshold: 60, minEvidence: 1, hint: "Simulate 8:30–6:00 with multiple assessments" },
    ],
  },
  {
    id: "S5",
    order: 5,
    name: "HR Round",
    shortName: "HR",
    description: "STAR stories, motivation, English fluency, salary, background.",
    passThreshold: 75,
    basePassRate: 0.55,
    accent: "#22c55e",
    competencies: [
      { id: "star_stories", name: "STAR stories", weight: 30, threshold: 80, minEvidence: 5, hint: "5 stories rehearsed aloud, not memorized word-for-word" },
      { id: "why_bs23", name: "Why BS23", weight: 20, threshold: 75, minEvidence: 2, hint: "Fintech clients, scale, public company — be specific" },
      { id: "english_fluency", name: "English fluency", weight: 25, threshold: 70, minEvidence: 3, hint: "Record yourself answering behavioral questions" },
      { id: "failure_weakness", name: "Failure / weakness", weight: 15, threshold: 70, minEvidence: 2, hint: "Honest weakness + concrete improvement plan" },
      { id: "salary_expectation", name: "Salary expectation", weight: 10, threshold: 70, minEvidence: 1, hint: "Research fresher range; give a researched band" },
    ],
  },
];

/** LeetCode pattern names → S3 competency ids */
export const LEETCODE_PATTERN_TO_COMPETENCY: Record<string, string> = {
  "Arrays & Hashing": "arrays_strings",
  "Two Pointers": "two_pointers_sliding",
  "Sliding Window": "two_pointers_sliding",
  "Binary Search": "binary_search",
  "Trees DFS/BFS": "trees_graphs",
  "Graphs BFS/DFS": "trees_graphs",
  "Graphs Shortest Path / Dijkstra": "trees_graphs",
  "DP Basics": "basic_dp",
  "Advanced DP": "basic_dp",
  "Stack / Monotonic Stack": "stacks_queues",
  "Linked List": "linked_lists",
  "Heap / Top K": "hashing",
  "String Algorithms": "arrays_strings",
};

/** CS review category → S2 competency */
export const CS_CATEGORY_TO_COMPETENCY: Record<string, string> = {
  OOP: "oop_pillars",
  DBMS: "dbms_sql_joins",
  DS: "ds_algo_theory",
};

export function getStageById(id: Bs23StageId): Bs23StageDef | undefined {
  return BS23_STAGES.find((s) => s.id === id);
}

export function getCompetencyById(id: string): { stage: Bs23StageDef; competency: Bs23CompetencyDef } | undefined {
  for (const stage of BS23_STAGES) {
    const competency = stage.competencies.find((c) => c.id === id);
    if (competency) return { stage, competency };
  }
  return undefined;
}

export function allCompetencyDefs(): Array<{ stage: Bs23StageDef; competency: Bs23CompetencyDef }> {
  return BS23_STAGES.flatMap((stage) =>
    stage.competencies.map((competency) => ({ stage, competency }))
  );
}
