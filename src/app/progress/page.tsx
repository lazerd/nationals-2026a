import { PROGRAM_DAYS } from '@/data/plan';
import { ProgressView } from '@/components/ProgressView';

export const metadata = { title: 'Progress · Nationals' };

export default function ProgressPage() {
  return (
    <main>
      <ProgressView
        days={PROGRAM_DAYS.map((d) => ({
          date: d.date,
          sessionType: d.sessionType,
          weekNumber: d.weekNumber,
        }))}
      />
    </main>
  );
}
