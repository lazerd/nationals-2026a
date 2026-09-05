'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Day, Exercise, SetPrescription } from '@/data/types';
import { formatClock } from '@/lib/format';
import { chime, primeAudio } from '@/lib/chime';
import { setDayDone, streakEndingAt } from '@/lib/storage';
import Link from 'next/link';

/**
 * Mobility and recovery days run as a guided sequence rather than a checklist:
 * one movement at a time, full screen, counting down and advancing itself so
 * the phone can go on the floor.
 *
 * Timing note: the plan prescribes seconds for holds and reps for everything
 * else. Rep-based steps get a paced duration of about three and a half seconds
 * a rep so the sequence can advance on its own — the prescription itself is
 * always shown as written.
 */

interface Step {
  exerciseId: string;
  detail: string;
  seconds: number;
  /** Long steps (a 15 minute walk) wait for a tap instead of counting down. */
  manual: boolean;
  prescriptionText: string;
  note?: string;
}

const PACE_PER_REP = 3.5;
const MANUAL_THRESHOLD = 240;

function expand(block: SetPrescription[]): Step[] {
  const steps: Step[] = [];
  for (const s of block) {
    const sides = s.perSide ? ['Left side', 'Right side'] : [null];
    const seconds = s.seconds ?? Math.round(((s.reps ?? 0) * PACE_PER_REP) / 5) * 5;
    const text = s.reps !== undefined ? `${s.reps} reps` : `${s.seconds}s`;
    for (let set = 1; set <= s.sets; set++) {
      for (const side of sides) {
        const parts = [side, s.sets > 1 ? `Set ${set} of ${s.sets}` : null].filter(Boolean);
        steps.push({
          exerciseId: s.exerciseId,
          detail: parts.join(' · '),
          seconds: Math.max(10, seconds),
          manual: seconds > MANUAL_THRESHOLD,
          prescriptionText: text,
          note: s.note,
        });
      }
    }
  }
  return steps;
}

