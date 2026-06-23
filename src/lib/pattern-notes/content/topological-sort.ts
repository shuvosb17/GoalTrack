import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("topological-sort")!;

export const article = buildPatternArticle({
  meta,
  summary: "Linear ordering of DAG nodes respecting all edges — prerequisites and dependencies.",
  intuition: "Two approaches: **Kahn's BFS** (in-degree queue) or **DFS postorder** stack. Cycle exists if you can't process all nodes.",
  signals: ["Course prerequisites", "Build order", "Dependency resolution", "Alien dictionary"],
  subpatterns: [
    { name: "Kahn's algorithm", description: "Enqueue in-degree 0; reduce neighbors." },
    { name: "DFS postorder", description: "Push to stack after visiting deps; reverse." },
    { name: "Cycle detection", description: "Processed count < n means cycle." },
  ],
  templateCode: {
    language: "typescript",
    code: `function canFinish(n: number, prereq: number[][]): boolean {
  const indeg = Array(n).fill(0), adj: number[][] = Array.from({length:n}, () => []);
  for (const [a,b] of prereq) { adj[b].push(a); indeg[a]++; }
  const q: number[] = [];
  indeg.forEach((d,i) => d === 0 && q.push(i));
  let seen = 0;
  while (q.length) {
    const u = q.shift()!; seen++;
    for (const v of adj[u]) if (--indeg[v] === 0) q.push(v);
  }
  return seen === n;
}`,
  },
  viz: "topo-sort",
  walkthrough: "**Course Schedule II**: Kahn's algorithm collects order while processing queue. If order length < n, return empty (cycle).",
  problems: [
    { title: "Course Schedule", slug: "course-schedule", difficulty: "medium", note: "Cycle check." },
    { title: "Course Schedule II", slug: "course-schedule-ii", difficulty: "medium", note: "Output order." },
    { title: "Alien Dictionary", slug: "alien-dictionary", difficulty: "hard", note: "Build graph from words." },
  ],
  pitfalls: "Build adjacency in correct direction (prerequisite → course). Handle disconnected DAG components.",
  complexity: [{ operation: "Topological sort", time: "O(V+E)", space: "O(V+E)" }],
});
