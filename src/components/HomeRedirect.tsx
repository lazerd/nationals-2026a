'use client';

import { useEffect, useState } from 'react';
import { localToday } from '@/lib/today';

export function HomeRedirect({ first, last, dates }: { first: string; last: string; dates: string[] }) {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    const d = localToday();
    setToday(d);
    if (dates.includes(d)) window.location.replace(`/day/${d}`);
  }, [dates]);

  const inRange = today !== null && dates.includes(today);
  if (today === null || inRange) {
    return <main className="grid min-h-dvh place-items-center px-6 text-[14px] text-ink-quiet">Opening today…</main>;
  }

  const before = today < first;
  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col justify-center px-6">
      <h1 className="text-[27px] font-bold leading-tight tracking-[-0.02em]">
        {before ? 'Not started yet' : 'Program complete'}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-quiet">
        {before
          ? `The block runs ${first} to ${last}. Day one opens on ${first}.`
          : `The block ran ${first} to ${last}. Nationals is behind you.`}
      </p>
      <a
        href={`/day/${before ? first : last}`}
        className="tap mt-6 flex items-center justify-center rounded-lg text-[16px] font-semibold"
        style={{ height: 52, background: 'var(--accent)', color: 'var(--accent-ink)' }}
      >
        {before ? 'Look at day one' : 'Look at the last day'}
      </a>
      <a href="/plan" className="tap mt-3 flex items-center justify-center rounded-lg border border-line text-[14px] text-ink-quiet">
        See the whole plan
      </a>
    </main>
  );
}
