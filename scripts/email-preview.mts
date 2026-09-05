import { writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { htmlFor, subjectFor, textFor, completeEmail } from '../worker/src/email';
import { getDay } from '../src/data/plan';

const ORIGIN = 'https://nationals.clubmode.ai';
const outDir = process.argv[2];
mkdirSync(outDir, { recursive: true });

const targets = ['2026-10-19', '2026-11-01', '2026-11-30'];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

for (const date of targets) {
  const day = getDay(date)!;
  const html = htmlFor(day, ORIGIN);
  writeFileSync(`${outDir}/email-${date}.html`, html);
  console.log(`${date}  ${subjectFor(day)}`);
  // Gmail on iOS renders at roughly this width.
  const p = await b.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
  await p.setContent(html, { waitUntil: 'load' });
  await p.screenshot({ path: `${outDir}/email-${date}.png`, fullPage: true });
  await p.close();
}

const done = completeEmail(ORIGIN);
writeFileSync(`${outDir}/email-complete.html`, done.html);
const p = await b.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2 });
await p.setContent(done.html, { waitUntil: 'load' });
await p.screenshot({ path: `${outDir}/email-complete.png`, fullPage: true });
await p.close();
await b.close();

console.log('\n--- plain text alternative, 2026-10-19 ---\n');
console.log(textFor(getDay('2026-10-19')!, ORIGIN));
