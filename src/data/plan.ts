import type { Day, SetPrescription } from './types';

/**
 * THE PROGRAM.
 *
 * Transcribed from `12-week-nationals-plan.md` at the repo root. Every set,
 * rep, second and intent below appears in that document. Nothing here is
 * rounded, improved, or invented.
 *
 * Two deliberate decisions, both flagged rather than hidden:
 *
 * 1. ON-RAMP. The source plan runs Mon Sep 7 - Sun Nov 29 with Nationals on
 *    Mon Nov 30, and its whole structure is weekday-locked (Mon = Serve A ...
 *    Sun = Recovery) with a taper engineered to land on match day. To start
 *    on Sat Sep 5 without shifting that, Sep 5 and Sep 6 run Week 1's own
 *    Saturday and Sunday prescriptions verbatim as `weekNumber: 0`,
 *    `isOnRamp: true`. Week 1 then opens on Mon Sep 7 exactly as written.
 *    To switch to a hard two-day shift instead, drop ON_RAMP below.
 *
 * 2. REST. `restSeconds` is set only where the source states a rest: 45s on
 *    max-intent throwing and jumping work (the number the plan itself gives
 *    in Week 5) and 60s on the 5-10-5 ("rest a full minute"). Everywhere the
 *    plan says "full reset" without a number, `restSeconds` is left unset and
 *    the instruction lives in the prescription note instead.
 */

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** Deterministic, timezone-free: plan dates are calendar labels, not instants. */
function dayOfWeek(date: string): string {
  return DAY_NAMES[new Date(`${date}T00:00:00Z`).getUTCDay()];
}

const p = (
  exerciseId: string,
  sets: number,
  o: Partial<Omit<SetPrescription, 'exerciseId' | 'sets'>> = {},
): SetPrescription => ({ exerciseId, sets, perSide: false, ...o });

// ---------------------------------------------------------------------------
// Fixed blocks. These are identical every week; only the main work changes.
// ---------------------------------------------------------------------------

/** Serve A warm-up, 4 min. */
const WARMUP_SERVE_A: SetPrescription[] = [
  p('band-external-rotation', 2, { reps: 15, perSide: true, note: 'Elbow pinned to the ribs. Slow.' }),
  p('band-pull-apart', 2, { reps: 15 }),
  p('thoracic-open-book', 1, { reps: 10, perSide: true, note: 'Knees stacked. Follow your hand with your eyes.' }),
  p('racket-wrist-snap', 1, { reps: 20, intent: 'easy', note: 'Just the last six inches of the serve.' }),
];

/** Serve A finish, 2 min. */
const FINISH_SERVE_A: SetPrescription[] = [
  p('cross-body-shoulder-stretch', 1, { seconds: 30, perSide: true }),
  p('sleeper-stretch', 1, { seconds: 30, perSide: true }),
];

/** Serve B warm-up, 4 min. */
const WARMUP_SERVE_B: SetPrescription[] = [
  p('ankle-rocker', 1, { reps: 10, perSide: true, note: 'Heel stays down.' }),
  p('worlds-greatest-stretch', 1, { reps: 5, perSide: true }),
  p('jump-rope', 1, { seconds: 30, intent: 'easy' }),
];

/** Serve B finish, 2 min. */
const FINISH_SERVE_B: SetPrescription[] = [
  p('wrist-flexor-stretch', 1, { seconds: 30, perSide: true, note: 'Then shake the forearm out loose.' }),
];

/**
 * Move A warm-up. The source lists pogo hops here too, but they carry a
 * weekly set/rep progression like main work, so they run in `main` where they
 * stay visible instead of collapsed behind a tap.
 */
const WARMUP_MOVE_A: SetPrescription[] = [
  p('leg-swing', 2, { reps: 10, perSide: true, note: '10 front-to-back, then 10 side-to-side.' }),
];

/** Move A finish, 2 min. Groin insurance for lunging volleys. */
const FINISH_MOVE_A: SetPrescription[] = [
  p('copenhagen-plank', 1, { seconds: 30, perSide: true, note: '20-30s. Knee-supported version is fine.' }),
];

/** Move B warm-up, 4 min. */
const WARMUP_MOVE_B: SetPrescription[] = [
  p('jump-rope', 1, { seconds: 60 }),
  p('a-skip', 2, { reps: 15 }),
  p('hip-opener', 1, { reps: 5, perSide: true }),
];

/** Move B finish, 2 min. */
const FINISH_MOVE_B: SetPrescription[] = [
  p('calf-stretch', 1, { seconds: 30, perSide: true }),
  p('hip-flexor-stretch', 1, { seconds: 30, perSide: true }),
];

/** Wednesday's full mobility sequence. 20 minutes, no rushing. */
const MOBILITY_SEQUENCE: SetPrescription[] = [
  p('thoracic-rotation-quadruped', 1, { reps: 10, perSide: true }),
  p('hip-90-90-switch', 1, { reps: 15, note: 'Slow switches. Sit tall.' }),
  p('couch-stretch', 1, { seconds: 60, perSide: true }),
  p('shoulder-car', 1, { reps: 5, perSide: true, note: 'Slowest possible full circle.' }),
  p('sleeper-stretch', 1, { seconds: 45, perSide: true }),
  p('cross-body-shoulder-stretch', 1, { seconds: 45, perSide: true }),
  p('band-external-rotation', 2, { reps: 15, perSide: true }),
  p('band-internal-rotation', 2, { reps: 15, perSide: true }),
  p('band-scaption', 2, { reps: 15 }),
  p('dead-hang', 2, { seconds: 30, note: 'If you have a bar. Optional.' }),
];

/** Sunday's recovery sequence. */
const RECOVERY_SEQUENCE: SetPrescription[] = [
  p('easy-aerobic', 1, { seconds: 780, intent: 'easy', note: '12-15 min. Nasal breathing only.' }),
  p('foam-roll', 1, { seconds: 300, note: 'Calves, quads, lats, upper back.' }),
  p('band-external-rotation', 2, { reps: 15, perSide: true, note: 'Cuff work every single Sunday, forever.' }),
  p('visualization', 1, { seconds: 300 }),
];

