"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/db";
import type { SessionQualityRating } from "@/lib/types/metrics";

const OPTIONS: { rating: SessionQualityRating; label: string; icon: string }[] = [
  { rating: 1, label: "Distracted", icon: "⚡" },
  { rating: 2, label: "Normal", icon: "✓" },
  { rating: 3, label: "Deep focus", icon: "🎯" },
];

export function SessionQualityPrompt({
  sessionId,
  onDone,
}: {
  sessionId: string;
  onDone: () => void;
}) {
  const [saving, setSaving] = useState(false);

  const rate = async (rating: SessionQualityRating) => {
    setSaving(true);
    await db.sessions.update(sessionId, { qualityRating: rating });
    onDone();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="mt-3 border-t border-white/[0.06] pt-3"
      >
        <p className="mb-2 text-xs text-muted-foreground">How was this session?</p>
        <div className="flex gap-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.rating}
              type="button"
              disabled={saving}
              onClick={() => rate(opt.rating)}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-[10px] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <span className="text-base">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onDone}
            className="px-2 text-[10px] text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
