import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("stack")!;

export const article = buildPatternArticle({
  meta,
  summary: "LIFO stacks model nesting, matching pairs, and deferred processing - especially for parentheses, monotonic next-greater, and expression evaluation.",
  intuition: "Reach for a **stack** when you need to match closing symbols, process elements in reverse arrival order, or maintain candidates with a monotonic property (increasing/decreasing heights).\n\nPush when you cannot yet resolve an element; pop when the top is the answer partner for the current item. Monotonic stacks keep indices or values sorted so each element pushes/pops once.",
  deepDive: "Parentheses validation, evaluate RPN, min stack, monotonic stack for next greater element, and stack-based DFS simulation.\n\nParentheses and daily temperatures variants appear often; explain O(n) amortized pushes/pops.",
  signals: [
    "Nested or matched parentheses/brackets",
    "Next greater/smaller element to the right/left",
    "Evaluate postfix or parse expressions",
    "Histogram/rectangle area needs increasing stack",
    "DFS iterative with explicit stack",
    "Undo/reverse operations on recent items",
    "Monotonic decreasing stack for span problems",
    "String reduction by adjacent pairs"
  ],
  subpatterns: [
    {
      "name": "Matching pairs",
      "description": "Push opens; on close verify top matches and pop."
    },
    {
      "name": "Monotonic stack",
      "description": "Maintain decreasing/increasing sequence of indices for NGE/NSE."
    },
    {
      "name": "RPN evaluation",
      "description": "Push numbers; on operator pop two, compute, push result."
    },
    {
      "name": "Min/max stack",
      "description": "Auxiliary stack tracking current extremum in O(1)."
    },
    {
      "name": "String builder stack",
      "description": "Simulate removals or directory paths (simplify path)."
    },
    {
      "name": "Two-stack queue",
      "description": "Amortized O(1) queue using in/out stacks."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <stack>
using namespace std;

class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = (int)temperatures.size();
        vector<int> ans(n, 0);
        stack<int> st; // indices
        for (int i = 0; i < n; ++i) {
            while (!st.empty() && temperatures[i] > temperatures[st.top()]) {
                int j = st.top(); st.pop();
                ans[j] = i - j;
            }
            st.push(i);
        }
        return ans;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Valid parentheses",
    language: "cpp",
    code: `#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '[' || c == '{') st.push(c);
            else {
                if (st.empty()) return false;
                char o = st.top(); st.pop();
                if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{'))
                    return false;
            }
        }
        return st.empty();
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "stack-monotonic",
  walkthrough: "Monotonic decreasing stack: when current is warmer than stack top, pop and assign distance. Unresolved indices remain on stack. Each index pushed once popped once.",
  steps: [
    "Identify what each stack entry represents (index vs value).",
    "Define when to push current element.",
    "While stack violates monotonic rule, pop and resolve answers.",
    "Push current after draining.",
    "Handle leftovers on stack (often zero or sentinel).",
    "Walk through small temperature or parentheses example.",
    "State O(n) time amortized."
  ],
  problems: [
    {
      "title": "Valid Parentheses",
      "slug": "valid-parentheses",
      "difficulty": "easy",
      "note": "Matching stack."
    },
    {
      "title": "Min Stack",
      "slug": "min-stack",
      "difficulty": "medium",
      "note": "Auxiliary min tracking."
    },
    {
      "title": "Evaluate Reverse Polish Notation",
      "slug": "evaluate-reverse-polish-notation",
      "difficulty": "medium",
      "note": "Operand stack."
    },
    {
      "title": "Daily Temperatures",
      "slug": "daily-temperatures",
      "difficulty": "medium",
      "note": "Monotonic stack."
    },
    {
      "title": "Largest Rectangle in Histogram",
      "slug": "largest-rectangle-in-histogram",
      "difficulty": "hard",
      "note": "Increasing stack sentinel."
    },
    {
      "title": "Car Fleet",
      "slug": "car-fleet",
      "difficulty": "medium",
      "note": "Stack of times."
    },
    {
      "title": "Decode String",
      "slug": "decode-string",
      "difficulty": "medium",
      "note": "Nested stack frames."
    },
    {
      "title": "Asteroid Collision",
      "slug": "asteroid-collision",
      "difficulty": "medium",
      "note": "Stack simulation."
    }
  ],
  pitfalls: "Storing values instead of indices when distance needed. Forgetting sentinel for histogram. Off-by-one on span calculations.",
  interviewTips: "Draw stack contents after each i. Mention amortized O(n) because each element pushes/pops once.",
  complexity: [
    {
      "operation": "Monotonic stack pass",
      "time": "O(n)",
      "space": "O(n)"
    },
    {
      "operation": "Parentheses scan",
      "time": "O(n)",
      "space": "O(n)"
    },
    {
      "operation": "RPN eval",
      "time": "O(n)",
      "space": "O(n)"
    }
  ],
});
