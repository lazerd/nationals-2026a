'use client';

import { useEffect, useState } from 'react';
import type { SessionType, TestResult } from '@/data/types';
import { completedDates, isDayDone } from '@/lib/storage';
import { TEST_METRICS, compare, readTests } from '@/lib/tests';
import { formatDate } from '@/lib/format';
import { MetricChart } from './MetricChart';
import { localToday } from '@/lib/today';
import Link from 'next/link';

type Slim = { date: string; sessionType: SessionType; weekNumber: number };

const TYPE_LABELS: Record<SessionType, string> = {
  'serve-a': 'Serve A — Rotation',
  'serve-b': 'Serve B — Leg Drive',
  'move-a': 'Move A — First Step',
  'move-b': 'Move B — React & Decelerate',
  strength: 'Strength',
  mobility: 'Mobility & Prehab',
  recovery: 'Recovery',
  test: 'Test',
  match: 'Nationals',
};

export function ProgressView({ days }: { days: Slim[] }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [tests, setTests] = useState<TestResult[]>([]);
  const [today, setToday] = useState<string>('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDone(completedDates(days.map((d) => d.date)));
    setTests(readTests());
    setToday(localToday());
    setReady(true);
  }, [days]);

  // Longest run of completed days anywhere in the program, and the live one.
  let best = 0;
  let run = 0;
  for (const d of days) {
    run = done.has(d.date) ? run + 1 : 0;
    if (run > best) best = run;
  }
  let current = 0;
  if (ready) {
    const upTo = days.filter((d) => d.date <= today);
    for (let i = upTo.length - 1; i >= 0; i--) {
      if (isDayDone(upTo[i].date)) current += 1;
      else break;
    }
  }

  const byType = new Map<SessionType, { total: number; done: number }>();
  for (const d of days) {
    const e = byType.get(d.sessionType) ?? { total: 0, done: 0 };
    e.total += 1;
    if (done.has(d.date)) e.done += 1;
    byType.set(d.sessionType, e);
  }

  return (
    <div className="mx-auto min-h-dvh max-w-[430px] px-4 pb-20 pt-6">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-[27px] font-bold tracking-[-0.02em]">Progress</h1>
        <Link href="/" className="tap flex items-center text-[14px] text-ink-quiet">
          Today →
        </Link>
      </header>

      <section className="mt-6 grid grid-cols-3 gap-3" aria-label="Summary">
        <Stat value={ready ? done.size : 0} of={days.length} label="days done" />
        <Stat value={ready ? current : 0} label="day streak" />
        <Stat value={ready ? best : 0} label="best run" />
      </section>

      <section className="mt-8" aria-label="Program grid">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">All 84 days</h2>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const isDone = done.has(d.date);
            const isToday = d.date === today;
            return (
              <a
                key={d.date}
                href={`/day/${d.date}`}
                title={`${formatDate(d.date)} · ${TYPE_LABELS[d.sessionType]}`}
                className="aspect-square rounded-[3px]"
                style={{
                  // Eighty-four filled squares in the accent would make this
                  // the loudest thing in the app. Done days read as a solid
                  // slate; the accent is saved for today.
                  background: isToday ? 'var(--accent)' : isDone ? 'var(--illo-figure)' : 'var(--surface-2)',
                }}
                aria-label={`${formatDate(d.date)}, ${TYPE_LABELS[d.sessionType]}, ${isDone ? 'done' : 'not done'}`}
              />
            );
          })}
        </div>
        <p className="mt-2 text-[12px] text-ink-faint">
          Each square is a day, Monday to Sunday across. Filled means done; today is marked.
        </p>
      </section>

      <section className="mt-8" aria-label="By session type">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">By session</h2>
        <ul className="mt-3 space-y-3">
          {[...byType.entries()].map(([type, e]) => (
            <li key={type}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[14px]">{TYPE_LABELS[type]}</span>
                <span className="scoreboard shrink-0 text-[14px] text-ink-quiet tabular">
                  {ready ? e.done : 0}/{e.total}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${ready ? (e.done / e.total) * 100 : 0}%`, background: 'var(--accent)' }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-label="Test results">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">Tests</h2>
        {!ready || tests.length === 0 ? (
          <p className="mt-3 rounded-xl border border-line bg-surface p-4 text-[14px] leading-relaxed text-ink-quiet">
            Nothing recorded yet. The three test days are Oct 4, Nov 1 and Nov 22 — the first one
            is the baseline everything else gets measured against.
          </p>
        ) : (
          <>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[300px] text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="pb-2 text-[12px] font-semibold text-ink-quiet">Metric</th>
                    {tests.map((t) => (
                      <th key={t.date} scope="col" className="pb-2 text-right text-[12px] font-semibold text-ink-quiet">
                        {formatDate(t.date)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TEST_METRICS.map((m) => (
                    <tr key={m.key} className="border-b border-line last:border-0">
                      <th scope="row" className="py-2 pr-2 text-[13px] font-normal text-ink">{m.label}</th>
                      {tests.map((t) => (
                        <td key={t.date} className="scoreboard py-2 text-right text-[15px] tabular">
                          {t[m.key] ?? <span className="text-ink-faint">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-5">
              {TEST_METRICS.map((m) => {
                const points = tests
                  .filter((t) => t[m.key] !== undefined)
                  .map((t) => ({ date: t.date, value: t[m.key] as number }));
                if (points.length === 0) return null;
                const delta =
                  points.length > 1
                    ? compare(m, points[points.length - 1].value, points[0].value)
                    : null;
                return (
                  <div key={m.key} className="rounded-xl border border-line bg-surface p-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[14px] font-medium">{m.label}</span>
                      {delta && (
                        <span
                          className="scoreboard shrink-0 text-[13px] tabular"
                          style={{ color: delta.raw === 0 ? 'var(--ink-faint)' : delta.improved ? 'var(--ok)' : 'var(--warn)' }}
                        >
                          {delta.text}
                        </span>
                      )}
                    </div>
                    <MetricChart points={points} better={m.better} unit={m.unit} label={m.label} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <nav className="mt-10 flex items-center justify-between border-t border-line pt-3 text-[14px]">
        <Link href="/plan" className="tap flex items-center pr-3 text-ink-quiet">The whole plan</Link>
        <Link href="/" className="tap flex items-center pl-3 text-ink-quiet">Today →</Link>
      </nav>
    </div>
  );
}

function Stat({ value, of, label }: { value: number; of?: number; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-3">
      <p className="scoreboard text-[28px] leading-none">
        {value}
        {of !== undefined && <span className="text-[15px] text-ink-faint">/{of}</span>}
      </p>
      <p className="mt-1.5 text-[12px] leading-tight text-ink-quiet">{label}</p>
    </div>
  );
}