// ---------------------------------------------------------------------------
// Day builders. Each session type has a fixed title, warm-up and finisher;
// only the main work and the day's job change week to week.
// ---------------------------------------------------------------------------

interface DayInput {
  date: string;
  week: number;
  block: 1 | 2 | 3;
  job: string;
  main: SetPrescription[];
  note?: string;
  deload?: boolean;
  minutes?: number;
  onRamp?: boolean;
}

type Shape = {
  sessionType: Day['sessionType'];
  title: string;
  warmup: SetPrescription[];
  finish: SetPrescription[];
};

const SHAPES: Record<string, Shape> = {
  serveA: { sessionType: 'serve-a', title: 'Serve A — Rotation', warmup: WARMUP_SERVE_A, finish: FINISH_SERVE_A },
  serveB: { sessionType: 'serve-b', title: 'Serve B — Leg Drive', warmup: WARMUP_SERVE_B, finish: FINISH_SERVE_B },
  moveA: { sessionType: 'move-a', title: 'Move A — First Step', warmup: WARMUP_MOVE_A, finish: FINISH_MOVE_A },
  moveB: { sessionType: 'move-b', title: 'Move B — React & Decelerate', warmup: WARMUP_MOVE_B, finish: FINISH_MOVE_B },
  strength: { sessionType: 'strength', title: 'Strength', warmup: [], finish: [] },
  mobility: { sessionType: 'mobility', title: 'Mobility & Prehab', warmup: [], finish: [] },
  recovery: { sessionType: 'recovery', title: 'Recovery', warmup: [], finish: [] },
  test: { sessionType: 'test', title: 'Recovery + Test', warmup: [], finish: [] },
  match: { sessionType: 'match', title: 'Nationals', warmup: [], finish: [] },
};

function mk(shape: keyof typeof SHAPES, d: DayInput): Day {
  const s = SHAPES[shape];
  return {
    date: d.date,
    weekNumber: d.week,
    blockNumber: d.block,
    dayOfWeek: dayOfWeek(d.date),
    sessionType: s.sessionType,
    title: s.title,
    oneLineJob: d.job,
    estimatedMinutes: d.minutes ?? 20,
    isDeload: d.deload ?? false,
    isTestDay: s.sessionType === 'test',
    ...(d.onRamp ? { isOnRamp: true } : {}),
    warmup: s.warmup,
    main: d.main,
    finish: s.finish,
    ...(d.note ? { coachNote: d.note } : {}),
  };
}

/** Wednesday's session, identical every week apart from the coach note. */
const mobilityDay = (date: string, week: number, block: 1 | 2 | 3, note?: string): Day =>
  mk('mobility', {
    date,
    week,
    block,
    job: 'Move slowly. This is a training day, not a day off.',
    main: MOBILITY_SEQUENCE,
    note,
  });

/** Sunday's session, identical every week apart from the coach note. */
const recoveryDay = (date: string, week: number, block: 1 | 2 | 3, note?: string, onRamp?: boolean): Day =>
  mk('recovery', {
    date,
    week,
    block,
    job: 'Easy enough to hold a conversation the whole way.',
    main: RECOVERY_SEQUENCE,
    note,
    minutes: 20,
    onRamp,
  });

/** Oct 4, Nov 1, Nov 22. Recovery sequence plus the measurement form. */
const testDay = (date: string, week: number, block: 1 | 2 | 3, label: string, note: string): Day => ({
  ...mk('test', {
    date,
    week,
    block,
    job: 'Same warm-up, same time of day. Write every number down.',
    main: RECOVERY_SEQUENCE,
    note,
    minutes: 30,
  }),
  title: `Recovery + ${label}`,
});

// ---------------------------------------------------------------------------
// ON-RAMP — Sep 5-6. Week 1's Saturday and Sunday, run two days early so the
// program starts today without shifting the weekday rhythm or the taper.
// ---------------------------------------------------------------------------

const ON_RAMP: Day[] = [
  mk('strength', {
    date: '2026-09-05',
    week: 0,
    block: 1,
    job: 'Injury insurance. Straight through, minimal rest.',
    main: [
      p('eccentric-heel-raise', 3, { reps: 10, perSide: true, note: 'Up on two feet, down on one. Three seconds down.' }),
      p('split-squat', 3, { reps: 8, perSide: true }),
      p('single-leg-rdl', 2, { reps: 8, perSide: true }),
      p('pallof-press', 2, { seconds: 20, perSide: true }),
      p('push-up', 2, { reps: 10 }),
    ],
    minutes: 14,
    onRamp: true,
    note: 'Week 1 opens Monday. This is Saturday’s session, run early so you start today rather than waiting. Nothing here needs to be heavy.',
  }),
  recoveryDay(
    '2026-09-06',
    0,
    1,
    'Second on-ramp day. Sleep well tonight — Week 1 starts tomorrow with the drill that matters most, the side toss.',
    true,
  ),
];

// ---------------------------------------------------------------------------
// BLOCK 1 — Build the Chassis (Weeks 1-4, Sep 7 - Oct 4)
// Tissue tolerance, mobility, clean patterns. Moderate intent. Do not chase
// speed yet.
// ---------------------------------------------------------------------------

