/**
 * Regenerates src/lib/go-backend-path.ts and src/lib/go-backend-projects.ts
 * from docs/Go_backend_updated_path version2.md.
 *
 * Topic 0.3 keeps the Bengali GIT_GITHUB_SUBTOPICS curriculum.
 * [PS] topics come from docs/Software_Engineering_Course_Modules_Only.md — one
 * topic per instructor module, each lesson as a [PS] subtopic.
 */
import fs from "fs";

const DOC = "docs/Go_backend_updated_path version2.md";
const PS_DOC = "docs/Software_Engineering_Course_Modules_Only.md";
const PATH_OUT = "src/lib/go-backend-path.ts";
const PROJECTS_OUT = "src/lib/go-backend-projects.ts";
const CURRICULUM_VERSION = 5;

/** Which PS course modules land in which Go path module (order preserved). */
const PS_MODULE_PLACEMENT = [
  // Module 0 — full watch
  { psName: "Welcome To Software Engineering Course", goModule: 0 },
  { psName: "Introduction to webservers", goModule: 0 },
  { psName: "Introduction To Backend Systems", goModule: 0 },
  // Module 1 — skim for interview contrasts
  { psName: "Javascript with Node JS and ExpressJS", goModule: 1, skim: true },
  { psName: "Async JS inside NodeJS", goModule: 1, skim: true },
  { psName: "JS Essentials For API development", goModule: 1, skim: true },
  { psName: "Process", goModule: 1, skim: true },
  { psName: "Typescript with OOP", goModule: 1, skim: true },
  { psName: "Interface And Polymorphism", goModule: 1, skim: true },
  // Module 4 — core API concepts
  { psName: "API - Development Part One", goModule: 4 },
  { psName: "API Development Part Two", goModule: 4 },
  { psName: "Data Modeling Part One", goModule: 4 },
  { psName: "Beyond CRUD: Understanding HTTP PUT and DELETE Methods", goModule: 4 },
  { psName: "response Formatting & Pagination : Offset and Cursor", goModule: 4 },
  { psName: "Api Security: CORS", goModule: 4 },
  // Module 5 — database / ERD
  { psName: "Introduction to Database", goModule: 5 },
  { psName: "Database Schema and SQL Inroduction", goModule: 5 },
  { psName: "Database Read Query Fundamentals", goModule: 5 },
  { psName: "Database Fundamentals: Entity Relationship", goModule: 5 },
  { psName: "ERD - Basics", goModule: 5 },
  // Module 6 — auth & security
  { psName: "Cookies and Session", goModule: 6 },
  { psName: "JWT", goModule: 6 },
  {
    psName: "Authentication & Authorization with JWT Indetails",
    goModule: 6,
  },
  { psName: "API Security", goModule: 6 },
  // Module 9 — file uploads → vaultdrop
  { psName: "File Uploader Project: POST api & Upload Handling", goModule: 9 },
  // Module 10 — logging
  { psName: "Loggers", goModule: 10 },
  // Module 11 — load testing
  { psName: "Load Testing", goModule: 11 },
  // Module 16 — patterns + delivery process
  { psName: "Software Design Patterns - Theory with Implementations", goModule: 16 },
  { psName: "NEST JS Project One", goModule: 16, processOnly: true },
];

