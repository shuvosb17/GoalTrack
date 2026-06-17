"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
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
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 9h18" />
      <path d="M8 3v4M16 3v4" />
      <circle cx="15.5" cy="15" r="2.3" fill="#fff" stroke="none" />
    </svg>
  );
}

function DeadlineCalendar({
  viewMonth,
  onViewMonthChange,
  selectedDate,
  today,
  todayKey,
  accent,
  onSelect,
}: {
  viewMonth: Date;
  onViewMonthChange: (month: Date) => void;
  selectedDate: Date;
  today: Date;
  todayKey: string;
  accent: string;
  onSelect: (date: Date) => void;
}) {
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  return (
    <div
      className="rounded-xl border border-white/[0.1] bg-[#1a1828] p-3"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onViewMonthChange(subMonths(viewMonth, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] bg-[#221f31] text-[#a39eb6] transition-colors hover:border-white/[0.14] hover:text-white"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span
          className="text-sm font-semibold text-[#f1eff8]"
          style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
        >
          {format(viewMonth, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={() => onViewMonthChange(addMonths(viewMonth, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] bg-[#221f31] text-[#a39eb6] transition-colors hover:border-white/[0.14] hover:text-white"
          aria-label="Next month"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {DOW_LABELS.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="flex h-6 items-center justify-center text-[10px] font-semibold text-[#67627a]"
          >
            {d}
          </div>
        ))}
        {monthDays.map((day) => {
          const inMonth = isSameMonth(day, viewMonth);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const isPast = isPastDeadlineDay(day, todayKey);
          const isSelectable = inMonth && !isPast;

          return (
            <button
              key={toDateKey(day)}
              type="button"
              disabled={!isSelectable}
              onClick={() => isSelectable && onSelect(day)}
              className={cn(
                "relative flex h-8 items-center justify-center rounded-md text-[12px] font-medium transition-colors",
                !inMonth && "invisible",
                isPast && inMonth && "text-[#67627a] opacity-35",
                isSelectable && !isSelected && "text-[#f1eff8] hover:bg-white/[0.06]",
                isSelected && "text-white"
              )}
              style={
                isSelected
                  ? { background: `linear-gradient(135deg, ${accent} 0%, #463e9c 100%)` }
                  : undefined
              }
            >
              {format(day, "d")}
              {isToday && !isSelected && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#2dd9c3]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
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

  const selectDate = useCallback(
    (date: Date) => {
      if (isPastDeadlineDay(date, todayKey)) return;
      onDueDateChange(toDateKey(date));
      setViewMonth(date);
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
  } as React.CSSProperties;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(92vh,720px)] max-w-[400px] gap-0 overflow-y-auto border-0 bg-transparent p-0 shadow-none [&>button]:hidden"
        style={cssVars}
        onPointerDownOutside={(e) => {
          if (calendarOpen) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (calendarOpen) e.preventDefault();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.2, 0.9, 0.25, 1.05] }}
          className="relative overflow-visible rounded-[20px] border border-white/[0.07] bg-gradient-to-br from-[#15131e] to-[#110f18] p-5 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.75)] sm:p-6"
        >
          <div
            className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full opacity-30 blur-[60px]"
            style={{ background: accentLight }}
          />
          <div
            className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full opacity-15 blur-[60px]"
            style={{ background: "#2dd9c3" }}
          />

          <div className="relative z-10 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-[0_6px_16px_-6px_var(--deadline-accent-glow)]"
                  style={{ background: `linear-gradient(135deg, ${accent} 0%, #3c3680 100%)` }}
                >
                  <TitleCalendarIcon />
                </div>
                <h2
                  className="text-lg font-semibold text-[#f1eff8]"
                  style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                >
                  Set deadline
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#67627a] hover:bg-white/[0.06] hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[13px] leading-relaxed text-[#a39eb6]">
              Pick a quick option or choose a custom date — shown on Tracks and Status.
            </p>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#67627a]">
                Quick pick
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PICKS.map((pick) => {
                  const active = activePick === pick.id;
                  return (
                    <button
                      key={pick.id}
                      type="button"
                      onClick={() => onDueDateChange(toDateKey(pick.resolve(today)))}
                      className={cn(
                        "rounded-full border px-3 py-1 text-[12px] font-medium transition-all",
                        active
                          ? "border-transparent text-white"
                          : "border-white/[0.07] bg-[#1c1929] text-[#a39eb6] hover:text-white"
                      )}
                      style={
                        active
                          ? { background: `linear-gradient(135deg, ${accent} 0%, #463e9c 100%)` }
                          : undefined
                      }
                    >
                      {pick.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#67627a]">
                Due date
              </p>
              <button
                type="button"
                onClick={() => {
                  setViewMonth(parseLocalDate(dueDate || todayKey));
                  setCalendarOpen((v) => !v);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl border bg-[#1c1929] px-2.5 py-2 text-left transition-all",
                  calendarOpen
                    ? "border-[var(--deadline-accent-light)] shadow-[0_0_0_3px_rgba(132,120,232,0.12)]"
                    : "border-white/[0.08] hover:border-white/[0.14]"
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#221f31] text-[var(--deadline-accent-light)]">
                  <CalendarIcon className="h-3.5 w-3.5" />
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="font-mono text-[13px] font-semibold text-[#f1eff8]">
                    {formatDeadlineDisplay(dueDate || todayKey)}
                  </span>
                  <span className="text-[11px] text-[#67627a]">
                    {formatDeadlineWeekdayShort(dueDate || todayKey)}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-[#67627a] transition-transform duration-200",
                    calendarOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {calendarOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2">
                      <DeadlineCalendar
                        viewMonth={viewMonth}
                        onViewMonthChange={setViewMonth}
                        selectedDate={selectedDate}
                        today={today}
                        todayKey={todayKey}
                        accent={accent}
                        onSelect={selectDate}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#1c1929] px-3 py-2">
              <div className="relative h-9 w-9 shrink-0">
                <svg viewBox="0 0 38 38" className="h-9 w-9 -rotate-90" aria-hidden>
                  <circle cx="19" cy="19" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
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
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs">
                  {status.emoji}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold" style={{ color: ringColor }}>
                  {status.main}
                </p>
                <p className="text-[11px] text-[#67627a]">
                  {formatDeadlineLong(dueDate || todayKey)}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-[0_8px_22px_-8px_var(--deadline-accent-glow)] transition-all hover:-translate-y-px hover:brightness-110 disabled:opacity-70"
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