const BLOCK_1: Day[] = [
  // ---- Week 1 (Sep 7-13) --------------------------------------------------
  mk('serveA', {
    date: '2026-09-07',
    week: 1,
    block: 1,
    job: 'Learn the sequence at 70%. Back hip fires first, arms last.',
    main: [
      p('rotational-wall-throw', 3, { reps: 5, perSide: true, intent: '70%', note: 'Full reset between reps.' }),
      p('half-kneeling-slam', 3, { reps: 5, note: 'Ribs down. Do not arch the low back.' }),
      p('weighted-shadow-serve', 3, { reps: 8, note: 'Weighted racket. Slow into the trophy, fast out of it.' }),
    ],
    note: 'Day one. Nothing today is about speed — it is about feeling the hip move before the chest does. If you only take one thing from this program, take that.',
  }),
  mk('moveA', {
    date: '2026-09-08',
    week: 1,
    block: 1,
    job: 'Land already loaded. Do not land, then think.',
    main: [
      p('pogo-hop', 3, { reps: 20, note: 'Stiff ankles, minimal knee bend.' }),
      p('split-step-lateral-pushoff', 1, { reps: 6, perSide: true, note: 'Alternate directions.' }),
      p('skater-bound', 3, { reps: 5, perSide: true, note: 'Stick each landing for one full second.' }),
      p('wall-shuffle', 3, { seconds: 10 }),
    ],
  }),
  mobilityDay('2026-09-09', 1, 1),
  mk('serveB', {
    date: '2026-09-10',
    week: 1,
    block: 1,
    job: 'Drive from the ground. Full triple extension.',
    main: [
      p('serve-stance-jump', 3, { reps: 4, note: 'Your exact serve stance. Up and forward-left.' }),
      p('scoop-toss', 3, { reps: 5, note: 'Check the space behind you first.' }),
      p('split-squat', 3, { reps: 8, perSide: true, note: 'Three seconds down, fast up.' }),
      p('pronation-snap', 2, { reps: 12, perSide: true, note: 'Fast to palm-down, slow back.' }),
    ],
  }),
  mk('moveB', {
    date: '2026-09-11',
    week: 1,
    block: 1,
    job: 'Brake hard. If you cannot stop, you will not go.',
    main: [
      p('mini-5-10-5', 2, { reps: 1, restSeconds: 60, note: 'Rest a full minute between reps.' }),
      p('drop-step-retreat', 1, { reps: 5, perSide: true }),
      p('deceleration-drop', 1, { reps: 5, note: 'Hold the low position for two full seconds.' }),
      p('ball-drop-reaction', 1, { reps: 10, note: 'Start a step further back each rep.' }),
    ],
  }),
  mk('strength', {
    date: '2026-09-12',
    week: 1,
    block: 1,
    job: 'Injury insurance. Straight through, minimal rest.',
    main: [
      p('eccentric-heel-raise', 3, { reps: 10, perSide: true, note: 'Up on two feet, down on one. Three seconds down.' }),
      p('split-squat', 3, { reps: 8, perSide: true }),
      p('single-leg-rdl', 2, { reps: 8, perSide: true }),
      p('pallof-press', 2, { seconds: 20, perSide: true }),
      p('push-up', 2, { reps: 10 }),
    ],
    minutes: 14,
  }),
  recoveryDay('2026-09-13', 1, 1),

  // ---- Week 2 (Sep 14-20) -------------------------------------------------
  mk('serveA', {
    date: '2026-09-14',
    week: 2,
    block: 1,
    job: 'Same sequence at 80%. The chest still waits for the hip.',
    main: [
      p('rotational-wall-throw', 4, { reps: 5, perSide: true, intent: '80%', note: 'Full reset between reps.' }),
      p('half-kneeling-slam', 3, { reps: 5 }),
      p('weighted-shadow-serve', 3, { reps: 8, note: 'Weighted racket.' }),
      p('live-serve', 1, { reps: 4, intent: 'max', note: 'Plain racket, full effort. Wake the pattern up.' }),
    ],
  }),
  mk('moveA', {
    date: '2026-09-15',
    week: 2,
    block: 1,
    job: 'The crossover beats the shuffle for anything more than a step.',
    main: [
      p('pogo-hop', 3, { reps: 25 }),
      p('split-step-lateral-pushoff', 1, { reps: 8, perSide: true }),
      p('skater-bound', 3, { reps: 6, perSide: true, note: 'Stick each landing for one full second.' }),
      p('crossover-step-start', 1, { reps: 5, perSide: true, note: 'First step crosses the body.' }),
    ],
  }),
  mobilityDay('2026-09-16', 2, 1),
  mk('serveB', {
    date: '2026-09-17',
    week: 2,
    block: 1,
    job: 'Your back leg is a spring. Load it, then release it.',
    main: [
      p('serve-stance-jump', 4, { reps: 4 }),
      p('scoop-toss', 3, { reps: 5 }),
      p('split-squat', 3, { reps: 8, perSide: true }),
      p('pronation-snap', 3, { reps: 12, perSide: true }),
    ],
  }),
  mk('moveB', {
    date: '2026-09-18',
    week: 2,
    block: 1,
    job: 'Get behind the lob, then swing. Do not backpedal.',
    main: [
      p('mini-5-10-5', 2, { reps: 1, restSeconds: 60, note: 'Rest a full minute between reps.' }),
      p('drop-step-retreat', 1, { reps: 6, perSide: true }),
      p('deceleration-drop', 1, { reps: 6 }),
      p('ball-drop-reaction', 1, { reps: 12 }),
    ],
  }),
  mk('strength', {
    date: '2026-09-19',
    week: 2,
    block: 1,
    job: 'Injury insurance. Straight through, minimal rest.',
    main: [
      p('eccentric-heel-raise', 3, { reps: 12, perSide: true }),
      p('split-squat', 3, { reps: 10, perSide: true }),
      p('single-leg-rdl', 3, { reps: 8, perSide: true }),
      p('pallof-press', 3, { seconds: 20, perSide: true }),
      p('push-up', 3, { reps: 10 }),
    ],
    minutes: 14,
  }),
  recoveryDay('2026-09-20', 2, 1),

  // ---- Week 3 (Sep 21-27) -------------------------------------------------
  mk('serveA', {
    date: '2026-09-21',
    week: 3,
    block: 1,
    job: '85% today, and a new drill: the throw with a step into it.',
    main: [
      p('rotational-wall-throw', 4, { reps: 5, perSide: true, intent: '85%' }),
      p('step-behind-rotational-throw', 2, { reps: 4, perSide: true, note: 'New this week. Arrive already loaded.' }),
      p('half-kneeling-slam', 3, { reps: 6 }),
      p('weighted-shadow-serve', 3, { reps: 8 }),
    ],
    note: 'The step-behind throw is new. Take the first set slowly — if your chest opens during the shuffle step, you have spent your separation before the throw even starts.',
  }),
  mk('moveA', {
    date: '2026-09-22',
    week: 3,
    block: 1,
    job: 'Quiet feet. Loud landings are slow landings.',
    main: [
      p('pogo-hop', 3, { reps: 25 }),
      p('split-step-lateral-pushoff', 1, { reps: 8, perSide: true }),
      p('skater-bound', 4, { reps: 6, perSide: true }),
      p('wall-shuffle', 4, { seconds: 10 }),
    ],
  }),
  mobilityDay('2026-09-23', 3, 1),
  mk('serveB', {
    date: '2026-09-24',
    week: 3,
    block: 1,
    job: 'Everything straightens at once. Ankles, knees, hips.',
    main: [
      p('serve-stance-jump', 4, { reps: 5 }),
      p('scoop-toss', 4, { reps: 5 }),
      p('split-squat', 3, { reps: 10, perSide: true }),
      p('pronation-snap', 3, { reps: 12, perSide: true }),
    ],
  }),
  mk('moveB', {
    date: '2026-09-25',
    week: 3,
    block: 1,
    job: 'Three shuttles today. Get low into the turns.',
    main: [
      p('mini-5-10-5', 3, { reps: 1, restSeconds: 60, note: 'Rest a full minute between reps.' }),
      p('drop-step-retreat', 1, { reps: 6, perSide: true }),
      p('deceleration-drop', 1, { reps: 6 }),
      p('ball-drop-reaction', 1, { reps: 12 }),
    ],
  }),
  mk('strength', {
    date: '2026-09-26',
    week: 3,
    block: 1,
    job: 'Injury insurance. Straight through, minimal rest.',
    main: [
      p('eccentric-heel-raise', 3, { reps: 12, perSide: true }),
      p('split-squat', 3, { reps: 10, perSide: true, note: 'Loaded — hold anything heavy.' }),
      p('single-leg-rdl', 3, { reps: 8, perSide: true }),
      p('pallof-press', 3, { seconds: 25, perSide: true }),
      p('push-up', 3, { reps: 12 }),
    ],
    minutes: 14,
  }),
  recoveryDay('2026-09-27', 3, 1),

  // ---- Week 4 (Sep 28 - Oct 4) — deload -----------------------------------
  mk('serveA', {
    date: '2026-09-28',
    week: 4,
    block: 1,
    job: 'Half the sets, full intent. Deload week.',
    main: [
      p('rotational-wall-throw', 2, { reps: 5, perSide: true, intent: 'max' }),
      p('half-kneeling-slam', 2, { reps: 5 }),
      p('weighted-shadow-serve', 2, { reps: 8 }),
    ],
    deload: true,
    minutes: 15,
    note: 'Deload week. Everything at half the sets but full intent — the point is to arrive at Block 2 fresh, not to keep the volume up.',
  }),
  mk('moveA', {
    date: '2026-09-29',
    week: 4,
    block: 1,
    job: 'Feel fast. Do not get tired.',
    main: [
      p('pogo-hop', 2, { reps: 20 }),
      p('split-step-lateral-pushoff', 1, { reps: 6, perSide: true }),
      p('skater-bound', 2, { reps: 5, perSide: true }),
    ],
    deload: true,
    minutes: 15,
  }),
  mobilityDay('2026-09-30', 4, 1, 'Deload week. Add an extra five minutes on whatever feels worst today.'),
  mk('serveB', {
    date: '2026-10-01',
    week: 4,
    block: 1,
    job: 'Half the sets, full intent.',
    main: [
      p('serve-stance-jump', 2, { reps: 4 }),
      p('scoop-toss', 2, { reps: 5 }),
      p('pronation-snap', 2, { reps: 12, perSide: true }),
    ],
    deload: true,
    minutes: 15,
  }),
  mk('moveB', {
    date: '2026-10-02',
    week: 4,
    block: 1,
    job: 'Sharp, short, and done.',
    main: [
      p('mini-5-10-5', 2, { reps: 1, restSeconds: 60 }),
      p('drop-step-retreat', 1, { reps: 4, perSide: true }),
      p('ball-drop-reaction', 1, { reps: 10 }),
    ],
    deload: true,
    minutes: 15,
  }),
  mk('strength', {
    date: '2026-10-03',
    week: 4,
    block: 1,
    job: 'Light. You are testing tomorrow.',
    main: [
      p('eccentric-heel-raise', 2, { reps: 12, perSide: true }),
      p('split-squat', 2, { reps: 8, perSide: true }),
      p('single-leg-rdl', 2, { reps: 8, perSide: true }),
      p('pallof-press', 2, { seconds: 20, perSide: true }),
    ],
    deload: true,
    minutes: 12,
  }),
  testDay(
    '2026-10-04',
    4,
    1,
    'Baseline Test',
    'These are the numbers everything else gets measured against. Same time of day, same warm-up, every number written down. Get the 240fps video too — it is the single most useful thing on the list.',
  ),
];

