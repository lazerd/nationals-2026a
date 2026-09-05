/**
 * Phase 1 gate. Asserts the transcription in src/data/plan.ts is complete and
 * internally consistent before anything gets built on top of it.
 *
 * Run: npm run validate
 */
import { PLAN, PROGRAM_DAYS, NATIONALS_DATE } from '../src/data/plan';
import { EXERCISES, getExercise } from '../src/data/exercises';
import type { Day, SetPrescription } from '../src/data/types';

const failures: string[] = [];
const warnings: string[] = [];

const fail = (m: string) => failures.push(m);
const warn = (m: string) => warnings.push(m);
const check = (label: string, ok: boolean, detail = '') =>
  ok ? results.push(['PASS', label, detail]) : (results.push(['FAIL', label, detail]), fail(label));

const results: [string, string, string][] = [];

// --- 1. Day count ----------------------------------------------------------
check(
  '84 numbered program days (Sep 7 - Nov 29)',
  PROGRAM_DAYS.length === 84,
  `found ${PROGRAM_DAYS.length}`,
);
check('2 on-ramp days (Sep 5-6)', PLAN.filter((d) => d.isOnRamp).length === 2);
check('1 match day (Nov 30)', PLAN.filter((d) => d.sessionType === 'match').length === 1);
check('87 total day pages', PLAN.length === 87, `found ${PLAN.length}`);

// --- 2. No date gaps, no duplicates, strictly ascending --------------------
const dates = PLAN.map((d) => d.date);
check('dates are unique', new Set(dates).size === dates.length);

let gapErrors = 0;
for (let i = 1; i < dates.length; i++) {
  const prev = new Date(`${dates[i - 1]}T00:00:00Z`).getTime();
  const cur = new Date(`${dates[i]}T00:00:00Z`).getTime();
  const delta = (cur - prev) / 86_400_000;
  if (delta !== 1) {
    gapErrors++;
    fail(`date gap: ${dates[i - 1]} -> ${dates[i]} is ${delta} day(s)`);
  }
}
check('no date gaps — every calendar day Sep 5 to Nov 30 present', gapErrors === 0);
check('starts 2026-09-05', dates[0] === '2026-09-05', dates[0]);
check('ends 2026-11-30', dates[dates.length - 1] === NATIONALS_DATE, dates[dates.length - 1]);

// --- 3. Every exerciseId resolves ------------------------------------------
const referenced = new Set<string>();
let unresolved = 0;
const walk = (d: Day, block: SetPrescription[], where: string) => {
  for (const s of block) {
    referenced.add(s.exerciseId);
    if (!getExercise(s.exerciseId)) {
      unresolved++;
      fail(`${d.date} ${where}: unknown exerciseId "${s.exerciseId}"`);
    }
  }
};
for (const d of PLAN) {
  walk(d, d.warmup, 'warmup');
  walk(d, d.main, 'main');
  walk(d, d.finish, 'finish');
}
check('every exerciseId resolves to the library', unresolved === 0, `${referenced.size} distinct ids referenced`);

// --- 4. Every day has main work --------------------------------------------
const empty = PLAN.filter((d) => d.main.length === 0);
check('every day has at least one main-work item', empty.length === 0, empty.map((d) => d.date).join(', '));

// --- 5. Prescription integrity ---------------------------------------------
let presErrors = 0;
for (const d of PLAN) {
  for (const s of [...d.warmup, ...d.main, ...d.finish]) {
    const hasReps = s.reps !== undefined;
    const hasSecs = s.seconds !== undefined;
    if (hasReps && hasSecs) {
      presErrors++;
      fail(`${d.date} ${s.exerciseId}: has both reps and seconds`);
    }
    if (!hasReps && !hasSecs) {
      presErrors++;
      fail(`${d.date} ${s.exerciseId}: has neither reps nor seconds`);
    }
    if (s.sets < 1) {
      presErrors++;
      fail(`${d.date} ${s.exerciseId}: sets must be >= 1`);
    }
  }
}
check('every prescription has reps XOR seconds, and sets >= 1', presErrors === 0);

// --- 6. Weekday rhythm holds -----------------------------------------------
const RHYTHM: Record<string, string[]> = {
  Monday: ['serve-a'],
  Tuesday: ['move-a'],
  Wednesday: ['mobility'],
  Thursday: ['serve-b'],
  Friday: ['move-b', 'move-a'], // Nov 27 is a light Move A by design
  Saturday: ['strength', 'mobility'], // Nov 28 is mobility by design
  Sunday: ['recovery', 'test'],
};
let rhythmErrors = 0;
for (const d of PROGRAM_DAYS) {
  const allowed = RHYTHM[d.dayOfWeek];
  if (!allowed?.includes(d.sessionType)) {
    rhythmErrors++;
    fail(`${d.date} (${d.dayOfWeek}) is "${d.sessionType}", expected one of ${allowed?.join('/')}`);
  }
}
check('weekday rhythm holds across all 84 days', rhythmErrors === 0);

