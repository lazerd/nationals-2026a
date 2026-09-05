import { chromium } from 'playwright';
const [url, out, width = '390', height = '2400'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: +width, height: +height }, deviceScaleFactor: 2 });
await p.goto(url, { waitUntil: 'networkidle' });
await p.screenshot({ path: out, fullPage: true });
await b.close();
console.log('->', out);
