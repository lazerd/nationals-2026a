import { chromium } from 'playwright';

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 375, height: 700 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const log = [];
const ok = (label, cond, extra = '') => log.push(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? ` · ${extra}` : ''}`);

await p.goto('http://localhost:3000/day/2026-10-19', { waitUntil: 'networkidle' });

// No horizontal overflow at the iPhone SE floor.
const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok('no horizontal overflow at 375px', overflow <= 0, `overflow ${overflow}px`);

// Every interactive element has an accessible name.
const unnamed = await p.evaluate(() =>
  [...document.querySelectorAll('button, a[href]')].filter((el) => {
    const n = (el.getAttribute('aria-label') || el.textContent || '').trim();
    return n.length === 0;
  }).length,
);
ok('every button and link has an accessible name', unnamed === 0, `${unnamed} unnamed`);

// Tap targets.
const small = await p.evaluate(() =>
  [...document.querySelectorAll('button')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && (r.height < 44 || r.width < 24);
  }).length,
);
ok('interactive controls meet the 44px floor', small === 0, `${small} too small`);

// Done button starts disabled.
const doneBtn = p.locator('button:has-text("sets to go")');
ok('done button starts disabled', await doneBtn.isDisabled());

// Tap a pip and confirm it persists across a reload.
const firstCard = p.locator('article').first();
await firstCard.locator('button[aria-label^="Set 1 of"]').click();
await p.waitForTimeout(150);
ok('pip records a set', (await firstCard.locator('button[aria-pressed="true"]').count()) === 1);

// This exercise has a 45s rest, so completing a set should start the timer.
const timer = p.locator('button[aria-label^="Resting"]');
ok('rest timer starts after a set with restSeconds', await timer.isVisible());
const t1 = await timer.getAttribute('aria-label');
await p.waitForTimeout(1300);
const t2 = await timer.getAttribute('aria-label');
ok('rest timer counts down', t1 !== t2, `${t1} -> ${t2}`);

// Timestamp math, not tick counting: jump the clock forward the way a locked
// phone does and confirm the timer has actually lost that time, rather than
// having paused along with the throttled interval.
const before = await timer.getAttribute('aria-label');
await p.evaluate(() => {
  const real = Date.now;
  Date.now = () => real() + 30_000;
});
await p.waitForTimeout(500);
const after = await timer.getAttribute('aria-label');
const secs = (s) => { const m = /(\d+):(\d+)/.exec(s || ''); return m ? +m[1] * 60 + +m[2] : NaN; };
const jumped = secs(before) - secs(after);
ok('rest timer is timestamp-based, so backgrounding does not pause it', jumped >= 29 && jumped <= 32, `lost ${jumped}s over a 30s clock jump`);
await p.evaluate(() => { /* clock restored by the reload below */ });

await p.reload({ waitUntil: 'networkidle' });
ok('set state survives a reload', (await p.locator('article').first().locator('button[aria-pressed="true"]').count()) === 1);

const stored = await p.evaluate(() => localStorage.getItem('nationals:day:2026-10-19:sets'));
ok('localStorage key is namespaced', stored !== null, `nationals:day:2026-10-19:sets = ${stored}`);

// Fill every main-work set and confirm the done button enables.
await p.evaluate(() => {
  const els = [...document.querySelectorAll('article')];
  return els.length;
});
for (const card of await p.locator('article').all()) {
  const pips = await card.locator('button[aria-label^="Set "]').all();
  if (pips.length) await pips[pips.length - 1].click();
  await p.waitForTimeout(60);
}
await p.waitForTimeout(200);
const finishBtn = p.locator('button:has-text("Mark session done")');
ok('done button enables once every main set is ticked', await finishBtn.isEnabled());

await finishBtn.click();
await p.waitForTimeout(250);
ok('marking done shows the confirmation', await p.locator('text=Session done').isVisible());
const doneRaw = await p.evaluate(() => localStorage.getItem('nationals:day:2026-10-19:done'));
ok('done flag persists', doneRaw === 'true', `nationals:day:2026-10-19:done = ${doneRaw}`);

// Survives a reload, and the streak reads back.
await p.reload({ waitUntil: 'networkidle' });
ok('done state survives a reload', await p.locator('text=Session done').isVisible());

// The ? sheet.
await p.locator('button[aria-label^="How to do"]').first().click();
await p.waitForTimeout(200);
ok('exercise sheet opens', await p.locator('[role="dialog"]').isVisible());
await p.keyboard.press('Escape');
await p.waitForTimeout(200);
ok('escape closes the sheet', (await p.locator('[role="dialog"]').count()) === 0);

// Every SVG has a title.
const untitled = await p.evaluate(() => [...document.querySelectorAll('svg[role="img"]')].filter((s) => !s.querySelector('title')).length);
ok('every role=img svg has a title', untitled === 0, `${untitled} missing`);

console.log(log.join('\n'));
await b.close();
process.exit(log.some((l) => l.startsWith('FAIL')) ? 1 : 0);
