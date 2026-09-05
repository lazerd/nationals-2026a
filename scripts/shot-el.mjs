import { chromium } from 'playwright';
const [url, sel, out] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 3 });
await p.goto(url, { waitUntil: 'networkidle' });
await p.locator(sel).screenshot({ path: out });
await b.close();
console.log('->', out);