export function GuidedSequence({
  day,
  exercises,
  illustrations,
  prev,
  next,
}: {
  day: Day;
  exercises: Record<string, Exercise>;
  illustrations: Record<string, React.ReactNode>;
  prev?: string;
  next?: string;
}) {
  const steps = useMemo(() => expand(day.main), [day.main]);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(steps[0]?.seconds ?? 0);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const endsAt = useRef<number | null>(null);

  const step = steps[index];
  const isLast = index >= steps.length - 1;

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, i));
      setIndex(clamped);
      setRemaining(steps[clamped].seconds);
      endsAt.current = null;
      setRunning(false);
    },
    [steps],
  );

  const complete = useCallback(() => {
    setDayDone(day.date, true);
    setFinished(true);
    setStreak(streakEndingAt(day.date));
    setRunning(false);
  }, [day.date]);

  const advance = useCallback(() => {
    if (isLast) complete();
    else {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setRemaining(steps[nextIndex].seconds);
      // Keep going without another tap: the point is to put the phone down.
      endsAt.current = steps[nextIndex].manual ? null : Date.now() + steps[nextIndex].seconds * 1000;
      setRunning(!steps[nextIndex].manual);
    }
  }, [complete, index, isLast, steps]);

  // Wall-clock countdown, so a locked screen does not stall the sequence.
  useEffect(() => {
    if (!running || endsAt.current === null) return;
    let t = 0;
    const tick = () => {
      const left = Math.max(0, (endsAt.current! - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0) {
        if (document.visibilityState === 'visible') chime();
        advance();
        return;
      }
      t = window.setTimeout(tick, 200);
    };
    tick();
    return () => window.clearTimeout(t);
  }, [running, advance, index]);

  const toggle = () => {
    primeAudio();
    if (step.manual) {
      advance();
      return;
    }
    if (running) {
      setRunning(false);
      endsAt.current = null;
    } else {
      endsAt.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  };

  if (finished) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col justify-center px-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: 'var(--accent)' }}>
          <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
            <path className="draw-check" d="M5 12.5 L10 17.5 L19 7" fill="none" stroke="var(--accent-ink)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="mt-5 text-[24px] font-bold tracking-[-0.02em]">{day.title} done</h1>
        {streak > 1 && <p className="scoreboard mt-1 text-[15px] text-accent tabular">{streak} days in a row</p>}
        <div className="mt-8 space-y-3">
          {next && (
            <Link href={`/day/${next}`} className="tap flex items-center justify-center rounded-lg text-[16px] font-semibold" style={{ height: 52, background: 'var(--accent)', color: 'var(--accent-ink)' }}>
              Tomorrow →
            </Link>
          )}
          <button type="button" onClick={() => { setDayDone(day.date, false); setFinished(false); goTo(0); }} className="tap flex w-full items-center justify-center rounded-lg border border-line text-[14px] text-ink-quiet">
            Run it again
          </button>
        </div>
      </div>
    );
  }

  const exercise = exercises[step.exerciseId];
  const progress = step.seconds > 0 ? Math.min(1, Math.max(0, remaining / step.seconds)) : 0;
  const C = 2 * Math.PI * 54;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col px-4 pb-6 pt-5">
      <header className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
            {day.title}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-ink-faint">
            {day.dayOfWeek} · {day.estimatedMinutes} min
          </p>
        </div>
        <p className="scoreboard shrink-0 text-[13px] text-ink-quiet tabular">
          {index + 1}/{steps.length}
        </p>
      </header>

      <div className="mt-3 flex gap-[3px]" role="img" aria-label={`Step ${index + 1} of ${steps.length}`}>
        {steps.map((_, i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{ background: i < index ? 'var(--line-bright)' : i === index ? 'var(--accent)' : 'var(--line)' }}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-1 flex-col justify-center">
        <h1 className="text-center text-[24px] font-bold leading-tight tracking-[-0.02em]">{exercise.name}</h1>
        <p className="mt-1 text-center text-[14px] text-ink-quiet">
          {[step.prescriptionText, step.detail].filter(Boolean).join(' · ')}
        </p>

        <div className="mt-4 rounded-xl bg-surface">{illustrations[step.exerciseId]}</div>

        <ul className="mt-4 space-y-1.5">
          {exercise.cues.slice(0, 2).map((c) => (
            <li key={c} className="border-l-2 border-accent pl-3 text-[15px] leading-snug">
              {c}
            </li>
          ))}
        </ul>
        {step.note && <p className="mt-2 text-[13px] leading-snug text-ink-quiet">{step.note}</p>}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={toggle}
          className="tap relative mx-auto grid h-[132px] w-[132px] place-items-center"
          aria-label={
            step.manual
              ? 'Mark this step done and continue'
              : running
                ? `Pause. ${formatClock(remaining)} remaining.`
                : `Start. ${formatClock(remaining)}.`
          }
        >
          <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--line)" strokeWidth="5" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
            />
          </svg>
          <span className="relative text-center">
            <span className="scoreboard block text-[34px]">
              {step.manual ? `${Math.round(step.seconds / 60)}m` : formatClock(remaining)}
            </span>
            <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-ink-quiet">
              {step.manual ? 'Tap when done' : running ? 'Pause' : 'Start'}
            </span>
          </span>
        </button>

        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} className="tap px-3 text-[14px] text-ink-quiet disabled:opacity-30">
            ← Back
          </button>
          {prev && index === 0 && (
            <Link href={`/day/${prev}`} className="tap px-3 text-[13px] text-ink-faint">
              Yesterday
            </Link>
          )}
          <button type="button" onClick={advance} className="tap px-3 text-[14px] text-ink-quiet">
            {isLast ? 'Finish' : 'Skip →'}
          </button>
        </div>
      </div>

      {day.coachNote && (
        <aside className="mt-5 border-l-2 border-accent bg-surface py-3 pl-4 pr-3 text-[13px] leading-relaxed">
          {day.coachNote}
        </aside>
      )}
    </div>
  );
}
