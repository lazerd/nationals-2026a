'use client';

import { useEffect, useRef } from 'react';
import type { Exercise } from '@/data/types';

/** The full detail sheet behind the ? on each card. */
export function ExerciseSheet({
  exercise,
  illustration,
  onClose,
}: {
  exercise: Exercise;
  illustration: React.ReactNode;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    panel.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={exercise.name}>
      <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close" onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        className="relative max-h-[88vh] w-full max-w-[430px] overflow-y-auto rounded-t-2xl border-t border-line bg-surface pb-10"
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-line bg-surface px-4 py-3">
          <h2 className="text-[17px] font-semibold leading-tight">{exercise.name}</h2>
          <button type="button" onClick={onClose} className="tap -mr-2 -mt-2 shrink-0 px-3 text-sm text-ink-quiet">
            Close
          </button>
        </div>

        <div className="px-4">
          <div className="mt-3 rounded-lg bg-ground">{illustration}</div>

          <p className="mt-4 text-[15px] leading-relaxed text-ink">{exercise.whyItMatters}</p>

          <Section title="Set up">
            <p className="text-[14px] leading-relaxed text-ink-quiet">{exercise.setup}</p>
          </Section>

          <Section title="How to do it">
            <ol className="space-y-2">
              {exercise.execution.map((step, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink-quiet">
                  <span className="scoreboard w-4 shrink-0 pt-0.5 text-[13px] text-ink-faint">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Cues">
            <ul className="space-y-1.5">
              {exercise.cues.map((c) => (
                <li key={c} className="border-l-2 border-accent pl-3 text-[14px] leading-snug text-ink">
                  {c}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Common mistakes">
            <ul className="space-y-2.5">
              {exercise.commonMistakes.map((m) => (
                <li key={m} className="text-[14px] leading-relaxed text-ink-quiet">
                  {m}
                </li>
              ))}
            </ul>
          </Section>

          {exercise.regressions && (
            <Section title="If it is too hard">
              <p className="text-[14px] leading-relaxed text-ink-quiet">{exercise.regressions}</p>
            </Section>
          )}

          {exercise.redFlags && (
            <Section title="Stop if">
              <p className="rounded-lg border border-warn/40 bg-warn/10 p-3 text-[14px] leading-relaxed text-ink">
                {exercise.redFlags}
              </p>
            </Section>
          )}

          {exercise.equipment.length > 0 && (
            <Section title="Equipment">
              <p className="text-[14px] text-ink-quiet">{exercise.equipment.join(' · ')}</p>
            </Section>
          )}

          <a
            href={`/exercise/${exercise.id}`}
            className="tap mt-6 flex items-center justify-center rounded-lg border border-line text-[14px] text-ink-quiet"
          >
            Open the full page for this exercise
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 border-t border-line pt-4">
      <h3 className="mb-2 text-[13px] font-semibold text-ink-quiet">{title}</h3>
      {children}
    </section>
  );
}
