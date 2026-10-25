import { ffmpegStream } from './ffmpeg.js';

// Ball strikes are short, sharp transients in the 1–6 kHz band. We band-pass
// the court audio, track short-time energy, and call a "hit" wherever energy
// jumps well above the local background and is a local peak.

export const SAMPLE_RATE = 22050;
export const HOP = 256; // ~11.6 ms per energy frame

export const DEFAULTS = {
  minRiseDb: 12, // how far above the preceding ~0.5 s a strike must jump
  floorDb: 6, // and how far above the file's typical loudness
  minHitGapSec: 0.45, // two strikes can't be closer than this
  maxRallyGapSec: 3.2, // longer silence than this ends the rally
  minRallyHits: 3,
  prePadSec: 1.2,
  postPadSec: 1.8,
  maxClipSec: 16,
};

// Converts a stream of float samples into per-frame log energy (dB).
export function energyFrames(samples, hop = HOP) {
  const n = Math.floor(samples.length / hop);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let e = 0;
    for (let j = i * hop, end = j + hop; j < end; j++) e += samples[j] * samples[j];
    out[i] = 10 * Math.log10(e / hop + 1e-10);
  }
  return out;
}

function median(arr) {
  const a = Float32Array.from(arr).sort();
  return a.length ? a[a.length >> 1] : 0;
}

// Returns hit times (seconds) from per-frame dB energy.
export function detectHits(db, { sampleRate = SAMPLE_RATE, hop = HOP, ...opts } = {}) {
  const o = { ...DEFAULTS, ...opts };
  const frameSec = hop / sampleRate;
  const back = Math.round(0.5 / frameSec);
  const guard = 3; // skip the frames right before the onset itself
  const peakWin = Math.max(1, Math.round(0.05 / frameSec));
  const globalFloor = median(db) + o.floorDb;

  // Rolling background: mean of the window [i-back, i-guard).
  const prefix = new Float64Array(db.length + 1);
  for (let i = 0; i < db.length; i++) prefix[i + 1] = prefix[i] + db[i];

  const candidates = [];
  for (let i = back; i < db.length; i++) {
    const v = db[i];
    if (v < globalFloor) continue;
    const bg = (prefix[i - guard] - prefix[i - back]) / (back - guard);
    if (v - bg < o.minRiseDb) continue;
    let isPeak = true;
    for (let k = Math.max(0, i - peakWin); k <= Math.min(db.length - 1, i + peakWin); k++) {
      if (db[k] > v) { isPeak = false; break; }
    }
    if (isPeak) candidates.push({ t: i * frameSec, strength: v - bg });
  }

  // Enforce the minimum gap, keeping the stronger of two close candidates.
  const hits = [];
  for (const c of candidates) {
    const last = hits[hits.length - 1];
    if (last && c.t - last.t < o.minHitGapSec) {
      if (c.strength > last.strength) hits[hits.length - 1] = c;
    } else {
      hits.push(c);
    }
  }
  return hits.map((h) => Number(h.t.toFixed(3)));
}

// Groups hit times into rallies and turns each into a padded clip window.
export function groupRallies(hits, duration, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const groups = [];
  let cur = [];
  for (const t of hits) {
    if (cur.length && t - cur[cur.length - 1] > o.maxRallyGapSec) {
      groups.push(cur);
      cur = [];
    }
    cur.push(t);
  }
  if (cur.length) groups.push(cur);

  return groups
    .filter((g) => g.length >= o.minRallyHits)
    .map((g) => {
      let start = Math.max(0, g[0] - o.prePadSec);
      const end = Math.min(duration || Infinity, g[g.length - 1] + o.postPadSec);
      // Long rallies: keep the ending, which is where the point is won.
      if (end - start > o.maxClipSec) start = end - o.maxClipSec;
      const shots = g.filter((t) => t >= start).length;
      return { start: round(start), end: round(end), shots };
    });
}

export function scoreClip(clip, motion = 0) {
  const dur = clip.end - clip.start;
  return round(clip.shots + 0.25 * dur + 4 * motion);
}

// Streams a file's audio through ffmpeg and returns its rally clips.
export async function analyzeAudio(file, duration, opts = {}) {
  const frames = [];
  let leftover = Buffer.alloc(0);
  let pending = new Float32Array(0);
  await ffmpegStream(
    ['-i', file, '-vn', '-ac', '1', '-ar', String(SAMPLE_RATE),
      '-af', 'highpass=f=1000,lowpass=f=6000', '-f', 'f32le'],
    (chunk) => {
      const data = leftover.length ? Buffer.concat([leftover, chunk]) : chunk;
      const usable = data.length - (data.length % 4);
      leftover = data.subarray(usable);
      const copy = new Float32Array(usable / 4);
      Buffer.from(copy.buffer).set(data.subarray(0, usable));
      const merged = new Float32Array(pending.length + copy.length);
      merged.set(pending);
      merged.set(copy, pending.length);
      const whole = merged.length - (merged.length % HOP);
      frames.push(energyFrames(merged.subarray(0, whole)));
      pending = merged.slice(whole);
    },
  );
  const total = frames.reduce((n, f) => n + f.length, 0);
  const db = new Float32Array(total);
  let off = 0;
  for (const f of frames) { db.set(f, off); off += f.length; }

  const hits = detectHits(db, opts);
  return { hits, clips: groupRallies(hits, duration, opts) };
}

function round(n) {
  return Math.round(n * 100) / 100;
}
