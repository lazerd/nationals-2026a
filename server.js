import express from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { probe, ffmpeg } from './lib/ffmpeg.js';
import { analyzeAudio, scoreClip, pointEndings } from './lib/detect.js';
import { sampleColor, sceneBackground, identifyInClip, winnerLikelihood } from './lib/identify.js';
import { analyzeMotion, playerPath } from './lib/track.js';
import { ingestLink, IngestError } from './lib/ingest.js';
import { renderReel, BRAND } from './lib/render.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const PORT = Number(process.env.PORT || 3000);
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 4096);
const RETENTION_HOURS = Number(process.env.RETENTION_HOURS || 48);
const CONCURRENCY = Number(process.env.JOB_CONCURRENCY || 2);

const sources = new Map();
const reels = new Map();

// ---- tiny job queue -------------------------------------------------------
const queue = [];
let running = 0;
function enqueue(fn) {
  queue.push(fn);
  pump();
}
function pump() {
  while (running < CONCURRENCY && queue.length) {
    const fn = queue.shift();
    running++;
    Promise.resolve().then(fn).catch((err) => console.error(err)).finally(() => { running--; pump(); });
  }
}

const newId = () => crypto.randomBytes(9).toString('base64url');
const sourceDir = (id) => path.join(DATA, 'sources', id);
const reelDir = (id) => path.join(DATA, 'reels', id);
const validId = (id) => /^[A-Za-z0-9_-]{6,32}$/.test(id);

async function save(dir, obj) {
  await fs.writeFile(path.join(dir, 'meta.json'), JSON.stringify(obj));
}

async function load(map, dirFn, id) {
  if (!validId(id)) return null;
  if (map.has(id)) return map.get(id);
  try {
    const obj = JSON.parse(await fs.readFile(path.join(dirFn(id), 'meta.json'), 'utf8'));
    // A job that was mid-flight when the server stopped won't resume.
    if (!['ready', 'error'].includes(obj.status)) Object.assign(obj, { status: 'error', error: 'Interrupted by a server restart. Please try again.' });
    map.set(id, obj);
    return obj;
  } catch {
    return null;
  }
}

// What gets written to disk, and what the API returns.
function storedSource(s) {
  const { motion, ...rest } = s;
  return rest;
}
function publicSource(s) {
  const { motion, file, ...rest } = s;
  return rest;
}

async function thumbnail(file, t, out) {
  await ffmpeg(['-ss', t.toFixed(2), '-i', file, '-frames:v', '1', '-vf', 'scale=360:-2', '-q:v', '5', out]);
}

async function makeClip(s, { start, end, shots }, manual = false) {
  const id = newId();
  const clip = { id, start, end, shots: shots ?? null, manual };
  for (const side of ['near', 'far']) {
    const { activity } = playerPath(s.motion, side, start, end);
    clip[`score_${side}`] = scoreClip({ start, end, shots: shots ?? 0 }, activity) + (manual ? 100 : 0);
  }
  try {
    await thumbnail(s.file, (start + end) / 2, path.join(sourceDir(s.id), `thumb_${id}.jpg`));
    clip.thumb = `/media/sources/${s.id}/thumb_${id}.jpg`;
  } catch { /* thumbnails are optional */ }
  return clip;
}

