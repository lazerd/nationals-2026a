/**
 * Three data points per metric. A charting library would be more code than the
 * chart, so this is hand-rolled: one line, one accent, dots at the tests, and
 * the numbers printed rather than an axis to read them off.
 */
export function MetricChart({
  points,
  better,
  unit,
  label,
}: {
  points: { date: string; value: number }[];
  better: 'higher' | 'lower';
  unit: string;
  label: string;
}) {
  const W = 260;
  const H = 70;
  const PAD_X = 16;
  // The value sits above its dot, so the top needs room for the label or the
  // highest reading — the one you most want to see — gets clipped.
  const PAD_TOP = 22;
  const PAD_BOTTOM = 12;

  if (points.length === 0) return null;

  const values = points.map((p) => p.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || Math.max(1, Math.abs(hi) * 0.1);

  const x = (i: number) =>
    points.length === 1 ? W / 2 : PAD_X + (i * (W - PAD_X * 2)) / (points.length - 1);
  const y = (v: number) => H - PAD_BOTTOM - ((v - lo) / span) * (H - PAD_TOP - PAD_BOTTOM);

  const first = values[0];
  const last = values[values.length - 1];
  const moved = last - first;
  const improved = better === 'higher' ? moved > 0 : moved < 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[70px] w-full" role="img" aria-labelledby={`chart-${label}`}>
      <title id={`chart-${label}`}>
        {label}: {points.map((p) => `${p.value}${unit}`).join(', then ')}
      </title>

      <line x1={PAD_X} y1={H - PAD_BOTTOM} x2={W - PAD_X} y2={H - PAD_BOTTOM} stroke="var(--line)" strokeWidth={1} />

      {points.length > 1 && (
        <polyline
          points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')}
          fill="none"
          stroke={points.length > 1 && moved !== 0 ? (improved ? 'var(--ok)' : 'var(--warn)') : 'var(--ink-faint)'}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {points.map((p, i) => (
        <g key={p.date}>
          <circle
            cx={x(i)}
            cy={y(p.value)}
            r={3.5}
            fill={i === points.length - 1 ? 'var(--accent)' : 'var(--surface)'}
            stroke={i === points.length - 1 ? 'var(--accent)' : 'var(--ink-faint)'}
            strokeWidth={2}
          />
          <text
            x={x(i)}
            y={y(p.value) - 9}
            textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
            fill="var(--ink-quiet)"
            fontSize={11}
            fontWeight={600}
          >
            {p.value}
          </text>
        </g>
      ))}
    </svg>
  );
}
