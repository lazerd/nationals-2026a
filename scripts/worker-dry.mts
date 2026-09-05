/**
 * Exercises the send worker's decision logic against a fake clock, with no
 * network and no KV. This is the proof for the Nov 1 DST transition and for
 * the idempotency guard.
 */
import { decide, type Env } from '../worker/src/index';
import { subjectFor, textFor } from '../worker/src/email';
import { PLAN, getDay } from '../src/data/plan';

const env = {
  TZ: 'America/Los_Angeles',
  EMAIL_TO: 'darrinjco@gmail.com',
  EMAIL_FROM: 'Nationals <coach@clubmode.ai>',
  SITE_ORIGIN: 'https://nationals.clubmode.ai',
  SEND_HOUR: '5',
} as unknown as Env;

const CASES: [string, string][] = [
  ['2026-09-05T12:00:00Z', 'first morning of the block (PDT, UTC-7)'],
  ['2026-09-07T12:00:00Z', 'Week 1 Monday, the side toss'],
  ['2026-10-04T12:00:00Z', 'baseline test day'],
  ['2026-10-19T12:00:00Z', 'hardest day in the program'],
  ['2026-10-31T12:00:00Z', 'DAY BEFORE DST ENDS — 12:00 UTC is 5 AM PDT'],
  ['2026-11-01T12:00:00Z', 'DST HAS ENDED — 12:00 UTC is now 4 AM PST, must NOT send'],
  ['2026-11-01T13:00:00Z', 'DST HAS ENDED — 13:00 UTC is 5 AM PST, must send'],
  ['2026-11-22T13:00:00Z', 'final test day (PST)'],
  ['2026-11-30T13:00:00Z', 'Nationals'],
  ['2026-12-01T13:00:00Z', 'the morning after: program complete'],
  ['2026-12-02T13:00:00Z', 'after the program: silent forever'],
  ['2026-10-19T14:00:00Z', 'wrong hour (7 AM local)'],
  ['2026-10-19T13:00:00Z', 'catch-up: 6 AM local and nothing sent yet'],
];

console.log('\n  DRY RUN — send decisions\n');
console.log(
  `  ${'UTC instant'.padEnd(22)}${'local'.padEnd(18)}${'action'.padEnd(18)}subject`,
);
console.log(`  ${'-'.repeat(100)}`);

for (const [iso, note] of CASES) {
  const d = await decide(env, new Date(iso), false);
  console.log(
    `  ${iso.padEnd(22)}${`${d.localDate} ${String(d.localHour).padStart(2, '0')}:00`.padEnd(18)}${d.action.padEnd(18)}${(d.subject ?? '—').slice(0, 44)}`,
  );
  console.log(`  ${' '.repeat(22)}${note}`);
}

// --- assertions -----------------------------------------------------------
let failures = 0;
const check = async (label: string, fn: () => Promise<boolean> | boolean) => {
  const ok = await fn();
  if (!ok) failures++;
  console.log(`  ${ok ? '✓' : '✗'} ${label}`);
};

console.log('\n  Assertions\n');

await check('Oct 31 at 12:00 UTC is 5 AM local and sends', async () =>
  (await decide(env, new Date('2026-10-31T12:00:00Z'), false)).action === 'send');

await check('Nov 1 at 12:00 UTC is 4 AM local and does NOT send', async () => {
  const d = await decide(env, new Date('2026-11-01T12:00:00Z'), false);
  return d.action === 'wrong-hour' && d.localHour === 4;
});

await check('Nov 1 at 13:00 UTC is 5 AM local and sends', async () => {
  const d = await decide(env, new Date('2026-11-01T13:00:00Z'), false);
  return d.action === 'send' && d.localHour === 5;
});

await check('running twice in the same hour sends exactly once', async () => {
  const first = await decide(env, new Date('2026-09-14T12:00:00Z'), false);
  const second = await decide(env, new Date('2026-09-14T12:20:00Z'), true);
  return first.action === 'send' && second.action === 'already-sent';
});

await check('6 AM local with nothing sent triggers one catch-up', async () =>
  (await decide(env, new Date('2026-10-19T13:00:00Z'), false)).action === 'catch-up');

await check('6 AM local after a successful 5 AM send does nothing', async () =>
  (await decide(env, new Date('2026-10-19T13:00:00Z'), true)).action === 'already-sent');

await check('7 AM local does not send', async () =>
  (await decide(env, new Date('2026-10-19T14:00:00Z'), false)).action === 'wrong-hour');

await check('Dec 1 sends the program-complete email', async () =>
  (await decide(env, new Date('2026-12-01T13:00:00Z'), false)).action === 'send');

await check('nothing sends after Dec 1', async () =>
  (await decide(env, new Date('2026-12-02T13:00:00Z'), false)).action === 'after-program');

await check('nothing sends before Sep 5', async () =>
  (await decide(env, new Date('2026-09-04T12:00:00Z'), false)).action === 'nothing-scheduled');

await check('every hour of a full day yields exactly one send', async () => {
  let sends = 0;
  let alreadySent = false;
  for (let h = 0; h < 24; h++) {
    const d = await decide(env, new Date(`2026-10-19T${String(h).padStart(2, '0')}:00:00Z`), alreadySent);
    if (d.action === 'send' || d.action === 'catch-up') {
      sends++;
      alreadySent = true;
    }
  }
  return sends === 1;
});

await check('all 87 days produce a subject and a body linking to their own page', () =>
  PLAN.every((day) => {
    const s = subjectFor(day);
    const t = textFor(day, env.SITE_ORIGIN);
    return s.length > 10 && s.length < 120 && t.includes(`/day/${day.date}`);
  }));

await check('the three test days carry the TEST DAY prefix', () =>
  ['2026-10-04', '2026-11-01', '2026-11-22'].every((d) => subjectFor(getDay(d)!).startsWith('📊 TEST DAY')));

await check('Nov 30 gets its own subject, not a numbered training day', () =>
  !subjectFor(getDay('2026-11-30')!).includes('Day '));

console.log('');
if (failures) {
  console.log(`  ${failures} FAILURE(S)\n`);
  process.exit(1);
}
console.log('  All assertions passed.\n');
