'use client';

import { useState } from 'react';
import type { Day, Exercise } from '@/data/types';
import { prescriptionLine } from '@/lib/format';
import { keys, usePersistentState } from '@/lib/storage';
import Link from 'next/link';

/**
 * Nov 30. No training — the warm-up protocol, the visualization prompt, and a
 * short reminder list. Every line below is drawn from the plan's own text
 * rather than invented on the morning of the tournament.
 */
const WHAT_WINS = [
  'The return decides matches in doubles, more than the serve does.',
  'Land the first one. Speed you cannot land is worth nothing.',
  'Split step as they make contact, not before.',
  'Get behind the lob and hit it as an overhead, not a defensive lob.',
  'Same routine on every ball. Same bounces, same breath, same toss.',
];

export function MatchDay({
  day,
  exercises,
  illustrations,
  prev,
}: {
  day: Day;
  exercises: Record<string, Exercise>;
  illustrations: Record<string, React.ReactNode>;
  prev?: string;
}) {
  const [checked, setChecked, ready] = usePersistentState<Record<string, boolean>>(keys.sets(day.date), {});
  const [showViz, setShowViz] = useState(false);
  const allDone = ready && day.main.every((_, i) => checked[`warm:${i}`]);

  return (
    <div className="mx-auto min-h-dvh max-w-[430px] px-4 pb-16 pt-8">
      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">November 30</p>
        <h1 className="mt-2 text-[38px] font-bold leading-[0.98] tracking-[-0.03em]">Nationals</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-quiet">
          Twelve weeks are behind you. Nothing you do in the next hour adds fitness — this is
          only about arriving warm and clear.
        </p>
      </header>

      <section className="mt-8" aria-label="Warm-up">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">Warm-up, then hit</h2>
        <ul className="mt-3 space-y-2">
          {day.main.map((s, i) => {
            const key = `warm:${i}`;
            const on = ready && checked[key] === true;
            const ex = exercises[s.exerciseId];
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setChecked((p) => ({ ...p, [key]: !p[key] }))}
                  className="tap flex w-full items-center gap-3 rounded-xl border bg-surface px-4 py-3 text-left transition-colors duration-150"
                  style={{ borderColor: on ? 'var(--accent-line)' : 'var(--line)' }}
                  aria-pressed={on}
                >
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2"
                    style={{ borderColor: on ? 'var(--accent)' : 'var(--line-bright)', background: on ? 'var(--accent)' : 'transparent' }}
                  >
                    {on && (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                        <path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke="var(--accent-ink)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] font-medium">{ex?.name ?? s.exerciseId}</span>
                  <span className="scoreboard shrink-0 text-[16px] tabular">{prescriptionLine(s)}</span>
                </button>
                {s.note && <p className="mt-1 pl-4 text-[12px] text-ink-quiet">{s.note}</p>}
              </li>
            );
          })}
        </ul>
        {allDone && <p className="mt-3 text-center text-[14px] text-accent">Warm. Go and hit.</p>}
      </section>

      <section className="mt-8" aria-label="Visualization">
        <button
          type="button"
          onClick={() => setShowViz((v) => !v)}
          aria-expanded={showViz}
          className="tap flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[15px] font-medium">Five minutes, eyes closed</span>
            <span className="mt-0.5 block text-[13px] text-ink-quiet">Before you leave the car.</span>
          </span>
          <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 transition-transform duration-200" style={{ transform: showViz ? 'rotate(180deg)' : undefined }} aria-hidden="true">
            <path d="M3 6 L8 11 L13 6" fill="none" stroke="var(--ink-quiet)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {showViz && (
          <div className="mt-3 rounded-xl border border-line bg-surface p-4">
            <div className="rounded bg-ground">{illustrations['visualization']}</div>
            <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-quiet">
              <li>Play points in real time. Not highlights — actual points, at actual speed.</li>
              <li>See your serve going where you aimed it. Feel the contact, do not just watch it.</li>
              <li>Include the poach you took and the return you read. Play your partner&rsquo;s side too.</li>
              <li>If a point goes badly in your head, replay it going well. End on a good one.</li>
            </ul>
          </div>
        )}
      </section>

      <section className="mt-8" aria-label="Reminders">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">What wins doubles matches</h2>
        <ul className="mt-3 space-y-3">
          {WHAT_WINS.map((line) => (
            <li key={line} className="border-l-2 border-accent pl-4 text-[16px] leading-snug">
              {line}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-center text-[15px] leading-relaxed text-ink-quiet">
        The work is done. Go and play.
      </p>

      <nav className="mt-8 flex items-center justify-between border-t border-line pt-3 text-[14px]">
        {prev ? (
          <Link href={`/day/${prev}`} className="tap flex items-center pr-3 text-ink-quiet">
            ← Yesterday
          </Link>
        ) : (
          <span />
        )}
        <Link href="/progress" className="tap flex items-center pl-3 text-ink-quiet">
          Twelve weeks →
        </Link>
      </nav>
    </div>
  );
}
