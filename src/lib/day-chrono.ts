export type ChronoMode = "elapsed" | "left";

export interface DayChronoSnapshot {
  hours: number;
  minutes: number;
  seconds: number;
  /** 0–100 display percent for ring + bar */
  percent: number;
}

const DAY_SECONDS = 24 * 60 * 60;
export const CHRONO_RING_CIRCUMFERENCE = 402.1;
export const CHRONO_ACCENT = "#7CFFC4";

export function getElapsedSeconds(now = new Date()): number {
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

export function calculateDayChrono(
  now: Date = new Date(),
  mode: ChronoMode = "elapsed"
): DayChronoSnapshot {
  const elapsed = getElapsedSeconds(now);
  const remaining = DAY_SECONDS - elapsed;
  const pctElapsed = (elapsed / DAY_SECONDS) * 100;

  const displaySeconds = mode === "elapsed" ? elapsed : remaining;
  const hours = Math.floor(displaySeconds / 3600);
  const minutes = Math.floor((displaySeconds % 3600) / 60);
  const seconds = displaySeconds % 60;
  const percent = mode === "elapsed" ? pctElapsed : 100 - pctElapsed;

  return { hours, minutes, seconds, percent };
}

export function padChrono(n: number): string {
  return String(n).padStart(2, "0");
}

type ChronoListener = (snapshot: DayChronoSnapshot, tick: number) => void;

/** Live 1s ticker for day chronometer widgets. */
export class DayChronoTimer {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<ChronoListener>();
  private tick = 0;

  subscribe(listener: ChronoListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  start(): void {
    if (this.intervalId) return;
    this.emit();
    this.intervalId = setInterval(() => {
      this.tick += 1;
      this.emit();
    }, 1000);
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners.clear();
    this.tick = 0;
  }

  private emit(): void {
    const snapshot = calculateDayChrono();
    this.listeners.forEach((listener) => listener(snapshot, this.tick));
  }
}
