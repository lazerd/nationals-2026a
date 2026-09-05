'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Day, Exercise, SetPrescription } from '@/data/types';
import { blockMinutes, prescriptionLine } from '@/lib/format';
import { keys, setDayDone, streakEndingAt, usePersistentState } from '@/lib/storage';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseSheet } from './ExerciseSheet';
import { Collapsible } from './Collapsible';
import { ProgressRail } from './ProgressRail';

export type ExerciseMap = Record<string, Exercise>;
export type IllustrationMap = Record<string, React.ReactNode>;

/** Stable per-day key for a prescription's completed-set count. */
const slotKey = (block: string, i: number, s: SetPrescription) => `${block}:${i}:${s.exerciseId}`;

export function DayView({
  day,
  dayNumber,
  daysOut,
  prev,
  next,
  exercises,
  illustrations,
}: {
  day: Day;
  dayNumber: number | null;
  daysOut: number;
  prev?: string;
  next?: string;
  exercises: ExerciseMap;
  illustrations: IllustrationMap;
}) {
  const [sets, setSets, ready] = usePersistentState<Record<string, number>>(keys.sets(day.date), {});
  const [done, setDone] = usePersistentState<boolean>(keys.done(day.date), false);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  const totalMainSets = useMemo(() => day.main.reduce((n, s) => n + s.sets, 0), [day.main]);
  const completedMainSets = useMemo(
    () => day.main.reduce((n, s, i) => n + Math.min(s.sets, sets[slotKey('main', i, s)] ?? 0), 0),
    [day.main, sets],
  );
  const allMainDone = completedMainSets >= totalMainSets;

  const update = useCallback(
    (key: string, value: number) => setSets((prev) => ({ ...prev, [key]: value })),
    [setSets],
  );

  const finish = useCallback(() => {
    // Write first so the streak count below sees today already marked.
    setDayDone(day.date, true);
    setDone(true);
    setStreak(streakEndingAt(day.date));
  }, [day.date, setDone]);

  const reopen = useCallback(() => {
    setDayDone(day.date, false);
    setDone(false);
    setStreak(0);
  }, [day.date, setDone]);

  const sheetExercise = sheetId ? exercises[sheetId] : null;

  return (
    <div className="mx-auto min-h-dvh max-w-[430px] px-4 pb-40 pt-6">
      <header>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
            {day.weekNumber === 0 ? 'On-ramp' : `Week ${day.weekNumber}`}
            {dayNumber !== null && ` · Day ${dayNumber}`}
          </p>
          <p className="scoreboard text-[13px] text-ink-quiet tabular">
            {daysOut === 0 ? 'Today' : `${daysOut} days out`}
          </p>
        </div>

        <h1 className="mt-1.5 text-[27px] font-bold leading-[1.08] tracking-[-0.02em]">{day.title}</h1>

        <p className="mt-1 text-[13px] text-ink-quiet">
          {day.dayOfWeek} · {day.estimatedMinutes} min
          {day.isDeload && ' · deload'}
        </p>

        <div className="mt-4">
          <ProgressRail current={dayNumber} />
        </div>
      </header>

      <p className="mt-6 rounded-lg border border-line-bright px-4 py-3.5 text-[17px] font-medium leading-snug">
        {day.oneLineJob}
      </p>

      {day.warmup.length > 0 && (
        <div className="mt-6">
          <BlockSummary title="Warm-up" block={day.warmup} exercises={exercises} illustrations={illustrations} />
        </div>
      )}

      <section className="mt-6" aria-label="Main work">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">Main work</h2>
          <span className="scoreboard text-[13px] text-ink-faint tabular">
            {ready ? completedMainSets : 0}/{totalMainSets}
          </span>
        </div>

        <div className="space-y-4">
          {day.main.map((s, i) => {
            const key = slotKey('main', i, s);
            const exercise = exercises[s.exerciseId];
            return (
              <ExerciseCard
                key={key}
                prescription={s}
                exercise={exercise}
                illustration={illustrations[s.exerciseId]}
                done={ready ? Math.min(s.sets, sets[key] ?? 0) : 0}
                onDone={(n) => update(key, n)}
                onOpenSheet={() => setSheetId(s.exerciseId)}
              />
            );
          })}
        </div>
      </section>

      {day.finish.length > 0 && (
        <div className="mt-6">
          <BlockSummary title="Finisher" block={day.finish} exercises={exercises} illustrations={illustrations} />
        </div>
      )}

      {day.coachNote && (
        <aside className="mt-6 border-l-2 border-accent bg-surface py-3 pl-4 pr-3 text-[14px] leading-relaxed text-ink">
          {day.coachNote}
        </aside>
      )}

      <nav className="mt-8 flex items-center justify-between border-t border-line pt-3 text-[14px]">
        {prev ? (
          <a href={`/day/${prev}`} className="tap flex items-center pr-3 text-ink-quiet">
            ← Yesterday
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={`/day/${next}`} className="tap flex items-center pl-3 text-ink-quiet">
            Tomorrow →
          </a>
        ) : (
          <span />
        )}
      </nav>

      <DoneBar
        ready={ready}
        done={done}
        enabled={allMainDone}
        remaining={totalMainSets - completedMainSets}
        streak={streak}
        onFinish={finish}
        onReopen={reopen}
      />

      {sheetExercise && (
        <ExerciseSheet
          exercise={sheetExercise}
          illustration={illustrations[sheetExercise.id]}
          onClose={() => setSheetId(null)}
        />
      )}
    </div>
  );
}

