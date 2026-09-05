/**
 * Proves R6 against the real production build: visit once, go offline, and
 * confirm day pages, illustrations and navigation all still work.
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:4321';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 375, height: 700 }, serviceWorkers: 'allow' });
const p = await ctx.newPage();

const log = [];
const ok = (label, cond, extra = '') => log.push(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? ` · ${extra}` : ''}`);

await p.goto(`${BASE}/day/2026-10-19`, { waitUntil: 'networkidle' });

const reg = await p.evaluate(async () => {
  const r = await navigator.serviceWorker.ready;
  return { scope: r.scope, active: !!r.active };
});
ok('service worker registers and activates', reg.active, reg.scope);

// Give the background pass time to pull the program down.
await p.waitForTimeout(9000);

const cached = await p.evaluate(async () => {
  const names = await caches.keys();
  const c = await caches.open(names[0]);
  const all = await c.keys();
  const urls = all.map((r) => new URL(r.url).pathname);
  return {
    cacheName: names[0],
    total: urls.length,
    days: urls.filter((u) => u.startsWith('/day/')).length,
    exercises: urls.filter((u) => u.startsWith('/exercise/')).length,
    hasManifest: urls.includes('/manifest.webmanifest'),
    hasIcon: urls.some((u) => u.startsWith('/icons/')),
  };
});
ok('all 87 day pages cached', cached.days === 87, `${cached.days} cached`);
ok('all 50 exercise pages cached', cached.exercises === 50, `${cached.exercises} cached`);
ok('manifest and icons cached', cached.hasManifest && cached.hasIcon, `${cached.total} entries total`);

// Cut the network.
await ctx.setOffline(true);

await p.goto(`${BASE}/day/2026-10-19`, { waitUntil: 'domcontentloaded' });
ok('the visited day page loads offline', (await p.locator('h1').first().textContent())?.includes('Serve A') === true);
ok('its illustrations render offline', (await p.locator('svg[role="img"]').count()) >= 4, `${await p.locator('svg[role="img"]').count()} svgs`);

// A day never opened while online.
await p.goto(`${BASE}/day/2026-09-21`, { waitUntil: 'domcontentloaded' });
const t = await p.locator('h1').first().textContent();
ok('a day page never opened before still loads offline', t?.includes('Serve A') === true, t ?? '');

await p.goto(`${BASE}/plan`, { waitUntil: 'domcontentloaded' });
ok('the plan overview loads offline', (await p.locator('h1').first().textContent()) === 'The plan');

await p.goto(`${BASE}/progress`, { waitUntil: 'domcontentloaded' });
ok('progress loads offline', (await p.locator('h1').first().textContent()) === 'Progress');

await p.goto(`${BASE}/exercise/rotational-wall-throw`, { waitUntil: 'domcontentloaded' });
ok('an exercise page loads offline', (await p.locator('h1').first().textContent())?.includes('Rotational Wall Throw') === true);

// Set state must still persist with no network. Wait for hydration first —
// the pips are server-rendered before React attaches, so an immediate click
// would be testing the test, not the app.
await p.goto(`${BASE}/day/2026-09-21`, { waitUntil: 'domcontentloaded' });
const pip = p.locator('button[aria-label^="Set 1 of"]').first();
await pip.waitFor({ state: 'visible' });
await p.waitForFunction(() => {
  const btn = document.querySelector('button[aria-label^="Set 1 of"]');
  return btn && Object.keys(btn).some((k) => k.startsWith('__react'));
}, null, { timeout: 10_000 });
await pip.click();
await p.waitForFunction(() => localStorage.getItem('nationals:day:2026-09-21:sets') !== null, null, { timeout: 5000 })
  .catch(() => {});
const beforeReload = await p.evaluate(() => localStorage.getItem('nationals:day:2026-09-21:sets'));
ok('a tap writes to storage with no network', beforeReload !== null, String(beforeReload));

await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(600);
ok('sets still persist offline', (await p.locator('article').first().locator('button[aria-pressed="true"]').count()) === 1);

console.log(log.join('\n'));
await b.close();
process.exit(log.some((l) => l.startsWith('FAIL')) ? 1 : 0);