const GIT_GITHUB_BLOCK = `/** Bengali Git & GitHub curriculum (Topic 0.3 subtopics). */
export const GIT_GITHUB_SUBTOPICS = [
  // শুরু
  "00 কিছু কথা",
  "01 গিট কি?",
  "02 গিটহাব কি?",
  // গিট
  "00 গিট সেটআপ",
  "01 গিট কনফিগার",
  "02 গিট রিপোজিটরি সেটআপ",
  "03 স্ট্যাটাস চেক করা",
  "04 স্টেজিং এরিয়াতে নেওয়া",
  "05 ফাইল কমিট করা",
  "06 ফাইল মডিফাই করে আবার কমিট",
  "07 পুনরায় মডিফাই করে কমিট",
  "08 কমিট লগ চেক",
  "09 পূর্বের ভার্শনে যাওয়া",
  "10 ব্রাঞ্চ তৈরি",
  "11 ব্রাঞ্চ এ চেকআউট",
  "12 নতুন ব্রাঞ্চে মডিফিকেশন",
  "13 ব্রাঞ্চ মেইনে মার্জ",
  "14 কমিটের সাথে কমিটের পার্থক্য",
  // গিটহাব
  "00 গিটহাবের সাথে লিঙ্ক",
  "01 গিটহাবে পুশ",
  "02 SSH কী সেটআপ",
  "03 গিটহাব থেকে পুল",
  "04 নিজের প্রোজেক্টে পুল রিকোয়েস্ট",
  "05 গিটহাব থেকে প্রোজেক্ট ক্লোন",
  "06 অন্য প্রোজেক্টে পুল রিকোয়েস্ট",
  // প্রোজেক্টে কন্ট্রিবিউট
  "00 প্রোজেক্ট খোঁজা",
  "01 প্রোজেক্ট ফর্ক",
  "02 কন্ট্রিবিউট",
  "03 এখনো শেষ হয়নি",
  "04 সেলিব্রেট 🎉",
  // এক্সপ্লোর গিট
  "00 গিট রিস্টোর",
  "01 গিট স্ট্যাশ",
  "02 গিট রিসেট",
  "03 গিট রিভার্ট",
  "04 গিট রিবেস",
  "05 গিট চেরিপিক",
] as const;
`;

/** NestJS Project One — process lessons only (skip Nest/TypeORM hands-on). */
const NESTJS_PROCESS_LESSONS = new Set([
  "Project Requirements",
  "Requirement analysis Part 2",
  "Technical Grooming and Project Bootstrap",
  "Finding P0 task and hands on details.mp4",
  "Preparing DTO and Repository Layer",
  "Service and Controller",
  "Testing End Points",
  "Automated Testing API with bash file",
  "Product Development PRD analysis and Development scope discussion",
]);

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function normalizeTier(raw) {
  const lower = raw.trim().toLowerCase();
  if (lower.includes("→")) {
    const parts = lower.split("→").map((p) => p.trim());
    return parts[parts.length - 1];
  }
  if (lower === "capstone") return "capstone";
  if (lower === "advanced") return "advanced";
  if (lower === "medium") return "medium";
  if (lower === "beginner") return "beginner";
  return "medium";
}

function psSubtopic(text) {
  const trimmed = text.trim();
  return trimmed.startsWith("[PS]") ? trimmed : `[PS] ${trimmed}`;
}

function parsePsCourse(md) {
  const modules = [];
  let current = null;
  for (const line of md.split(/\r?\n/)) {
    if (line.startsWith("# ")) {
      if (current) modules.push(current);
      current = { name: line.slice(2).trim(), lessons: [] };
    } else if (line.startsWith("- ") && !line.startsWith("- •")) {
      const lesson = line.slice(2).trim();
      if (lesson) current?.lessons.push(lesson);
    }
  }
  if (current) modules.push(current);
  return modules;
}

function attachPsTopics(goModules, psModules) {
  const psByName = new Map(psModules.map((m) => [m.name, m]));
  const counters = new Map();

  for (const placement of PS_MODULE_PLACEMENT) {
    const psMod = psByName.get(placement.psName);
    if (!psMod) {
      throw new Error(`PS course module not found: ${placement.psName}`);
    }

    const goMod = goModules.find((m) => m.index === placement.goModule);
    if (!goMod) {
      throw new Error(`Go module ${placement.goModule} not found for PS: ${placement.psName}`);
    }

    const seq = (counters.get(placement.goModule) ?? 0) + 1;
    counters.set(placement.goModule, seq);

    let lessons = psMod.lessons;
    if (placement.processOnly) {
      lessons = [
        "Process focus — skip NestJS/TypeORM hands-on; mirror handler → service → store in Go",
        ...psMod.lessons.filter((l) => NESTJS_PROCESS_LESSONS.has(l)),
      ];
    }

    const skimSuffix = placement.skim ? " (skim)" : "";
    const topic = {
      name: `Topic ${placement.goModule}.PS${seq}: [PS] ${psMod.name}${skimSuffix}`,
      subtopics: lessons.map((l) => psSubtopic(l)),
      isPsTopic: true,
    };

    if (placement.psName === "JWT") {
      topic.subtopics.push(
        psSubtopic(
          "Assignment: Build Personal To-Do Manager with JWT in Go (no database — warm-up before Secure jobtrackr)"
        )
      );
    }

    goMod.topics.push(topic);
  }
}