/** Warm-up and finisher: one row with the time and the movement names, tap to open. */
function BlockSummary({
  title,
  block,
  exercises,
  illustrations,
}: {
  title: string;
  block: SetPrescription[];
  exercises: ExerciseMap;
  illustrations: IllustrationMap;
}) {
  return (
    <Collapsible
      tone="card"
      detail={`${blockMinutes(block)} min`}
      summary={
        <>
          <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">{title}</span>
          <span className="mt-0.5 block truncate text-[13px] text-ink-faint">
            {block.map((s) => exercises[s.exerciseId]?.name ?? s.exerciseId).join(', ')}
          </span>
        </>
      }
    >
      <ul className="space-y-4 pt-1">
        {block.map((s, i) => {
          const ex = exercises[s.exerciseId];
          return (
            <li key={`${s.exerciseId}-${i}`}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[14px] font-medium">{ex?.name ?? s.exerciseId}</span>
                <span className="scoreboard shrink-0 text-[15px] tabular">{prescriptionLine(s)}</span>
              </div>
              {s.note && <p className="mt-0.5 text-[12px] leading-snug text-ink-quiet">{s.note}</p>}
              <div className="mt-2 rounded bg-ground">{illustrations[s.exerciseId]}</div>
            </li>
          );
        })}
      </ul>
    </Collapsible>
  );
}

/** Sticky bottom bar. Only enables once every main-work set is ticked. */
function DoneBar({
  ready,
  done,
  enabled,
  remaining,
  streak,
  onFinish,
  onReopen,
}: {
  ready: boolean;
  done: boolean;
  enabled: boolean;
  remaining: number;
  streak: number;
  onFinish: () => void;
  onReopen: () => void;
}) {
  if (done) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ground/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[430px] items-center gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full" style={{ background: 'var(--accent)' }}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path
                className="draw-check"
                d="M5 12.5 L10 17.5 L19 7"
                fill="none"
                stroke="var(--accent-ink)"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">Session done</p>
            {streak > 1 && <p className="scoreboard text-[13px] text-accent tabular">{streak} days in a row</p>}
          </div>
          <button type="button" onClick={onReopen} className="tap shrink-0 px-3 text-[13px] text-ink-quiet">
            Undo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ground/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[430px] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={onFinish}
          disabled={!ready || !enabled}
          className="tap flex w-full items-center justify-center rounded-lg text-[16px] font-semibold transition-colors duration-150 disabled:cursor-default"
          style={{
            height: 52,
            background: enabled ? 'var(--accent)' : 'var(--surface-2)',
            color: enabled ? 'var(--accent-ink)' : 'var(--ink-faint)',
          }}
        >
          {enabled ? 'Mark session done' : `${remaining} set${remaining === 1 ? '' : 's'} to go`}
        </button>
      </div>
    </div>
  );
}
