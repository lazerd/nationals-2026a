import { getDay, dayNumber, daysUntilNationals } from '../src/data/plan';
for (const d of process.argv.slice(2)) {
  const day = getDay(d)!;
  console.log(`\n${d} · ${day.dayOfWeek} · W${day.weekNumber} B${day.blockNumber} · ${day.title} · day ${dayNumber(d) ?? '—'}/84 · ${daysUntilNationals(d)} out · ${day.estimatedMinutes} min`);
  console.log(`  job: ${day.oneLineJob}`);
  for (const s of day.main) {
    const amt = s.reps !== undefined ? `${s.sets}×${s.reps}` : `${s.sets}×${s.seconds}s`;
    console.log(`  main: ${s.exerciseId.padEnd(28)} ${amt}${s.perSide ? '/side' : ''}${s.intent ? ` @${s.intent}` : ''}${s.restSeconds ? ` rest ${s.restSeconds}s` : ''}`);
  }
}
