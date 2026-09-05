'use client';

import { useState } from 'react';

const CATEGORIES = ['all', 'serve', 'movement', 'strength', 'warmup', 'mobility'] as const;

export function GalleryFilter({
  items,
}: {
  items: { id: string; name: string; category: string; svg: React.ReactNode }[];
}) {
  const [only, setOnly] = useState<(typeof CATEGORIES)[number]>('all');
  const shown = only === 'all' ? items : items.filter((i) => i.category === only);

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setOnly(c)}
            className="rounded-full border px-3 py-1.5 text-[13px]"
            style={{
              borderColor: only === c ? 'var(--accent)' : 'var(--line)',
              color: only === c ? 'var(--accent)' : 'var(--ink-quiet)',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-5">
        {shown.map((e) => (
          <figure key={e.id} className="rounded-lg border border-line bg-surface p-3">
            <figcaption className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-[15px] font-semibold">{e.name}</span>
              <span className="text-[11px] text-ink-faint">{e.category}</span>
            </figcaption>
            <div className="rounded bg-ground">{e.svg}</div>
          </figure>
        ))}
      </div>
    </>
  );
}
