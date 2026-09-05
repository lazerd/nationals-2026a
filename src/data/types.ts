/**
 * Core domain types for the Nationals training app.
 *
 * Source of truth for all programming is `12-week-nationals-plan.md` at the
 * repo root. Nothing in this file or its consumers may invent sets, reps, or
 * prescriptions that do not appear there.
 */

export type SessionType =
  | 'serve-a'
  | 'serve-b'
  | 'move-a'
  | 'move-b'
  | 'strength'
  | 'mobility'
  | 'recovery'
  | 'test'
  | 'match';

export type Intent = 'easy' | 'moderate' | '70%' | '80%' | '85%' | 'max';

export type ExerciseCategory =
  | 'serve'
  | 'movement'
  | 'strength'
  | 'mobility'
  | 'warmup';

export interface SetPrescription {
  /** FK into the exercise library in `exercises.ts`. */
  exerciseId: string;
  sets: number;
  /** Reps OR seconds, never both. */
  reps?: number;
  seconds?: number;
  perSide: boolean;
  intent?: Intent;
  restSeconds?: number;
  /** Short imperative shown under the prescription, e.g. "Stick the landing." */
  note?: string;
}

export interface Day {
  /** ISO calendar date, "2026-09-07". Also the URL segment for /day/[date]. */
  date: string;
  /** 1-12 for the program proper; 0 for the two on-ramp days before Week 1. */
  weekNumber: number;
  blockNumber: 1 | 2 | 3;
  dayOfWeek: string;
  sessionType: SessionType;
  /** "Serve A — Rotation" */
  title: string;
  /** The single sentence he reads if he reads nothing else. */
  oneLineJob: string;
  estimatedMinutes: number;
  isDeload: boolean;
  isTestDay: boolean;
  /** True for Sep 5-6, the two days that get him started before Week 1 opens. */
  isOnRamp?: boolean;
  warmup: SetPrescription[];
  main: SetPrescription[];
  finish: SetPrescription[];
  /** 1-2 sentences, rendered in a highlighted box. */
  coachNote?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  /** One sentence: where to stand, what to hold. */
  setup: string;
  /** 3-5 ordered steps. */
  execution: string[];
  /** 2-3 short imperatives. */
  cues: string[];
  /** 2-3 faults. The highest-value field in the app. */
  commonMistakes: string[];
  /** One sentence tying it to serve speed or court speed. */
  whyItMatters: string;
  /** Component name exported from src/components/illustrations. */
  illustration: string;
  equipment: string[];
  /** What to do if it is too hard or something hurts. */
  regressions?: string;
  /** When to stop. */
  redFlags?: string;
}

export interface TestResult {
  date: string;
  serveSpeedFastest?: number;
  serveSpeedAverage?: number;
  firstServePercent?: number;
  shuttle5105?: number;
  broadJump?: number;
  lateralBoundLeft?: number;
  lateralBoundRight?: number;
  notes?: string;
}
