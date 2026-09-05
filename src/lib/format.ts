import type { SetPrescription } from '@/data/types';

/**
 * How a prescription reads on the card. The number is the largest thing on the
 * screen and has to be legible at arm's length, so it stays short: the
 * qualifier ("each side", "hold") carries the rest underneath it.
 */
export function prescriptionParts(s: SetPrescription): { primary: string; qualifier: string } {
  const amount = s.reps !== undefined ? String(s.reps) : `${s.seconds}s`;
  const isHold = s.reps === undefined;

  if (s.sets > 1) {
    return {
      primary: `${s.sets} × ${amount}`,
      qualifier: s.perSide ? 'each side' : isHold ? 'holds' : 'sets',
    };
  }
  return {
    primary: amount,
    qualifier: s.perSide ? 'each side' : isHold ? 'hold' : 'reps',
  };
}

/** A one-line version for the collapsed warm-up and finisher rows, and the email. */
export function prescriptionLine(s: SetPrescription): string {
  const amount = s.reps !== undefined ? String(s.reps) : `${s.seconds}s`;
  const core = s.sets > 1 ? `${s.sets}×${amount}` : amount;
  return s.perSide ? `${core}/side` : core;
}

/** Total sets a block asks for, counting each side separately. */
export function blockSetCount(block: SetPrescription[]): number {
  return block.reduce((n, s) => n + s.sets * (s.perSide ? 2 : 1), 0);
}

/** Rough minutes for a block, used for the collapsed warm-up row. */
export function blockMinutes(block: SetPrescription[]): number {
  const seconds = block.reduce((total, s) => {
    const sides = s.perSide ? 2 : 1;
    const work = s.seconds ?? (s.reps ?? 0) * 3;
    const rest = s.restSeconds ?? 12;
    return total + s.sets * sides * (work + rest);
  }, 0);
  return Math.max(1, Math.round(seconds / 60));
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Mon 19 Oct" — dates are calendar labels, so parse them as UTC, not local. */
export function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}
