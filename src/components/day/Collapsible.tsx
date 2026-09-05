'use client';

import { useId, useState } from 'react';

/** A disclosure that stays quiet when closed. Used for warm-up, finisher, and mistakes. */
export function Collapsible({
  summary,
  detail,
  children,
  defaultOpen = false,
  tone = 'plain',
}: {
  summary: React.ReactNode;
  detail?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  tone?: 'plain' | 'card';
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className={tone === 'card' ? 'rounded-xl border border-line bg-surface' : ''}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className={`tap flex w-full items-center justify-between gap-3 text-left ${
          tone === 'card' ? 'px-4 py-3' : 'py-2'
        }`}
      >
        <span className="min-w-0 flex-1">{summary}</span>
        <span className="flex shrink-0 items-center gap-2">
          {detail && <span className="text-xs text-ink-quiet">{detail}</span>}
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4 shrink-0 transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : undefined }}
            aria-hidden="true"
          >
            <path d="M3 6 L8 11 L13 6" fill="none" stroke="var(--ink-quiet)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div id={id} hidden={!open} className={tone === 'card' ? 'px-4 pb-4' : 'pb-2'}>
        {children}
      </div>
    </div>
  );
}