function parseDoc(md) {
  const modules = [];
  let cur = null;
  let topic = null;
  let project = null;
  let inInstructorBlock = false;

  for (const line of md.split(/\r?\n/)) {
    const mod = line.match(/^## Module (\d+): (.+)$/);
    if (mod) {
      cur = {
        index: Number(mod[1]),
        name: `Module ${mod[1]}: ${mod[2].trim()}`,
        ongoing: /\[Ongoing\]/i.test(mod[2]),
        topics: [],
        projects: [],
      };
      modules.push(cur);
      topic = null;
      project = null;
      inInstructorBlock = false;
      continue;
    }
    if (!cur) continue;
    if (/^## /.test(line) && !/^## Module /.test(line)) {
      cur = null;
      inInstructorBlock = false;
      continue;
    }
    if (/^### 📺 Instructor course —/.test(line)) {
      inInstructorBlock = true;
      topic = null;
      project = null;
      continue;
    }
    if (inInstructorBlock) {
      if (/^### /.test(line)) inInstructorBlock = false;
      else continue;
    }
    if (/^### Projects\s*$/.test(line)) {
      topic = null;
      project = null;
      continue;
    }
    const t = line.match(/^### Topic (.+)$/);
    if (t) {
      topic = { name: `Topic ${t[1].trim()}`, subtopics: [], isPsTopic: false };
      cur.topics.push(topic);
      project = null;
      continue;
    }
    const p = line.match(/^#### Project: \[(.+?)\] (.+)$/);
    if (p) {
      project = {
        name: p[2].trim(),
        tier: normalizeTier(p[1]),
        deliverables: [],
      };
      cur.projects.push(project);
      topic = null;
      continue;
    }
    if (/^\*Tier:/.test(line)) continue;
    if (/^>/.test(line)) continue;
    const bullet = line.match(/^- (.+)$/);
    if (bullet) {
      const text = bullet[1].trim();
      if (!text || text === "•") continue;
      if (project) project.deliverables.push(text);
      else if (topic) topic.subtopics.push(text);
    }
  }
  return modules;
}

function genPathTs(modules) {
  const lines = [];
  lines.push(`export type GoProjectTier = "beginner" | "medium" | "advanced" | "capstone";`);
  lines.push(``);
  lines.push(`export interface GoPathProject {`);
  lines.push(`  name: string;`);
  lines.push(`  tier: GoProjectTier;`);
  lines.push(`  deliverables: string[];`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export interface GoPathTopic {`);
  lines.push(`  name: string;`);
  lines.push(`  subtopics: string[];`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export interface GoPathModule {`);
  lines.push(`  name: string;`);
  lines.push(`  ongoing?: boolean;`);
  lines.push(`  topics: GoPathTopic[];`);
  lines.push(`  projects?: GoPathProject[];`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const GO_BACKEND_PATH_MARKER =`);
  lines.push(`  "Module 0: Developer Environment & Foundations";`);
  lines.push(``);
  lines.push(
    `/** Bump when Development Go path curriculum shape changes (v${CURRICULUM_VERSION}: [PS] topics aligned to instructor course modules). */`
  );
  lines.push(`export const GO_BACKEND_CURRICULUM_VERSION = ${CURRICULUM_VERSION};`);
  lines.push(``);
  lines.push(GIT_GITHUB_BLOCK.trimEnd());
  lines.push(``);
  lines.push(`export const GO_BACKEND_PATH: GoPathModule[] = [`);

  for (const mod of modules) {
    lines.push(`  {`);
    lines.push(`    name: "${esc(mod.name)}",`);
    if (mod.ongoing) lines.push(`    ongoing: true,`);
    lines.push(`    topics: [`);
    for (const topic of mod.topics) {
      lines.push(`      {`);
      lines.push(`        name: "${esc(topic.name)}",`);
      if (topic.name === "Topic 0.3: Git & GitHub") {
        lines.push(`        subtopics: [...GIT_GITHUB_SUBTOPICS],`);
      } else {
        lines.push(`        subtopics: [`);
        for (const s of topic.subtopics) {
          lines.push(`          "${esc(s)}",`);
        }
        lines.push(`        ],`);
      }
      lines.push(`      },`);
    }
    lines.push(`    ],`);
    lines.push(`  },`);
  }
  lines.push(`];`);
  lines.push(``);
  return lines.join("\n");
}

function genProjectsTs(modules) {
  const lines = [];
  lines.push(`import type { GoPathProject } from "./go-backend-path";`);
  lines.push(``);
  lines.push(`/** Projects per module index (0–23). At least 1–2 per module; beginner → advanced progression. */`);
  lines.push(`export const GO_BACKEND_MODULE_PROJECTS: GoPathProject[][] = [`);

  for (const mod of modules) {
    lines.push(`  // ${mod.name}`);
    lines.push(`  [`);
    for (const p of mod.projects) {
      lines.push(`    {`);
      lines.push(`      name: "${esc(p.name)}",`);
      lines.push(`      tier: "${p.tier}",`);
      lines.push(`      deliverables: [`);
      for (const d of p.deliverables) {
        lines.push(`        "${esc(d)}",`);
      }
      lines.push(`      ],`);
      lines.push(`    },`);
    }
    lines.push(`  ],`);
  }

  lines.push(`];`);
  lines.push(``);
  lines.push(`export const GO_BACKEND_PROJECT_TOPIC_PREFIX = "Project:";`);
  lines.push(``);
  lines.push(`export function formatGoProjectTopicName(project: GoPathProject): string {`);
  lines.push(`  const tier =`);
  lines.push(`    project.tier === "capstone"`);
  lines.push(`      ? "Capstone"`);
  lines.push(`      : project.tier.charAt(0).toUpperCase() + project.tier.slice(1);`);
  lines.push(`  return \`\${GO_BACKEND_PROJECT_TOPIC_PREFIX} [\${tier}] \${project.name}\`;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function goProjectTierToDifficulty(`);
  lines.push(`  tier: GoPathProject["tier"]`);
  lines.push(`): "easy" | "medium" | "hard" | "expert" {`);
  lines.push(`  switch (tier) {`);
  lines.push(`    case "beginner":`);
  lines.push(`      return "easy";`);
  lines.push(`    case "medium":`);
  lines.push(`      return "medium";`);
  lines.push(`    case "advanced":`);
  lines.push(`      return "hard";`);
  lines.push(`    case "capstone":`);
  lines.push(`      return "expert";`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`/** Attach projects array to each module in the path. */`);
  lines.push(`export function withGoBackendProjects<T extends { projects?: GoPathProject[] }>(`);
  lines.push(`  modules: T[]`);
  lines.push(`): (T & { projects: GoPathProject[] })[] {`);
  lines.push(`  return modules.map((mod, i) => ({`);
  lines.push(`    ...mod,`);
  lines.push(`    projects: GO_BACKEND_MODULE_PROJECTS[i] ?? mod.projects ?? [],`);
  lines.push(`  }));`);
  lines.push(`}`);
  lines.push(``);
  return lines.join("\n");
}

const modules = parseDoc(fs.readFileSync(DOC, "utf8"));
if (modules.length !== 24) {
  console.error(`Expected 24 modules, got ${modules.length}`);
  process.exit(1);
}

const psModules = parsePsCourse(fs.readFileSync(PS_DOC, "utf8"));
attachPsTopics(modules, psModules);

fs.writeFileSync(PATH_OUT, genPathTs(modules));
fs.writeFileSync(PROJECTS_OUT, genProjectsTs(modules));

const topics = modules.reduce((s, m) => s + m.topics.length, 0);
const psTopics = modules.reduce((s, m) => s + m.topics.filter((t) => t.isPsTopic).length, 0);
const subs = modules.reduce(
  (s, m) => s + m.topics.reduce((a, t) => a + (t.name === "Topic 0.3: Git & GitHub" ? 36 : t.subtopics.length), 0),
  0
);
const psSubs = modules.reduce(
  (s, m) => s + m.topics.reduce((a, t) => a + (t.isPsTopic ? t.subtopics.length : 0), 0),
  0
);
const projects = modules.reduce((s, m) => s + m.projects.length, 0);
console.log(`Wrote ${PATH_OUT} and ${PROJECTS_OUT}`);
console.log(
  `Modules=${modules.length} Topics=${topics} ([PS] topics=${psTopics}) Subtopics≈${subs} ([PS] subs=${psSubs}) Projects=${projects}`
);
