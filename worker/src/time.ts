/**
 * Every time decision in this worker goes through Intl with a named timezone.
 *
 * There is no offset arithmetic here and there must never be. US daylight
 * saving ends on Sunday Nov 1 2026, in the middle of the training block: a
 * fixed `0 12 * * *` cron would send at 5 AM local through October and then
 * silently at 4 AM for the last four weeks. Running hourly and asking Intl
 * what the local wall clock says is what makes that a non-event.
 */

/** Local calendar date, "2026-09-07". */
export function localDate(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Local wall-clock hour, 0-23. */
export function localHour(now: Date, timeZone: string): number {
  return Number(
    new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hour12: false }).format(now),
  );
}

/** "Monday" in the user's timezone. */
export function localWeekday(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' }).format(now);
}

export function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
