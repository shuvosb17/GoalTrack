"use client";

import Link from "next/link";
import { BookmarkCheck } from "lucide-react";

interface ReviewDueBannerProps {
  count: number;
}

export function ReviewDueBanner({ count }: ReviewDueBannerProps) {
  if (count <= 0) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-[18px] py-3.5"
      style={{
        background: "linear-gradient(90deg, rgba(83,74,183,0.18), rgba(83,74,183,0.05))",
        border: "0.5px solid rgba(127,119,221,0.4)",
      }}
    >
      <div className="flex items-center gap-2.5 text-sm">
        <BookmarkCheck className="h-4 w-4 shrink-0" style={{ color: "#AFA9EC" }} />
        <span style={{ color: "#EEEDFE" }}>
          <span className="font-medium">{count} item{count === 1 ? "" : "s"}</span>
          <span className="opacity-80"> due for spaced review — open Review on Status</span>
        </span>
      </div>
      <Link
        href="/status?tab=review"
        className="inline-flex h-8 shrink-0 items-center rounded-lg px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#534AB7" }}
      >
        Open review
      </Link>
    </div>
  );
}
