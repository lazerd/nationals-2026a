import { TZ } from '@/config';

/**
 * Today's calendar date in the user's timezone, as "YYYY-MM-DD".
 *
 * Uses Intl with a named zone rather than any offset arithmetic, so the Nov 1
 * 2026 DST change is handled for free. The same rule applies here as in the
 * send worker: never subtract hours by hand anywhere in this codebase.
 */
export function localToday(now: Date = new Date(), timeZone: string = TZ): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Local wall-clock hour, 0-23, in the user's timezone. */
export function localHour(now: Date = new Date(), timeZone: string = TZ): number {
  return Number(
    new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hour12: false }).format(now),
  );
}
