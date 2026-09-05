'use client';

import { useCallback, useState } from 'react';
import type { Exercise, SetPrescription } from '@/data/types';
import { prescriptionParts } from '@/lib/format';
import { SetPips } from './SetPips';
import { RestTimer } from './RestTimer';
import { Collapsible } from './Collapsible';

/**
 * One card per main-work exercise. The prescription is the largest thing on
 * the card, the illustration sits full width beneath it, and the cues are
 * never hidden behind a tap — those are the three things he reads at 6 AM.
 */
export function ExerciseCard({
  prescription,
  exercise,
  illustration,
  done,
  onDone,
  onOpenSheet,
}: {
  prescription: SetPrescription;
  exercise: Exercise;
  illustration: React.ReactNode;
  done: number;
  onDone: (next: number) => void;
  onOpenSheet: () => void;
}) {
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const { primary, qualifier } = prescriptionParts(prescription);
  const complete = done >= prescription.sets;

  const handleChange = useCallback(
    (next: number) => {
      const advanced = next > done;
      onDone(next);
      if (advanced && prescription.restSeconds && next < prescription.sets) {
        setRestEndsAt(Date.now() + prescription.restSeconds * 1000);
      } else if (!advanced) {
        setRestEndsAt(null);
      }
    },
    [done, onDone, prescription.restSeconds, prescription.sets],
  );

  const clearRest = useCallback(() => setRestEndsAt(null), []);

  return (
    <article
      className="rounded-xl border bg-surface transition-colors duration-200"
      style={{ borderColor: complete ? 'var(--accent-line)' : 'var(--line)' }}
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-tight">{exercise.name}</h3>
          {prescription.note && <p className="mt-1 text-[13px] leading-snug text-ink-quiet">{prescription.note}</p>}
        </div>
        <button
          type="button"
          onClick={onOpenSheet}
          className="tap -mr-2 -mt-2 grid shrink-0 place-items-center text-ink-quiet"
          aria-label={`How to do ${exercise.name}`}
        >
          <span className="grid h-7 w-7 place-items-center rounded-full border border-line-bright text-[13px] font-semibold">
            ?
          </span>
        </button>
      </div>

      <div className="mt-3 flex items-end gap-3 px-4">
        <span className="scoreboard text-[42px] leading-none">{primary}</span>
        <span className="pb-1 text-[13px] leading-tight text-ink-quiet">
          {qualifier}
          {prescription.intent && (
            <span className="mt-0.5 block font-semibold text-accent">{prescription.intent} intent</span>
          )}
        </span>
      </div>

      <div className="mt-3 bg-ground">{illustration}</div>

      <div className="px-4 pb-4">
        <div className="mt-3">
          <SetPips total={prescription.sets} done={done} onChange={handleChange} label={exercise.name} />
        </div>

        {restEndsAt !== null && prescription.restSeconds && (
          <RestTimer
            endsAt={restEndsAt}
            seconds={prescription.restSeconds}
            onDone={clearRest}
            onSkip={clearRest}
          />
        )}

        <ul className="mt-4 space-y-1.5">
          {exercise.cues.map((cue) => (
            <li key={cue} className="border-l-2 border-accent pl-3 text-[14px] leading-snug">
              {cue}
            </li>
          ))}
        </ul>

        <div className="mt-2 border-t border-line">
          <Collapsible summary={<span className="text-[13px] text-ink-quiet">Common mistakes</span>}>
            <ul className="space-y-2.5 pt-1">
              {exercise.commonMistakes.map((m) => (
                <li key={m} className="text-[13px] leading-relaxed text-ink-quiet">
                  {m}
                </li>
              ))}
            </ul>
          </Collapsible>
        </div>
      </div>
    </article>
  );
}
