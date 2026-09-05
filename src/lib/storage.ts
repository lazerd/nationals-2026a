'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * All persistence is localStorage on one device for one user. Keys are
 * namespaced so nothing collides with anything else served from the origin.
 *
 *   nationals:day:2026-09-07:sets   {"main:0:rotational-wall-throw": 3}
 *   nationals:day:2026-09-07:done   "1"
 *   nationals:tests                 TestResult[]
 *
 * Every read is wrapped: a private window, cleared site data, or a browser
 * blocking storage must degrade to an empty workout, never to a crash.
 */

const NS = 'nationals';

export const keys = {
  sets: (date: string) => `${NS}:day:${date}:sets`,
  done: (date: string) => `${NS}:day:${date}:done`,
  tests: () => `${NS}:tests`,
};

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or blocked storage: the session still works, it just will not persist */
  }
}

export function removeKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * Reads on mount rather than during render. The day pages are statically
 * generated, so touching localStorage while rendering would mismatch hydration.
 * `ready` lets the UI hold off drawing checked state until the real value lands.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(readJSON<T>(key, initial));
    setReady(true);
    // Re-reads when the key changes, e.g. navigating between day pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        writeJSON(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update, ready] as const;
}

/**
 * Marks a day complete, or clears it. Writes synchronously so that a streak
 * read taken immediately afterwards sees this day, rather than racing a
 * deferred React state update.
 */
export function setDayDone(date: string, done: boolean): void {
  if (done) writeJSON(keys.done(date), true);
  else removeKey(keys.done(date));
}

export function isDayDone(date: string): boolean {
  return readJSON<boolean>(keys.done(date), false) === true;
}

const DAY_MS = 86_400_000;

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Consecutive completed days ending at `date`. Counts back day by day and
 * stops at the first gap, so a missed Tuesday resets it — which matches the
 * plan's own "the calendar is a rhythm, not a debt".
 */
export function streakEndingAt(date: string): number {
  if (typeof window === 'undefined') return 0;
  let n = 0;
  let cursor = date;
  while (isDayDone(cursor) && n < 400) {
    n += 1;
    cursor = shiftDate(cursor, -1);
  }
  return n;
}

/** Every completed date, for the progress screen. */
export function completedDates(all: string[]): Set<string> {
  const out = new Set<string>();
  for (const d of all) if (isDayDone(d)) out.add(d);
  return out;
}

export { shiftDate, DAY_MS };
