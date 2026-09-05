/**
 * The whole program as one 84-segment rail. Position is the information — how
 * far in he is, and how much is left — so it is drawn as discrete days rather
 * than a smooth bar.
 */
export function ProgressRail({ current, total = 84 }: { current: number | null; total?: number }) {
  const label = current ? `Day ${current} of ${total}` : `Outside the ${total} numbered days`;
  return (
    <svg
      viewBox={`0 0 ${total * 4} 8`}
      preserveAspectRatio="none"
      className="h-2 w-full"
      role="img"
      aria-labelledby="progress-rail-title"
    >
      <title id="progress-rail-title">{label}</title>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const past = current !== null && n < current;
        const now = current !== null && n === current;
        return (
          <rect
            key={n}
            x={i * 4}
            y={now ? 0 : 2}
            width={2.6}
            height={now ? 8 : 4}
            rx={1}
            fill={now ? 'var(--accent)' : past ? 'var(--line-bright)' : 'var(--line)'}
          />
        );
      })}
    </svg>
  );
}