async function processSource(s, { link } = {}) {
  const dir = sourceDir(s.id);
  const update = async (patch) => { Object.assign(s, patch); await save(dir, storedSource(s)); };
  try {
    let page = { segments: [], players: [], title: null };
    if (link) {
      await update({ status: 'downloading', step: 'Opening link' });
      page = await ingestLink(link, s.file, { onStatus: (step) => update({ step }) });
    }
    await update({ status: 'analyzing', step: 'Reading video' });
    const info = await probe(s.file);
    await update({
      info: { ...info, title: page.title, players: page.players, thumbnail: page.thumbnail || null },
      step: 'Finding rallies and tracking players',
    });

    const [audio, motion] = await Promise.all([
      info.hasAudio && !page.segments.length ? analyzeAudio(s.file, info.duration) : Promise.resolve(null),
      analyzeMotion(s.file),
    ]);
    s.motion = motion;
    await fs.writeFile(path.join(dir, 'motion.json'), JSON.stringify(motion));

    let candidates = page.segments.length ? page.segments : audio?.clips || [];
    let detection = page.segments.length ? 'swingvision' : audio ? 'audio' : 'none';
    if (!candidates.length) {
      // No usable audio: fall back to evenly spaced moments the user can prune.
      detection = 'even';
      const step = Math.max(10, info.duration / 12);
      for (let t = 0; t + 6 <= info.duration; t += step) candidates.push({ start: t, end: Math.min(info.duration, t + 8) });
    }
    candidates = candidates.slice(0, 400);

    await update({ step: `Building ${candidates.length} clip previews` });
    const clips = [];
    for (const c of candidates) clips.push(await makeClip(s, c));
    // Every exchange's final strike, for "my winners" once the player taps themselves.
    const endings = audio ? pointEndings(audio.rallies, info.duration) : [];
    await update({ status: 'ready', step: null, detection, clips, endings });
  } catch (err) {
    console.error(`source ${s.id}:`, err);
    await update({ status: 'error', error: err instanceof IngestError ? err.message : `Processing failed: ${err.message}` });
  }
}

// Finds the points the tapped player won: exchanges whose final strike came
// from their end, ranked by how likely it was their swing rather than their
// partner's.
async function processWinners(s, tap) {
  const dir = sourceDir(s.id);
  const update = async (patch) => { Object.assign(s, patch); await save(dir, storedSource(s)); };
  try {
    const endings = s.endings || [];
    await update({ identify: { status: 'running', done: 0, total: endings.length, step: 'Learning what you look like' } });
    const color = await sampleColor(s.file, tap.t, tap.x, tap.y);
    const bg = await sceneBackground(s.file, s.info.duration);
    const winners = [];
    for (const [i, e] of endings.entries()) {
      const id = await identifyInClip(s.file, e, color, { bg });
      if (id.mySide && e.lastSide === id.mySide) {
        const likelihood = winnerLikelihood(e, id);
        const clip = {
          id: newId(), start: e.start, end: e.end, shots: e.shots, lastHit: e.lastHit,
          likelihood, meShare: id.meShare, mySide: id.mySide, keyframes: id.keyframes,
          label: 'WINNER', winner: true,
        };
        try {
          await thumbnail(s.file, Math.max(0, e.lastHit - 0.15), path.join(dir, `thumb_${clip.id}.jpg`));
          clip.thumb = `/media/sources/${s.id}/thumb_${clip.id}.jpg`;
        } catch { /* optional */ }
        winners.push(clip);
      }
      if (i % 3 === 2 || i === endings.length - 1) {
        await update({ identify: { status: 'running', done: i + 1, total: endings.length, step: 'Checking every point' } });
      }
    }
    await update({ winners, me: { color, ...tap }, identify: { status: 'ready', done: endings.length, total: endings.length } });
  } catch (err) {
    console.error(`winners ${s.id}:`, err);
    await update({ identify: { status: 'error', error: err.message } });
  }
}

async function processReel(r, s, clips, opts) {
  const dir = reelDir(r.id);
  const update = async (patch) => { Object.assign(r, patch); await save(dir, r); };
  try {
    await update({ status: 'rendering', progress: 0 });
    if (!s.motion) s.motion = JSON.parse(await fs.readFile(path.join(sourceDir(s.id), 'motion.json'), 'utf8'));
    const ordered = clips
      .map((c) => ({
        ...c,
        score: c.winner ? c.likelihood : c[`score_${opts.side}`],
        keyframes: c.keyframes || playerPath(s.motion, opts.side, c.start, c.end).keyframes,
      }))
      .sort((a, b) => a.start - b.start);
    const out = path.join(dir, 'reel.mp4');
    let last = 0;
    const result = await renderReel({
      source: s.file, src: s.info, clips: ordered, workDir: path.join(dir, 'work'), outFile: out, ...opts,
      onProgress: (p) => { if (p - last > 0.02 || p === 1) { last = p; update({ progress: Number(p.toFixed(3)) }); } },
    });
    await fs.rm(path.join(dir, 'work'), { recursive: true, force: true });
    await update({ status: 'ready', progress: 1, duration: result.duration, layout: result.layout, url: `/media/reels/${r.id}/reel.mp4` });
  } catch (err) {
    console.error(`reel ${r.id}:`, err);
    await update({ status: 'error', error: `Render failed: ${err.message}` });
  }
}

