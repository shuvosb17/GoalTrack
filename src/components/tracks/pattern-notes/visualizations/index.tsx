"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface VizStep {
  caption: string;
  render: () => React.ReactNode;
}

interface SteppedVizProps {
  title: string;
  steps: VizStep[];
}

export function SteppedViz({ title, steps }: SteppedVizProps) {
  const [step, setStep] = useState(0);
  const current = steps[step];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs tabular-nums text-muted-foreground">
            {step + 1}/{steps.length}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            disabled={step === steps.length - 1}
            onClick={() => setStep((s) => s + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex min-h-[140px] items-center justify-center rounded-lg bg-black/30 p-4">
        {current.render()}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{current.caption}</p>
      <div className="mt-2 flex justify-center gap-1">
        {steps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === step ? "w-4 bg-primary" : "w-1.5 bg-white/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Cell({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded border text-sm font-mono",
        highlight ? "border-primary bg-primary/20 text-primary" : "border-white/10 bg-white/[0.04]"
      )}
    >
      {children}
    </div>
  );
}

export function FrequencyCountViz() {
  const arr = [1, 2, 2, 3, 1];
  return (
    <SteppedViz
      title="Frequency count with HashMap"
      steps={[
        {
          caption: "Scan the array. For each element, increment its count in a hash map.",
          render: () => (
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {arr.map((n, i) => (
                  <Cell key={i} highlight={i === 0}>{n}</Cell>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">count[1] = 1</div>
            </div>
          ),
        },
        {
          caption: "After full pass: {1:2, 2:2, 3:1}. Use for anagrams, duplicates, top-K.",
          render: () => (
            <div className="font-mono text-sm text-violet-300">
              {"{ 1: 2, 2: 2, 3: 1 }"}
            </div>
          ),
        },
      ]}
    />
  );
}

export function TwoPointerOppositeViz() {
  return (
    <SteppedViz
      title="Opposite ends two pointers"
      steps={[
        {
          caption: "Place left at start, right at end. Move based on comparison with target.",
          render: () => (
            <div className="flex items-center gap-2">
              <Cell highlight>1</Cell>
              <Cell>3</Cell>
              <Cell>4</Cell>
              <Cell>6</Cell>
              <Cell highlight>9</Cell>
              <span className="ml-2 text-xs text-muted-foreground">L + R = 10</span>
            </div>
          ),
        },
        {
          caption: "If sum too small, move left++. If too large, move right--.",
          render: () => (
            <div className="flex items-center gap-2">
              <Cell>1</Cell>
              <Cell highlight>3</Cell>
              <Cell>4</Cell>
              <Cell>6</Cell>
              <Cell highlight>9</Cell>
            </div>
          ),
        },
      ]}
    />
  );
}

export function SlidingWindowViz() {
  return (
    <SteppedViz
      title="Expand → shrink window"
      steps={[
        {
          caption: "Expand right pointer to grow window until condition is met.",
          render: () => (
            <div className="font-mono text-lg tracking-widest">
              <span className="rounded bg-primary/30 px-1">a</span>
              <span className="rounded bg-primary/30 px-1">b</span>
              <span className="text-muted-foreground">c</span>
              <span className="text-muted-foreground">a</span>
            </div>
          ),
        },
        {
          caption: "When invalid, shrink from left until valid again. Track best window.",
          render: () => (
            <div className="font-mono text-lg tracking-widest">
              <span className="text-muted-foreground">a</span>
              <span className="rounded bg-primary/30 px-1">b</span>
              <span className="rounded bg-primary/30 px-1">c</span>
              <span className="rounded bg-primary/30 px-1">a</span>
            </div>
          ),
        },
      ]}
    />
  );
}

export function BinarySearchSpaceViz() {
  return (
    <SteppedViz
      title="Binary search on answer space"
      steps={[
        {
          caption: "Define lo/hi on possible answers. Mid is a candidate, not an index.",
          render: () => (
            <div className="flex items-center gap-1 text-xs font-mono">
              <span className="text-muted-foreground">lo</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <Cell key={n} highlight={n === 4}>{n}</Cell>
                ))}
              </div>
              <span className="text-muted-foreground">hi</span>
            </div>
          ),
        },
        {
          caption: "If feasible(mid), try smaller answer (hi=mid). Else lo=mid+1.",
          render: () => (
            <div className="text-sm text-muted-foreground">feasible(4)? → shrink search left</div>
          ),
        },
      ]}
    />
  );
}

