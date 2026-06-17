export interface TimeData {
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
}

export type TimeUnit = "hours" | "minutes" | "seconds";

export interface TimeBlockState {
  unit: TimeUnit;
  value: number;
  tooltip: string;
}

/** Time remaining until end of day + elapsed day progress (0–100). */
export function calculateDayTime(now = new Date()): TimeData {
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const totalDay = 24 * 60 * 60 * 1000;
  let remaining = endOfDay.getTime() - now.getTime();

  if (remaining < 0) {
    endOfDay.setDate(endOfDay.getDate() + 1);
    remaining = endOfDay.getTime() - now.getTime();
  }

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  const elapsed = totalDay - remaining;
  const progress = Math.max(0, Math.min(100, (elapsed / totalDay) * 100));

  return { hours, minutes, seconds, progress };
}

export function formatTimeUnit(value: number): string {
  return String(value).padStart(2, "0");
}

export function buildTimeBlockStates(data: TimeData): TimeBlockState[] {
  return [
    { unit: "hours", value: data.hours, tooltip: `${data.hours} hours remaining` },
    { unit: "minutes", value: data.minutes, tooltip: `${data.minutes} minutes remaining` },
    { unit: "seconds", value: data.seconds, tooltip: `${data.seconds} seconds remaining` },
  ];
}

type TickListener = (data: TimeData) => void;

/** Encapsulates interval lifecycle for day countdown ticks. */
export class DayTimer {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<TickListener>();

  subscribe(listener: TickListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  start(): void {
    if (this.intervalId) return;
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners.clear();
  }

  private tick(): void {
    const data = calculateDayTime();
    this.listeners.forEach((listener) => listener(data));
  }
}
