import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("bst")!;

export const article = buildPatternArticle({
  meta,
  summary: "Exploit BST ordering: left < root < right for O(h) search, inorder sorted sequence, and validated range checks.",
  intuition: "Use **BST** patterns when tree is ordered so inorder is sorted and pruning is possible. Many problems reduce to maintaining valid (min,max) range per node or kth element via inorder counting.\n\nBST property is local but propagates globally via bounds. Inorder traversal visits keys in sorted order - use iterative stack for kth smallest. Insert/search follow greedy left/right decisions.",
  deepDive: "Validate BST with bounds, kth smallest inorder, LCA in BST, convert sorted array to balanced BST, trim BST to range.\n\nBST validation with INT_MIN/MAX pitfalls is a common trick question - use long bounds or null-open intervals.",
  signals: [
    "Binary search tree wording or sorted inorder",
    "Search/insert/delete in ordered tree",
    "Kth smallest/largest in BST",
    "Lowest common ancestor in BST",
    "Range queries or trim to [low,high]",
    "Construct balanced BST from sorted array",
    "Need O(h) not O(n) when balanced",
    "Compare keys with pruning left/right"
  ],
  subpatterns: [
    {
      "name": "Range validation",
      "description": "Pass (lo, hi) open bounds; node must lie strictly inside."
    },
    {
      "name": "Inorder kth",
      "description": "Iterative inorder counting until kth element."
    },
    {
      "name": "Greedy search",
      "description": "Compare target with root to go left or right."
    },
    {
      "name": "LCA exploit ordering",
      "description": "Descend where p and q diverge."
    },
    {
      "name": "Balanced construction",
      "description": "Recursively pick mid of sorted segment as root."
    },
    {
      "name": "Successor/predecessor",
      "description": "Inorder next for delete-with-replacement."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <utility>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    TreeNode* searchBST(TreeNode* root, int val) {
        while (root) {
            if (val < root->val) root = root->left;
            else if (val > root->val) root = root->right;
            else return root;
        }
        return nullptr;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Validate BST with bounds",
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
    bool isValidBST(TreeNode* root, long lo = LONG_MIN, long hi = LONG_MAX) {
        if (!root) return true;
        if (root->val <= lo || root->val >= hi) return false;
        return isValidBST(root->left, lo, root->val) &&
               isValidBST(root->right, root->val, hi);
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "tree-traversals",
  walkthrough: "Validation must use strict inequalities with evolving bounds - duplicate values break BST. For kth smallest, inorder walk; stop early at k.",
  steps: [
    "Confirm BST property definition (strict left/right).",
    "Pick search, inorder, or range validation approach.",
    "Use long long bounds to avoid INT edge bugs.",
    "Implement iterative inorder if stack depth matters.",
    "For LCA, walk while both targets on same side.",
    "Test skewed tree and duplicate-adjacent values.",
    "Complexity O(h) average balanced, O(n) worst skew."
  ],
  problems: [
    {
      "title": "Validate Binary Search Tree",
      "slug": "validate-binary-search-tree",
      "difficulty": "medium",
      "note": "Range DFS."
    },
    {
      "title": "Kth Smallest Element in a BST",
      "slug": "kth-smallest-element-in-a-bst",
      "difficulty": "medium",
      "note": "Inorder k."
    },
    {
      "title": "Search in a Binary Search Tree",
      "slug": "search-in-a-binary-search-tree",
      "difficulty": "easy",
      "note": "Greedy walk."
    },
    {
      "title": "Lowest Common Ancestor of a BST",
      "slug": "lowest-common-ancestor-of-a-binary-search-tree",
      "difficulty": "medium",
      "note": "Ordering LCA."
    },
    {
      "title": "Insert into a Binary Search Tree",
      "slug": "insert-into-a-binary-search-tree",
      "difficulty": "medium",
      "note": "Descend and attach."
    },
    {
      "title": "Convert Sorted Array to Binary Search Tree",
      "slug": "convert-sorted-array-to-binary-search-tree",
      "difficulty": "easy",
      "note": "Mid split recurse."
    },
    {
      "title": "Trim a Binary Search Tree",
      "slug": "trim-a-binary-search-tree",
      "difficulty": "medium",
      "note": "Recurse with range."
    },
    {
      "title": "Delete Node in a BST",
      "slug": "delete-node-in-a-bst",
      "difficulty": "medium",
      "note": "Successor replace."
    }
  ],
  pitfalls: "Using INT_MIN/MAX as sentinels when node values include them. Allowing equal values on both sides. O(n) validation when only checking local parent-child.",
  interviewTips: "Explain strict bounds vs checking parent only. Mention inorder sorted property for kth problems.",
  complexity: [
    {
      "operation": "BST search/insert",
      "time": "O(h)",
      "space": "O(1)"
    },
    {
      "operation": "Inorder kth",
      "time": "O(h + k)",
      "space": "O(h)"
    },
    {
      "operation": "Validate all nodes",
      "time": "O(n)",
      "space": "O(h)"
    }
  ],
});
