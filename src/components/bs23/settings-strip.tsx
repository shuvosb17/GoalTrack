"use client";

import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppSettings, Bs23DeclaredStack } from "@/lib/types";
import { parseLocalDate } from "@/lib/utils";

const STACKS: { value: Bs23DeclaredStack; label: string }[] = [
  { value: "java", label: "Java / Spring Boot" },
  { value: "csharp", label: ".NET / C#" },
  { value: "javascript", label: "JavaScript / Node.js" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go (not recommended for BS23 stack test)" },
];

interface SettingsStripProps {
  mcqDate: string;
  dayLongDate: string;
  declaredStack?: Bs23DeclaredStack;
  weeklyHours?: number;
  onMcqDateChange: (v: string) => void;
  onDayLongDateChange: (v: string) => void;
  onStackChange: (v: Bs23DeclaredStack) => void;
  onWeeklyHoursChange: (v: number) => void;
}

export function SettingsStrip({
  mcqDate,
  dayLongDate,
  declaredStack,
  weeklyHours,
  onMcqDateChange,
  onDayLongDateChange,
  onStackChange,
  onWeeklyHoursChange,
}: SettingsStripProps) {
  return (
    <div className="glass-card flex flex-wrap items-end gap-4 rounded-xl p-4">
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground">
          MCQ target
        </label>
        <Input
          type="date"
          value={mcqDate}
          onChange={(e) => onMcqDateChange(e.target.value)}
          className="h-9 w-[10.5rem] text-[13px]"
        />
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {format(parseLocalDate(mcqDate), "MMM d, yyyy")}
        </p>
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground">
          Day-long target
        </label>
        <Input
          type="date"
          value={dayLongDate}
          onChange={(e) => onDayLongDateChange(e.target.value)}
          className="h-9 w-[10.5rem] text-[13px]"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground">
          Declared stack
        </label>
        <Select value={declaredStack ?? "java"} onValueChange={(v) => onStackChange(v as Bs23DeclaredStack)}>
          <SelectTrigger className="h-9 w-[12rem] text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STACKS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground">
          Weekly hours plan
        </label>
        <Input
          type="number"
          min={1}
          max={60}
          step={0.5}
          value={weeklyHours ?? 12}
          onChange={(e) => onWeeklyHoursChange(Number(e.target.value) || 12)}
          className="h-9 w-24 text-[13px]"
        />
      </div>
    </div>
  );
}

export function defaultBs23Settings(settings: AppSettings | null) {
  return {
    mcqDate: settings?.bs23McqDate ?? "2026-12-15",
    dayLongDate: settings?.bs23DayLongDate ?? "2027-01-26",
    declaredStack: settings?.bs23DeclaredStack ?? ("java" as Bs23DeclaredStack),
    weeklyHours: settings?.bs23WeeklyHours ?? 12,
  };
}
