"use client";

import type { ComponentType } from "react";
import type { VizId } from "@/lib/pattern-notes/types";
import {
  FrequencyCountViz,
  TwoPointerOppositeViz,
  SlidingWindowViz,
  BinarySearchSpaceViz,
  StackMonotonicViz,
  LinkedListFastSlowViz,
  TreeTraversalsViz,
  HeapTopKViz,
  BacktrackingTreeViz,
  GraphBfsDfsViz,
  TriePrefixViz,
  UnionFindViz,
  TopoSortViz,
  DpStateTableViz,
  BitXorViz,
  PrefixSumViz,
  GreedyChoiceViz,
  IntervalMergeViz,
  MonotonicQueueViz,
} from "../visualizations";

const VIZ_MAP: Record<VizId, ComponentType> = {
  "frequency-count": FrequencyCountViz,
  "two-pointer-opposite": TwoPointerOppositeViz,
  "sliding-window-expand-shrink": SlidingWindowViz,
  "binary-search-space": BinarySearchSpaceViz,
  "stack-monotonic": StackMonotonicViz,
  "linked-list-fast-slow": LinkedListFastSlowViz,
  "tree-traversals": TreeTraversalsViz,
  "heap-top-k": HeapTopKViz,
  "backtracking-tree": BacktrackingTreeViz,
  "graph-bfs-dfs": GraphBfsDfsViz,
  "trie-prefix": TriePrefixViz,
  "union-find": UnionFindViz,
  "topo-sort": TopoSortViz,
  "dp-state-table": DpStateTableViz,
  "bit-xor": BitXorViz,
  "prefix-sum": PrefixSumViz,
  "greedy-choice": GreedyChoiceViz,
  "interval-merge": IntervalMergeViz,
  "monotonic-queue": MonotonicQueueViz,
};

export function VizBlock({ viz }: { viz: VizId }) {
  const Component = VIZ_MAP[viz];
  if (!Component) return null;
  return <Component />;
}