// ---------------------------------------------------------------------------
// BLOCK 2 — Build the Engine (Weeks 5-8, Oct 5 - Nov 1)
// Maximum intent. Fewer reps, more rest, everything thrown or jumped as hard
// as you can. If a rep feels slow, stop the set.
// ---------------------------------------------------------------------------

const BLOCK_2: Day[] = [
  // ---- Week 5 (Oct 5-11) --------------------------------------------------
  mk('serveA', {
    date: '2026-10-05',
    week: 5,
    block: 2,
    job: 'Max intent from today. Every throw at 100% or it is a wasted rep.',
    main: [
      p('rotational-wall-throw', 5, { reps: 4, perSide: true, intent: 'max', restSeconds: 45 }),
      p('step-behind-rotational-throw', 3, { reps: 4, perSide: true, intent: 'max', restSeconds: 45 }),
      p('half-kneeling-slam', 3, { reps: 6 }),
      p('weighted-shadow-serve', 2, { reps: 6 }),
      p('live-serve', 1, { reps: 6, intent: 'max' }),
    ],
    note: 'Block 2 starts here. Power days are quality days — if you are breathing hard, you are resting too little. Save the fatigue for Saturdays.',
  }),
  mk('moveA', {
    date: '2026-10-06',
    week: 5,
    block: 2,
    job: 'Max height on the pogos. Shortest possible time on the ground.',
    main: [
      p('pogo-hop', 3, { reps: 20, intent: 'max', note: 'Max height this block.' }),
      p('split-step-lateral-pushoff', 1, { reps: 8, perSide: true }),
      p('skater-bound', 4, { reps: 6, perSide: true }),
      p('crossover-step-start', 1, { reps: 6, perSide: true }),
    ],
  }),
  mobilityDay('2026-10-07', 5, 2),
  mk('serveB', {
    date: '2026-10-08',
    week: 5,
    block: 2,
    job: 'Maximum leg drive. New drill: the split squat jump.',
    main: [
      p('serve-stance-jump', 5, { reps: 4, intent: 'max', restSeconds: 45 }),
      p('scoop-toss', 4, { reps: 5, intent: 'max', restSeconds: 45 }),
      p('split-squat-jump', 3, { reps: 5, perSide: true, note: 'New this week. Land quiet.' }),
      p('pronation-snap', 3, { reps: 15, perSide: true }),
    ],
    note: 'Split squat jumps are new. Keep the same stance in the air and land softly — if you are landing loudly, drop the height.',
  }),
  mk('moveB', {
    date: '2026-10-09',
    week: 5,
    block: 2,
    job: 'Time the shuttles today. You want a number to beat.',
    main: [
      p('mini-5-10-5', 3, { reps: 1, restSeconds: 60, note: 'Timed. Rest a full minute.' }),
      p('drop-step-retreat', 1, { reps: 8, perSide: true }),
      p('deceleration-drop', 1, { reps: 8 }),
      p('ball-drop-reaction', 1, { reps: 15 }),
    ],
  }),
  mk('strength', {
    date: '2026-10-10',
    week: 5,
    block: 2,
    job: 'This is the day fatigue is allowed. Straight through.',
    main: [
      p('eccentric-heel-raise', 4, { reps: 12, perSide: true }),
      p('split-squat', 3, { reps: 10, perSide: true, note: 'Loaded.' }),
      p('single-leg-rdl', 3, { reps: 10, perSide: true }),
      p('pallof-press', 3, { seconds: 25, perSide: true }),
      p('push-up', 3, { reps: 12 }),
    ],
    minutes: 14,
  }),
  recoveryDay('2026-10-11', 5, 2),

  // ---- Week 6 (Oct 12-18) -------------------------------------------------
  mk('serveA', {
    date: '2026-10-12',
    week: 6,
    block: 2,
    job: 'Eight live serves at full effort. Put a number on it if you can.',
    main: [
      p('rotational-wall-throw', 5, { reps: 4, perSide: true, intent: 'max', restSeconds: 45 }),
      p('step-behind-rotational-throw', 3, { reps: 4, perSide: true, intent: 'max', restSeconds: 45 }),
      p('half-kneeling-slam', 4, { reps: 6 }),
      p('live-serve', 1, { reps: 8, intent: 'max', note: 'Full effort. Time them if you have a radar.' }),
    ],
  }),
  mk('moveA', {
    date: '2026-10-13',
    week: 6,
    block: 2,
    job: 'Highest volume of the block. Keep every rep sharp.',
    main: [
      p('pogo-hop', 4, { reps: 20 }),
      p('split-step-lateral-pushoff', 1, { reps: 10, perSide: true }),
      p('skater-bound', 4, { reps: 6, perSide: true }),
      p('wall-shuffle', 4, { seconds: 12 }),
    ],
  }),
  mobilityDay('2026-10-14', 6, 2),
  mk('serveB', {
    date: '2026-10-15',
    week: 6,
    block: 2,
    job: 'Up and into the court. Not straight up.',
    main: [
      p('serve-stance-jump', 5, { reps: 4, intent: 'max', restSeconds: 45 }),
      p('scoop-toss', 4, { reps: 5, intent: 'max', restSeconds: 45 }),
      p('split-squat-jump', 3, { reps: 5, perSide: true }),
      p('pronation-snap', 3, { reps: 15, perSide: true }),
    ],
  }),
  mk('moveB', {
    date: '2026-10-16',
    week: 6,
    block: 2,
    job: 'Stop dead. Two full seconds in the low position.',
    main: [
      p('mini-5-10-5', 3, { reps: 1, restSeconds: 60 }),
      p('drop-step-retreat', 1, { reps: 8, perSide: true }),
      p('deceleration-drop', 1, { reps: 8 }),
      p('ball-drop-reaction', 1, { reps: 15 }),
    ],
  }),
  mk('strength', {
    date: '2026-10-17',
    week: 6,
    block: 2,
    job: 'Injury insurance. Straight through, minimal rest.',
    main: [
      p('eccentric-heel-raise', 4, { reps: 12, perSide: true }),
      p('split-squat', 4, { reps: 8, perSide: true, note: 'Loaded.' }),
      p('single-leg-rdl', 3, { reps: 10, perSide: true }),
      p('pallof-press', 3, { seconds: 30, perSide: true }),
      p('push-up', 3, { reps: 15 }),
    ],
    minutes: 14,
  }),
  recoveryDay('2026-10-18', 6, 2),

  // ---- Week 7 (Oct 19-25) — hardest week of the program --------------------
  mk('serveA', {
    date: '2026-10-19',
    week: 7,
    block: 2,
    job: 'The biggest throwing day of the program. Full rest, full intent.',
    main: [
      p('rotational-wall-throw', 6, { reps: 4, perSide: true, intent: 'max', restSeconds: 45 }),
      p('step-behind-rotational-throw', 4, { reps: 4, perSide: true, intent: 'max', restSeconds: 45 }),
      p('half-kneeling-slam', 4, { reps: 6 }),
      p('live-serve', 1, { reps: 8, intent: 'max' }),
    ],
    note: 'Hardest week of the program starts today. If a throw feels slow, stop that set — a slow rep at this point in the block does nothing but add fatigue.',
  }),
  mk('moveA', {
    date: '2026-10-20',
    week: 7,
    block: 2,
    job: 'Five sets of bounds. Stick every single landing.',
    main: [
      p('pogo-hop', 4, { reps: 20 }),
      p('split-step-lateral-pushoff', 1, { reps: 10, perSide: true }),
      p('skater-bound', 5, { reps: 6, perSide: true, note: 'One full second on each landing.' }),
      p('crossover-step-start', 1, { reps: 8, perSide: true }),
    ],
  }),
  mobilityDay('2026-10-21', 7, 2, 'Hardest week of the program. Take this session seriously — it is what makes Thursday and Friday possible.'),
  mk('serveB', {
    date: '2026-10-22',
    week: 7,
    block: 2,
    job: 'Peak leg drive volume. Quality on every jump.',
    main: [
      p('serve-stance-jump', 6, { reps: 4, intent: 'max', restSeconds: 45 }),
      p('scoop-toss', 5, { reps: 5, intent: 'max', restSeconds: 45 }),
      p('split-squat-jump', 4, { reps: 5, perSide: true }),
      p('pronation-snap', 3, { reps: 15, perSide: true }),
    ],
  }),
  mk('moveB', {
    date: '2026-10-23',
    week: 7,
    block: 2,
    job: 'Four shuttles. This is the hardest twenty minutes of the block.',
    main: [
      p('mini-5-10-5', 4, { reps: 1, restSeconds: 60, note: 'Rest a full minute. Do not shortcut it.' }),
      p('drop-step-retreat', 1, { reps: 8, perSide: true }),
      p('deceleration-drop', 1, { reps: 8 }),
      p('ball-drop-reaction', 1, { reps: 15 }),
    ],
    note: 'Never run this cold. If the warm-up felt short today, do another 60 seconds of rope before the first shuttle — this is the highest-risk drill in the program at 42.',
  }),
  mk('strength', {
    date: '2026-10-24',
    week: 7,
    block: 2,
    job: 'Peak strength volume. Then the volume comes down for good.',
    main: [
      p('eccentric-heel-raise', 4, { reps: 15, perSide: true }),
      p('split-squat', 4, { reps: 10, perSide: true, note: 'Loaded.' }),
      p('single-leg-rdl', 4, { reps: 10, perSide: true }),
      p('pallof-press', 3, { seconds: 30, perSide: true }),
      p('push-up', 3, { reps: 15 }),
    ],
    minutes: 16,
  }),
  recoveryDay('2026-10-25', 7, 2, 'Hardest week is done. Add extra soft tissue work today — calves and lats especially.'),

  // ---- Week 8 (Oct 26 - Nov 1) — deload ------------------------------------
  mk('serveA', {
    date: '2026-10-26',
    week: 8,
    block: 2,
    job: 'Deload. Fewer sets, still max intent.',
    main: [
      p('rotational-wall-throw', 3, { reps: 4, perSide: true, intent: 'max', restSeconds: 45 }),
      p('half-kneeling-slam', 2, { reps: 5 }),
      p('live-serve', 1, { reps: 6 }),
    ],
    deload: true,
    minutes: 15,
    note: 'Deload. You test on Sunday — the point of this week is to arrive at that test fresh enough to show what Block 2 actually built.',
  }),
  mk('moveA', {
    date: '2026-10-27',
    week: 8,
    block: 2,
    job: 'Light and springy. Nothing to prove today.',
    main: [
      p('pogo-hop', 2, { reps: 20 }),
      p('split-step-lateral-pushoff', 1, { reps: 6, perSide: true }),
      p('skater-bound', 3, { reps: 5, perSide: true }),
    ],
    deload: true,
    minutes: 15,
  }),
  mobilityDay('2026-10-28', 8, 2),
  mk('serveB', {
    date: '2026-10-29',
    week: 8,
    block: 2,
    job: 'Deload. Sharp, then stop.',
    main: [
      p('serve-stance-jump', 3, { reps: 4, intent: 'max', restSeconds: 45 }),
      p('scoop-toss', 3, { reps: 5 }),
      p('pronation-snap', 2, { reps: 15, perSide: true }),
    ],
    deload: true,
    minutes: 15,
  }),
  mk('moveB', {
    date: '2026-10-30',
    week: 8,
    block: 2,
    job: 'Two shuttles only. Keep the legs fresh for Sunday.',
    main: [
      p('mini-5-10-5', 2, { reps: 1, restSeconds: 60 }),
      p('drop-step-retreat', 1, { reps: 6, perSide: true }),
      p('ball-drop-reaction', 1, { reps: 12 }),
    ],
    deload: true,
    minutes: 15,
  }),
  mk('strength', {
    date: '2026-10-31',
    week: 8,
    block: 2,
    job: 'Light. You are testing tomorrow.',
    main: [
      p('eccentric-heel-raise', 3, { reps: 12, perSide: true }),
      p('split-squat', 2, { reps: 10, perSide: true }),
      p('single-leg-rdl', 2, { reps: 8, perSide: true }),
      p('pallof-press', 2, { seconds: 25, perSide: true }),
    ],
    deload: true,
    minutes: 12,
  }),
  testDay(
    '2026-11-01',
    8,
    2,
    'Mid-Test',
    'Halfway. Compare every number against Oct 4. If the serve speed has not moved but the 5-10-5 has, that is normal — movement responds faster than velocity. Shoot the 240fps video again and compare the shoulder position against the first one.',
  ),
];

