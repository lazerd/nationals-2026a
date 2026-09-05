/**
 * Catches illustrations whose drawn content escapes the 320x180 viewBox, which
 * shows up as a figure clipped by the card edge on a phone.
 */
import { chromium } from 'playwright';
const BASE = process.argv[2] ?? 'http://localhost:4321';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 430, height: 900 } });
await p.goto(`${BASE}/dev/illustrations`, { waitUntil: 'networkidle' });

const bad = await p.evaluate(() => {
  const out = [];
  for (const fig of document.querySelectorAll('figure')) {
    const name = fig.querySelector('figcaption span')?.textContent ?? '?';
    const svg = fig.querySelector('svg[role="img"]');
    if (!svg) continue;

    // getBoundingClientRect is in CSS pixels and includes stroke width, which
    // is exactly what "does it get clipped by the card" means. Normalise back
    // into viewBox units against the svg's own rect.
    const box = svg.getBoundingClientRect();
    if (box.width === 0) continue;
    const sx = 320 / box.width;
    const sy = 180 / box.height;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of svg.querySelectorAll('line, circle, rect, path, polyline, ellipse, text')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      minX = Math.min(minX, (r.left - box.left) * sx);
      maxX = Math.max(maxX, (r.right - box.left) * sx);
      minY = Math.min(minY, (r.top - box.top) * sy);
      maxY = Math.max(maxY, (r.bottom - box.top) * sy);
    }
    if (!Number.isFinite(minX)) continue;

    const over = [];
    if (minX < -1) over.push(`left ${minX.toFixed(0)}`);
    if (maxX > 321) over.push(`right ${maxX.toFixed(0)}`);
    if (minY < -1) over.push(`top ${minY.toFixed(0)}`);
    if (maxY > 181) over.push(`bottom ${maxY.toFixed(0)}`);
    if (over.length) out.push({ name, over: over.join(', ') });
  }
  return out;
});

if (bad.length === 0) console.log('PASS  every illustration stays inside its 320x180 viewBox');
else {
  console.log(`FAIL  ${bad.length} illustration(s) overflow the viewBox:`);
  for (const x of bad) console.log(`   ${x.name.padEnd(36)} ${x.over}`);
}
await b.close();
process.exit(bad.length ? 1 : 0);
