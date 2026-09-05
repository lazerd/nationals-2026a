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
| `src/components/illustrations/` | `Figure.tsx` primitives + 50 exercise SVGs |
| `src/components/day/` | The day page, guided sequence, test form, match day |
| `worker/` | The 5 AM sender: hourly cron, KV send log, Resend |
| `scripts/` | Validators and browser checks |

## Screens

| Route | What |
|---|---|
| `/` | Resolves today in your timezone and redirects |
| `/day/[date]` | The session. Four layouts by session type. |
| `/progress` | Streak, 84-day grid, session breakdown, test charts |
| `/plan` | All twelve weeks, scannable, with completion state |
| `/exercise/[id]` | Full detail plus every day it appears |
| `/dev/illustrations` | Review gallery for the figure system |

## Commands

```bash
npm run dev            # local dev server
npm run build          # static export to out/, then generate out/sw.js
npm run check          # validate + typecheck (app and worker) + lint + dry run
npm run dry            # send decisions across the DST boundary, no network

# browser checks — need a server running
node scripts/serve-out.mjs 4321   # serve out/ the way Pages does
npm run check:day                 # 17 interaction checks on the day page
npm run check:pwa                 # offline: cut the network, confirm it works
node scripts/illo-bounds.mjs      # no illustration escapes its viewBox

npx tsx scripts/spot.ts 2026-10-19            # print a day's prescription
npx tsx scripts/email-preview.mts ./preview   # render the emails to HTML + PNG
```

Deployment is in [DEPLOY.md](./DEPLOY.md).

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

## Offline

A generated service worker (`scripts/build-sw.mjs`) precaches the shell on
install — about 1.2 MB, blocking — then pulls all 87 day pages, all 50 exercise
pages and every illustration in the background on activate. `npm run check:pwa`
proves it by cutting the network and loading a day page that was never opened
while online.

## The 5 AM email

`worker/` is a Cloudflare Worker on an **hourly** cron. It asks
`Intl.DateTimeFormat` what the local wall clock says and only sends when that
reads 5. A fixed daily UTC cron would start sending at 4 AM local the moment
DST ends on Nov 1 2026 and keep doing it for the last four weeks of the block.

- `sent:YYYY-MM-DD` in KV is written **only after** Resend confirms. Running the
  worker twice in an hour sends once.
- If all three send attempts fail, no `sent:` key is written, and the 6 AM tick
  sends a catch-up. One late email beats no email.
- `GET /?dry=1[&at=<iso>]` runs the whole decision and returns what would be
  sent, without sending.
- `GET /health` returns the last seven days, so a missed morning is diagnosable
  in ten seconds.
- Dec 1 sends one program-complete note. Nothing sends after that.
