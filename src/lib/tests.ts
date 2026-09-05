'use client';

import type { TestResult } from '@/data/types';
import { keys, readJSON, writeJSON } from './storage';

export const TEST_DATES = ['2026-10-04', '2026-11-01', '2026-11-22'] as const;

export interface TestMetric {
  key: keyof Omit<TestResult, 'date' | 'notes'>;
  label: string;
  unit: string;
  /** Which direction counts as an improvement. */
  better: 'higher' | 'lower';
  step: number;
  hint?: string;
}

export const TEST_METRICS: TestMetric[] = [
  { key: 'serveSpeedFastest', label: 'Serve speed, fastest', unit: 'mph', better: 'higher', step: 1, hint: '10 first serves. Radar or app.' },
  { key: 'serveSpeedAverage', label: 'Serve speed, average', unit: 'mph', better: 'higher', step: 1, hint: 'Same 10 serves.' },
  { key: 'firstServePercent', label: 'First-serve percentage', unit: '%', better: 'higher', step: 1, hint: 'Of those 10, how many landed.' },
  { key: 'shuttle5105', label: '5-10-5', unit: 's', better: 'lower', step: 0.01, hint: 'Best of 2.' },
  { key: 'broadJump', label: 'Broad jump', unit: 'ft', better: 'higher', step: 0.1, hint: 'Standing, best of 3.' },
  { key: 'lateralBoundLeft', label: 'Lateral bound, left', unit: 'ft', better: 'higher', step: 0.1, hint: 'Single leg, for distance.' },
  { key: 'lateralBoundRight', label: 'Lateral bound, right', unit: 'ft', better: 'higher', step: 0.1, hint: 'Compare the two sides.' },
];

export function readTests(): TestResult[] {
  return readJSON<TestResult[]>(keys.tests(), []).sort((a, b) => a.date.localeCompare(b.date));
}

export function saveTest(result: TestResult): TestResult[] {
  const all = readTests().filter((t) => t.date !== result.date);
  all.push(result);
  all.sort((a, b) => a.date.localeCompare(b.date));
  writeJSON(keys.tests(), all);
  return all;
}

export function getTest(date: string): TestResult | undefined {
  return readTests().find((t) => t.date === date);
}

/** The most recent test strictly before `date`, for the comparison view. */
export function previousTest(date: string): TestResult | undefined {
  return readTests().filter((t) => t.date < date).pop();
}

export interface Delta {
  raw: number;
  improved: boolean;
  text: string;
}

export function compare(metric: TestMetric, now?: number, before?: number): Delta | null {
  if (now === undefined || before === undefined) return null;
  const raw = now - before;
  if (Math.abs(raw) < metric.step / 2) return { raw: 0, improved: false, text: 'no change' };
  const improved = metric.better === 'higher' ? raw > 0 : raw < 0;
  const decimals = metric.step < 1 ? 2 : 0;
  const sign = raw > 0 ? '+' : '';
  return { raw, improved, text: `${sign}${raw.toFixed(decimals)} ${metric.unit}` };
}