// ---- HTTP -----------------------------------------------------------------
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));
app.use(express.static(path.join(ROOT, 'public')));
app.use('/fonts', express.static(path.join(ROOT, 'assets/fonts'), { maxAge: '7d' }));
// Only rendered media is public, never job metadata or raw uploads.
app.use('/media', (req, res, next) => (/\.(mp4|mov|m4v|webm|jpg)$/i.test(req.path) ? next() : res.sendStatus(404)));
app.use('/media', express.static(DATA, { index: false, dotfiles: 'deny' }));

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, _file, cb) => {
      const dir = path.join(DATA, 'uploads');
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, _file, cb) => cb(null, newId()),
  }),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
});

app.get('/api/config', (_req, res) => res.json({ brand: BRAND, maxUploadMb: MAX_UPLOAD_MB }));

app.post('/api/sources', upload.single('video'), async (req, res) => {
  const link = req.body?.url?.trim();
  if (!req.file && !link) return res.status(400).json({ error: 'Paste a SwingVision link or upload a video.' });
  const id = newId();
  const dir = sourceDir(id);
  await fs.mkdir(dir, { recursive: true });
  const s = { id, status: 'queued', step: 'Waiting in line', link: link || null, createdAt: Date.now(), file: path.join(dir, 'source.mp4') };
  if (req.file) {
    // Remux so the browser can scrub it; fall back to the raw upload.
    const ext = path.extname(req.file.originalname || '').toLowerCase() || '.mp4';
    s.file = path.join(dir, `original${ext}`);
    await fs.rename(req.file.path, s.file);
  }
  sources.set(id, s);
  await save(dir, storedSource(s));
  enqueue(async () => {
    if (req.file) {
      try {
        const remuxed = path.join(dir, 'source.mp4');
        await ffmpeg(['-i', s.file, '-map', '0:v:0', '-map', '0:a:0?', '-c', 'copy', '-movflags', '+faststart', remuxed]);
        await fs.rm(s.file);
        s.file = remuxed;
      } catch { /* keep original container */ }
    }
    s.previewUrl = `/media/sources/${id}/${path.basename(s.file)}`;
    await processSource(s, { link: req.file ? null : link });
  });
  res.status(202).json({ id });
});

app.get('/api/sources/:id', async (req, res) => {
  const s = await load(sources, sourceDir, req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(publicSource(s));
});

// Lets the user add a moment detection missed.
app.post('/api/sources/:id/clips', async (req, res) => {
  const s = await load(sources, sourceDir, req.params.id);
  if (!s || s.status !== 'ready') return res.status(404).json({ error: 'Not found' });
  const start = Math.max(0, Number(req.body.start));
  const end = Math.min(s.info.duration, Number(req.body.end));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end - start < 1 || end - start > 30) {
    return res.status(400).json({ error: 'Clips must be 1–30 seconds long.' });
  }
  if (!s.motion) s.motion = JSON.parse(await fs.readFile(path.join(sourceDir(s.id), 'motion.json'), 'utf8'));
  const clip = await makeClip(s, { start, end }, true);
  s.clips.push(clip);
  s.clips.sort((a, b) => a.start - b.start);
  await save(sourceDir(s.id), storedSource(s));
  res.status(201).json(clip);
});

