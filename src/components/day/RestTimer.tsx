'use client';

import { useEffect, useRef, useState } from 'react';
import { chime } from '@/lib/chime';
import { formatClock } from '@/lib/format';

/**
 * Counts down to a wall-clock deadline rather than ticking a counter, so
 * locking the phone or switching apps mid-rest does not pause or lose the
 * timer — coming back shows the true remaining time.
 */
export function RestTimer({
  endsAt,
  seconds,
  onDone,
  onSkip,
}: {
  endsAt: number;
  seconds: number;
  onDone: () => void;
  onSkip: () => void;
}) {
  const [remaining, setRemaining] = useState(() => Math.max(0, (endsAt - Date.now()) / 1000));
  const fired = useRef(false);

  useEffect(() => {
    fired.current = false;
    let raf = 0;
    const tick = () => {
      const left = Math.max(0, (endsAt - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0 && !fired.current) {
        fired.current = true;
        if (document.visibilityState === 'visible') chime();
        onDone();
        return;
      }
      raf = window.setTimeout(tick, 200);
    };
    tick();
    return () => window.clearTimeout(raf);
  }, [endsAt, onDone]);

  const R = 26;
  const C = 2 * Math.PI * R;
  const progress = seconds > 0 ? Math.min(1, Math.max(0, remaining / seconds)) : 0;

  return (
    <button
      type="button"
      onClick={onSkip}
      className="tap -mx-1 mt-3 flex w-[calc(100%+0.5rem)] items-center gap-3 rounded-lg border border-accent/40 bg-accent-wash px-3 py-2 text-left"
      style={{ backgroundColor: 'var(--accent-wash)' }}
      aria-label={`Resting, ${formatClock(remaining)} remaining. Tap to skip the rest.`}
    >
      <svg viewBox="0 0 60 60" className="h-11 w-11 shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="30" cy="30" r={R} fill="none" stroke="var(--line-bright)" strokeWidth="4" />
        <circle
          cx="30"
          cy="30"
          r={R}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
        />
      </svg>
      <span className="min-w-0">
        <span className="scoreboard block text-xl text-accent">{formatClock(remaining)}</span>
        <span className="block text-[11px] text-ink-quiet">Rest — tap to skip</span>
      </span>
    </button>
  );
}