// --- 7. Week numbering and blocks ------------------------------------------
const weekSizes = new Map<number, number>();
for (const d of PROGRAM_DAYS) weekSizes.set(d.weekNumber, (weekSizes.get(d.weekNumber) ?? 0) + 1);
const badWeeks = [...weekSizes.entries()].filter(([, n]) => n !== 7);
check('12 weeks of exactly 7 days', weekSizes.size === 12 && badWeeks.length === 0,
  badWeeks.map(([w, n]) => `week ${w} has ${n}`).join(', '));

const BLOCK_OF = (w: number): 1 | 2 | 3 => (w <= 4 ? 1 : w <= 8 ? 2 : 3);
const blockErrors = PROGRAM_DAYS.filter((d) => d.blockNumber !== BLOCK_OF(d.weekNumber));
check('block number matches week number', blockErrors.length === 0,
  blockErrors.map((d) => d.date).join(', '));

// --- 8. Test days ----------------------------------------------------------
const testDates = PLAN.filter((d) => d.isTestDay).map((d) => d.date);
check('test days are exactly Oct 4, Nov 1, Nov 22',
  JSON.stringify(testDates) === JSON.stringify(['2026-10-04', '2026-11-01', '2026-11-22']),
  testDates.join(', '));

// --- 9. Deload weeks -------------------------------------------------------
const deloadWeeks = [...new Set(PROGRAM_DAYS.filter((d) => d.isDeload).map((d) => d.weekNumber))].sort((a, b) => a - b);
check('deload flags land in weeks 4 and 8', JSON.stringify(deloadWeeks) === JSON.stringify([4, 8]),
  deloadWeeks.join(', '));

// --- 10. Exercise library integrity ----------------------------------------
const ids = EXERCISES.map((e) => e.id);
check('exercise ids are unique', new Set(ids).size === ids.length);

const thin = EXERCISES.filter((e) => e.commonMistakes.length < 2 || e.cues.length < 2 || e.execution.length < 3);
check('every exercise has >=3 execution steps, >=2 cues, >=2 common mistakes', thin.length === 0,
  thin.map((e) => e.id).join(', '));

const noRedFlag = EXERCISES.filter((e) => !e.redFlags);
if (noRedFlag.length) warn(`no redFlags on: ${noRedFlag.map((e) => e.id).join(', ')}`);

const illos = EXERCISES.map((e) => e.illustration);
check('every exercise names an illustration component', illos.every(Boolean) && new Set(illos).size === illos.length);

const orphans = EXERCISES.filter((e) => !referenced.has(e.id));
if (orphans.length) warn(`exercises in the library but never programmed: ${orphans.map((e) => e.id).join(', ')}`);

// --- 11. Session estimates -------------------------------------------------
const overLong = PLAN.filter((d) => d.estimatedMinutes > 30);
check('no session estimated over 30 minutes', overLong.length === 0, overLong.map((d) => d.date).join(', '));

// --- report ----------------------------------------------------------------
const W = Math.max(...results.map((r) => r[1].length));
console.log('\n  PHASE 1 — PLAN VALIDATION\n');
for (const [status, label, detail] of results) {
  const mark = status === 'PASS' ? '  ✓' : '  ✗';
  console.log(`${mark} ${label.padEnd(W)}  ${detail ? `· ${detail}` : ''}`);
}

const counts = PLAN.reduce<Record<string, number>>((acc, d) => {
  acc[d.sessionType] = (acc[d.sessionType] ?? 0) + 1;
  return acc;
}, {});
console.log('\n  Session mix:');
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${k.padEnd(10)} ${String(v).padStart(3)}`);
}
console.log(`\n  Exercise library: ${EXERCISES.length} entries, ${referenced.size} referenced by the plan.`);
const totalSets = PLAN.reduce((n, d) => n + d.warmup.length + d.main.length + d.finish.length, 0);
console.log(`  Prescriptions:    ${totalSets} across ${PLAN.length} days.`);

if (warnings.length) {
  console.log('\n  Warnings:');
  for (const w of warnings) console.log(`    ! ${w}`);
}

if (failures.length) {
  console.log(`\n  ${failures.length} FAILURE(S):`);
  for (const f of failures) console.log(`    ✗ ${f}`);
  console.log('');
  process.exit(1);
}
console.log('\n  All checks passed.\n');
