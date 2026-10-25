import { lookup } from 'node:dns/promises';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { ffmpeg } from './ffmpeg.js';

// Resolves a SwingVision share link (swing.vision/matches/…, highlight links)
// to a downloadable video. SwingVision has no public API, so we read the
// public share page the same way a browser or link-preview bot would and look
// for the video it embeds. Direct .mp4/.m3u8 links work too.

const UA = 'Mozilla/5.0 (compatible; ClubModeReels/0.1; +https://clubmode.app)';
const MEDIA_RE = /\.(m3u8|mp4|mov|m4v)(\?|#|$)/i;
const MAX_PAGE_BYTES = 5 * 1024 * 1024;

export class IngestError extends Error {}

export const UPLOAD_HINT =
  'In SwingVision, open the session, tap Share Video and save it to your phone, then upload the file here instead.';

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return isPrivateIp(v.slice(7));
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
}

// Keeps a public link-fetching endpoint from being pointed at internal hosts.
export async function assertPublicUrl(raw) {
  let url;
  try { url = new URL(raw); } catch { throw new IngestError('That doesn\'t look like a link.'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new IngestError('Only http(s) links are supported.');
  if (process.env.ALLOW_PRIVATE_URLS === '1') return url;
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addrs = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => {
    throw new IngestError(`Couldn't reach ${url.hostname}.`);
  });
  if (addrs.some((a) => isPrivateIp(a.address))) throw new IngestError('That link points at a private address.');
  return url;
}

async function fetchPage(raw) {
  let url = await assertPublicUrl(raw);
  for (let hop = 0; hop < 5; hop++) {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*' },
      signal: AbortSignal.timeout(15000),
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      url = await assertPublicUrl(new URL(res.headers.get('location'), url).href);
      continue;
    }
    if (!res.ok) throw new IngestError(`The link returned HTTP ${res.status}. Is the session shared publicly?`);
    const type = res.headers.get('content-type') || '';
    if (type.startsWith('video/') || type.includes('mpegurl')) {
      res.body?.cancel();
      return { finalUrl: url.href, html: null, isMedia: true };
    }
    const reader = res.body.getReader();
    const chunks = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_PAGE_BYTES) { reader.cancel(); break; }
      chunks.push(value);
    }
    return { finalUrl: url.href, html: Buffer.concat(chunks).toString('utf8'), isMedia: false };
  }
  throw new IngestError('Too many redirects.');
}

function decode(s) {
  return s
    .replace(/\\u002[fF]/g, '/')
    .replace(/\\u0026/g, '&')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x2F;/gi, '/')
    .replace(/&#39;/g, "'");
}

function metaContent(html, prop) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop.replace(/:/g, '\\:')}["'][^>]*content=["']([^"']+)["']` +
    `|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop.replace(/:/g, '\\:')}["']`,
    'i',
  );
  const m = html.match(re);
  return m ? decode(m[1] || m[2]) : null;
}

// "SwingVision: Jane Doe and Sam Lee vs Alex Kim and Pat Ray" → names.
export function playersFromTitle(title) {
  if (!title) return [];
  const body = title.replace(/^SwingVision:\s*/i, '').replace(/\s*[|–-]\s*SwingVision.*$/i, '');
  if (!/\s+vs\.?\s+/i.test(body)) return [];
  return body
    .split(/\s+vs\.?\s+/i)
    .flatMap((side) => side.split(/\s+(?:and|&)\s+|,\s*/i))
    .map((s) => s.trim())
    .filter((s) => s && !/^(my partner|opponent( \d+)?|player( \d+)?)$/i.test(s));
}

const START_KEYS = ['start', 'startTime', 'start_time', 'startSec', 'startSeconds', 'videoStart', 'video_start', 'startTimestamp'];
const END_KEYS = ['end', 'endTime', 'end_time', 'endSec', 'endSeconds', 'videoEnd', 'video_end', 'endTimestamp'];

function pick(obj, keys) {
  for (const k of keys) if (typeof obj[k] === 'number' && Number.isFinite(obj[k])) return obj[k];
  return undefined;
}

// Looks through any JSON on the page for a list of points/shots that carry
// video timestamps. If SwingVision exposes these, they beat audio detection.
export function findTimedSegments(json) {
  let best = [];
  const visit = (node, depth) => {
    if (!node || typeof node !== 'object' || depth > 12) return;
    if (Array.isArray(node)) {
      if (node.length >= 2 && node.every((o) => o && typeof o === 'object' && !Array.isArray(o))) {
        const segs = node
          .map((o) => ({ start: pick(o, START_KEYS), end: pick(o, END_KEYS), shots: o.shots?.length ?? o.shotCount ?? o.rallyLength }))
          .filter((s) => s.start !== undefined && s.end !== undefined && s.end > s.start);
        if (segs.length >= Math.max(2, node.length * 0.8) && segs.length > best.length) {
          // Millisecond timestamps are common in web payloads.
          const scale = segs.some((s) => s.end > 50000) ? 1000 : 1;
          best = segs.map((s) => ({
            start: s.start / scale,
            end: s.end / scale,
            shots: typeof s.shots === 'number' ? s.shots : undefined,
          }));
        }
      }
      for (const v of node) visit(v, depth + 1);
    } else {
      for (const v of Object.values(node)) visit(v, depth + 1);
    }
  };
  visit(json, 0);
  return best;
}

