"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { parseLocalDate, todayISO } from "@/lib/utils";
import {
  formatDeadlineDisplay,
  formatDeadlineLong,
  formatDeadlineWeekdayShort,
  getDeadlineDaysFromToday,
  getDeadlineStatus,
  isPastDeadlineDay,
  matchingQuickPickId,
  QUICK_PICKS,
  toDateKey,
  urgencyColor,
  urgencyRingRatio,
} from "@/lib/deadline-picker";

const RING_RADIUS = 15.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export interface SetDeadlineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dueDate: string;
  onDueDateChange: (dateKey: string) => void;
  onSave: () => void | Promise<void>;
  /** Override accent for track-themed dialogs */
  accent?: string;
  accentLight?: string;
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 9h18" />
      <path d="M8 3v4M16 3v4" />
    </svg>
  );
}

function TitleCalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 9h18" />
      <path d="M8 3v4M16 3v4" />
      <circle cx="15.5" cy="15" r="2.3" fill="#fff" stroke="none" />
    </svg>
  );
}

export function SetDeadlineDialog({
  open,
  onOpenChange,
  dueDate,
  onDueDateChange,
  onSave,
  accent = "#534AB7",
  accentLight = "#8478e8",
}: SetDeadlineDialogProps) {
  const todayKey = todayISO();
  const today = useMemo(() => parseLocalDate(todayKey), [todayKey]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => parseLocalDate(dueDate || todayKey));
  const [saving, setSaving] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseLocalDate(dueDate || todayKey);
  const diff = getDeadlineDaysFromToday(dueDate || todayKey, todayKey);
  const status = getDeadlineStatus(diff);
  const activePick = matchingQuickPickId(dueDate || todayKey, todayKey);
  const ringColor = urgencyColor(status.urgency);
  const ringOffset = RING_CIRCUMFERENCE * (1 - urgencyRingRatio(diff));

  useEffect(() => {
    if (open) {
      setViewMonth(parseLocalDate(dueDate || todayKey));
      setCalendarOpen(false);
    }
  }, [open, dueDate, todayKey]);

  useEffect(() => {
    if (!calendarOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        fieldRef.current?.contains(target) ||
        calendarRef.current?.contains(target)
      ) {
        return;
      }
      setCalendarOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [calendarOpen]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  const selectDate = useCallback(
    (date: Date) => {
      if (isPastDeadlineDay(date, todayKey)) return;
      onDueDateChange(toDateKey(date));
      setCalendarOpen(false);
    },
    [onDueDateChange, todayKey]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  const cssVars = {
    "--deadline-accent": accent,
    "--deadline-accent-light": accentLight,
    "--deadline-accent-glow": `${accentLight}80`,
    "--deadline-teal": "#2dd9c3",
    "--deadline-amber": "#f5b942",
    "--deadline-red": "#ff6868",
  } as React.CSSProperties;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[440px] gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none [&>button]:hidden"
        style={cssVars}
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.2, 0.9, 0.25, 1.1] }}
          className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-gradient-to-br from-[#15131e] to-[#110f18] p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.02)]"
        >
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-[340px] w-[340px] rounded-full opacity-35 blur-[70px]"
            style={{ background: accentLight, animation: "deadlineDrift1 14s ease-in-out infinite" }}
          />
          <div
            className="pointer-events-none absolute -bottom-12 -right-12 h-[300px] w-[300px] rounded-full opacity-[0.18] blur-[70px]"
            style={{ background: "#2dd9c3", animation: "deadlineDrift2 16s ease-in-out infinite" }}
          />

          <div className="relative z-10">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_8px_20px_-6px_var(--deadline-accent-glow)]"
                  style={{
                    background: `linear-gradient(135deg, ${accent} 0%, #3c3680 100%)`,
                  }}
                >
                  <TitleCalendarIcon />
                </div>
                <h2
                  className="text-[19px] font-semibold tracking-tight text-[#f1eff8]"
                  style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                >
                  Set deadline
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[#67627a] transition-colors hover:border-white/[0.13] hover:bg-[#1c1929] hover:text-[#f1eff8]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-5 text-[13.5px] leading-relaxed text-[#a39eb6]">
              Defaults to today in your local timezone. Pick a quick option or set a custom date — it&apos;ll show on Tracks and Status.
            </p>

            <p className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.5px] text-[#67627a]">
              Quick pick
            </p>
            <div className="mb-5 flex flex-wrap gap-2">
              {QUICK_PICKS.map((pick) => {
                const active = activePick === pick.id;
                return (
                  <button
                    key={pick.id}
                    type="button"
                    onClick={() => onDueDateChange(toDateKey(pick.resolve(today)))}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-all duration-200",
                      active
                        ? "border-transparent text-white shadow-[0_6px_16px_-6px_var(--deadline-accent-glow)]"
                        : "border-white/[0.07] bg-[#1c1929] text-[#a39eb6] hover:-translate-y-px hover:border-white/[0.13] hover:text-[#f1eff8]"
                    )}
                    style={
                      active
                        ? {
                            background: `linear-gradient(135deg, ${accent} 0%, #463e9c 100%)`,
                          }
                        : undefined
                    }
                  >
                    {pick.label}
                  </button>
                );
              })}
            </div>

            <p className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.5px] text-[#67627a]">
              Due date
            </p>
            <div className="relative mb-4" ref={fieldRef}>
              <button
                type="button"
                onClick={() => setCalendarOpen((v) => !v)}
                className={cn(
                  "flex w-full items-center justify-between gap-2.5 rounded-[14px] border-[1.5px] bg-[#1c1929] px-3.5 py-3 text-left transition-all duration-200",
                  calendarOpen
                    ? "border-[var(--deadline-accent-light)] shadow-[0_0_0_4px_rgba(132,120,232,0.14)]"
                    : "border-white/[0.07] hover:border-white/[0.13]"
                )}
              >
                <div>
                  <span className="font-mono text-[15px] font-semibold tracking-wide text-[#f1eff8]">
                    {formatDeadlineDisplay(dueDate || todayKey)}
                  </span>
                  <span className="ml-2 text-[13px] font-medium text-[#67627a]">
                    {formatDeadlineWeekdayShort(dueDate || todayKey)}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#221f31] text-[var(--deadline-accent-light)] transition-transform duration-200",
                    calendarOpen && "rotate-[8deg]"
                  )}
                >
                  <CalendarIcon className="h-[15px] w-[15px]" />
                </div>
              </button>

              <AnimatePresence>
                {calendarOpen && (
                  <motion.div
                    ref={calendarRef}
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: [0.2, 0.9, 0.3, 1.2] }}
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-2xl border border-white/[0.13] bg-[#221f31] p-4 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.6)]"
                  >
                    <div className="mb-3.5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setViewMonth((m) => subMonths(m, 1))}
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-white/[0.07] bg-[#1c1929] text-[#a39eb6] transition-colors hover:border-white/[0.13] hover:text-[#f1eff8]"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                      <span
                        className="text-sm font-semibold text-[#f1eff8]"
                        style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                      >
                        {format(viewMonth, "MMMM yyyy")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewMonth((m) => addMonths(m, 1))}
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-white/[0.07] bg-[#1c1929] text-[#a39eb6] transition-colors hover:border-white/[0.13] hover:text-[#f1eff8]"
                        aria-label="Next month"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                      {DOW_LABELS.map((d, i) => (
                        <div
                          key={`${d}-${i}`}
                          className="pb-1.5 text-center text-[10.5px] font-semibold tracking-wide text-[#67627a]"
                        >
                          {d}
                        </div>
                      ))}
                      {monthDays.map((day) => {
                        const inMonth = isSameMonth(day, viewMonth);
                        const isToday = isSameDay(day, today);
                        const isSelected = isSameDay(day, selectedDate);
                        const isPast = isPastDeadlineDay(day, todayKey);

                        return (
                          <button
                            key={day.toISOString()}
                            type="button"
                            disabled={isPast}
                            onClick={() => selectDate(day)}
                            className={cn(
                              "relative flex aspect-square items-center justify-center rounded-lg text-[13px] font-medium transition-all duration-150",
                              !inMonth && "text-[#67627a] opacity-40",
                              inMonth && !isSelected && !isPast && "text-[#a39eb6] hover:bg-[#1c1929] hover:text-[#f1eff8]",
                              isPast && "pointer-events-none opacity-25",
                              isSelected &&
                                "text-white shadow-[0_4px_14px_-4px_var(--deadline-accent-glow)]"
                            )}
                            style={
                              isSelected
                                ? {
                                    background: `linear-gradient(135deg, ${accent} 0%, #463e9c 100%)`,
                                  }
                                : undefined
                            }
                          >
                            {format(day, "d")}
                            {isToday && !isSelected && (
                              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#2dd9c3]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mb-5 flex items-center gap-3 rounded-[14px] border border-white/[0.07] bg-[#1c1929] px-3.5 py-2.5">
              <div className="relative h-[38px] w-[38px] shrink-0">
                <svg
                  viewBox="0 0 38 38"
                  className="h-[38px] w-[38px] -rotate-90"
                  aria-hidden
                >
                  <circle
                    cx="19"
                    cy="19"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={4}
                  />
                  <circle
                    cx="19"
                    cy="19"
                    r={RING_RADIUS}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={ringOffset}
                    className="transition-[stroke-dashoffset,stroke] duration-500 ease-out"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[13px]">
                  {status.emoji}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[13.5px] font-semibold transition-colors duration-300"
                  style={{ color: ringColor }}
                >
                  {status.main}
                </p>
                <p className="mt-0.5 text-[11.5px] text-[#67627a]">
                  {formatDeadlineLong(dueDate || todayKey)}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-[14.5px] font-semibold tracking-wide text-white shadow-[0_10px_26px_-8px_var(--deadline-accent-glow)] transition-all duration-200 hover:-translate-y-px hover:brightness-110 hover:shadow-[0_14px_32px_-8px_var(--deadline-accent-glow)] active:translate-y-0 disabled:opacity-70"
              style={{
                background: `linear-gradient(135deg, ${accentLight} 0%, ${accent} 55%, #3c3680 100%)`,
              }}
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
              Save deadline
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
