import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("trees-dfs-bfs")!;

export const article = buildPatternArticle({
  meta,
  summary: "Traverse hierarchical nodes with DFS (recursive/iterative stack) or BFS (queue) to aggregate, compare, or search trees.",
  intuition: "Use **tree DFS/BFS** when input is a rooted tree/graph-like hierarchy without cycles. DFS excels at path sums and structural recursion; BFS levels and shortest steps in unweighted trees.\n\nDFS passes state down (path sum, depth, parent constraint) and combines child results. BFS processes layer by layer with a queue storing `(node, depth)`. Always handle null children and define base case before recursion.",
  deepDive: "Preorder/inorder/postorder, level-order BFS, diameter/height DP on nodes, path sum any-start, serialize/deserialize, and iterative DFS with explicit stack.\n\nTree traversals are staple warm-ups; expect clear recursion base cases and O(n) node visits.",
  signals: [
    "Binary or N-ary TreeNode structure",
    "Path sum / root-to-leaf constraints",
    "Level order output or zigzag levels",
    "Subtree problems (same tree, invert)",
    "Diameter, height, balance checks",
    "Construct tree from traversals",
    "BFS shortest depth in perfect tree",
    "Need global answer from subtrees"
  ],
  subpatterns: [
    {
      "name": "DFS with return value",
      "description": "Each call returns height/result aggregated from children."
    },
    {
      "name": "DFS with side effect",
      "description": "Mutate external answer for paths passing through node."
    },
    {
      "name": "Level-order BFS",
      "description": "Queue processes all nodes at current depth before next."
    },
    {
      "name": "Two-tree DFS",
      "description": "Parallel recursion on p and q for symmetry/substructure."
    },
    {
      "name": "Path tracking",
      "description": "Push/pop current path in backtracking style for all paths."
    },
    {
      "name": "Iterative stack DFS",
      "description": "Simulate recursion for deep trees or follow-up constraints."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <queue>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> res;
        if (!root) return res;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int sz = (int)q.size();
            vector<int> level;
            for (int i = 0; i < sz; ++i) {
                TreeNode* node = q.front(); q.pop();
                level.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            res.push_back(level);
        }
        return res;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "DFS max depth",
    language: "cpp",
    code: `using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "tree-traversals",
  walkthrough: "For subtree aggregation, postorder ensures children computed before parent. For path sum III style, prefix-sum hashing on DFS path may apply. BFS uses queue size snapshot per level.",
  steps: [
    "Confirm null-safe signature and return type.",
    "Choose DFS vs BFS based on path vs level need.",
    "Define recursive function parameters (node, state).",
    "Write base case for null.",
    "Combine child results or enqueue children.",
    "For global metrics, consider passing references.",
    "Complexity O(n) nodes, O(h) recursion stack."
  ],
  problems: [
    {
      "title": "Invert Binary Tree",
      "slug": "invert-binary-tree",
      "difficulty": "easy",
      "note": "Swap children DFS."
    },
    {
      "title": "Maximum Depth of Binary Tree",
      "slug": "maximum-depth-of-binary-tree",
      "difficulty": "easy",
      "note": "DFS depth."
    },
    {
      "title": "Binary Tree Level Order Traversal",
      "slug": "binary-tree-level-order-traversal",
      "difficulty": "medium",
      "note": "BFS levels."
    },
    {
      "title": "Diameter of Binary Tree",
      "slug": "diameter-of-binary-tree",
      "difficulty": "easy",
      "note": "Height DP."
    },
    {
      "title": "Subtree of Another Tree",
      "slug": "subtree-of-another-tree",
      "difficulty": "easy",
      "note": "Parallel DFS."
    },
    {
      "title": "Path Sum",
      "slug": "path-sum",
      "difficulty": "easy",
      "note": "Root-to-leaf DFS."
    },
    {
      "title": "Serialize and Deserialize Binary Tree",
      "slug": "serialize-and-deserialize-binary-tree",
      "difficulty": "hard",
      "note": "BFS/DFS encoding."
    },
    {
      "title": "Binary Tree Maximum Path Sum",
      "slug": "binary-tree-maximum-path-sum",
      "difficulty": "hard",
      "note": "Gain through node."
    }
  ],
  pitfalls: "Forgetting null checks. Confusing global diameter with single path through root. Stack overflow on skewed trees - mention iterative DFS.",
  interviewTips: "State traversal order aloud. Mention O(h) stack depth and when BFS uses O(width) memory.",
  complexity: [
    {
      "operation": "Visit all nodes",
      "time": "O(n)",
      "space": "O(h) DFS"
    },
    {
      "operation": "BFS levels",
      "time": "O(n)",
      "space": "O(w) width"
    },
    {
      "operation": "Path sum DFS",
      "time": "O(n)",
      "space": "O(h)"
    }
  ],
});