export function extractFromHtml(html, baseUrl) {
  const found = [];
  const add = (u) => {
    if (!u) return;
    try {
      const abs = new URL(decode(u), baseUrl).href;
      if (!found.includes(abs)) found.push(abs);
    } catch { /* ignore malformed */ }
  };

  for (const p of ['og:video:secure_url', 'og:video:url', 'og:video', 'twitter:player:stream']) {
    add(metaContent(html, p));
  }
  for (const m of html.matchAll(/<(?:video|source)[^>]+src=["']([^"']+)["']/gi)) add(m[1]);
  for (const m of html.matchAll(/"(?:video|hls|playback|stream|media|download|mp4|source)_?(?:url|src|uri)"\s*:\s*"([^"]+)"/gi)) {
    if (MEDIA_RE.test(decode(m[1])) || /^https?:/.test(decode(m[1]))) add(m[1]);
  }
  for (const m of html.matchAll(/https?:(?:\/|\\\/|\\u002[fF]){2}[^"'\s<>()]+?\.(?:m3u8|mp4|mov|m4v)(?:\?[^"'\s<>()]*)?/gi)) add(m[0]);

  const media = found.filter((u) => MEDIA_RE.test(new URL(u).pathname) || /\.(m3u8|mp4)/i.test(u));
  // HLS masters carry the best rendition; otherwise keep page order (og:video first).
  media.sort((a, b) => Number(/\.m3u8/i.test(b)) - Number(/\.m3u8/i.test(a)));

  let segments = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/(?:ld\+)?json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const segs = findTimedSegments(JSON.parse(m[1]));
      if (segs.length > segments.length) segments = segs;
    } catch { /* not JSON */ }
  }

  const title = metaContent(html, 'og:title') || html.match(/<title>([^<]+)<\/title>/i)?.[1] || null;
  return {
    videoUrls: media,
    title: title ? decode(title).trim() : null,
    thumbnail: metaContent(html, 'og:image'),
    players: playersFromTitle(title && decode(title)),
    segments,
  };
}

// Sites yt-dlp handles natively; their pages don't embed a plain video URL.
const VIDEO_SITES = /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com|facebook\.com|fb\.watch|instagram\.com)$/i;

export function isVideoSite(raw) {
  try { return VIDEO_SITES.test(new URL(raw).hostname); } catch { return false; }
}

// Resolves to { ok, error }. Caps at 1080p: plenty for a 1080x1920 reel.
function ytDlp(url, out) {
  return new Promise((resolve) => {
    const proc = spawn(process.env.YTDLP_PATH || 'yt-dlp', [
      '--no-playlist', '--no-progress', '--force-overwrites',
      '-f', 'bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080][ext=mp4]/bv*[height<=1080]+ba/b',
      '--merge-output-format', 'mp4', '-o', out, url,
    ]);
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr = (stderr + d).slice(-2000); });
    proc.on('error', () => resolve({ ok: false, error: 'yt-dlp is not installed' }));
    proc.on('close', (code) => resolve({ ok: code === 0, error: stderr.trim().split('\n').pop() }));
  });
}

async function download(mediaUrl, out, onProgress) {
  await assertPublicUrl(mediaUrl);
  await ffmpeg(
    ['-user_agent', UA, '-i', mediaUrl, '-map', '0:v:0', '-map', '0:a:0?', '-c', 'copy', '-movflags', '+faststart', out],
    { onProgress },
  );
}

// Downloads the video behind `link` to `out`. Returns page metadata.
export async function ingestLink(link, out, { onStatus = () => {} } = {}) {
  if (isVideoSite(link)) {
    onStatus('Downloading video');
    const res = await ytDlp(link.trim(), out);
    if (!res.ok) throw new IngestError(`Couldn't download that video (${res.error}). Is it public or unlisted?`);
    return { title: null, players: [], segments: [] };
  }

  onStatus('Opening link');
  const page = await fetchPage(link.trim());
  if (page.isMedia || MEDIA_RE.test(new URL(page.finalUrl).pathname)) {
    onStatus('Downloading video');
    await download(page.finalUrl, out);
    return { title: null, players: [], segments: [] };
  }

  const info = extractFromHtml(page.html, page.finalUrl);
  const errors = [];
  for (const mediaUrl of info.videoUrls.slice(0, 4)) {
    try {
      onStatus('Downloading video');
      await download(mediaUrl, out);
      return info;
    } catch (err) {
      errors.push(err.message);
    }
  }

  onStatus('Trying fallback downloader');
  if ((await ytDlp(page.finalUrl, out)).ok) return info;

  const why = info.videoUrls.length
    ? `Found the video but couldn't download it (${errors[0]}).`
    : 'Couldn\'t find a video on that page. SwingVision may only load it after sign-in.';
  throw new IngestError(`${why} ${UPLOAD_HINT}`);
}
