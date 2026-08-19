import { useSyncExternalStore } from "react";
import { dayKey, newCard, schedule, startOfDay, type Grade, type SrsState } from "./srs";

const KEY = "xrlab-state-v1";

export type Theme = "dark" | "light";

export interface SectionProgress {
  read?: boolean;
  quizBest?: number; // 0..1 best quiz score
  practiceDone?: boolean;
  updatedAt: number;
}

export interface DayActivity {
  xp: number;
  reviews: number;
  lessons: number;
}

export interface ExerciseState {
  done?: boolean;
  note?: string;
}

export interface AppState {
  version: number;
  theme: Theme;
  xp: number;
  streak: { count: number; lastActiveDay: string | null };
  activityByDay: Record<string, DayActivity>;
  progress: Record<string, SectionProgress>;
  srs: Record<string, SrsState>;
  exercises: Record<string, ExerciseState>;
  /** interactive labs the learner has completed at least once */
  labsDone: Record<string, boolean>;
  dailyGoal: number;
}

const DEFAULT_STATE: AppState = {
  version: 1,
  theme: "dark",
  xp: 0,
  streak: { count: 0, lastActiveDay: null },
  activityByDay: {},
  progress: {},
  srs: {},
  exercises: {},
  labsDone: {},
  dailyGoal: 20,
};

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / disabled — ignore */
  }
}

function set(next: Partial<AppState>) {
  state = { ...state, ...next };
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

export function useStore(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Selector hook to avoid re-renders when unrelated state changes. */
export function useSelector<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

// ---------- streak / activity ----------

function touchStreak() {
  const today = dayKey();
  const { lastActiveDay, count } = state.streak;
  if (lastActiveDay === today) return;
  const yesterday = dayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const nextCount = lastActiveDay === yesterday ? count + 1 : 1;
  set({ streak: { count: nextCount, lastActiveDay: today } });
}

function bumpActivity(patch: Partial<DayActivity>) {
  const today = dayKey();
  const cur = state.activityByDay[today] ?? { xp: 0, reviews: 0, lessons: 0 };
  const next: DayActivity = {
    xp: cur.xp + (patch.xp ?? 0),
    reviews: cur.reviews + (patch.reviews ?? 0),
    lessons: cur.lessons + (patch.lessons ?? 0),
  };
  set({ activityByDay: { ...state.activityByDay, [today]: next } });
}

export function addXp(amount: number) {
  set({ xp: state.xp + amount });
  bumpActivity({ xp: amount });
  touchStreak();
}

// ---------- actions ----------

export const actions = {
  setTheme(theme: Theme) {
    set({ theme });
  },

  setDailyGoal(goal: number) {
    set({ dailyGoal: Math.max(5, Math.min(200, Math.round(goal))) });
  },

  markSectionRead(id: string) {
    const prev = state.progress[id];
    if (prev?.read) return;
    set({
      progress: { ...state.progress, [id]: { ...prev, read: true, updatedAt: Date.now() } },
    });
    bumpActivity({ lessons: 1 });
    addXp(15);
  },

  recordQuiz(id: string, score: number) {
    const prev = state.progress[id];
    const best = Math.max(prev?.quizBest ?? 0, score);
    const improved = best > (prev?.quizBest ?? 0);
    set({
      progress: {
        ...state.progress,
        [id]: { ...prev, quizBest: best, updatedAt: Date.now() },
      },
    });
    if (improved) addXp(Math.round(score * 30));
  },

  markPracticeDone(id: string) {
    const prev = state.progress[id];
    if (prev?.practiceDone) return;
    set({
      progress: { ...state.progress, [id]: { ...prev, practiceDone: true, updatedAt: Date.now() } },
    });
    addXp(10);
  },

  toggleExercise(id: string) {
    const prev = state.exercises[id];
    const done = !prev?.done;
    set({ exercises: { ...state.exercises, [id]: { ...prev, done } } });
    if (done) addXp(20);
  },

  setExerciseNote(id: string, note: string) {
    const prev = state.exercises[id];
    set({ exercises: { ...state.exercises, [id]: { ...prev, note } } });
  },

  /** First time a learner actually drives an interactive lab. */
  completeLab(labId: string) {
    if (state.labsDone[labId]) return;
    set({ labsDone: { ...state.labsDone, [labId]: true } });
    addXp(12);
  },

  /** Grade a flashcard in the daily review. */
  gradeCard(cardId: string, grade: Grade) {
    const prev = state.srs[cardId] ?? newCard();
    const next = schedule(prev, grade);
    set({ srs: { ...state.srs, [cardId]: next } });
    bumpActivity({ reviews: 1 });
    const reward = grade === "again" ? 1 : grade === "hard" ? 3 : 5;
    addXp(reward);
  },

  /** Reset all progress (used by the settings "erase" button). */
  resetAll() {
    state = { ...DEFAULT_STATE, theme: state.theme };
    persist();
    emit();
  },
};

// ---------- derived selectors (plain functions) ----------

export function dueCardIds(allIds: string[], now: Date = new Date()): string[] {
  const today = startOfDay(now);
  return allIds.filter((id) => {
    const c = state.srs[id];
    if (!c) return true; // brand new cards are due
    return c.due <= today;
  });
}

export function reviewsToday(): number {
  return state.activityByDay[dayKey()]?.reviews ?? 0;
}

export function xpToday(): number {
  return state.activityByDay[dayKey()]?.xp ?? 0;
}