// The player taps themselves on a paused frame; we learn their shirt color
// and look for their winners.
app.post('/api/sources/:id/me', async (req, res) => {
  const s = await load(sources, sourceDir, req.params.id);
  if (!s || s.status !== 'ready') return res.status(404).json({ error: 'Not found' });
  if (!s.endings?.length) return res.status(400).json({ error: 'Finding winners needs the match audio, and this video has none.' });
  if (s.identify?.status === 'running') return res.status(409).json({ error: 'Already working on it.' });
  const t = Number(req.body.t);
  const x = Number(req.body.x);
  const y = Number(req.body.y);
  if (![t, x, y].every(Number.isFinite) || x < 0 || x > 1 || y < 0 || y > 1 || t < 0 || t > s.info.duration) {
    return res.status(400).json({ error: 'Tap on yourself in the video.' });
  }
  s.identify = { status: 'queued', done: 0, total: s.endings.length, step: 'Waiting in line' };
  await save(sourceDir(s.id), storedSource(s));
  enqueue(() => processWinners(s, { t, x, y }));
  res.status(202).json({ ok: true });
});

app.post('/api/reels', upload.single('music'), async (req, res) => {
  const b = req.body || {};
  const s = await load(sources, sourceDir, b.sourceId);
  if (!s || s.status !== 'ready') return res.status(400).json({ error: 'That match isn\'t ready yet.' });
  let ids;
  try { ids = JSON.parse(b.clipIds || '[]'); } catch { ids = []; }
  const clips = [...s.clips, ...(s.winners || [])].filter((c) => ids.includes(c.id));
  if (!clips.length) return res.status(400).json({ error: 'Pick at least one clip.' });
  if (clips.length > 30) return res.status(400).json({ error: 'Pick at most 30 clips.' });
  const playerName = String(b.playerName || '').trim().slice(0, 40);
  if (!playerName) return res.status(400).json({ error: 'Enter the player\'s name.' });

  const id = newId();
  const dir = reelDir(id);
  await fs.mkdir(dir, { recursive: true });
  let musicFile = null;
  if (req.file) {
    musicFile = path.join(dir, 'music');
    await fs.rename(req.file.path, musicFile);
  }
  const opts = {
    playerName,
    side: b.side === 'far' ? 'far' : 'near',
    subtitle: String(b.subtitle || '').trim().slice(0, 60),
    clubName: String(b.clubName || '').trim().slice(0, 50),
    layout: ['focus', 'full', 'follow'].includes(b.layout) ? b.layout : 'focus',
    replayBest: b.replay !== 'false',
    musicFile,
  };
  const r = { id, sourceId: s.id, status: 'queued', progress: 0, playerName, createdAt: Date.now() };
  reels.set(id, r);
  await save(dir, r);
  enqueue(() => processReel(r, s, clips, opts));
  res.status(202).json({ id });
});

app.get('/api/reels/:id', async (req, res) => {
  const r = await load(reels, reelDir, req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json(r);
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? `Max upload is ${MAX_UPLOAD_MB} MB.` : err.message });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong.' });
});

// ---- retention ------------------------------------------------------------
async function sweep() {
  const cutoff = Date.now() - RETENTION_HOURS * 3600 * 1000;
  for (const kind of ['sources', 'reels', 'uploads']) {
    const base = path.join(DATA, kind);
    const entries = await fs.readdir(base).catch(() => []);
    for (const name of entries) {
      const p = path.join(base, name);
      const stat = await fs.stat(p).catch(() => null);
      if (stat && stat.mtimeMs < cutoff) {
        await fs.rm(p, { recursive: true, force: true });
        sources.delete(name);
        reels.delete(name);
      }
    }
  }
}

export { app };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await fs.mkdir(DATA, { recursive: true });
  setInterval(() => sweep().catch(console.error), 3600 * 1000).unref();
  sweep().catch(console.error);
  app.listen(PORT, () => console.log(`${BRAND} Reels listening on http://localhost:${PORT}`));
}
