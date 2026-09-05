import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const svg = readFileSync(process.argv[2], 'utf8');
const outDir = process.argv[3];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

for (const size of [180, 192, 512]) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(
    `<style>html,body{margin:0;padding:0;background:#0a1114}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  await p.screenshot({ path: `${outDir}/icon-${size}.png`, omitBackground: false });
  await p.close();
  console.log(`icon-${size}.png`);
}
await b.close();
