/**
 * Serves out/ the way Cloudflare Pages does — clean URLs mapped to .html,
 * _headers honoured loosely — so the service worker can be tested against the
 * real production build rather than the dev server.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = 'out';
const PORT = Number(process.argv[2] ?? 4321);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

async function resolve(pathname) {
  const clean = decodeURIComponent(pathname).replace(/\/+$/, '') || '/index';
  for (const candidate of [join(ROOT, clean), join(ROOT, `${clean}.html`), join(ROOT, clean, 'index.html')]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      /* try the next shape */
    }
  }
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = await resolve(url.pathname);
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/html' });
    res.end(await readFile(join(ROOT, '404.html')).catch(() => 'not found'));
    return;
  }
  const body = await readFile(file);
  res.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'cache-control': file.includes('_next/static') ? 'public, max-age=31536000, immutable' : 'no-cache',
    ...(file.endsWith('sw.js') ? { 'service-worker-allowed': '/' } : {}),
  });
  res.end(body);
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
