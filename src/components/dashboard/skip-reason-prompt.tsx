"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useSessions } from "@/hooks/use-data";
import { upsertSkipLog } from "@/lib/skip-logs";
import type { SkipReason } from "@/lib/types/metrics";
import { parseLocalDate, todayISO } from "@/lib/utils";

const REASONS: { id: SkipReason; label: string }[] = [
  { id: "too-tired", label: "Too tired" },
  { id: "too-busy", label: "Too busy" },
  { id: "unclear-what-to-do", label: "Unclear what to do" },
  { id: "forgot", label: "Forgot" },
  { id: "other", label: "Other" },
];

export function SkipReasonPrompt() {
  const sessions = useSessions();
  const skipLogsQuery = useLiveQuery(() => db.skipLogs.toArray(), []);
  const skipLogsReady = skipLogsQuery !== undefined;
  const [show, setShow] = useState(false);
  const [targetDate, setTargetDate] = useState<string | null>(null);

  useEffect(() => {
    if (!skipLogsReady || skipLogsQuery === undefined) return;

    const logs = skipLogsQuery;
    const yesterday = format(subDays(parseLocalDate(todayISO()), 1), "yyyy-MM-dd");
    const alreadyLogged = logs.some((l) => l.date === yesterday);

    if (alreadyLogged) {
      setShow(false);
      setTargetDate(null);
      return;
    }

    const yesterdayHours =
      sessions.filter((s) => s.date === yesterday).reduce((sum, s) => sum + s.duration, 0) / 3600000;

    if (yesterdayHours === 0) {
      setTargetDate(yesterday);
      setShow(true);
    } else {
      setShow(false);
      setTargetDate(null);
    }
  }, [sessions, skipLogsQuery, skipLogsReady]);

  const saveAndClose = async (reason: SkipReason) => {
    if (!targetDate) return;
    await upsertSkipLog(targetDate, reason);
    setShow(false);
    setTargetDate(null);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-4 left-4 right-4 z-40 glass-card rounded-xl border-[0.5px] border-white/[0.08] p-4 shadow-2xl sm:left-auto sm:right-6 sm:max-w-sm"
        >
          <p className="mb-3 text-sm font-medium">You didn&apos;t study yesterday. What happened?</p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => saveAndClose(r.id)}
                className="rounded-lg border-[0.5px] border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
              >
                {r.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => saveAndClose("other")}
              className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
