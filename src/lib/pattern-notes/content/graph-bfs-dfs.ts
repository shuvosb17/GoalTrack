import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("graph-bfs-dfs")!;

export const article = buildPatternArticle({
  meta,
  summary: "Traverse adjacency graphs with BFS (shortest unweighted paths) or DFS (connectivity, cycles, components).",
  intuition: "Use **graph BFS/DFS** on explicit adjacency lists, grids as implicit graphs, or when counting islands/components. BFS when edge weights uniform; DFS for exhaustive component labeling.\n\nMark visited to avoid revisiting. BFS uses queue for level-by-level expansion; DFS uses recursion/stack for deep exploration. For grids, encode neighbors with direction arrays.",
  deepDive: "Connected components, flood fill, cycle detection in directed/undirected graphs, bipartite check coloring, clone graph with hash map.\n\nGrid BFS/DFS (islands, rotten oranges) is extremely common in BD service company tests.",
  signals: [
    "Nodes and edges or 2D grid traversal",
    "Count connected components or islands",
    "Shortest steps in unweighted graph",
    "Detect cycle or topological need",
    "Visit all reachable with constraints",
    "Clone or serialize graph structure",
    "Multi-source BFS spreading",
    "Bipartite / 2-coloring question"
  ],
  subpatterns: [
    {
      "name": "Grid DFS/BFS",
      "description": "4/8 directional flood fill with visited matrix."
    },
    {
      "name": "Adjacency list DFS",
      "description": "Recursive stack for component sizes."
    },
    {
      "name": "BFS shortest path",
      "description": "Queue stores (node, distance) on unweighted edges."
    },
    {
      "name": "Multi-source BFS",
      "description": "Enqueue all sources at distance 0 together."
    },
    {
      "name": "Coloring bipartite",
      "description": "Alternate colors; conflict means not bipartite."
    },
    {
      "name": "Iterative DFS stack",
      "description": "Avoid recursion limits on deep graphs."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <queue>
using namespace std;

class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int m = (int)grid.size(), n = grid[0].size(), ans = 0;
        vector<pair<int,int>> dirs = {{1,0},{-1,0},{0,1},{0,-1}};
        auto dfs = [&](int r, int c, auto&& dfs_ref) -> void {
            grid[r][c] = '0';
            for (auto [dr, dc] : dirs) {
                int nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == '1')
                    dfs_ref(nr, nc, dfs_ref);
            }
        };
        for (int i = 0; i < m; ++i)
            for (int j = 0; j < n; ++j)
                if (grid[i][j] == '1') { ++ans; dfs(i, j, dfs); }
        return ans;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "BFS shortest path in grid",
    language: "cpp",
    code: `#include <vector>
#include <queue>
using namespace std;

class Solution {
public:
    int shortestPathBinaryMatrix(vector<vector<int>>& grid) {
        int n = (int)grid.size();
        if (grid[0][0] || grid[n-1][n-1]) return -1;
        queue<pair<int,int>> q;
        q.push({0,0});
        grid[0][0] = 1;
        int steps = 1;
        vector<pair<int,int>> dirs = {{1,0},{-1,0},{0,1},{0,-1},{1,1},{1,-1},{-1,1},{-1,-1}};
        while (!q.empty()) {
            int sz = (int)q.size();
            for (int s = 0; s < sz; ++s) {
                auto [r,c] = q.front(); q.pop();
                if (r == n-1 && c == n-1) return steps;
                for (auto [dr,dc] : dirs) {
                    int nr = r+dr, nc = c+dc;
                    if (nr>=0 && nr<n && nc>=0 && nc<n && grid[nr][nc]==0) {
                        grid[nr][nc] = 1;
                        q.push({nr,nc});
                    }
                }
            }
            ++steps;
        }
        return -1;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "graph-bfs-dfs",
  walkthrough: "Mutating visited into grid saves memory. For adjacency lists, use `vector<char> seen(n)`. Multi-source BFS enqueues all rotten oranges simultaneously.",
  steps: [
    "Build graph representation (adj list or grid).",
    "Choose BFS vs DFS based on shortest path need.",
    "Initialize visited structure.",
    "Traverse neighbors with bounds checks.",
    "For components, increment counter per unseen start.",
    "Discuss directed vs undirected edge handling.",
    "Complexity O(V+E) or O(mn)."
  ],
  problems: [
    {
      "title": "Number of Islands",
      "slug": "number-of-islands",
      "difficulty": "medium",
      "note": "Grid DFS/BFS."
    },
    {
      "title": "Clone Graph",
      "slug": "clone-graph",
      "difficulty": "medium",
      "note": "Map old->new DFS."
    },
    {
      "title": "Pacific Atlantic Water Flow",
      "slug": "pacific-atlantic-water-flow",
      "difficulty": "medium",
      "note": "Multi-source DFS."
    },
    {
      "title": "Course Schedule",
      "slug": "course-schedule",
      "difficulty": "medium",
      "note": "Cycle detection DFS."
    },
    {
      "title": "Rotting Oranges",
      "slug": "rotting-oranges",
      "difficulty": "medium",
      "note": "Multi-source BFS."
    },
    {
      "title": "Word Ladder",
      "slug": "word-ladder",
      "difficulty": "hard",
      "note": "BFS on implicit graph."
    },
    {
      "title": "Surrounded Regions",
      "slug": "surrounded-regions",
      "difficulty": "medium",
      "note": "DFS from borders."
    },
    {
      "title": "Graph Valid Tree",
      "slug": "graph-valid-tree",
      "difficulty": "medium",
      "note": "Union-find or DFS cycle."
    }
  ],
  pitfalls: "Not marking visited at enqueue time in BFS (duplicate queue entries). Modifying grid without clarifying with interviewer. Stack overflow on large grids - prefer BFS/iterative.",
  interviewTips: "State O(V+E). For grids, mention 4 vs 8 connectivity.",
  complexity: [
    {
      "operation": "DFS/BFS visit",
      "time": "O(V+E)",
      "space": "O(V)"
    },
    {
      "operation": "Grid flood fill",
      "time": "O(mn)",
      "space": "O(mn)"
    },
    {
      "operation": "BFS shortest",
      "time": "O(V+E)",
      "space": "O(V)"
    }
  ],
});
