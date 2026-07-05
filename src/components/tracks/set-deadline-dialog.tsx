"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseLocalDate, todayISO } from "@/lib/utils";
import {
  formatDeadlineDisplay,
  formatDeadlineLong,
  getDeadlineDaysFromToday,
  getDeadlineStatus,
  isPastDeadlineDay,
  matchingQuickPickId,
  QUICK_PICKS,
  toDateKey,
  urgencyColor,
} from "@/lib/deadline-picker";

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

function DeadlineCalendar({
  viewMonth,
  onViewMonthChange,
  selectedDate,
  todayKey,
  accent,
  onSelect,
}: {
  viewMonth: Date;
  onViewMonthChange: (month: Date) => void;
  selectedDate: Date;
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
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onViewMonthChange(subMonths(viewMonth, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{format(viewMonth, "MMMM yyyy")}</span>
        <button
          type="button"
          onClick={() => onViewMonthChange(addMonths(viewMonth, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {DOW_LABELS.map((d, i) => (
          <div key={`${d}-${i}`} className="flex h-6 items-center justify-center text-[10px] text-muted-foreground">
            {d}
          </div>
        ))}
        {monthDays.map((day) => {
          const inMonth = isSameMonth(day, viewMonth);
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
                "flex h-8 items-center justify-center rounded-md text-xs transition-colors",
                !inMonth && "invisible",
                isPast && inMonth && "text-muted-foreground/40",
                isSelectable && !isSelected && "hover:bg-white/[0.06]",
                isSelected && "font-medium text-white"
              )}
              style={isSelected ? { backgroundColor: accent } : undefined}
            >
              {format(day, "d")}
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
  accent = "#FAC775",
}: SetDeadlineDialogProps) {
  const todayKey = todayISO();
  const today = useMemo(() => parseLocalDate(todayKey), [todayKey]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => parseLocalDate(dueDate || todayKey));
  const [saving, setSaving] = useState(false);

  const diff = getDeadlineDaysFromToday(dueDate || todayKey, todayKey);
  const status = getDeadlineStatus(diff);
  const activePick = matchingQuickPickId(dueDate || todayKey, todayKey);
  const statusColor = urgencyColor(status.urgency);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px] gap-0 border-white/[0.08] bg-[#121216] p-0 sm:rounded-xl">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Set deadline</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Shown on Tracks and Status when in progress.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Quick pick</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PICKS.map((pick) => {
                const active = activePick === pick.id;
                return (
                  <button
                    key={pick.id}
                    type="button"
                    onClick={() => onDueDateChange(toDateKey(pick.resolve(today)))}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      active
                        ? "border-transparent text-black"
                        : "border-white/[0.08] text-muted-foreground hover:text-foreground"
                    )}
                    style={active ? { backgroundColor: accent } : undefined}
                  >
                    {pick.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Due date</p>
            <button
              type="button"
              onClick={() => {
                setViewMonth(parseLocalDate(dueDate || todayKey));
                setCalendarOpen((v) => !v);
              }}
              className="flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-left hover:border-white/[0.12]"
            >
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm">{formatDeadlineDisplay(dueDate || todayKey)}</span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", calendarOpen && "rotate-180")} />
            </button>
            {calendarOpen && (
              <div className="mt-2">
                <DeadlineCalendar
                  viewMonth={viewMonth}
                  onViewMonthChange={setViewMonth}
                  selectedDate={parseLocalDate(dueDate || todayKey)}
                  todayKey={todayKey}
                  accent={accent}
                  onSelect={selectDate}
                />
              </div>
            )}
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <p className="text-sm font-medium" style={{ color: statusColor }}>
              {status.main}
            </p>
            <p className="text-xs text-muted-foreground">{formatDeadlineLong(dueDate || todayKey)}</p>
          </div>
        </div>

        <div className="border-t border-white/[0.06] px-5 py-4">
          <Button
            className="w-full gap-2"
            disabled={saving}
            onClick={handleSave}
            style={{ backgroundColor: accent, color: "#111" }}
          >
            <Check className="h-4 w-4" />
            Save deadline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