export function StackMonotonicViz() {
  return (
    <SteppedViz
      title="Monotonic stack"
      steps={[
        {
          caption: "Stack keeps decreasing temperatures. Pop when current is warmer.",
          render: () => (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[73, 74, 71, 69, 72].map((t, i) => (
                  <Cell key={i} highlight={i === 1}>{t}</Cell>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">stack: [73] → pop, answer[0]=1</div>
            </div>
          ),
        },
      ]}
    />
  );
}

export function LinkedListFastSlowViz() {
  return (
    <SteppedViz
      title="Fast & slow pointers"
      steps={[
        {
          caption: "Slow moves 1 step, fast moves 2. If cycle exists, they meet.",
          render: () => (
            <div className="flex items-center gap-1 font-mono text-sm">
              <span className="rounded-full border border-primary px-2 py-1">1</span>
              <span>→</span>
              <span className="rounded-full border border-white/20 px-2 py-1">2</span>
              <span>→</span>
              <span className="rounded-full border border-amber-400 px-2 py-1">3</span>
              <span className="text-xs text-muted-foreground ml-2">fast ↑ slow</span>
            </div>
          ),
        },
      ]}
    />
  );
}

export function TreeTraversalsViz() {
  return (
    <SteppedViz
      title="Tree traversals"
      steps={[
        {
          caption: "Preorder: root → left → right. Inorder: left → root → right (BST sorted).",
          render: () => (
            <svg viewBox="0 0 120 80" className="h-24 w-36">
              <circle cx="60" cy="15" r="10" fill="#534AB7" />
              <circle cx="35" cy="45" r="10" fill="#534AB7" opacity="0.7" />
              <circle cx="85" cy="45" r="10" fill="#534AB7" opacity="0.7" />
              <line x1="60" y1="25" x2="35" y2="35" stroke="#666" />
              <line x1="60" y1="25" x2="85" y2="35" stroke="#666" />
              <text x="56" y="19" fill="white" fontSize="10">1</text>
            </svg>
          ),
        },
        {
          caption: "BFS uses a queue for level-order; DFS uses recursion or explicit stack.",
          render: () => (
            <div className="text-sm text-muted-foreground">Level 0: [1] → Level 1: [2,3]</div>
          ),
        },
      ]}
    />
  );
}

export function HeapTopKViz() {
  return (
    <SteppedViz
      title="Top K with heap"
      steps={[
        {
          caption: "Min-heap of size K keeps K largest. Root is Kth largest.",
          render: () => (
            <div className="text-center font-mono text-sm">
              <div className="rounded border border-primary/40 bg-primary/10 px-3 py-2">min heap [7,8,9]</div>
              <div className="mt-2 text-xs text-muted-foreground">pop if size &gt; K</div>
            </div>
          ),
        },
      ]}
    />
  );
}

export function BacktrackingTreeViz() {
  return (
    <SteppedViz
      title="Choose → explore → unchoose"
      steps={[
        {
          caption: "Each level picks or skips an element. Undo choice before next branch.",
          render: () => (
            <svg viewBox="0 0 160 90" className="h-28 w-44">
              <circle cx="80" cy="12" r="8" fill="#534AB7" />
              <circle cx="50" cy="40" r="7" fill="#534AB7" opacity="0.6" />
              <circle cx="110" cy="40" r="7" fill="#534AB7" opacity="0.6" />
              <line x1="80" y1="20" x2="50" y2="33" stroke="#555" />
              <line x1="80" y1="20" x2="110" y2="33" stroke="#555" />
              <text x="76" y="16" fill="white" fontSize="8">[]</text>
            </svg>
          ),
        },
      ]}
    />
  );
}

export function GraphBfsDfsViz() {
  return (
    <SteppedViz
      title="Graph BFS vs DFS"
      steps={[
        {
          caption: "BFS: queue, explores layer by layer — shortest path in unweighted graphs.",
          render: () => (
            <div className="grid grid-cols-3 gap-2">
              {["A", "B", "C", "D", "E", "F"].map((n, i) => (
                <Cell key={n} highlight={i < 3}>{n}</Cell>
              ))}
            </div>
          ),
        },
        {
          caption: "DFS: stack/recursion — flood fill, cycle detection, connected components.",
          render: () => (
            <div className="text-sm text-muted-foreground">visit → mark → recurse neighbors</div>
          ),
        },
      ]}
    />
  );
}

export function TriePrefixViz() {
  return (
    <SteppedViz
      title="Trie prefix search"
      steps={[
        {
          caption: "Each edge is a character. Path from root spells a prefix.",
          render: () => (
            <div className="font-mono text-sm text-violet-300">
              root → c → a → t* (word end)
            </div>
          ),
        },
      ]}
    />
  );
}

export function UnionFindViz() {
  return (
    <SteppedViz
      title="Union-Find"
      steps={[
        {
          caption: "find(x) with path compression. union(x,y) by rank/size.",
          render: () => (
            <div className="flex gap-4 text-sm">
              <div>parent: [0,0,1,2]</div>
              <div className="text-muted-foreground">2 components → 1</div>
            </div>
          ),
        },
      ]}
    />
  );
}

export function TopoSortViz() {
  return (
    <SteppedViz
      title="Kahn's topological sort"
      steps={[
        {
          caption: "Start with nodes of in-degree 0. Remove, decrease neighbors' in-degree.",
          render: () => (
            <div className="text-sm">
              <span className="text-primary">queue: [0]</span>
              <span className="ml-2 text-muted-foreground">order: []</span>
            </div>
          ),
        },
      ]}
    />
  );
}

export function DpStateTableViz() {
  return (
    <SteppedViz
      title="DP state table"
      steps={[
        {
          caption: "Fill table bottom-up. dp[i] depends on smaller subproblems.",
          render: () => (
            <div className="flex gap-1">
              {[1, 1, 2, 3, 5, 8].map((n, i) => (
                <Cell key={i} highlight={i === 5}>{n}</Cell>
              ))}
            </div>
          ),
        },
      ]}
    />
  );
}

export function BitXorViz() {
  return (
    <SteppedViz
      title="XOR trick"
      steps={[
        {
          caption: "a ^ a = 0, a ^ 0 = a. XOR all numbers — pairs cancel, leftover is answer.",
          render: () => (
            <div className="font-mono text-sm">4 ^ 1 ^ 2 ^ 1 ^ 2 → 4</div>
          ),
        },
      ]}
    />
  );
}

export function PrefixSumViz() {
  return (
    <SteppedViz
      title="Prefix sum range query"
      steps={[
        {
          caption: "prefix[i] = sum(nums[0..i]). Range [l,r] = prefix[r] - prefix[l-1].",
          render: () => (
            <div className="flex gap-1">
              {[0, 1, 3, 6, 10].map((n, i) => (
                <Cell key={i}>{n}</Cell>
              ))}
            </div>
          ),
        },
      ]}
    />
  );
}

export function GreedyChoiceViz() {
  return (
    <SteppedViz
      title="Greedy local choice"
      steps={[
        {
          caption: "Sort by finish time. Always pick next non-overlapping interval.",
          render: () => (
            <div className="text-sm text-muted-foreground">[1,3] [2,4] [3,5] → pick [1,3], [3,5]</div>
          ),
        },
      ]}
    />
  );
}

export function IntervalMergeViz() {
  return (
    <SteppedViz
      title="Merge intervals"
      steps={[
        {
          caption: "Sort by start. If overlap, merge into one; else push new interval.",
          render: () => (
            <div className="flex gap-2 text-xs">
              <span className="rounded bg-primary/20 px-2 py-1">[1,4]</span>
              <span className="rounded bg-primary/20 px-2 py-1">[2,6]</span>
              <span>→</span>
              <span className="rounded bg-violet-500/30 px-2 py-1">[1,6]</span>
            </div>
          ),
        },
      ]}
    />
  );
}

export function MonotonicQueueViz() {
  return (
    <SteppedViz
      title="Monotonic deque"
      steps={[
        {
          caption: "Deque stores indices in decreasing value. Front is window max.",
          render: () => (
            <div className="text-sm text-muted-foreground">window [1,3,-1] → max = 3</div>
          ),
        },
      ]}
    />
  );
}
