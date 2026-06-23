import { buildPatternArticle } from "../content-builder";
import { getPatternNoteMeta } from "../catalog";

const meta = getPatternNoteMeta("heap")!;

export const article = buildPatternArticle({
  meta,
  summary: "Priority queues extract min/max repeatedly for top-K, streaming medians, merge K sorted lists, and scheduling.",
  intuition: "Use a **heap** when you need repeated access to current smallest/largest among a dynamic set. `priority_queue` in C++ is max-heap by default - invert comparator for min-heap.\n\nHeaps maintain partial order in O(log n) push/pop. For top-K, keep size K and evict extremum. For merge K lists, seed heap with heads; pop pushes next from that list.",
  deepDive: "Top K frequent/closest, merge k sorted, two-heap median finder, Dijkstra frontier (with shortest-path note), meeting rooms min-heap of end times.\n\nTop K and merge K lists are frequent medium questions; state O(n log k) vs sorting O(n log n).",
  signals: [
    "Top K largest/smallest/frequent",
    "K-way merge of sorted sequences",
    "Streaming median or sliding median",
    "Schedule tasks by next available time",
    "Closest points to origin",
    "Continuously pick min cost frontier",
    "Need O(log n) insertions with extremum queries",
    "Transform max-heap via custom comparator"
  ],
  subpatterns: [
    {
      "name": "Top-K heap",
      "description": "Maintain size k; compare with root before push/pop."
    },
    {
      "name": "Min-heap scheduling",
      "description": "Track earliest finishing machine/room end time."
    },
    {
      "name": "Two heaps median",
      "description": "Max-heap low half + min-heap high half balanced."
    },
    {
      "name": "K-merge",
      "description": "Heap of (value, list id, node ptr)."
    },
    {
      "name": "Bucket + heap",
      "description": "Frequency buckets then heap on counts."
    },
    {
      "name": "Lazy deletion",
      "description": "Mark stale entries; pop until valid top."
    }
  ],
  templateCode: {
    language: "cpp",
    code: `#include <vector>
#include <queue>
#include <unordered_map>
#include <functional>
#include <queue>
#include <functional>
using namespace std;

class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> freq;
        for (int x : nums) ++freq[x];
        auto cmp = [&](int a, int b) { return freq[a] > freq[b]; };
        priority_queue<int, vector<int>, decltype(cmp)> pq(cmp);
        for (auto& [x, c] : freq) {
            pq.push(x);
            if ((int)pq.size() > k) pq.pop();
        }
        vector<int> res;
        while (!pq.empty()) { res.push_back(pq.top()); pq.pop(); }
        return res;
    }
};`,
    caption: "Primary template  -  adapt identifiers and conditions to the problem.",
  },
  variantCode: {
    title: "Merge k sorted linked lists (heap seed)",
    language: "cpp",
    code: `#include <vector>
#include <queue>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
        for (auto* h : lists) if (h) pq.push(h);
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (!pq.empty()) {
            ListNode* node = pq.top(); pq.pop();
            tail->next = node; tail = node;
            if (node->next) pq.push(node->next);
        }
        return dummy.next;
    }
};`,
    caption: "Common variant  -  use when the prompt matches this shape.",
  },
  viz: "heap-top-k",
  walkthrough: "For top-K frequent, count first O(n), heap size k O(n log k). Alternatively bucket sort when frequencies bounded.",
  steps: [
    "Decide min-heap vs max-heap comparator.",
    "Define heap element type (value, pair, pointer).",
    "Seed heap with initial candidates.",
    "Pop best, record answer, push successors.",
    "Keep size bounded to k when appropriate.",
    "Discuss alternatives: sort, quickselect.",
    "State complexities with k and n."
  ],
  problems: [
    {
      "title": "Kth Largest Element in an Array",
      "slug": "kth-largest-element-in-an-array",
      "difficulty": "medium",
      "note": "Min-heap size k."
    },
    {
      "title": "Top K Frequent Elements",
      "slug": "top-k-frequent-elements",
      "difficulty": "medium",
      "note": "Freq map + heap."
    },
    {
      "title": "Merge k Sorted Lists",
      "slug": "merge-k-sorted-lists",
      "difficulty": "hard",
      "note": "Heap of heads."
    },
    {
      "title": "Find Median from Data Stream",
      "slug": "find-median-from-data-stream",
      "difficulty": "hard",
      "note": "Two heaps."
    },
    {
      "title": "K Closest Points to Origin",
      "slug": "k-closest-points-to-origin",
      "difficulty": "medium",
      "note": "Max-heap size k."
    },
    {
      "title": "Task Scheduler",
      "slug": "task-scheduler",
      "difficulty": "medium",
      "note": "Heap/greedy scheduling."
    },
    {
      "title": "Smallest Range Covering Elements from K Lists",
      "slug": "smallest-range-covering-elements-from-k-lists",
      "difficulty": "hard",
      "note": "Heap range."
    },
    {
      "title": "Last Stone Weight",
      "slug": "last-stone-weight",
      "difficulty": "easy",
      "note": "Max-heap simulation."
    }
  ],
  pitfalls: "Forgetting `#include <unordered_map>` in top-K code. Using wrong comparator polarity. Pushing entire array into heap when quickselect suffices.",
  interviewTips: "Say whether you need min-heap or max-heap of size K. Compare O(n log k) heap vs O(n) quickselect average.",
  complexity: [
    {
      "operation": "Heap push/pop",
      "time": "O(log n)",
      "space": "O(n)"
    },
    {
      "operation": "Top-K with heap",
      "time": "O(n log k)",
      "space": "O(k)"
    },
    {
      "operation": "Merge k lists",
      "time": "O(N log k)",
      "space": "O(k)"
    }
  ],
});
