import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PLAN, getDay, dayNumber, daysUntilNationals, neighbours } from '@/data/plan';
import { requireExercise } from '@/data/exercises';
import { Illustration } from '@/components/illustrations/render';
import { DayView, type ExerciseMap, type IllustrationMap } from '@/components/day/DayView';
import { GuidedSequence } from '@/components/day/GuidedSequence';
import { TestDay } from '@/components/day/TestDay';
import { MatchDay } from '@/components/day/MatchDay';
import { formatDate } from '@/lib/format';

/** All 87 days are built at build time. Nothing about a day page is fetched. */
export function generateStaticParams() {
  return PLAN.map((d) => ({ date: d.date }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const day = getDay(date);
  if (!day) return { title: 'Nationals' };
  const n = dayNumber(date);
  return {
    title: `${n ? `Day ${n} · ` : ''}${day.title} · ${formatDate(date)}`,
    description: day.oneLineJob,
  };
}

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const day = getDay(date);
  if (!day) notFound();

  // Only the exercises this day uses, so the page ships its own SVGs and no more.
  const ids = [...new Set([...day.warmup, ...day.main, ...day.finish].map((s) => s.exerciseId))];

  const exercises: ExerciseMap = {};
  const illustrations: IllustrationMap = {};
  for (const id of ids) {
    const exercise = requireExercise(id);
    exercises[id] = exercise;
    illustrations[id] = <Illustration name={exercise.illustration} />;
  }

  const { prev, next } = neighbours(date);

  // Four shapes of day, because four kinds of session need four kinds of screen.
  if (day.sessionType === 'match') {
    return (
      <main>
        <MatchDay day={day} exercises={exercises} illustrations={illustrations} prev={prev} />
      </main>
    );
  }

  if (day.isTestDay) {
    return (
      <main>
        <TestDay day={day} label={day.title.replace(/^Recovery \+ /, '')} />
      </main>
    );
  }

  if (day.sessionType === 'mobility' || day.sessionType === 'recovery') {
    return (
      <main>
        <GuidedSequence day={day} exercises={exercises} illustrations={illustrations} prev={prev} next={next} />
      </main>
    );
  }

  return (
    <main>
      <DayView
        day={day}
        dayNumber={dayNumber(date)}
        daysOut={daysUntilNationals(date)}
        prev={prev}
        next={next}
        exercises={exercises}
        illustrations={illustrations}
      />
    </main>
  );
}
