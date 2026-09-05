'use client';

import { primeAudio } from '@/lib/chime';

/**
 * One tappable pip per set. Tapping the next empty pip completes a set;
 * tapping a filled one steps back, which is how a miscount gets fixed with a
 * sweaty thumb and no undo menu.
 */
export function SetPips({
  total,
  done,
  onChange,
  label,
}: {
  total: number;
  done: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label={`${label}: ${done} of ${total} sets done`}>
      {Array.from({ length: total }, (_, i) => {
        const filled = i < done;
        return (
          <button
            key={i}
            type="button"
            onClick={() => {
              primeAudio();
              // Tapping the pip you just filled steps back; anything else fills to there.
              onChange(done === i + 1 ? i : i + 1);
            }}
            className="tap grid place-items-center px-0.5"
            aria-pressed={filled}
            aria-label={`Set ${i + 1} of ${total}`}
          >
            <span
              className="block h-6 w-6 rounded-full border-2 transition-colors duration-150"
              style={{
                borderColor: filled ? 'var(--accent)' : 'var(--line-bright)',
                background: filled ? 'var(--accent)' : 'transparent',
              }}
            />
          </button>
        );
      })}
      <span className="scoreboard ml-1 text-sm text-ink-faint tabular">
        {done}/{total}
      </span>
    </div>
  );
}
