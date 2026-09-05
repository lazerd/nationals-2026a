# Nationals — Daily Training App

A single-user training app for a 12-week block leading to USTA Nationals on
**Nov 30, 2026**. Two moving parts:

1. An email at **5:00 AM America/Los_Angeles**, every day, Sep 5 – Nov 30.
2. The page it links to: `/day/YYYY-MM-DD` — that day's warm-up, main work,
   illustrations, timers, and checkboxes that persist.

Programming comes from [`12-week-nationals-plan.md`](./12-week-nationals-plan.md).
That file is the source of truth; nothing in the app invents sets or reps.

## Layout

| Path | What |
|---|---|
| `src/data/types.ts` | Domain types |
| `src/data/exercises.ts` | 50-entry exercise library |
| `src/data/plan.ts` | All 87 day entries |
| `scripts/validate-plan.ts` | The gate — run before trusting the data |

## Commands

```bash
npm run dev        # local dev server
npm run build      # production build
npm run validate   # assert the plan data is complete and consistent
npm run check:day  # interaction checks against a running dev server
npx tsx scripts/spot.ts 2026-10-19    # print a day's prescription
```

## Calendar

- **Sep 5–6** — on-ramp. Week 1's Saturday and Sunday, run early so the program
  starts today without shifting the weekday rhythm or the taper.
- **Sep 7 – Nov 29** — the 84 numbered days. Mon serve A, Tue move A, Wed
  mobility, Thu serve B, Fri move B, Sat strength, Sun recovery.
- **Oct 4 / Nov 1 / Nov 22** — test days.
- **Nov 30** — Nationals.

## Illustrations

`src/components/illustrations/` — 50 original SVGs, no third-party assets.
Every figure is composed from `Figure.tsx` primitives at joint angles rather
than raw path data, so poses stay readable and editable.

- **Angles**: degrees from straight-down, positive clockwise. 0 hangs down,
  180 points up, -90 points right.
- **Anchors**: `aim(from, to)` solves the angle and length that lands a joint
  on an exact point. Lying and propped positions are built this way.
- **Colour**: CSS variables only (`--illo-figure`, `--illo-accent`, …). No hex
  inside an SVG, so dark mode and theming work.
- **Format**: `viewBox="0 0 320 180"`, two panels (start, end), a motion arc
  between them, `role="img"` and a `<title>` describing the movement.

Review them at `/dev/illustrations`, filterable by `?only=<category>`.

```bash
node scripts/shot.mjs http://localhost:3000/dev/illustrations out.png
```

## Persistence

localStorage only. No accounts, no backend, no sync.

| Key | Value |
|---|---|
| `nationals:day:2026-09-07:sets` | `{"main:0:rotational-wall-throw": 3}` |
| `nationals:day:2026-09-07:done` | `true` |
| `nationals:tests` | `TestResult[]` |

Reads happen on mount, not during render — the day pages are statically
generated, so touching storage while rendering would mismatch hydration. Every
read and write is wrapped: a private window or a browser blocking site data has
to degrade to an empty workout, never to a crash.

The rest timer counts down to a wall-clock deadline rather than ticking a
counter, so locking the phone mid-rest does not pause it. `npm run check:day`
proves this by jumping `Date.now` forward 30s and asserting the timer lost
exactly that.

## Timezone

Every date and hour decision goes through `Intl.DateTimeFormat` with a named
zone (`src/lib/today.ts`). No offset arithmetic anywhere. US DST ends Sunday
Nov 1 2026, mid-block: 12:00 UTC is 5 AM local on Oct 31 but 4 AM on Nov 1.
