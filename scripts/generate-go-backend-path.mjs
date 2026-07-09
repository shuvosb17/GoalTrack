/**
 * Regenerates src/lib/go-backend-path.ts and src/lib/go-backend-projects.ts
 * from docs/Go_backend_updated_path.md.
 *
 * Topic 0.3 keeps the Bengali GIT_GITHUB_SUBTOPICS curriculum (not the English
 * bullets in the markdown).
 */
import fs from "fs";

const DOC = "docs/Go_backend_updated_path.md";
const PATH_OUT = "src/lib/go-backend-path.ts";
const PROJECTS_OUT = "src/lib/go-backend-projects.ts";

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

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function parseDoc(md) {
  const modules = [];
  let cur = null;
  let topic = null;
  let project = null;

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
      continue;
    }
    if (!cur) continue;
    if (/^## /.test(line) && !/^## Module /.test(line)) {
      cur = null;
      continue;
    }
    if (/^### Projects\s*$/.test(line)) {
      topic = null;
      project = null;
      continue;
    }
    const t = line.match(/^### Topic (.+)$/);
    if (t) {
      topic = { name: `Topic ${t[1].trim()}`, subtopics: [] };
      cur.topics.push(topic);
      project = null;
      continue;
    }
    const p = line.match(/^#### Project: \[(.+?)\] (.+)$/);
    if (p) {
      project = {
        name: p[2].trim(),
        tier: p[1].trim().toLowerCase(),
        deliverables: [],
      };
      cur.projects.push(project);
      continue;
    }
    if (/^\*Tier:/.test(line)) continue;
    const bullet = line.match(/^- (.+)$/);
    if (bullet) {
      if (project) project.deliverables.push(bullet[1]);
      else if (topic) topic.subtopics.push(bullet[1]);
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
  lines.push(`/** Bump when Development Go path curriculum shape changes. */`);
  lines.push(`export const GO_BACKEND_CURRICULUM_VERSION = 2;`);
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

fs.writeFileSync(PATH_OUT, genPathTs(modules));
fs.writeFileSync(PROJECTS_OUT, genProjectsTs(modules));

const topics = modules.reduce((s, m) => s + m.topics.length, 0);
const subs = modules.reduce(
  (s, m) => s + m.topics.reduce((a, t) => a + (t.name === "Topic 0.3: Git & GitHub" ? 36 : t.subtopics.length), 0),
  0
);
const projects = modules.reduce((s, m) => s + m.projects.length, 0);
console.log(`Wrote ${PATH_OUT} and ${PROJECTS_OUT}`);
console.log(`Modules=${modules.length} Topics=${topics} Subtopics≈${subs} Projects=${projects}`);