// ---------------------------------------------------------------------------
// BLOCK 3 — Sharpen (Weeks 9-12, Nov 2 - Nov 29)
// Volume drops every week. Intent stays at 100%. You should feel springy and
// slightly under-worked — that is the design.
// ---------------------------------------------------------------------------

const BLOCK_3: Day[] = [
  // ---- Week 9 (Nov 2-8) ---------------------------------------------------
  mk('serveA', {
    date: '2026-11-02',
    week: 9,
    block: 3,
    job: 'Ten live serves at first-serve intent. Count how many land.',
    main: [
      p('rotational-wall-throw', 4, { reps: 4, perSide: true, intent: 'max', restSeconds: 45 }),
      p('step-behind-rotational-throw', 3, { reps: 4, perSide: true, intent: 'max', restSeconds: 45 }),
      p('half-kneeling-slam', 3, { reps: 5 }),
      p('live-serve', 1, { reps: 10, intent: 'max', note: 'First-serve intent. Count how many land.' }),
    ],
    note: 'Block 3 starts here. You have built it — now stop building and start expressing it. Volume comes down every week from now on.',
  }),
  mk('moveA', {
    date: '2026-11-03',
    week: 9,
    block: 3,
    job: 'Springy, not tired. That is the whole block.',
    main: [
      p('pogo-hop', 3, { reps: 20 }),
      p('split-step-lateral-pushoff', 1, { reps: 8, perSide: true }),
      p('skater-bound', 3, { reps: 6, perSide: true }),
      p('crossover-step-start', 1, { reps: 6, perSide: true }),
    ],
  }),
  mobilityDay('2026-11-04', 9, 3),
  mk('serveB', {
    date: '2026-11-05',
    week: 9,
    block: 3,
    job: 'Same quality, less of it.',
    main: [
      p('serve-stance-jump', 4, { reps: 4, intent: 'max', restSeconds: 45 }),
      p('scoop-toss', 4, { reps: 5, intent: 'max', restSeconds: 45 }),
      p('split-squat-jump', 3, { reps: 5, perSide: true }),
      p('pronation-snap', 3, { reps: 15, perSide: true }),
    ],
  }),
  mk('moveB', {
    date: '2026-11-06',
    week: 9,
    block: 3,
    job: 'Fast feet, fresh legs. Stop before you are tired.',
    main: [
      p('mini-5-10-5', 3, { reps: 1, restSeconds: 60 }),
      p('drop-step-retreat', 1, { reps: 8, perSide: true }),
      p('deceleration-drop', 1, { reps: 6 }),
      p('ball-drop-reaction', 1, { reps: 15 }),
    ],
  }),
  mk('strength', {
    date: '2026-11-07',
    week: 9,
    block: 3,
    job: 'Maintain. Do not chase numbers from here on.',
    main: [
      p('eccentric-heel-raise', 3, { reps: 12, perSide: true }),
      p('split-squat', 3, { reps: 8, perSide: true }),
      p('single-leg-rdl', 3, { reps: 8, perSide: true }),
      p('pallof-press', 3, { seconds: 25, perSide: true }),
    ],
    minutes: 12,
  }),
  recoveryDay('2026-11-08', 9, 3),

  // ---- Week 10 (Nov 9-15) -------------------------------------------------
  mk('serveA', {
    date: '2026-11-09',
    week: 10,
    block: 3,
    job: 'Twelve serves: six wide, six down the T. Full pace on all of them.',
    main: [
      p('rotational-wall-throw', 4, { reps: 3, perSide: true, intent: 'max', restSeconds: 45 }),
      p('half-kneeling-slam', 3, { reps: 5 }),
      p('live-serve', 1, { reps: 12, intent: 'max', note: 'Six wide, six down the T. Full pace.' }),
    ],
  }),
  mk('moveA', {
    date: '2026-11-10',
    week: 10,
    block: 3,
    job: 'Turnover speed. Strike under the hip.',
    main: [
      p('pogo-hop', 3, { reps: 20 }),
      p('split-step-lateral-pushoff', 1, { reps: 8, perSide: true }),
      p('skater-bound', 3, { reps: 5, perSide: true }),
      p('wall-shuffle', 3, { seconds: 10 }),
    ],
  }),
  mobilityDay('2026-11-11', 10, 3),
  mk('serveB', {
    date: '2026-11-12',
    week: 10,
    block: 3,
    job: 'Leg drive stays sharp while the volume falls away.',
    main: [
      p('serve-stance-jump', 4, { reps: 4, intent: 'max', restSeconds: 45 }),
      p('scoop-toss', 3, { reps: 5, intent: 'max', restSeconds: 45 }),
      p('split-squat-jump', 3, { reps: 4, perSide: true }),
      p('pronation-snap', 2, { reps: 15, perSide: true }),
    ],
  }),
  mk('moveB', {
    date: '2026-11-13',
    week: 10,
    block: 3,
    job: 'Sharp turns, clean stops, then finish.',
    main: [
      p('mini-5-10-5', 3, { reps: 1, restSeconds: 60 }),
      p('drop-step-retreat', 1, { reps: 6, perSide: true }),
      p('deceleration-drop', 1, { reps: 6 }),
      p('ball-drop-reaction', 1, { reps: 12 }),
    ],
  }),
  mk('strength', {
    date: '2026-11-14',
    week: 10,
    block: 3,
    job: 'Maintain. Nothing heroic.',
    main: [
      p('eccentric-heel-raise', 3, { reps: 12, perSide: true }),
      p('split-squat', 3, { reps: 8, perSide: true }),
      p('single-leg-rdl', 2, { reps: 8, perSide: true }),
      p('pallof-press', 2, { seconds: 25, perSide: true }),
    ],
    minutes: 12,
  }),
  recoveryDay('2026-11-15', 10, 3),

  // ---- Week 11 (Nov 16-22) ------------------------------------------------
  mk('serveA', {
    date: '2026-11-16',
    week: 11,
    block: 3,
    job: 'Serve, then move in behind it. That is the sequence that wins points.',
    main: [
      p('rotational-wall-throw', 3, { reps: 3, perSide: true, intent: 'max', restSeconds: 45 }),
      p('half-kneeling-slam', 2, { reps: 5 }),
      p('live-serve', 1, { reps: 12, intent: 'max' }),
      p('serve-first-volley', 1, { reps: 6, note: 'Two hard steps, then split as they contact.' }),
    ],
  }),
  mk('moveA', {
    date: '2026-11-17',
    week: 11,
    block: 3,
    job: 'Less volume again. Every rep should feel easy and fast.',
    main: [
      p('pogo-hop', 3, { reps: 15 }),
      p('split-step-lateral-pushoff', 1, { reps: 6, perSide: true }),
      p('skater-bound', 3, { reps: 5, perSide: true }),
      p('crossover-step-start', 1, { reps: 5, perSide: true }),
    ],
  }),
  mobilityDay('2026-11-18', 11, 3),
  mk('serveB', {
    date: '2026-11-19',
    week: 11,
    block: 3,
    job: 'Short and sharp. Stop while it still feels good.',
    main: [
      p('serve-stance-jump', 3, { reps: 4, intent: 'max', restSeconds: 45 }),
      p('scoop-toss', 3, { reps: 4, intent: 'max', restSeconds: 45 }),
      p('split-squat-jump', 2, { reps: 4, perSide: true }),
      p('pronation-snap', 2, { reps: 12, perSide: true }),
    ],
  }),
  mk('moveB', {
    date: '2026-11-20',
    week: 11,
    block: 3,
    job: 'Two shuttles. Keep something in the tank for Sunday.',
    main: [
      p('mini-5-10-5', 2, { reps: 1, restSeconds: 60 }),
      p('drop-step-retreat', 1, { reps: 6, perSide: true }),
      p('ball-drop-reaction', 1, { reps: 12 }),
    ],
    minutes: 15,
  }),
  mk('strength', {
    date: '2026-11-21',
    week: 11,
    block: 3,
    job: 'All light. You are testing tomorrow.',
    main: [
      p('eccentric-heel-raise', 3, { reps: 10, perSide: true, intent: 'easy' }),
      p('split-squat', 2, { reps: 8, perSide: true, intent: 'easy' }),
      p('single-leg-rdl', 2, { reps: 8, perSide: true, intent: 'easy' }),
      p('pallof-press', 2, { seconds: 20, perSide: true, intent: 'easy' }),
    ],
    minutes: 12,
    note: 'All light today. Every load comes down — nothing you do in this session can improve tomorrow’s test, but plenty could hurt it.',
  }),
  testDay(
    '2026-11-22',
    11,
    3,
    'Final Test',
    'Last measurement before Nationals. Compare against Oct 4 and Nov 1. Whatever the serve speed says, look at the 5-10-5 — a tenth of a second there is the difference between reaching a poach and watching it.',
  ),

  // ---- Week 12 (Nov 23-29) — taper ----------------------------------------
  mk('serveA', {
    date: '2026-11-23',
    week: 12,
    block: 3,
    job: 'Short and sharp. Ten serves at full pace, then walk away.',
    main: [
      p('rotational-wall-throw', 3, { reps: 3, perSide: true, intent: 'max', restSeconds: 45 }),
      p('live-serve', 1, { reps: 10, intent: 'max', note: 'Full pace. Then stop.' }),
    ],
    minutes: 15,
    note: 'Taper week. Nothing you do now adds fitness — everything from here is about arriving on Monday feeling fast.',
  }),
  mk('moveA', {
    date: '2026-11-24',
    week: 12,
    block: 3,
    job: 'Feel fast. Do not get tired.',
    main: [
      p('pogo-hop', 2, { reps: 15 }),
      p('split-step-lateral-pushoff', 1, { reps: 5, perSide: true }),
      p('skater-bound', 2, { reps: 4, perSide: true }),
    ],
    minutes: 15,
  }),
  mobilityDay('2026-11-25', 12, 3),
  mk('serveB', {
    date: '2026-11-26',
    week: 12,
    block: 3,
    job: 'Stop while you feel good. That is the instruction.',
    main: [
      p('serve-stance-jump', 3, { reps: 3, intent: 'max' }),
      p('scoop-toss', 2, { reps: 4, intent: 'max' }),
      p('pronation-snap', 2, { reps: 12, perSide: true }),
    ],
    minutes: 15,
    note: 'Stop while you feel good. If you finish this session wanting one more set, you have done it exactly right.',
  }),
  {
    ...mk('moveA', {
      date: '2026-11-27',
      week: 12,
      block: 3,
      job: 'Twelve minutes maximum. Touch the pattern and leave.',
      main: [
        p('pogo-hop', 2, { reps: 15 }),
        p('split-step-lateral-pushoff', 1, { reps: 5, perSide: true }),
        p('crossover-step-start', 1, { reps: 4, note: 'Four starts total, not per side.' }),
      ],
      minutes: 12,
    }),
    title: 'Move A — Light',
  },
  mobilityDay('2026-11-28', 12, 3, 'Full sequence, no power work. Three days out — nothing you do today can help you on Monday except feeling loose.'),
  {
    ...mk('recovery', {
      date: '2026-11-29',
      week: 12,
      block: 3,
      job: 'Travel day. Walk, cuff work, and ten minutes with your eyes closed.',
      main: [
        p('easy-aerobic', 1, { seconds: 900, intent: 'easy', note: '15 minute walk. Nothing else.' }),
        p('band-external-rotation', 2, { reps: 15, perSide: true }),
        p('visualization', 1, { seconds: 600, note: 'Ten minutes today. Play real points at real speed.' }),
      ],
      minutes: 30,
      note: 'Tomorrow is the day. Nothing else today — no extra hitting, no "one more" of anything. Sleep is the last piece of training you have left.',
    }),
    title: 'Travel / Recovery',
  },

  // ---- Nov 30 — Nationals -------------------------------------------------
  mk('match', {
    date: '2026-11-30',
    week: 12,
    block: 3,
    job: 'Warm up, then go and play. The work is done.',
    main: [
      p('jump-rope', 1, { seconds: 60 }),
      p('band-external-rotation', 2, { reps: 15, perSide: true, note: 'Cuff work. Do not skip this today.' }),
      p('pogo-hop', 2, { reps: 15 }),
      p('weighted-shadow-serve', 1, { reps: 5, note: 'Plain racket. Just wake the pattern up.' }),
    ],
    minutes: 12,
  }),
];

