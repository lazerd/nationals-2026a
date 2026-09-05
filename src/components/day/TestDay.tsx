'use client';

import { useEffect, useState } from 'react';
import type { Day, TestResult } from '@/data/types';
import { TEST_METRICS, compare, getTest, previousTest, saveTest, readTests } from '@/lib/tests';
import { formatDate } from '@/lib/format';
import { setDayDone } from '@/lib/storage';
import Link from 'next/link';

/**
 * Test days are a measurement form, not a workout. Numbers go in, and the
 * comparison against the last test comes back immediately — the whole point of
 * testing three times is seeing the direction of travel.
 */
export function TestDay({ day, label }: { day: Day; label: string }) {
  const [values, setValues] = useState<Partial<Record<string, string>>>({});
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState<TestResult | null>(null);
  const [before, setBefore] = useState<TestResult | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const existing = getTest(day.date);
    if (existing) {
      const next: Record<string, string> = {};
      for (const m of TEST_METRICS) {
        const v = existing[m.key];
        if (v !== undefined) next[m.key] = String(v);
      }
      setValues(next);
      setNotes(existing.notes ?? '');
      setSaved(existing);
    }
    setBefore(previousTest(day.date));
    setReady(true);
  }, [day.date]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result: TestResult = { date: day.date, notes: notes.trim() || undefined };
    for (const m of TEST_METRICS) {
      const raw = values[m.key];
      if (raw !== undefined && raw !== '') {
        const n = Number(raw);
        if (Number.isFinite(n)) result[m.key] = n;
      }
    }
    saveTest(result);
    setDayDone(day.date, true);
    setSaved(result);
    setBefore(previousTest(day.date));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const anyRecorded = TEST_METRICS.some((m) => saved?.[m.key] !== undefined);

  return (
    <div className="mx-auto min-h-dvh max-w-[430px] px-4 pb-24 pt-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Test day</p>
        <h1 className="mt-1.5 text-[27px] font-bold leading-[1.08] tracking-[-0.02em]">{label}</h1>
        <p className="mt-1 text-[13px] text-ink-quiet">
          {day.dayOfWeek} {formatDate(day.date)} · Week {day.weekNumber}
        </p>
      </header>

      <p className="mt-6 rounded-lg border border-line-bright px-4 py-3.5 text-[17px] font-medium leading-snug">
        {day.oneLineJob}
      </p>

      {day.coachNote && (
        <aside className="mt-4 border-l-2 border-accent bg-surface py-3 pl-4 pr-3 text-[14px] leading-relaxed">
          {day.coachNote}
        </aside>
      )}

      {ready && saved && anyRecorded && (
        <section className="mt-6 rounded-xl border border-accent-line bg-surface p-4" aria-label="Results">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
            Recorded{before ? ` · vs ${formatDate(before.date)}` : ''}
          </h2>
          <dl className="mt-3 space-y-3">
            {TEST_METRICS.map((m) => {
              const now = saved[m.key];
              if (now === undefined) return null;
              const delta = compare(m, now, before?.[m.key]);
              return (
                <div key={m.key} className="flex items-baseline justify-between gap-3 border-b border-line pb-2 last:border-0">
                  <dt className="text-[14px] text-ink-quiet">{m.label}</dt>
                  <dd className="flex shrink-0 items-baseline gap-2">
                    <span className="scoreboard text-[19px] tabular">
                      {now}
                      <span className="ml-0.5 text-[12px] font-normal text-ink-quiet">{m.unit}</span>
                    </span>
                    {delta && (
                      <span
                        className="scoreboard w-[74px] text-right text-[12px] tabular"
                        style={{ color: delta.raw === 0 ? 'var(--ink-faint)' : delta.improved ? 'var(--ok)' : 'var(--warn)' }}
                      >
                        {delta.text}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
          {!before && (
            <p className="mt-3 text-[13px] leading-relaxed text-ink-quiet">
              Baseline. Everything from here gets measured against these numbers.
            </p>
          )}
          <Link href="/progress" className="tap mt-4 flex items-center justify-center rounded-lg border border-line text-[14px] text-ink-quiet">
            See all three tests
          </Link>
        </section>
      )}

      <form onSubmit={submit} className="mt-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
          {saved ? 'Edit the numbers' : 'Write it down'}
        </h2>
        <div className="mt-3 space-y-4">
          {TEST_METRICS.map((m) => (
            <div key={m.key}>
              <label htmlFor={m.key} className="block text-[14px] font-medium">
                {m.label}
              </label>
              {m.hint && <p className="mt-0.5 text-[12px] text-ink-quiet">{m.hint}</p>}
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id={m.key}
                  type="number"
                  inputMode="decimal"
                  step={m.step}
                  value={values[m.key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [m.key]: e.target.value }))}
                  className="scoreboard tap w-full rounded-lg border border-line bg-surface px-3 text-[22px] text-ink"
                  style={{ height: 52 }}
                />
                <span className="w-8 shrink-0 text-[14px] text-ink-quiet">{m.unit}</span>
              </div>
            </div>
          ))}

          <div>
            <label htmlFor="notes" className="block text-[14px] font-medium">
              Notes
            </label>
            <p className="mt-0.5 text-[12px] text-ink-quiet">
              Shoot the 240fps video from behind and from the side. Note here what you saw.
            </p>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-line bg-surface p-3 text-[15px] text-ink"
            />
          </div>
        </div>

        <button
          type="submit"
          className="tap mt-6 flex w-full items-center justify-center rounded-lg text-[16px] font-semibold"
          style={{ height: 52, background: 'var(--accent)', color: 'var(--accent-ink)' }}
        >
          {saved ? 'Update results' : 'Save results'}
        </button>
      </form>

      <details className="mt-8 rounded-xl border border-line bg-surface">
        <summary className="tap flex cursor-pointer items-center px-4 py-3 text-[14px] text-ink-quiet">
          Today is also a recovery day
        </summary>
        <ul className="space-y-2 px-4 pb-4 text-[14px] text-ink-quiet">
          <li>12–15 min easy walk, bike or swim. Nasal breathing only.</li>
          <li>Foam roll: calves, quads, lats, upper back. 5 min.</li>
          <li>Band external rotation 2×15 each side.</li>
          <li>5 minutes of visualization.</li>
        </ul>
      </details>
    </div>
  );
}

export function useTestCount() {
  const [n, setN] = useState(0);
  useEffect(() => setN(readTests().length), []);
  return n;
}
