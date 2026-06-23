import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("graph-bfs-dfs")!;

export const article = buildPatternArticle({
  meta,
  summary: "Model relationships as nodes/edges; BFS for shortest unweighted paths, DFS for exploration.",
  intuition: "Convert grid or implicit graph to adjacency list. **BFS** finds shortest steps in unweighted graphs. **DFS** floods islands, detects cycles, clones nodes.",
  signals: ["Grid as graph (4/8 directions)", "Connected components", "Shortest path unweighted", "Clone/adjacency from node object"],
  subpatterns: [
    { name: "DFS flood fill", description: "Mark visited; recurse neighbors." },
    { name: "BFS layers", description: "Queue + distance increment per level." },
    { name: "Multi-source BFS", description: "Enqueue all sources initially." },
  ],
  templateCode: {
    language: "typescript",
    code: `function numIslands(grid: string[][]): number {
  let count = 0;
  const dfs = (r: number, c: number) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] === "0") return;
    grid[r][c] = "0";
    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
  };
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++)
      if (grid[r][c] === "1") { count++; dfs(r,c); }
  return count;
}`,
  },
  viz: "graph-bfs-dfs",
  walkthrough: "**Rotting Oranges**: multi-source BFS from all rotten cells; each minute expands to adjacent fresh oranges.",
  problems: [
    { title: "Number of Islands", slug: "number-of-islands", difficulty: "medium", note: "DFS flood fill." },
    { title: "Clone Graph", slug: "clone-graph", difficulty: "medium", note: "HashMap old→clone." },
    { title: "Pacific Atlantic Water Flow", slug: "pacific-atlantic-water-flow", difficulty: "medium", note: "DFS from oceans." },
    { title: "Rotting Oranges", slug: "rotting-oranges", difficulty: "medium", note: "Multi-source BFS." },
  ],
  pitfalls: "Mark visited when enqueuing, not when dequeuing. For undirected edges add both directions.",
  complexity: [{ operation: "Visit all V,E", time: "O(V+E)", space: "O(V)" }],
});