// ---------------------------------------------------------------------------

export const PLAN: Day[] = [...ON_RAMP, ...BLOCK_1, ...BLOCK_2, ...BLOCK_3];

const BY_DATE = new Map(PLAN.map((d) => [d.date, d]));

export function getDay(date: string): Day | undefined {
  return BY_DATE.get(date);
}

/** The 84 numbered training days, Sep 7 - Nov 29. Excludes on-ramp and match day. */
export const PROGRAM_DAYS: Day[] = PLAN.filter(
  (d) => !d.isOnRamp && d.sessionType !== 'match',
);

export const FIRST_DATE = PLAN[0].date;
export const LAST_DATE = PLAN[PLAN.length - 1].date;
export const NATIONALS_DATE = '2026-11-30';

/** 1-based position within the 84 numbered days; null for on-ramp and match day. */
export function dayNumber(date: string): number | null {
  const i = PROGRAM_DAYS.findIndex((d) => d.date === date);
  return i === -1 ? null : i + 1;
}

export function daysUntilNationals(date: string): number {
  const a = new Date(`${date}T00:00:00Z`).getTime();
  const b = new Date(`${NATIONALS_DATE}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function neighbours(date: string): { prev?: string; next?: string } {
  const i = PLAN.findIndex((d) => d.date === date);
  if (i === -1) return {};
  return { prev: PLAN[i - 1]?.date, next: PLAN[i + 1]?.date };
}
