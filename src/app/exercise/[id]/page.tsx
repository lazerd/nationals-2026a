import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EXERCISES, getExercise } from '@/data/exercises';
import { PLAN, dayNumber } from '@/data/plan';
import { Illustration } from '@/components/illustrations/render';
import { prescriptionLine, formatDate } from '@/lib/format';
import Link from 'next/link';

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ id: e.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = getExercise(id);
  return e ? { title: `${e.name} · Nationals`, description: e.whyItMatters } : { title: 'Nationals' };
}

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exercise = getExercise(id);
  if (!exercise) notFound();

  // Every day in the program this movement appears on, with its prescription.
  const appearances = PLAN.flatMap((day) => {
    const hit = [...day.warmup, ...day.main, ...day.finish].find((s) => s.exerciseId === id);
    return hit ? [{ day, prescription: hit }] : [];
  });

  return (
    <main className="mx-auto min-h-dvh max-w-[430px] px-4 pb-20 pt-6">
      <Link href="/plan" className="tap inline-flex items-center text-[14px] text-ink-quiet">
        ← The plan
      </Link>

      <h1 className="mt-3 text-[27px] font-bold leading-[1.08] tracking-[-0.02em]">{exercise.name}</h1>
      <p className="mt-1 text-[13px] text-ink-quiet">{exercise.category}</p>

      <div className="mt-4 rounded-xl bg-surface">
        <Illustration name={exercise.illustration} />
      </div>

      <p className="mt-5 text-[16px] leading-relaxed">{exercise.whyItMatters}</p>

      <Section title="Set up">
        <p className="text-[14px] leading-relaxed text-ink-quiet">{exercise.setup}</p>
      </Section>

      <Section title="How to do it">
        <ol className="space-y-2.5">
          {exercise.execution.map((step, i) => (
            <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink-quiet">
              <span className="scoreboard w-4 shrink-0 pt-0.5 text-[13px] text-ink-faint">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Cues">
        <ul className="space-y-2">
          {exercise.cues.map((c) => (
            <li key={c} className="border-l-2 border-accent pl-3 text-[16px] leading-snug">
              {c}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Common mistakes">
        <ul className="space-y-3">
          {exercise.commonMistakes.map((m) => (
            <li key={m} className="text-[14px] leading-relaxed text-ink-quiet">{m}</li>
          ))}
        </ul>
      </Section>

      {exercise.regressions && (
        <Section title="If it is too hard, or something hurts">
          <p className="text-[14px] leading-relaxed text-ink-quiet">{exercise.regressions}</p>
        </Section>
      )}

      {exercise.redFlags && (
        <Section title="Stop if">
          <p className="rounded-lg border border-warn/40 bg-warn/10 p-3 text-[14px] leading-relaxed">
            {exercise.redFlags}
          </p>
        </Section>
      )}

      {exercise.equipment.length > 0 && (
        <Section title="Equipment">
          <p className="text-[14px] text-ink-quiet">{exercise.equipment.join(' · ')}</p>
        </Section>
      )}

      <Section title={`In the program · ${appearances.length} ${appearances.length === 1 ? 'day' : 'days'}`}>
        <ul className="divide-y divide-line">
          {appearances.map(({ day, prescription }) => {
            const n = dayNumber(day.date);
            return (
              <li key={day.date}>
                <Link href={`/day/${day.date}`} className="tap flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-[14px]">{day.title}</span>
                    <span className="block text-[12px] text-ink-faint">
                      {formatDate(day.date)}
                      {n !== null && ` · day ${n}`}
                    </span>
                  </span>
                  <span className="scoreboard shrink-0 text-[15px] tabular">{prescriptionLine(prescription)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 border-t border-line pt-4">
      <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">{title}</h2>
      {children}
    </section>
  );
}
