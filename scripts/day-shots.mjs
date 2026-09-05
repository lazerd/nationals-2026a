import { chromium } from 'playwright';
const out = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await (await b.newContext({ viewport: { width: 375, height: 780 }, deviceScaleFactor: 2 })).newPage();

await p.goto('http://localhost:3000/day/2026-10-19', { waitUntil: 'networkidle' });
// Mid-session: some sets done, a rest running, the mistakes open on one card.
const card = p.locator('article').first();
await card.locator('button[aria-label="Set 1 of 6"]').click();
await p.waitForTimeout(120);
await card.locator('button:has-text("Common mistakes")').click();
await p.waitForTimeout(250);
await p.screenshot({ path: `${out}/day-mid.png`, clip: { x: 0, y: 150, width: 375, height: 780 } });

await p.locator('button[aria-label^="How to do"]').first().click();
await p.waitForTimeout(350);
await p.screenshot({ path: `${out}/day-sheet.png` });
await p.keyboard.press('Escape');

for (const c of await p.locator('article').all()) {
  const pips = await c.locator('button[aria-label^="Set "]').all();
  if (pips.length) await pips[pips.length - 1].click();
  await p.waitForTimeout(40);
}
await p.locator('button:has-text("Mark session done")').click();
await p.waitForTimeout(500);
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/day-done.png` });

await b.close();
console.log('ok');
