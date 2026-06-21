import type { PrepQuizQuestion } from "./types";

function q(
  question: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string
): PrepQuizQuestion {
  return { question, options, correctIndex, explanation };
}

export const PATTERN_QUIZ_BANK: Record<string, PrepQuizQuestion[]> = {
  "Arrays & Hashing": [
    q(
      "Which problem signal most strongly suggests using a hash map over sorting?",
      [
        "You need O(1) average-time lookups or frequency counts while scanning once",
        "The input is already sorted and you need pair sums",
        "You must find the k-th smallest element in a stream",
        "The answer depends only on contiguous subarray sums",
      ],
      0,
      "Hash maps trade O(n) extra space for O(1) average lookups, making them ideal for complement searches, deduplication, and frequency tracking in a single pass. Sorting helps with ordering constraints but costs O(n log n) and does not give constant-time membership checks."
    ),
    q(
      "What is the typical time/space tradeoff for a single-pass array + hash map solution?",
      [
        "O(n) time, O(n) space",
        "O(n log n) time, O(1) space",
        "O(n²) time, O(n) space",
        "O(n) time, O(1) space always",
      ],
      0,
      "One pass over n elements with hash map insert/lookup at O(1) average yields O(n) time. Storing seen values or counts usually requires O(n) space in the worst case. O(1) space is only possible when the problem allows in-place mutation or bounded key space."
    ),
    q(
      "When is prefix-sum + hash map preferable to brute-force nested loops on an array?",
      [
        "When you need subarray sums equal to a target and can store running totals",
        "When you need the longest palindrome in a string",
        "When elements must be processed in strictly decreasing order",
        "When the array is a rotation of a sorted array",
      ],
      0,
      "Prefix sums convert range-sum queries to differences of cumulative totals. Combining with a hash map lets you find subarrays with a target sum in O(n) instead of O(n²) by checking whether (currentPrefix - target) was seen before."
    ),
    q(
      "What is a common pitfall when using a hash map for grouping or anagram problems?",
      [
        "Using a non-canonical key (e.g., unsorted string) so equivalent groups split apart",
        "Forgetting that hash map iteration order is sorted",
        "Assuming hash maps always use O(1) worst-case time per operation",
        "Using a hash map when the input size is below 10",
      ],
      0,
      "For grouping anagrams or equivalent objects, the key must be invariant under the equivalence relation—typically a sorted string or a frequency tuple. Using the raw string as key creates duplicate groups for the same logical bucket."
    ),
    q(
      "An unsorted array asks whether any value appears more than once. Why is a hash set often better than sorting here?",
      [
        "Early exit on first duplicate with O(n) average time vs O(n log n) sort",
        "Sorting guarantees O(1) space while sets do not",
        "Sets preserve original element order for the answer",
        "Sorting is impossible on integer arrays",
      ],
      0,
      "A hash set detects duplicates in one pass: insert each element and return true on collision. Sorting works but costs O(n log n) and scans adjacent pairs. The set approach can short-circuit as soon as a duplicate is found."
    ),
  ],

  "Two Pointers": [
    q(
      "Which scenario is the clearest signal for the two-pointer technique?",
      [
        "Sorted (or monotonic) sequence where moving inward/outward prunes the search space",
        "Counting frequencies of characters in a sliding window",
        "Finding shortest path in a weighted graph",
        "Computing overlapping subproblems on a sequence",
      ],
      0,
      "Two pointers exploit order: on sorted arrays, increasing the left or decreasing the right pointer monotonically eliminates candidates. Without sortability or a two-ended traversal structure, pointers rarely beat brute force."
    ),
    q(
      "What is the typical complexity of a well-designed two-pointer solution on n elements?",
      [
        "O(n) time after any required O(n log n) sort, O(1) extra space",
        "O(n²) time, O(n) space",
        "O(log n) time, O(1) space",
        "O(n log n) time even when input is already sorted",
      ],
      0,
      "Each pointer moves at most n steps, so the scan is O(n). If sorting is needed first, total time is O(n log n). Extra space is usually O(1) aside from output, since pointers index in-place."
    ),
    q(
      "Fast/slow pointers on a linked list primarily help with:",
      [
        "Cycle detection and finding midpoints without knowing length upfront",
        "Sorting the list in O(n log n) time",
        "Merging k sorted lists efficiently",
        "Reversing every other node in one pass",
      ],
      0,
      "Floyd's cycle detection and the midpoint trick rely on different speeds: if a cycle exists, fast eventually meets slow; if not, fast reaches the end when slow is at mid. This avoids storing visited nodes."
    ),
    q(
      "A common mistake with opposite-end two pointers on a sorted array is:",
      [
        "Not skipping duplicate values when collecting unique triplets or pairs",
        "Always moving both pointers after every comparison",
        "Using two pointers only on unsorted data",
        "Assuming two pointers require O(n) extra space",
      ],
      0,
      "For problems like 3Sum, after finding a valid triplet you must advance past duplicate values on both sides; otherwise you emit duplicate answers. Pointer movement rules depend on the comparison, not a fixed pattern."
    ),
    q(
      "When does the 'collision' two-pointer pattern (both start at 0) apply?",
      [
        "Merging two sorted arrays/lists or partitioning by a condition in one pass",
        "Finding the median of two sorted arrays",
        "Detecting cycles in a directed graph",
        "Computing maximum subarray sum",
      ],
      0,
      "Same-direction pointers shine when building output from two sorted sources or when one pointer leads and another trails (e.g., removing duplicates in-place). Both indices advance according to merge or write rules."
    ),
  ],

  "Sliding Window": [
    q(
      "Which problem description best matches a fixed-size sliding window?",
      [
        "Find the maximum/minimum among every contiguous subarray of length k",
        "Find the longest substring with at most k distinct characters",
        "Determine if a graph has a cycle",
        "Count paths in a grid with obstacles",
      ],
      0,
      "Fixed windows have constant width k: each step adds one element and removes the one leaving the window. Variable windows resize based on validity constraints (duplicates, character counts, sum thresholds)."
    ),
    q(
      "What is the hallmark of a variable sliding window problem?",
      [
        "Expand right while valid, shrink left when invalid, tracking the best window",
        "Always move both pointers one step regardless of state",
        "Require sorted input before scanning",
        "Use BFS to explore window boundaries",
      ],
      0,
      "Variable windows maintain an invariant (e.g., at most k distinct chars, sum ≤ target). Expand to explore, contract to restore validity, and record the optimal window size or content during valid states."
    ),
    q(
      "Typical time complexity for a sliding window over a string of length n?",
      [
        "O(n) — each character enters and leaves the window at most once",
        "O(n²) — every window start pairs with every end",
        "O(n log n) — window boundaries require sorting",
        "O(k) where k is window size only",
      ],
      0,
      "With proper expand/shrink logic, left and right pointers each advance at most n times, giving linear total work. The pitfall is re-scanning inside the loop, which degrades to O(n²)."
    ),
    q(
      "A frequent sliding-window pitfall with character frequency maps is:",
      [
        "Forgetting to decrement counts when shrinking, leaving stale 'valid' windows",
        "Using a window on unsorted arrays without hashing",
        "Assuming window size must always equal n/2",
        "Not sorting the alphabet before scanning",
      ],
      0,
      "When the left pointer moves, remove its character from the frequency map and update the validity predicate. Stale counts make the window appear valid when it is not, producing wrong answers."
    ),
    q(
      "Sliding window is usually NOT the right first choice when:",
      [
        "The objective depends on non-contiguous elements or global reordering",
        "You need the longest contiguous subarray with sum ≤ k on positives",
        "You track at most k distinct values in a substring",
        "You need minimum window covering all required characters",
      ],
      0,
      "Sliding windows optimize contiguous segments. Problems about subsets, permutations, or arbitrary picks from the array usually need hashing, DP, or combinatorics—not a contiguous window."
    ),
  ],

  "Binary Search": [
    q(
      "Beyond sorted arrays, binary search applies when:",
      [
        "There is a monotonic predicate over an answer space (first true / last false)",
        "The input is a linked list",
        "You need all permutations of a set",
        "Edge weights can be negative",
      ],
      0,
      "Binary search on the answer (parametric search) works when feasibility is monotonic: if x works, all larger (or smaller) x also work. You bisect the range of possible answers, not just indices."
    ),
    q(
      "What is the standard time complexity of binary search on n elements or a range [lo, hi]?",
      [
        "O(log n) or O(log(hi − lo)) predicate evaluations",
        "O(n) with early termination",
        "O(n log n) due to sorting",
        "O(1) with memoization",
      ],
      0,
      "Each halving eliminates half the search space. The dominant cost is often O(log n) calls to an O(1) or O(n) feasibility check—clarify total complexity as O(log n × cost of check)."
    ),
    q(
      "Which bug is most common in binary search implementations?",
      [
        "Infinite loops from incorrect mid calculation or not moving lo/hi past mid",
        "Using binary search only on even-length arrays",
        "Forgetting that binary search requires O(n) space",
        "Sorting the array before every query",
      ],
      0,
      "Off-by-one errors and mid = (lo + hi) / 2 overflow (use lo + (hi - lo) / 2) cause stuck loops or skipped elements. Always define whether you seek lower bound, upper bound, or exact match."
    ),
    q(
      "Binary search on a rotated sorted array works because:",
      [
        "At least one half is always sorted, letting you discard half each step",
        "Rotation preserves O(1) lookup like a hash map",
        "You must sort the array first in O(n log n)",
        "Two pointers replace binary search entirely",
      ],
      0,
      "Even after rotation, comparing nums[mid] with nums[lo] or nums[hi] identifies which side is sorted and whether the target lies there. This preserves O(log n) search without full resorting."
    ),
    q(
      "When should you prefer binary search over a hash map?",
      [
        "When the structure is sorted or the answer space is monotonic and you need O(log n) space",
        "When you need O(1) average lookups on arbitrary keys",
        "When counting frequencies of unsorted elements",
        "When building a trie over strings",
      ],
      0,
      "Hash maps excel at arbitrary key lookup. Binary search suits ordered data or answer-space search with logarithmic memory. Choosing wrong tool wastes space (hash) or misses monotonic structure (linear scan)."
    ),
  ],

  "Trees DFS/BFS": [
    q(
      "When is BFS typically preferred over DFS on trees?",
      [
        "Level-order processing, shortest path in unweighted trees, or minimum depth",
        "Deep recursion without stack limits",
        "Finding a path from root to leaf with maximum sum",
        "In-place Morris traversal",
      ],
      0,
      "BFS explores layer by layer, naturally yielding level order and shortest distance in unweighted settings. DFS is simpler for path aggregation and uses less memory on skinny trees."
    ),
    q(
      "What space complexity should you quote for iterative BFS on a balanced tree with n nodes?",
      [
        "O(w) where w is maximum width (up to O(n) for a full last level)",
        "O(1) always",
        "O(log n) always",
        "O(n²) due to queue operations",
      ],
      0,
      "The queue holds at most one frontier level. For a complete tree, the last level has about n/2 nodes—worst-case O(n) space. Skewed trees may use O(1) width but O(n) depth for DFS recursion."
    ),
    q(
      "A problem asks for the diameter or max path sum in a binary tree. Why is post-order DFS natural?",
      [
        "You need aggregated info from subtrees before combining at the parent",
        "BFS always finds maximum paths faster",
        "The tree must be sorted level by level",
        "You only need the root-to-leaf path",
      ],
      0,
      "Post-order (children before parent) lets you return subtree heights or best gains upward while updating a global answer from left-right combinations through the current node."
    ),
    q(
      "BST problems often use DFS with a range (min, max) because:",
      [
        "Each node must fall within bounds inherited from ancestors to validate BST property",
        "BFS cannot traverse binary trees",
        "BST in-order is always BFS order",
        "Range tracking requires O(n²) time",
      ],
      0,
      "Passing valid (low, high) intervals down the tree detects violations in O(n). In-order traversal also works for kth smallest because BST order is sorted along the in-order walk."
    ),
    q(
      "Common tree DFS pitfall in interviews:",
      [
        "Not handling null children or confusing single-node vs empty tree base cases",
        "Using DFS only on binary trees with more than two children",
        "Assuming trees cannot be traversed iteratively",
        "Forgetting that tree nodes always store parent pointers",
      ],
      0,
      "Explicit null checks and clear return values for base cases prevent NPE-style errors. Clarify whether the tree is binary, whether values can duplicate (BST definition), and if mutation is allowed."
    ),
  ],

  "Graphs BFS/DFS": [
    q(
      "Which problem cue points to graph BFS/DFS rather than a tree template?",
      [
        "Implicit grid/graph connectivity, cycles, or multi-source reachability",
        "Strict parent-child hierarchy with no back edges",
        "Finding kth element in a BST",
        "Computing prefix sums on a 1D array",
      ],
      0,
      "Grids become graphs via adjacency; multiple components, cycles, and visit tracking signal general graph traversal. Trees are special cases without cycle handling."
    ),
    q(
      "Time complexity for BFS/DFS on a graph with V vertices and E edges?",
      [
        "O(V + E) when adjacency lists are used and each vertex/edge is processed once",
        "O(V × E) always",
        "O(V log V) due to sorting",
        "O(E²) for sparse graphs",
      ],
      0,
      "With adjacency lists, visiting each vertex once and scanning its edges once gives O(V + E). Adjacency matrices look like O(V²) unless sparsity is exploited."
    ),
    q(
      "Why use multi-source BFS instead of repeated single-source BFS?",
      [
        "All sources expand simultaneously, giving nearest-source distances in one O(V + E) pass",
        "It reduces space to O(1)",
        "DFS cannot start from multiple nodes",
        "Only works on directed acyclic graphs",
      ],
      0,
      "Initializing the queue with all sources (e.g., all rotten oranges) computes minimum steps to each cell in one traversal—cleaner and same asymptotic cost as serial BFS from each source."
    ),
    q(
      "DFS on graphs requires careful visit tracking because:",
      [
        "Revisiting nodes in cyclic graphs causes infinite loops",
        "DFS cannot detect connected components",
        "BFS is always faster on cyclic graphs",
        "Undirected graphs have no edges",
      ],
      0,
      "Unlike trees, graphs may have cycles. Mark nodes visited when enqueued (BFS) or entered (DFS) to avoid exponential re-exploration. For undirected edges, treat adjacency bidirectionally."
    ),
    q(
      "Grid DFS/BFS pitfall:",
      [
        "Mutating the grid for visited marks without clarifying whether input can be destroyed",
        "Using directions arrays for 4-neighbor movement",
        "Counting islands only on land cells",
        "Checking bounds before accessing neighbors",
      ],
      0,
      "Flipping '0'/'1' or marking visited in-place is valid if allowed; otherwise use a separate visited structure. Always state assumptions about modifying input during interviews."
    ),
  ],

  "DP Basics": [
    q(
      "Which clue most strongly suggests basic 1D/2D dynamic programming?",
      [
        "Optimal substructure and overlapping subproblems on sequences or grids",
        "Need only the first duplicate in an array",
        "Input is sorted and you need two-sum",
        "Single BFS from source suffices",
      ],
      0,
      "DP applies when optimal solutions compose from smaller subproblems reused many times (e.g., paths, knapsack-style choices, decode counts). If a greedy local choice is provably optimal, DP may be overkill."
    ),
    q(
      "Typical space optimization for 1D DP when only the previous row/state matters?",
      [
        "Reduce O(n) table to O(1) or O(k) rolling variables",
        "Always keep full O(n²) table for clarity",
        "Switch to recursion without memoization",
        "Use BFS instead of DP",
      ],
      0,
      "Many linear DPs (fib-style, house robber, min cost stairs) need only the last one or two states. Rolling arrays cut memory from O(n) to O(1) without changing O(n) time."
    ),
    q(
      "Bottom-up vs top-down DP—key tradeoff:",
      [
        "Top-down computes only needed subproblems; bottom-up fills table systematically, often better cache locality",
        "Top-down always faster and uses less memory",
        "Bottom-up cannot handle 2D state",
        "Only top-down works for string DP",
      ],
      0,
      "Memoized DFS explores the implicit DAG of states on demand. Iterative DP guarantees no recursion depth issues and can be easier to space-optimize. Both are O(states × transitions) when done correctly."
    ),
    q(
      "Common DP pitfall on coin change / unbounded knapsack style problems:",
      [
        "Wrong loop order causing permutations vs combinations to be counted incorrectly",
        "Using DP when input size is 1",
        "Forgetting that DP requires exponential time always",
        "Not sorting coins before DP",
      ],
      0,
      "Iterating coins outermost vs amounts outermost changes whether order of coins matters. Define the state (min coins, number of ways) and transition direction to match the problem's counting rules."
    ),
    q(
      "Word break / decode ways pattern recognition:",
      [
        "Boolean or count DP over prefix length: dp[i] depends on earlier reachable indices",
        "Sliding window on characters only",
        "Union-find over characters",
        "Monotonic stack on the string",
      ],
      0,
      "Linear string DP often asks 'can we segment s[0..i)?' by trying last word lengths and OR-ing/adding dp at earlier split points. State is usually index into the string, transitions scan backward over word lengths."
    ),
  ],

  "Stack / Monotonic Stack": [
    q(
      "Monotonic stack problems are signaled when you need:",
      [
        "Next greater/smaller element or spans bounded by a dominance property",
        "Shortest path in weighted graphs",
        "All subsets of an array",
        "Matrix chain multiplication",
      ],
      0,
      "Monotonic stacks maintain candidates in increasing/decreasing order so each element is pushed and popped once, yielding next/previous greater/smaller in O(n)."
    ),
    q(
      "Time complexity for a proper monotonic stack scan of n elements?",
      [
        "O(n) — each index pushed and popped at most once",
        "O(n log n) due to stack sorting",
        "O(n²) from nested while loops",
        "O(1) per query after O(n) build",
      ],
      0,
      "The inner while loop looks dangerous but amortized analysis is linear because pops are limited. Claiming O(n²) without amortization is a common interview mistake."
    ),
    q(
      "When is a regular stack (not monotonic) the right tool?",
      [
        "Matching nested structures, evaluating RPN, or DFS-like backtracking simulation",
        "Finding median in a stream",
        "Dijkstra's algorithm",
        "Counting inversions in O(n)",
      ],
      0,
      "Classic stacks handle LIFO nesting (parentheses), expression evaluation, and iterative tree/graph walks. Monotonic stacks add ordering constraints for nearest dominant element problems."
    ),
    q(
      "Histogram/largest rectangle pattern uses monotonic stack because:",
      [
        "You need previous smaller boundaries to compute width where each bar is the minimum height",
        "Greedy always picks the tallest bar globally",
        "Two pointers on unsorted heights suffice",
        "BFS levels correspond to bar heights",
      ],
      0,
      "For each bar, extend left/right until a shorter bar—stack tracks increasing heights and pops when current is smaller, revealing span limits in O(n)."
    ),
    q(
      "Stack pitfall:",
      [
        "Storing indices vs values incorrectly when width calculations need positions",
        "Using stack for FIFO queue problems",
        "Assuming JavaScript Array.pop is O(n)",
        "Stacks cannot be simulated iteratively",
      ],
      0,
      "Many span problems need bar indices (or index pairs) on the stack to compute widths. Storing only heights loses distance information unless heights uniquely determine positions."
    ),
  ],

  "Linked List": [
    q(
      "Which technique is the standard O(1) space way to reverse a singly linked list?",
      [
        "Iterative three-pointer reversal (prev, curr, next)",
        "Copy nodes into an array and reverse the array",
        "BFS from head to tail",
        "Hash map from value to node",
      ],
      0,
      "In-place reversal rewires next pointers in one pass with O(1) extra space. Recursion works but uses O(n) stack space."
    ),
    q(
      "Why use dummy head nodes in linked list problems?",
      [
        "Simplify edge cases when the head itself may be deleted or merged",
        "Speed up random access to index k",
        "Convert singly linked list to doubly linked",
        "Detect cycles automatically",
      ],
      0,
      "A sentinel before the real head uniformizes insertion/deletion at the front and merge results without special-casing null head."
    ),
    q(
      "Finding the n-th node from the end in one pass uses:",
      [
        "Two pointers spaced n apart, then move both until fast hits end",
        "Sorting the list by value",
        "Stack of all nodes then pop n times",
        "Binary search on node indices",
      ],
      0,
      "Fast pointer advances n steps first; then both advance until fast is null—slow is at target. This is O(n) time, O(1) space."
    ),
    q(
      "Cycle detection in O(n) time, O(1) space:",
      [
        "Floyd's tortoise and hare (fast/slow pointers)",
        "Store all visited nodes in a hash set only",
        "Reverse the list and compare",
        "BFS level order traversal",
      ],
      0,
      "Floyd detects cycles without extra memory. Hash sets are O(n) space but easier to explain; know both tradeoffs."
    ),
    q(
      "Linked list interview pitfall:",
      [
        "Losing reference to next before rewiring or not handling even/odd length for middle-finding",
        "Assuming O(1) access by index",
        "Forgetting that nodes may have different values but duplicate value nodes are distinct objects",
        "Using two pointers only on arrays",
      ],
      0,
      "Save next before changing pointers. For reorder/partition problems, clarify whether to mutate or return new list. Duplicate values still mean distinct nodes for cycle/copy problems."
    ),
  ],

  "Heap / Top K": [
    q(
      "When is a min-heap of size k preferred over full sorting for 'top k' problems?",
      [
        "O(n log k) time vs O(n log n) sort when k ≪ n",
        "When you need stable sort on strings",
        "When k equals n",
        "When elements are already in a BST",
      ],
      0,
      "Maintain k best candidates in a heap: each of n elements does O(log k) work. Full sort is simpler but asymptotically worse when k is small."
    ),
    q(
      "For 'kth largest element', a min-heap of size k works because:",
      [
        "The root is the smallest among the k largest seen so far—the kth largest candidate",
        "The root is always the global maximum",
        "Heaps sort the entire array automatically",
        "You need max-heap for kth largest always",
      ],
      0,
      "Min-heap of size k evicts smaller elements when a larger one arrives; after scanning, the root is the kth largest. Alternatively, use quickselect for average O(n)."
    ),
    q(
      "Two-heap pattern (max-heap + min-heap) is used for:",
      [
        "Streaming median: balance halves so max of lower ≤ min of upper",
        "Shortest path in graphs",
        "Topological ordering",
        "String matching",
      ],
      0,
      "Keep lower half in a max-heap and upper half in a min-heap, rebalancing sizes so median is O(1) to read and O(log n) per insert."
    ),
    q(
      "Merge k sorted lists efficiently suggests:",
      [
        "Min-heap of size k holding current head from each list",
        "Sort all values together ignoring list structure",
        "k separate binary searches",
        "Union-find on list nodes",
      ],
      0,
      "Push k heads into a heap; pop smallest, advance that list, push next—O(N log k) total for N total nodes vs O(N log N) flatten sort."
    ),
    q(
      "Heap complexity pitfall:",
      [
        "Saying heapify is O(n log n) when building heap from array is O(n)",
        "Assuming heaps provide O(1) extract-max and insert",
        "Using heap when BFS queue already suffices",
        "Forgetting that priority queue is not always a binary heap",
      ],
      0,
      "Build-heap is linear; n successive inserts are O(n log n). Extract/insert are O(log n). State whether you use heapify once or incremental pushes."
    ),
  ],

  "Backtracking": [
    q(
      "Backtracking is appropriate when:",
      [
        "You must enumerate or decide among combinations/permutations with constraints pruned early",
        "A greedy choice is provably globally optimal",
        "Shortest path in unweighted graph is needed",
        "Subproblems overlap heavily in a DAG",
      ],
      0,
      "Backtracking explores a decision tree (pick/skip, place/remove) with pruning when partial states violate constraints. Overlapping subproblems suggest DP instead."
    ),
    q(
      "Typical backtracking time complexity characterization:",
      [
        "Exponential in branching factor and depth—pruning improves practical runtime, not worst-case bound",
        "Always O(n!) exactly",
        "O(n) with memo on combinations",
        "O(log n) with binary search",
      ],
      0,
      "Subset/permutation generation is often O(2^n) or O(n!); interviews care that you articulate pruning (e.g., skip duplicates, bound early) even if worst case stays exponential."
    ),
    q(
      "Handling duplicate elements in subset/combination sum II:",
      [
        "Sort and skip same value at same recursion depth when not using earlier duplicate",
        "Use hash set only without sorting",
        "Always include all duplicates without pruning",
        "Use BFS instead of DFS",
      ],
      0,
      "Sorting groups equal values; in the loop, if i > start and nums[i] == nums[i-1], skip to avoid duplicate combinations at the same tree level."
    ),
    q(
      "Backtracking on grids (word search) pruning signal:",
      [
        "Mark visited, explore 4 directions, unmark on retreat (restore state)",
        "Never unmark cells after recursion",
        "Use global visited set across all start cells without clearing",
        "Only DFS without backtracking",
      ],
      0,
      "Undo marks on backtrack so other paths can reuse the cell. Copying visited sets per path works but costs more memory; in-place marking is standard."
    ),
    q(
      "Backtracking vs DFS on graphs:",
      [
        "Backtracking builds and undoes partial solutions; graph DFS marks visited globally to avoid cycles",
        "They are identical in all problems",
        "Backtracking never uses recursion",
        "DFS never prunes branches",
      ],
      0,
      "Backtracking emphasizes choose-explore-unchoose for generating answers. Graph DFS focuses on reachability with persistent visited flags; combine both for grid path enumeration."
    ),
  ],

  "Graphs Shortest Path / Dijkstra": [
    q(
      "Dijkstra's algorithm applies when:",
      [
        "Non-negative edge weights and you need single-source shortest paths",
        "Negative edges may exist",
        "Unweighted graph—BFS is enough",
        "You need minimum spanning tree only",
      ],
      0,
      "Dijkstra with a priority queue relaxes edges in increasing distance order. Negative weights break the greedy invariant—use Bellman-Ford instead."
    ),
    q(
      "Time complexity with binary heap for V vertices, E edges?",
      [
        "O((V + E) log V) for standard adjacency list + priority queue",
        "O(V²) always regardless of heap",
        "O(E² log E)",
        "O(V + E) without log factor",
      ],
      0,
      "Each vertex extracted once O(log V), each edge relaxed possibly once with heap decrease/insert O(log V). Fibonacci heaps improve theoretically but binary heaps are interview standard."
    ),
    q(
      "Signal for Dijkstra on implicit graphs (grids with costs):",
      [
        "Moving between cells has varying non-negative cost and you need minimum cost path",
        "Counting connected components only",
        "Detecting bipartite coloring",
        "Finding any path regardless of cost",
      ],
      0,
      "When BFS's unit steps aren't enough and weights differ, treat cells as nodes and moves as weighted edges; Dijkstra finds min total cost."
    ),
    q(
      "K-stop / limited hops variants often modify Dijkstra by:",
      [
        "Tracking (node, stops used) state or relaxing only within hop budget",
        "Using only BFS without state dimension",
        "Sorting edges alphabetically",
        "Applying Kruskal's algorithm",
      ],
      0,
      "Extra state in the distance tuple (city, k remaining) distinguishes paths that reach the same node with different stop counts—plain dist[node] is insufficient."
    ),
    q(
      "Dijkstra pitfall:",
      [
        "Re-processing nodes without proper distance improvement check or using it with negative weights",
        "Using priority queue for BFS on unweighted graphs (still works but overkill)",
        "Initializing all distances to infinity except source 0",
        "Storing adjacency lists",
      ],
      0,
      "With non-negative weights, first time you pop a node its distance is final—skipping stale heap entries is key. Negative edges require Bellman-Ford or SPFA with caution."
    ),
  ],

  "Greedy": [
    q(
      "Greedy is justified when:",
      [
        "Locally optimal choices lead to global optimum (often via exchange argument or matroid structure)",
        "Overlapping subproblems dominate",
        "You need all permutations",
        "Graph has negative cycles",
      ],
      0,
      "Prove or cite why greedy works (interval scheduling, Huffman). If counterexamples exist easily, switch to DP."
    ),
    q(
      "Interval scheduling / minimum arrows pattern: sort by:",
      [
        "End time (or start) to make earliest-finish greedy optimal",
        "Random order for average case",
        "Descending length only",
        "Alphabetical labels",
      ],
      0,
      "Classic activity selection sorts by finish time, picks non-overlapping intervals greedily—O(n log n) from sort, O(n) scan."
    ),
    q(
      "Jump game greedy insight:",
      [
        "Track farthest reachable index; fail if i > farthest",
        "Always jump maximum distance at each step for minimum jumps",
        "Use DFS for linear time",
        "Sort jumps ascending",
      ],
      0,
      "Reachability only needs max reach from safe positions. Minimum jumps version extends with BFS layers or greedy on jump range ends."
    ),
    q(
      "Greedy pitfall in interviews:",
      [
        "Applying greedy without proof where DP is required (e.g., arbitrary coin systems)",
        "Using greedy on matroids",
        "Sorting intervals by end",
        "Tracking cumulative fuel at gas stations",
      ],
      0,
      "Standard US coin change is greedy-safe; arbitrary denominations need DP. Always sanity-check a counterexample before committing to greedy."
    ),
    q(
      "Maximum subarray (Kadane) is greedy-like because:",
      [
        "Extend current subarray or restart at i based on which maximizes running sum",
        "Sort array first",
        "Pick global max and min elements",
        "Use divide and conquer only",
      ],
      0,
      "Kadane's O(n) scan resets when running sum goes negative—local decision with global optimum proof via induction."
    ),
  ],

  "Math & Number Theory": [
    q(
      "Which problem type signals math/number theory over generic DS?",
      [
        "Divisors, primes, GCD/LCM, modular arithmetic, or digit properties",
        "Level-order tree traversal",
        "Monotonic stack on temperatures",
        "Clone a graph with BFS",
      ],
      0,
      "Number-theoretic structure (mod, sieve, Euclidean GCD) replaces brute simulation when n is large."
    ),
    q(
      "Modular exponentiation (pow mod) should run in:",
      [
        "O(log exponent) using binary exponentiation",
        "O(exponent) linear multiplication",
        "O(n log n) sorting",
        "O(1) always",
      ],
      0,
      "Square-and-multiply reduces exponentiation to logarithmic multiplies—critical for large exponents in interviews."
    ),
    q(
      "Sieve of Eratosthenes complexity for primes up to n?",
      [
        "O(n log log n) time, O(n) space",
        "O(n²) time",
        "O(log n) time",
        "O(n) time with no extra space required",
      ],
      0,
      "Each composite is crossed out by its smallest prime factor; harmonic sum over primes gives n log log n."
    ),
    q(
      "GCD of two integers efficiently:",
      [
        "Euclidean algorithm O(log min(a,b))",
        "Prime factorize both numbers fully each time",
        "Sort digits and compare",
        "Brute force all divisors up to n",
      ],
      0,
      "Euclid's gcd(a,b) = gcd(b, a mod b) is fast and standard for simplifying fractions and modular inverse setup."
    ),
    q(
      "Math pattern pitfall:",
      [
        "Integer overflow in products—use BigInt or modular reduction before multiply",
        "Using modulo only at the end after overflow",
        "Forgetting 0 and 1 edge cases in factorial/prime problems",
        "All of the above are common issues",
      ],
      3,
      "Interview math problems often fail on 32-bit overflow, division by zero, and degenerate small n. Apply mod during accumulation and test n=0,1,2."
    ),
  ],

  "Advanced DP": [
    q(
      "Longest Increasing Subsequence O(n log n) uses:",
      [
        "Patience sorting / binary search on tails array of smallest ending values",
        "O(n²) nested loops only",
        "Greedy pick largest elements",
        "BFS on array indices",
      ],
      0,
      "Maintain candidate tail array; for each element binary search position to replace—length equals LIS length, reconstruct needs extra tracking."
    ),
    q(
      "LCS / edit distance DP state typically is:",
      [
        "dp[i][j] over prefixes of two strings (or sequences)",
        "Single index i only",
        "Heap of characters",
        "Graph adjacency matrix only",
      ],
      0,
      "2D string DP compares s1[0..i) and s2[0..j) with insert/delete/match transitions—O(mn) time and space, reducible to O(min(m,n)) space."
    ),
    q(
      "0/1 knapsack (partition equal subset) recognition:",
      [
        "Boolean DP over capacity: can we reach sum/2 using each item once",
        "Unbounded coin change inner loop order",
        "Greedy by item value/weight ratio always",
        "BFS on weights",
      ],
      0,
      "Subset sum variant—iterate items outer, capacities inner descending for 0/1 use. Wrong loop order turns it into unbounded knapsack."
    ),
    q(
      "Advanced DP pitfall:",
      [
        "Confusing LIS length DP with LIS sequence reconstruction without parent pointers",
        "Using memo on state (index, last) for LIS O(n²)",
        "Defining state too small missing necessary info (e.g., day and holding stock)",
        "All of the above",
      ],
      3,
      "Stock problems need state like (day, hold, cooldown). LIS log n method needs tie-breaking for reconstruction. Always define state to capture full decision history needed."
    ),
    q(
      "When does bitmask DP apply?",
      [
        "Small n (≈20) set problems: visiting cities, assigning tasks with state as subset bitmask",
        "n = 10⁶ array processing",
        "Sorted array two-sum",
        "Tree diameter",
      ],
      0,
      "State is 2^n subsets—feasible only for small n. TSP-style DP iterates masks and last node in O(n² 2^n)."
    ),
  ],

  "Bit Manipulation": [
    q(
      "Which problem cue suggests bit tricks?",
      [
        "XOR pairs, single/missing number, power-of-two checks, or subset enumeration via masks",
        "Shortest path with weights",
        "BST validation",
        "Merge intervals",
      ],
      0,
      "Bitwise ops exploit binary representation: XOR cancels duplicates, n & (n-1) clears lowest set bit, 1<<i enumerates subsets."
    ),
    q(
      "n & (n - 1) == 0 tests:",
      [
        "Whether n is a power of two (for n > 0)",
        "Whether n is prime",
        "Parity of n",
        "Number of set bits",
      ],
      0,
      "Powers of two have single bit set; subtracting 1 flips trailing zeros and that bit, AND yields 0."
    ),
    q(
      "XOR all numbers to find single occurrence works because:",
      [
        "a ^ a = 0 and a ^ 0 = a; pairs cancel, remainder is unique",
        "XOR sorts the array",
        "XOR requires sorted input",
        "XOR doubles values",
      ],
      0,
      "Associative/commutative XOR eliminates even-frequency elements in O(n) time, O(1) space when other values appear twice."
    ),
    q(
      "Count set bits for 0..n (counting bits DP) uses:",
      [
        "dp[i] = dp[i >> 1] + (i & 1) — reuse lower half",
        "Sieve of Eratosthenes",
        "Monotonic stack",
        "Dijkstra",
      ],
      0,
      "Bit DP builds on i without bits or i/2 plus last bit—O(n) preprocessing for O(1) queries per i."
    ),
    q(
      "Bit manipulation pitfall:",
      [
        "Undefined behavior or sign issues with shifts on negative numbers in some languages",
        "Using XOR when values appear three times (need different approach)",
        "Forgetting operator precedence (& vs ==)",
        "All of the above",
      ],
      3,
      "Triple-frequency problems need bit-count mod 3 per bit position. Use unsigned shifts where needed and parentheses around bitwise ops before comparison."
    ),
  ],

  "Union-Find & Topological Sort": [
    q(
      "Union-Find (DSU) is ideal when:",
      [
        "Dynamic connectivity queries: merge components, count components, detect cycle in undirected graph",
        "Shortest path with negative edges",
        "Finding LIS",
        "String anagram grouping",
      ],
      0,
      "DSU supports near-constant amortized unite/find with path compression and union by rank—great for Kruskal MST and connectivity."
    ),
    q(
      "Topological sort applies to:",
      [
        "Directed acyclic graphs with prerequisite/ordering constraints",
        "Undirected tree diameter",
        "Finding median in stream",
        "Array rotation",
      ],
      0,
      "Kahn's BFS (indegree 0 queue) or DFS post-order reverse produces valid linear order iff no cycle in directed graph."
    ),
    q(
      "Detecting cycle in directed graph for course schedule:",
      [
        "Topological sort fails to include all nodes, or DFS 3-color (gray/black)",
        "Union-Find alone on directed edges",
        "Sort edges by weight",
        "Heap extract-max",
      ],
      0,
      "If Kahn's algorithm processes fewer than V nodes, a cycle exists. DFS with visiting state detects back edges in directed graphs."
    ),
    q(
      "Union-Find amortized complexity (with optimizations)?",
      [
        "Nearly O(α(n)) per operation — inverse Ackermann, effectively constant",
        "O(n) per find always",
        "O(log n) only without path compression",
        "O(n²) total always",
      ],
      0,
      "Path compression and union by rank yield almost constant time per operation—state α(n) in theory, 'constant' in practice for interviews."
    ),
    q(
      "Accounts merge / redundant connection pattern:",
      [
        "Union emails or edges when they share a node; redundant edge creates cycle in undirected graph",
        "Dijkstra on emails",
        "Trie only",
        "Sliding window on accounts",
      ],
      0,
      "Model shared attributes as edges between nodes; DSU groups transitive connections. Redundant connection returns first edge connecting already-connected vertices."
    ),
  ],

  "Tries": [
    q(
      "Use a trie when:",
      [
        "Many prefix queries on strings: autocomplete, dictionary, prefix existence",
        "Need shortest path in weighted graph",
        "Array is sorted for two-sum",
        "Matrix rotation",
      ],
      0,
      "Tries trade space for O(L) prefix operations per string length L—better than re-scanning a word list for each query."
    ),
    q(
      "Trie node typical fields:",
      [
        "Children map/array (26 or dynamic) and optional end-of-word flag",
        "Left/right child only",
        "Heap priority",
        "Edge weight to parent",
      ],
      0,
      "Each node branches on next character; isEnd marks complete words. Arrays are fast for lowercase English; maps handle general alphabets."
    ),
    q(
      "Trie vs hash set of full words:",
      [
        "Trie supports prefix search and shared prefix compression; hash set is O(1) exact word lookup only",
        "Hash set always uses less memory",
        "Trie cannot delete words",
        "Hash set finds prefixes efficiently",
      ],
      0,
      "For 'starts with' or autocomplete, trie walks prefix once. Hash set must check all keys or maintain separate structure."
    ),
    q(
      "Word search II pattern combines:",
      [
        "Trie of dictionary words + grid DFS/backtrack with pruning when prefix not in trie",
        "Dijkstra + trie",
        "Union-find only",
        "Segment tree on grid",
      ],
      0,
      "Store words in trie; during DFS, follow trie children and prune when prefix absent—avoids revisiting full dictionary each cell."
    ),
    q(
      "Trie space complexity for W words average length L?",
      [
        "O(total characters stored) ≤ O(W × L), often less due to shared prefixes",
        "O(1)",
        "O(W²)",
        "O(L log W) only",
      ],
      0,
      "Shared prefixes collapse paths; worst case still O(W × L) for no shared prefixes. Clarify alphabet size affects child storage."
    ),
  ],

  "String Algorithms": [
    q(
      "When to reach for KMP / Z-algorithm / rolling hash?",
      [
        "Single or multiple pattern searches in text with O(n+m) or similar vs naive O(nm)",
        "Reversing a linked list",
        "Graph coloring",
        "Heap median",
      ],
      0,
      "Pattern matching with preprocessing on pattern (KMP failure function) or rolling hash (Rabin-Karp) avoids re-comparing from scratch each offset."
    ),
    q(
      "KMP failure (prefix) function purpose:",
      [
        "Reuse longest proper prefix that is also suffix when mismatch occurs",
        "Sort pattern characters",
        "Hash the text only",
        "Build suffix tree manually",
      ],
      0,
      "On mismatch at j, fall back to lps[j-1] instead of restarting pattern from 0—keeps text pointer from moving backward."
    ),
    q(
      "Rolling hash pitfall:",
      [
        "Collisions—use double hash or verify match on collision",
        "Always O(1) for any substring compare without verification",
        "Cannot compute substring hashes in O(1)",
        "Requires sorted string",
      ],
      0,
      "Modular hashes can collide; compare actual substrings when hashes match or use two moduli. Precompute prefix hashes and powers for O(1) range hash."
    ),
    q(
      "Palindrome-centric string DP vs expanding centers:",
      [
        "DP O(n²) for all palindromes/counts; expand centers O(n²) worst, O(n) best for longest in practice",
        "Only brute force O(n³) is acceptable",
        "Manacher is never useful",
        "BFS on characters",
      ],
      0,
      "Choose by need: count all substrings → DP; longest palindrome → expand around center or Manacher O(n) for expert level."
    ),
    q(
      "Valid parentheses with wildcards '*':",
      [
        "Greedy two-pass or DP tracking balance range— '*' as (, ), or empty",
        "Simple stack only without handling *",
        "Trie traversal",
        "Topological sort",
      ],
      0,
      "Wildcard adds ambiguity; track possible open counts (low/high greedy) or use DP on index and balance—stack alone is insufficient."
    ),
  ],

  "Segment Tree / Fenwick Tree": [
    q(
      "Fenwick tree (BIT) vs segment tree—common tradeoff:",
      [
        "BIT: simpler code, less memory, prefix/range sums; segment tree: flexible range ops (min/max/gcd)",
        "BIT handles arbitrary range min in O(log n) with no setup",
        "Segment tree uses O(1) space",
        "Neither beats prefix array for immutable data",
      ],
      0,
      "Immutable static range sum → prefix array O(1) query. Mutable array with updates + range queries → BIT or segtree O(log n)."
    ),
    q(
      "Both BIT and segment tree update/query complexity?",
      [
        "O(log n) per update and query (range sum via BIT prefix difference)",
        "O(1) update, O(n) query",
        "O(n log n) build only, queries O(1)",
        "O(n²)",
      ],
      0,
      "Tree height is logarithmic; point updates propagate O(log n). BIT range sum uses two prefix queries."
    ),
    q(
      "When is a plain prefix sum array insufficient?",
      [
        "Values change after queries—need mutable structure",
        "Array never changes",
        "Only single element lookups",
        "Strings only",
      ],
      0,
      "Prefix sums are perfect static; point updates invalidate suffix sums—BIT/segtree or sqrt decomposition for dynamic range aggregates."
    ),
    q(
      "Segment tree lazy propagation is for:",
      [
        "Range updates (add v to [l,r]) without O(n) per element touch",
        "Single point queries only",
        "Graph shortest paths",
        "String matching",
      ],
      0,
      "Lazy tags defer range updates to children until needed—keeps range update + query at O(log n) for sum/min/max variants supporting range ops."
    ),
    q(
      "Fenwick tree indexing pitfall:",
      [
        "1-based vs 0-based indexing errors in i += i & -i and i -= i & -i",
        "Using BIT for non-invertible operations like max without careful design",
        "Forgetting O(log n) for prefix only, range needs two queries",
        "All of the above",
      ],
      3,
      "BIT formulas assume 1-based internal indexing often; max BIT is trickier than sum. Range [l,r] sum = prefix(r) - prefix(l-1)."
    ),
  ],
};
