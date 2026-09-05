'use client';

/**
 * A soft two-note chime for the end of a rest period, synthesised rather than
 * loaded so there is no audio asset to cache and nothing to fail offline.
 *
 * Browsers only allow audio after a user gesture; the context is created on the
 * first set-pip tap, which is always a real tap.
 */
let ctx: AudioContext | null = null;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

export function primeAudio(): void {
  if (typeof window === 'undefined') return;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

export function chime(): void {
  if (!ctx || ctx.state !== 'running') return;
  try {
    const now = ctx.currentTime;
    // A fifth, quiet and short. Loud enough to hear in a garage, not startling.
    for (const [freq, at] of [
      [784, 0],
      [1175, 0.16],
    ] as const) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + at);
      gain.gain.exponentialRampToValueAtTime(0.16, now + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.55);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + at);
      osc.stop(now + at + 0.6);
    }
  } catch {
    /* audio is a nicety, never a failure */
  }
}
