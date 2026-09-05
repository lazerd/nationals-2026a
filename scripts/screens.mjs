import { chromium } from 'playwright';
const [base, out] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();

// Seed some completed days and two test results so the screens have real data.
await p.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
await p.evaluate(() => {
  const dates = [];
  const d = new Date('2026-09-05T00:00:00Z');
  for (let i = 0; i < 62; i++) {
    if (i % 9 !== 4) dates.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  for (const x of dates) localStorage.setItem(`nationals:day:${x}:done`, 'true');
  localStorage.setItem('nationals:tests', JSON.stringify([
    { date: '2026-10-04', serveSpeedFastest: 96, serveSpeedAverage: 88, firstServePercent: 55, shuttle5105: 5.42, broadJump: 6.9, lateralBoundLeft: 5.1, lateralBoundRight: 5.6 },
    { date: '2026-11-01', serveSpeedFastest: 100, serveSpeedAverage: 92, firstServePercent: 62, shuttle5105: 5.21, broadJump: 7.2, lateralBoundLeft: 5.4, lateralBoundRight: 5.7 },
  ]));
});

const shots = [
  ['/day/2026-09-09', 'mobility', 900],
  ['/day/2026-11-01', 'testday', 2200],
  ['/day/2026-11-30', 'matchday', 1800],
  ['/progress', 'progress', 2600],
  ['/plan', 'plan', 1600],
];
for (const [path, name, h] of shots) {
  await p.setViewportSize({ width: 375, height: h });
  await p.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: false });
  console.log(name);
}
await b.close();
