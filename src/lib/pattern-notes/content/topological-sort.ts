import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("topological-sort")!;

export const article = buildPatternArticle({
  meta,
  summary: "Order directed acyclic graphs so every edge goes from earlier to later - Kahn BFS or DFS postorder.",
  intuition: "Use **topological sort** for prerequisites, build orders, or detecting cycles in directed graphs. If cycle exists, no valid ordering.\n\nKahn: compute indegrees, enqueue zeros, pop and relax neighbors. DFS: mark visiting/visited; push to order on finish; reverse for topo order. Both O(V+E).",
  deepDive: "Course schedule feasibility, all topological orders (backtrack), longest path in DAG, alien dictionary.\n\nCourse schedule I/II is the canonical BD directed graph question.",
  signals: [
    "Prerequisites or dependencies between tasks",
    "Directed edges must be respected in output order",
    "Detect cycle in directed graph",
    "Build sequence from partial order",
    "DAG longest/shortest path in linear time",
    "Indegree zero nodes can start",
    "Multiple valid orders acceptable",
    "Implicit graph from words/rules"
  ],
  subpatterns: [
    {
      "name": "Kahn BFS",
      "description": "Queue indegree 0 nodes; decrement neighbor indegrees."
    },
    {
      "name": "DFS postorder",
      "description": "Finish time stack; reverse for topological order."
    },
    {
      "name": "Cycle detection",
      "description": "If processed count < n or DFS back-edge, cycle exists."
    },
    {
      "name": "DAG DP on topo",
      "description": "Process in topo order relaxing longest path."
    },
    {
      "name": "Alien dictionary",
      "description": "Build edges from adjacent word char comparisons."
    },
    {
      "name": "Course scheduling",
      "description": "Return order or boolean feasibility."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <queue>
using namespace std;

class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> indeg(numCourses, 0);
        for (auto& p : prerequisites) {
            adj[p[1]].push_back(p[0]);
            ++indeg[p[0]];
        }
        queue<int> q;
        for (int i = 0; i < numCourses; ++i) if (!indeg[i]) q.push(i);
        int seen = 0;
        while (!q.empty()) {
            int u = q.front(); q.pop(); ++seen;
            for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
        }
        return seen == numCourses;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Return topological order (Kahn)",
    language: "cpp",
    code: `#include <vector>
#include <queue>
using namespace std;

class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> indeg(numCourses, 0);
        for (auto& p : prerequisites) { adj[p[1]].push_back(p[0]); ++indeg[p[0]]; }
        queue<int> q;
        for (int i = 0; i < numCourses; ++i) if (!indeg[i]) q.push(i);
        vector<int> order;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            order.push_back(u);
            for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
        }
        if ((int)order.size() != numCourses) return {};
        return order;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "topo-sort",
  walkthrough: "If fewer than n courses processed, cycle exists. For alien dictionary, compare first differing char between adjacent words to add edge; check prefix-invalid case.",
  steps: [
    "Build adjacency and indegree arrays.",
    "Enqueue all indegree 0 nodes.",
    "Pop, append, relax neighbors decrementing indegree.",
    "Compare processed count to n.",
    "Alternatively implement DFS cycle colors.",
    "For order output, return queue sequence.",
    "Complexity O(V+E)."
  ],
  problems: [
    {
      "title": "Course Schedule",
      "slug": "course-schedule",
      "difficulty": "medium",
      "note": "Cycle detection."
    },
    {
      "title": "Course Schedule II",
      "slug": "course-schedule-ii",
      "difficulty": "medium",
      "note": "Return order."
    },
    {
      "title": "Alien Dictionary",
      "slug": "alien-dictionary",
      "difficulty": "hard",
      "note": "Build graph from words."
    },
    {
      "title": "Sequence Reconstruction",
      "slug": "sequence-reconstruction",
      "difficulty": "medium",
      "note": "Unique topo check."
    },
    {
      "title": "Minimum Height Trees",
      "slug": "minimum-height-trees",
      "difficulty": "medium",
      "note": "Tree center pruning."
    },
    {
      "title": "Longest Increasing Path in a Matrix",
      "slug": "longest-increasing-path-in-a-matrix",
      "difficulty": "hard",
      "note": "DAG DP on grid."
    },
    {
      "title": "Parallel Courses",
      "slug": "parallel-courses",
      "difficulty": "hard",
      "note": "Layers with indegree."
    },
    {
      "title": "Sort Items by Groups Respecting Dependencies",
      "slug": "sort-items-by-groups-respecting-dependencies",
      "difficulty": "hard",
      "note": "Group topo + item topo."
    }
  ],
  pitfalls: "Confusing course a->b direction in prerequisites. Not detecting invalid prefix in alien dictionary. Off-by-one on numCourses sizing.",
  interviewTips: "Draw small DAG with indegrees. Mention both Kahn and DFS approaches.",
  complexity: [
    {
      "operation": "Kahn topo",
      "time": "O(V+E)",
      "space": "O(V)"
    },
    {
      "operation": "DFS topo",
      "time": "O(V+E)",
      "space": "O(V)"
    }
  ],
});
