'use client';

import { useEffect, useState } from 'react';
import type { SessionType } from '@/data/types';
import { completedDates } from '@/lib/storage';
import { localToday } from '@/lib/today';
import { formatDate } from '@/lib/format';
import Link from 'next/link';

export interface PlanRow {
  date: string;
  dayOfWeek: string;
  weekNumber: number;
  blockNumber: number;
  title: string;
  sessionType: SessionType;
  isDeload: boolean;
  isTestDay: boolean;
  isOnRamp: boolean;
  summary: string;
}

const BLOCKS: Record<number, { name: string; goal: string }> = {
  1: { name: 'Build the chassis', goal: 'Tissue tolerance and clean patterns. Moderate intent — do not chase speed yet.' },
  2: { name: 'Build the engine', goal: 'Maximum intent. Fewer reps, more rest, everything thrown or jumped as hard as you can.' },
  3: { name: 'Sharpen', goal: 'Volume drops every week, intent stays at 100%. Springy and slightly under-worked is the design.' },
};

export function PlanView({ rows }: { rows: PlanRow[] }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [today, setToday] = useState('');

  useEffect(() => {
    setDone(completedDates(rows.map((r) => r.date)));
    setToday(localToday());
  }, [rows]);

  const weeks = new Map<number, PlanRow[]>();
  for (const r of rows) {
    const list = weeks.get(r.weekNumber) ?? [];
    list.push(r);
    weeks.set(r.weekNumber, list);
  }

  let lastBlock = 0;

  return (
    <div className="mx-auto min-h-dvh max-w-[430px] px-4 pb-20 pt-6">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-[27px] font-bold tracking-[-0.02em]">The plan</h1>
        <Link href="/" className="tap flex items-center text-[14px] text-ink-quiet">Today →</Link>
      </header>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-quiet">
        Twelve weeks, twenty minutes a day, to Nov 30. Each day has one job.
      </p>

      <div className="mt-6 space-y-7">
        {[...weeks.entries()].map(([week, days]) => {
          const block = days[0].blockNumber;
          const showBlock = block !== lastBlock && week !== 0;
          lastBlock = block;
          const doneCount = days.filter((d) => done.has(d.date)).length;

          return (
            <div key={week}>
              {showBlock && (
                <div className="mb-5 border-t-2 border-accent pt-3">
                  <h2 className="text-[15px] font-bold">
                    Block {block} — {BLOCKS[block].name}
                  </h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-quiet">{BLOCKS[block].goal}</p>
                </div>
              )}

              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
                  {week === 0 ? 'On-ramp' : `Week ${week}`}
                  {days.some((d) => d.isDeload) && <span className="ml-2 normal-case tracking-normal text-ink-faint">deload</span>}
                  {week === 12 && <span className="ml-2 normal-case tracking-normal text-ink-faint">taper</span>}
                </h3>
                <span className="scoreboard shrink-0 text-[12px] text-ink-faint tabular">
                  {doneCount}/{days.length}
                </span>
              </div>

              <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-surface">
                {days.map((d) => {
                  const isDone = done.has(d.date);
                  const isToday = d.date === today;
                  return (
                    <li key={d.date}>
                      <Link
                        href={`/day/${d.date}`}
                        className="tap flex items-start gap-3 px-3 py-2.5"
                        style={isToday ? { background: 'var(--accent-wash)' } : undefined}
                      >
                        <span className="w-9 shrink-0 pt-0.5">
                          <span className="block text-[12px] text-ink-faint">{d.dayOfWeek}</span>
                          <span className="scoreboard block text-[13px] tabular">{formatDate(d.date).split(' ')[1]}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-[14px] font-medium">{d.title}</span>
                            {d.isTestDay && (
                              <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
                                TEST
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-[12px] text-ink-faint">{d.summary}</span>
                        </span>
                        <span
                          className="mt-1 h-4 w-4 shrink-0 rounded-full border-2"
                          style={{
                            borderColor: isDone ? 'var(--accent)' : 'var(--line-bright)',
                            background: isDone ? 'var(--accent)' : 'transparent',
                          }}
                          aria-label={isDone ? 'Done' : 'Not done'}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <nav className="mt-10 flex items-center justify-between border-t border-line pt-3 text-[14px]">
        <Link href="/progress" className="tap flex items-center pr-3 text-ink-quiet">Progress</Link>
        <Link href="/" className="tap flex items-center pl-3 text-ink-quiet">Today →</Link>
      </nav>
    </div>
  );
}
