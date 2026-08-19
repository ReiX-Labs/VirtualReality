// A compact SM-2 (Anki-style) spaced-repetition scheduler.
// Everything is day-based and stored in localStorage — no backend needed.
// This powers "Ôn tập hàng ngày": học rồi lại quên, nên xào đi xào lại đúng nhịp
// để kiến thức nằm lại trong trí nhớ dài hạn.

export type Grade = "again" | "hard" | "good" | "easy";

export interface SrsState {
  /** ease factor, starts at 2.5, floored at 1.3 */
  ef: number;
  /** current interval in days */
  interval: number;
  /** number of successful reviews in a row */
  reps: number;
  /** due timestamp (local midnight) */
  due: number;
  /** times the card was forgotten */
  lapses: number;
  /** has the card ever been seen */
  introduced: boolean;
  /** last time it was reviewed */
  lastReview?: number;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Local-midnight timestamp for a given date (defaults to now). */
export function startOfDay(d: Date = new Date()): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** YYYY-MM-DD in local time. */
export function dayKey(d: Date = new Date()): string {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function newCard(): SrsState {
  return { ef: 2.5, interval: 0, reps: 0, due: startOfDay(), lapses: 0, introduced: false };
}

const QUALITY: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };

/** Apply a grade and return the next scheduling state. Pure. */
export function schedule(prev: SrsState, grade: Grade, now: Date = new Date()): SrsState {
  const q = QUALITY[grade];
  const today = startOfDay(now);
  let { ef, interval, reps, lapses } = prev;

  // SM-2 ease update
  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < 1.3) ef = 1.3;

  if (grade === "again") {
    reps = 0;
    lapses += 1;
    interval = 0; // repeat again in this same session
    return { ef, interval, reps, lapses, introduced: true, lastReview: today, due: today };
  }

  reps += 1;
  if (reps === 1) {
    interval = grade === "easy" ? 3 : 1;
  } else if (reps === 2) {
    interval = grade === "easy" ? 6 : grade === "hard" ? 2 : 4;
  } else {
    const mult = grade === "hard" ? 1.2 : grade === "easy" ? ef * 1.3 : ef;
    interval = Math.max(1, Math.round(interval * mult));
  }

  return {
    ef,
    interval,
    reps,
    lapses,
    introduced: true,
    lastReview: today,
    due: today + interval * DAY_MS,
  };
}

export function isDue(card: SrsState, now: Date = new Date()): boolean {
  return card.due <= startOfDay(now);
}

/** A friendly label for the "next review" gap a grade would produce. */
export function previewInterval(prev: SrsState, grade: Grade): string {
  const next = schedule(prev, grade);
  if (grade === "again") return "< 10 phút";
  if (next.interval <= 0) return "hôm nay";
  if (next.interval === 1) return "1 ngày";
  if (next.interval < 30) return `${next.interval} ngày`;
  const months = Math.round(next.interval / 30);
  return months <= 1 ? "~1 tháng" : `~${months} tháng`;
}
