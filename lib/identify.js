import { ffmpegStream } from './ffmpeg.js';
import { BANDS } from './track.js';

// Finds one specific player (the user taps themselves once) by the color of
// their clothing. That works in doubles, where "the near player" is
// ambiguous, and survives teams changing ends during the match. Only pixels
// that match the color AND move count, so static court lines, fences and
// bags in a similar color are ignored.

const W = 320;
const H = 180;
const FPS = 6;
const MOVE_THRESHOLD = 30;
const MOVE_LAG = 3; // compare against the frame ~0.5 s earlier/later
const MIN_PIXELS = { near: 20, far: 5 };
const FAR_WEIGHT = 4; // far players cover roughly a quarter of the pixels

async function rgbFrames(file, start, duration, fps = FPS) {
  const size = W * H * 3;
  const frames = [];
  let buf = Buffer.alloc(0);
  await ffmpegStream(
    ['-ss', Math.max(0, start).toFixed(3), '-t', duration.toFixed(3), '-i', file, '-an',
      '-vf', `fps=${fps},scale=${W}:${H}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo'],
    (chunk) => {
      buf = buf.length ? Buffer.concat([buf, chunk]) : chunk;
      while (buf.length >= size) {
        frames.push(Uint8Array.from(buf.subarray(0, size)));
        buf = buf.subarray(size);
      }
    },
  );
  return frames;
}

// Median color of a small patch around the tapped point (x, y in 0..1).
export async function sampleColor(file, t, x, y) {
  const [frame] = await rgbFrames(file, t, 0.5, 2);
  if (!frame) throw new Error('Could not read that frame.');
  const cx = Math.round(x * (W - 1));
  const cy = Math.round(y * (H - 1));
  const rs = [];
  const gs = [];
  const bs = [];
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const px = Math.min(W - 1, Math.max(0, cx + dx));
      const py = Math.min(H - 1, Math.max(0, cy + dy));
      const i = (py * W + px) * 3;
      rs.push(frame[i]); gs.push(frame[i + 1]); bs.push(frame[i + 2]);
    }
  }
  const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
  return { r: med(rs), g: med(gs), b: med(bs) };
}

// Chroma matters more than brightness: shade and sun change lightness a lot
// but hue much less.
export function colorDistance(a, b) {
  const la = (a.r + a.g + a.b) / 3;
  const lb = (b.r + b.g + b.b) / 3;
  const ca = [a.r - la, a.g - la, a.b - la];
  const cb = [b.r - lb, b.g - lb, b.b - lb];
  const chroma = Math.hypot(ca[0] - cb[0], ca[1] - cb[1], ca[2] - cb[2]);
  return chroma + 0.35 * Math.abs(la - lb);
}

function isColor(f, i, color, tolerance = 40) {
  return colorDistance({ r: f[i], g: f[i + 1], b: f[i + 2] }, color) <= tolerance;
}

// Largest per-channel change. Brightness alone misses e.g. a red shirt
// moving over a green court, which are close in luma.
function changed(a, b, i, threshold = MOVE_THRESHOLD) {
  return Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) >= threshold;
}

// Per-frame stats of moving, color-matching pixels in each court band.
export function locate(frames, color, tolerance = 40) {
  const bandRows = Object.fromEntries(Object.entries(BANDS).map(([k, [a, b]]) => [k, [Math.floor(a * H), Math.floor(b * H)]]));
  return frames.map((f, idx) => {
    const ref = frames[idx >= MOVE_LAG ? idx - MOVE_LAG : Math.min(frames.length - 1, idx + MOVE_LAG)];
    const out = {};
    for (const [side, [y0, y1]] of Object.entries(bandRows)) {
      let n = 0;
      let sx = 0;
      let sy = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 3;
          if (ref !== f && !changed(f, ref, i)) continue;
          if (!isColor(f, i, color, tolerance)) continue;
          n++;
          sx += x;
          sy += y;
        }
      }
      out[side] = n >= MIN_PIXELS[side] ? { n, x: (sx / n + 0.5) / W, y: (sy / n + 0.5) / H } : null;
    }
    return out;
  });
}

const FG_THRESHOLD = 35;

// Per-pixel median over a sample of frames. The camera is fixed and the
// players keep moving, so this is the empty court.
export function background(frames, samples = 31) {
  const n = Math.min(samples, frames.length);
  const pick = Array.from({ length: n }, (_, k) => frames[Math.floor((k * (frames.length - 1)) / Math.max(1, n - 1))]);
  const bg = new Uint8Array(W * H * 3);
  const vals = new Uint8Array(n);
  for (let i = 0; i < bg.length; i++) {
    for (let k = 0; k < n; k++) vals[k] = pick[k][i];
    vals.sort();
    bg[i] = vals[n >> 1];
  }
  return bg;
}

// Empty-court image from frames spread across the whole match. A single
// rally is too short: a net player who barely moves would become part of the
// "court" and leave a ghost.
export async function sceneBackground(file, duration, samples = 31) {
  const frames = [];
  for (let k = 0; k < samples; k++) {
    const t = ((k + 0.5) * duration) / samples;
    const [f] = await rgbFrames(file, t, 0.4, 5);
    if (f) frames.push(f);
  }
  if (!frames.length) throw new Error('Could not read the video.');
  return background(frames);
}

// Pixels of a shirt color, grown a little so blurred edges are covered.
function shirtMask(f, bg, color, y0, y1, grow = 2) {
  const m = new Uint8Array(W * H);
  if (!color) return m;
  for (let y = Math.max(0, y0 - grow); y < Math.min(H, y1 + grow); y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      if (!changed(f, bg, i, FG_THRESHOLD) || !isColor(f, i, color)) continue;
      for (let yy = Math.max(0, y - grow); yy <= Math.min(H - 1, y + grow); yy++) {
        for (let xx = Math.max(0, x - grow); xx <= Math.min(W - 1, x + grow); xx++) m[yy * W + xx] = 1;
      }
    }
  }
  return m;
}

function centroid(mask, y0, y1) {
  let n = 0;
  let sx = 0;
  let sy = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < W; x++) {
      if (mask[y * W + x]) { n++; sx += x; sy += y; }
    }
  }
  return n >= 8 ? { x: sx / n, y: sy / n } : null;
}

// The partner is whoever else is in the foreground on our side of the net:
// the most common non-court color there once our own shirt is removed.
export function learnPartnerColor(frames, bg, side, myColor) {
  const [top, bottom] = BANDS[side];
  const y0 = Math.floor(top * H);
  const y1 = Math.floor(bottom * H);
  const bins = new Map();
  for (let k = 0; k < frames.length; k += 2) {
    const f = frames[k];
    const mine = shirtMask(f, bg, myColor, y0, y1, 3);
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 3;
        if (mine[y * W + x] || !changed(f, bg, i, FG_THRESHOLD)) continue;
        const key = ((f[i] >> 5) << 6) | ((f[i + 1] >> 5) << 3) | (f[i + 2] >> 5);
        const b = bins.get(key) || { n: 0, r: 0, g: 0, b: 0 };
        b.n++; b.r += f[i]; b.g += f[i + 1]; b.b += f[i + 2];
        bins.set(key, b);
      }
    }
  }
  let best = null;
  for (const b of bins.values()) if (!best || b.n > best.n) best = b;
  if (!best || best.n < 40) return null;
  return { r: Math.round(best.r / best.n), g: Math.round(best.g / best.n), b: Math.round(best.b / best.n) };
}

// At contact the hitter's arm and racket stick out from their body. For each
// player on our side, count foreground pixels around them that are not shirt
// (arm, racket) at contact versus a moment earlier. Returns my share of that
// increase, or null if no swing is visible.
export function hitterShare(frames, bg, idx, side, myColor, partnerColor) {
  const [top, bottom] = BANDS[side];
  const y0 = Math.floor(top * H);
  const y1 = Math.floor(bottom * H);
  const r = (side === 'near' ? 0.12 : 0.07) * W;

  const stats = (k) => {
    const f = frames[k];
    const mine = shirtMask(f, bg, myColor, y0, y1);
    const theirs = shirtMask(f, bg, partnerColor, y0, y1);
    const me = centroid(mine, y0, y1);
    const pa = centroid(theirs, y0, y1);
    let nMe = 0;
    let nPa = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < W; x++) {
        const j = y * W + x;
        if (mine[j] || theirs[j] || !changed(f, bg, j * 3, FG_THRESHOLD)) continue;
        const dMe = me ? Math.hypot((x - me.x) / r, (y - me.y) / (r * 1.4)) : Infinity;
        const dPa = pa ? Math.hypot((x - pa.x) / r, (y - pa.y) / (r * 1.4)) : Infinity;
        if (dMe <= 1 && dMe <= dPa) nMe++;
        else if (dPa <= 1) nPa++;
      }
    }
    return { me: nMe, partner: nPa };
  };
  const avg = (from, to) => {
    const acc = { me: 0, partner: 0, n: 0 };
    for (let k = Math.max(0, from); k <= Math.min(frames.length - 1, to); k++) {
      const s = stats(k);
      acc.me += s.me; acc.partner += s.partner; acc.n++;
    }
    return acc.n ? { me: acc.me / acc.n, partner: acc.partner / acc.n } : null;
  };
  const hit = avg(idx - 2, idx + 1);
  const before = avg(idx - 8, idx - 4) || { me: 0, partner: 0 };
  if (!hit) return null;
  const me = Math.max(0, hit.me - before.me);
  const partner = Math.max(0, hit.partner - before.partner);
  if (me + partner < 3) return null;
  return me / (me + partner);
}

// Where the player is during a clip: their side of the net, a crop path,
// and (if the clip ends on a strike) whether that strike looks like theirs.
export async function identifyInClip(file, clip, color, { bg } = {}) {
  const frames = await rgbFrames(file, clip.start, clip.end - clip.start);
  const spots = locate(frames, color);
  const seen = { near: 0, far: 0 };
  for (const s of spots) {
    if (s.near) seen.near += s.near.n;
    if (s.far) seen.far += s.far.n * FAR_WEIGHT;
  }
  const mySide = seen.near + seen.far === 0 ? null : seen.near >= seen.far ? 'near' : 'far';
  const sideScore = mySide ? seen[mySide] / (seen.near + seen.far) : 0;

  const keyframes = [];
  let last = null;
  spots.forEach((s, i) => {
    const t = i / FPS;
    let x = mySide && s[mySide] ? s[mySide].x : last ?? 0.5;
    if (last !== null) x = last + (x - last) * 0.5;
    last = x;
    if (i % 3 === 0) keyframes.push({ t: Math.round(t * 100) / 100, x: Math.round(x * 1000) / 1000 });
  });

  let meShare = null;
  if (mySide && clip.lastHit !== undefined) {
    const idx = Math.round((clip.lastHit - clip.start) * FPS);
    const scene = bg || background(frames);
    const partnerColor = learnPartnerColor(frames, scene, mySide, color);
    meShare = hitterShare(frames, scene, idx, mySide, color, partnerColor);
  }
  const visible = spots.filter((s) => mySide && s[mySide]).length / Math.max(1, spots.length);
  return {
    mySide,
    sideScore: Number(sideScore.toFixed(2)),
    visible: Number(visible.toFixed(2)),
    meShare: meShare === null ? null : Number(meShare.toFixed(2)),
    keyframes,
  };
}

// How likely a point ending is "my winner", 0..1.
export function winnerLikelihood(clip, id) {
  if (!id.mySide || !clip.lastSide) return 0;
  const teamEnded = clip.lastSide === id.mySide ? 0.5 + 0.5 * clip.sideConfidence : 0.5 - 0.5 * clip.sideConfidence;
  const mine = id.meShare === null ? 0.5 : id.meShare;
  return Number((teamEnded * (0.25 + 0.75 * mine) * (0.5 + 0.5 * id.sideScore)).toFixed(3));
}
