import { PLAN } from '@/data/plan';
import { PlanView } from '@/components/PlanView';
import { requireExercise } from '@/data/exercises';
import { prescriptionLine } from '@/lib/format';

export const metadata = { title: 'The plan · Nationals' };

/**
 * The whole twelve weeks, flattened at build time into the smallest shape the
 * client needs — the plan data itself never reaches the browser.
 */
export default function PlanPage() {
  const rows = PLAN.map((d) => ({
    date: d.date,
    dayOfWeek: d.dayOfWeek.slice(0, 3),
    weekNumber: d.weekNumber,
    blockNumber: d.blockNumber,
    title: d.title,
    sessionType: d.sessionType,
    isDeload: d.isDeload,
    isTestDay: d.isTestDay,
    isOnRamp: d.isOnRamp ?? false,
    summary: d.main
      .map((s) => `${requireExercise(s.exerciseId).name.split(' (')[0]} ${prescriptionLine(s)}`)
      .join(' · '),
  }));

  return (
    <main>
      <PlanView rows={rows} />
    </main>
  );
}
