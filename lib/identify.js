import { ffmpegStream } from './ffmpeg.js';

// Finds one specific player (the user taps their shirt once) and tells their
// strikes from their partner's. Works in doubles and across changes of ends.
//
// Real SwingVision footage is shot from high behind one baseline: the net is
// near the top of the frame, and fences, trees, shade and neighbouring
// courts fill the rest. A plain color match would find the player's shirt
// color all over that scenery. So the user also taps the top of the net. From
// that and an empty-court image we work out the playing area, and only look
// for moving pixels of the shirt color inside it.

// 480x270: at 320x180 a far-side player's shirt is only 2-3 pixels and
// blurs into the background.
const W = 480;
const H = 270;
const S = W / 320; // pixel sizes below were tuned at 320 wide
const FPS = 6;
const FG_THRESHOLD = 35; // per-channel difference from the empty court
const MIN_SHIRT = Math.round(5 * S * S);
const LINE_OFF = Math.round(2 * S);

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

const px = (f, i) => ({ r: f[i], g: f[i + 1], b: f[i + 2] });
const median = (a) => a.slice().sort((p, q) => p - q)[a.length >> 1];

function patchColor(f, cx, cy, rx = 3, ry = 3) {
  const rs = [];
  const gs = [];
  const bs = [];
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      const x = Math.min(W - 1, Math.max(0, Math.round(cx) + dx));
      const y = Math.min(H - 1, Math.max(0, Math.round(cy) + dy));
      const i = (y * W + x) * 3;
      rs.push(f[i]); gs.push(f[i + 1]); bs.push(f[i + 2]);
    }
  }
  return { r: median(rs), g: median(gs), b: median(bs) };
}

// What the player looks like, from the user's tap (x, y in 0..1): their shirt
// color, plus the colors just above it (head or cap) and below it (shorts).
// A muted shirt alone can match a partner's dark shorts; the three together
// rarely do. Sampled from a larger copy of the frame, where the shirt is ~30
// pixels across. Fingers miss: with the empty-court image we look around the
// tap for the most uniform patch that is player rather than court.
export async function sampleColor(file, t, x, y, bg = null) {
  const SW = 960;
  const SH = 540;
  const chunks = [];
  await ffmpegStream(
    ['-ss', Math.max(0, t).toFixed(3), '-i', file, '-an', '-frames:v', '1',
      '-vf', `scale=${SW}:${SH}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo'],
    (c) => chunks.push(c),
  );
  const f = Buffer.concat(chunks);
  if (f.length < SW * SH * 3) throw new Error('Could not read that frame.');
  const patch = (cx, cy, rx, ry) => {
    const rs = [];
    const gs = [];
    const bs = [];
    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        const xx = Math.min(SW - 1, Math.max(0, cx + dx));
        const yy = Math.min(SH - 1, Math.max(0, cy + dy));
        const i = (yy * SW + xx) * 3;
        rs.push(f[i]); gs.push(f[i + 1]); bs.push(f[i + 2]);
      }
    }
    return { r: median(rs), g: median(gs), b: median(bs) };
  };
  let cx = Math.round(x * (SW - 1));
  let cy = Math.round(y * (SH - 1));
  if (bg) {
    let best = null;
    const R = 14;
    for (let dy = -R; dy <= R; dy += 2) {
      for (let dx = -R; dx <= R; dx += 2) {
        const d = Math.hypot(dx, dy);
        if (d > R) continue;
        const qx = Math.min(SW - 1, Math.max(0, cx + dx));
        const qy = Math.min(SH - 1, Math.max(0, cy + dy));
        const c = patch(qx, qy, 2, 2);
        // Player, not court: differs from the empty court at that spot.
        const bi = (Math.round((qy / (SH - 1)) * (H - 1)) * W + Math.round((qx / (SW - 1)) * (W - 1))) * 3;
        if (Math.max(Math.abs(c.r - bg[bi]), Math.abs(c.g - bg[bi + 1]), Math.abs(c.b - bg[bi + 2])) < FG_THRESHOLD) continue;
        // Uniform: every pixel of the patch close to its median.
        let spread = 0;
        for (let yy = -2; yy <= 2; yy++) {
          for (let xx = -2; xx <= 2; xx++) {
            const i = (Math.min(SH - 1, Math.max(0, qy + yy)) * SW + Math.min(SW - 1, Math.max(0, qx + xx))) * 3;
            spread += colorDistance(px(f, i), c);
          }
        }
        const score = spread / 25 + 1.5 * d;
        if (!best || score < best.score) best = { score, qx, qy };
      }
    }
    if (best) { cx = best.qx; cy = best.qy; }
  }
  const shirt = patch(cx, cy, 3, 3);
  // Walk up/down from the tap until the color changes for good.
  const neighbour = (dir) => {
    let misses = 0;
    for (let yy = cy + dir * 4; yy > 0 && yy < SH - 1 && Math.abs(yy - cy) < 0.2 * SH; yy += dir * 3) {
      if (colorDistance(patch(cx, yy, 2, 1), shirt) > 45) {
        if (++misses === 2) return patch(cx, Math.min(SH - 2, Math.max(1, yy + dir * 4)), 2, 1);
      } else {
        misses = 0;
      }
    }
    return null;
  };
  return { ...shirt, above: neighbour(-1), below: neighbour(1) };
}

// Shirt matching: chroma matters more than brightness, since sun and shade
// change lightness a lot but hue much less.
export function colorDistance(a, b) {
  const la = (a.r + a.g + a.b) / 3;
  const lb = (b.r + b.g + b.b) / 3;
  const chroma = Math.hypot(a.r - la - (b.r - lb), a.g - la - (b.g - lb), a.b - la - (b.b - lb));
  return chroma + 0.35 * Math.abs(la - lb);
}

function isColor(f, i, color, tolerance = 40) {
  return colorDistance(px(f, i), color) <= tolerance;
}

function changed(a, b, i, threshold = FG_THRESHOLD) {
  return Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) >= threshold;
}

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

// 4-connected flood fill from `seeds` over pixels where test(index) holds,
// limited to the box. Returns the filled pixel indices.
function flood(seeds, test, box = { x0: 0, x1: W - 1, y0: 0, y1: H - 1 }, seen = new Uint8Array(W * H)) {
  const out = [];
  const stack = [];
  for (const s of seeds) if (!seen[s]) { seen[s] = 1; stack.push(s); }
  while (stack.length) {
    const j = stack.pop();
    out.push(j);
    const x = j % W;
    const y = (j / W) | 0;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < box.x0 || nx > box.x1 || ny < box.y0 || ny > box.y1) continue;
      const k = ny * W + nx;
      if (seen[k] || !test(k)) continue;
      seen[k] = 1;
      stack.push(k);
    }
  }
  return out;
}

const lum = (f, x, y) => {
  const i = (y * W + x) * 3;
  return (f[i] + f[i + 1] + f[i + 2]) / 3;
};

// How much brighter a pixel is than the pixels a couple of rows above and
// below: high on thin horizontal court lines, in sun or in shade.
function lineness(f, x, y) {
  if (y < LINE_OFF || y > H - 1 - LINE_OFF) return 0;
  return lum(f, x, y) - Math.max(lum(f, x, y - LINE_OFF), lum(f, x, y + LINE_OFF));
}

// The stretch of horizontal line around row y that contains column `seed`,
// bridging gaps of up to `gap` pixels (shade, the net's center strap). It
// stops at the net posts, so a neighbouring court's net on the same row
// isn't included.
function lineExtent(f, y, seed, { minContrast = 18, gap = Math.round(0.02 * W) } = {}) {
  const on = (x) => Math.max(lineness(f, x, y), lineness(f, x, y - 1), lineness(f, x, y + 1)) > minContrast;
  // Start from the nearest line pixel to the seed.
  let start = -1;
  for (let d = 0; d < 0.15 * W && start < 0; d++) {
    if (seed - d >= 0 && on(seed - d)) start = seed - d;
    else if (seed + d < W && on(seed + d)) start = seed + d;
  }
  if (start < 0) return null;
  const walk = (dir) => {
    let x = start;
    let last = start;
    let n = 0;
    while (x >= 0 && x < W && Math.abs(x - last) <= gap) {
      if (on(x)) { last = x; n++; }
      x += dir;
    }
    return { end: last, n };
  };
  const l = walk(-1);
  const r = walk(1);
  return { x0: l.end, x1: r.end, n: l.n + r.n };
}

// Works out the playing area from the empty-court image and the user's tap
// on the top of the net (x, y in 0..1). Court colors are no help here: in
// tree shade the apron can match the sunlit court. The white lines are: the
// net tape and the near baseline are the longest bright horizontal lines,
// and their ends mark the court's corners.
export function analyzeScene(bg, net) {
  const nx = Math.round(net.x * (W - 1));
  let netTop = Math.round(net.y * (H - 1));
  // Snap to the tape: the most line-like row near the tap.
  let bestLine = -Infinity;
  const snap = Math.round(3 * S);
  for (let y = Math.max(LINE_OFF, netTop - snap); y <= Math.min(H - 1 - LINE_OFF, netTop + snap); y++) {
    let sum = 0;
    for (let x = Math.max(0, nx - Math.round(0.1 * W)); x <= Math.min(W - 1, nx + Math.round(0.1 * W)); x++) sum += lineness(bg, x, y);
    if (sum > bestLine) { bestLine = sum; netTop = y; }
  }

  // The net base: the mesh lets the court show through but darker, so it's
  // where brightness comes back up to the open court's level.
  const bases = [];
  for (const d of [-30, -22, -14, 14, 22, 30]) {
    const x = Math.min(W - 1, Math.max(0, nx + Math.round(d * S)));
    const ref = median(Array.from({ length: 6 }, (_, k) => lum(bg, x, Math.min(H - 1, netTop + Math.round(0.1 * H) + k))));
    for (let y = netTop + 2; y < Math.min(H - 3, netTop + 0.15 * H); y++) {
      if ([0, 1, 2].every((k) => lum(bg, x, y + k) >= 0.93 * ref)) { bases.push(y); break; }
    }
  }
  const netBase = bases.length ? median(bases) : Math.round(netTop + 0.05 * H);

  const tape = lineExtent(bg, netTop, nx, { minContrast: 12, gap: Math.round(0.015 * W) });
  // The near baseline: the lowest long horizontal line below the net, about
  // as wide as the net or wider (it's closer to the camera).
  const minRow = Math.min(H - 3, Math.round(netBase + 0.2 * H));
  let baseline = null;
  const mid = tape ? Math.round((tape.x0 + tape.x1) / 2) : nx;
  for (let y = H - 3; y >= minRow && tape; y--) {
    const ext = lineExtent(bg, y, mid, { gap: Math.round(0.03 * W) });
    if (ext && ext.x1 - ext.x0 > Math.max(0.4 * W, 0.8 * (tape.x1 - tape.x0)) && ext.n > 0.6 * (ext.x1 - ext.x0)) {
      baseline = { y, ...ext };
      break;
    }
  }
  if (!baseline || !tape) {
    throw new Error("Couldn't find the court lines. Tap the white tape along the top of the net, on a frame where the court is visible.");
  }

  // Sidelines run from the ends of the net to the ends of the baseline.
  const left = { a: (baseline.x0 - tape.x0) / (baseline.y - netTop), b: 0 };
  left.b = tape.x0 - left.a * netTop;
  const right = { a: (baseline.x1 - tape.x1) / (baseline.y - netTop), b: 0 };
  right.b = tape.x1 - right.a * netTop;

  const margin = 0.04 * W;
  const roiBottom = Math.min(H - 1, Math.round(baseline.y + 0.1 * H));
  const roi = new Uint8Array(W * H);
  for (let y = 0; y <= roiBottom; y++) {
    // Above the net the court keeps narrowing with perspective; keep at least
    // the width at the net so far players near the sidelines stay inside.
    const yy = Math.max(y, netTop);
    const x0 = Math.max(0, Math.floor(left.a * yy + left.b - margin));
    const x1 = Math.min(W - 1, Math.ceil(right.a * yy + right.b + margin));
    for (let x = x0; x <= x1; x++) roi[y * W + x] = 1;
  }
  return { netTop, netBase, bottom: baseline.y, roiBottom, roi, corners: { tape, baseline } };
}

function fgMask(f, bg, scene) {
  const m = new Uint8Array(W * H);
  for (let j = 0; j < W * H; j++) if (scene.roi[j] && changed(f, bg, j * 3)) m[j] = 1;
  return m;
}

// Does the patch have the player's head color just above it and shorts
// color just below? 1 when both match, down to ~0.2 when neither does.
function signatureFit(f, c, color) {
  const near = (y0, dir, target) => {
    if (!target) return true;
    const reach = Math.max(2, Math.round(0.4 * (c.y1 - c.y0 + 1)));
    for (let k = 1; k <= reach; k++) {
      const y = dir > 0 ? y0 + k : y0 - k;
      if (y < 0 || y >= H) break;
      for (const dx of [-1, 0, 1]) {
        const x = Math.round(c.x) + dx;
        if (x >= 0 && x < W && colorDistance(px(f, (y * W + x) * 3), target) <= 45) return true;
      }
    }
    return false;
  };
  return (near(c.y1, 1, color.below) ? 1 : 0.35) * (near(c.y0, -1, color.above) ? 1 : 0.6);
}

// Candidate positions for the player in one frame: patches of moving pixels
// in their shirt color inside the court, best first, scored by size and by
// whether the head and shorts colors are above and below.
export function findCandidates(f, bg, scene, color, max = 4) {
  const fg = fgMask(f, bg, scene);
  const shirt = new Uint8Array(W * H);
  for (let j = 0; j < W * H; j++) if (fg[j] && isColor(f, j * 3, color)) shirt[j] = 1;
  const seen = new Uint8Array(W * H);
  const out = [];
  for (let j = 0; j < W * H; j++) {
    if (!shirt[j] || seen[j]) continue;
    const comp = flood([j], (k) => shirt[k] === 1, undefined, seen);
    if (comp.length < MIN_SHIRT) continue;
    let sx = 0; let sy = 0; let y0 = H; let y1 = 0; let x0 = W; let x1 = 0;
    for (const k of comp) {
      const x = k % W;
      const y = (k / W) | 0;
      sx += x; sy += y;
      y0 = Math.min(y0, y); y1 = Math.max(y1, y); x0 = Math.min(x0, x); x1 = Math.max(x1, x);
    }
    const c = { pixels: comp, n: comp.length, x: sx / comp.length, y: sy / comp.length, x0, x1, y0, y1 };
    c.score = c.n * signatureFit(f, c, color);
    out.push(c);
  }
  out.sort((a, b) => b.score - a.score);
  return { fg, candidates: out.slice(0, max) };
}

// The rest of the body (moving pixels connected to the shirt, within a
// person-shaped box) gives the feet, and feet versus the base of the net
// give which end the player is at.
function resolve(c, fg, scene) {
  const sh = c.y1 - c.y0 + 1;
  const sw = c.x1 - c.x0 + 1;
  const box = {
    x0: Math.max(0, Math.floor(c.x0 - 1.5 * sw)), x1: Math.min(W - 1, Math.ceil(c.x1 + 1.5 * sw)),
    y0: Math.max(0, Math.floor(c.y0 - 1.2 * sh)), y1: Math.min(H - 1, Math.ceil(c.y1 + 3 * sh)),
  };
  const body = flood(c.pixels, (k) => fg[k] === 1, box);
  let feet = c.y1;
  for (const k of body) feet = Math.max(feet, (k / W) | 0);
  return {
    n: c.n,
    x: (c.x + 0.5) / W,
    y: (c.y + 0.5) / H,
    feet: (feet + 0.5) / H,
    side: feet > scene.netBase ? 'near' : 'far',
    body,
    shirt: c.pixels,
  };
}

export function findPlayer(f, bg, scene, color) {
  const { fg, candidates } = findCandidates(f, bg, scene, color, 1);
  return candidates.length ? resolve(candidates[0], fg, scene) : null;
}

// Follows the player through a clip. Rather than trusting each frame's best
// match (a partner's dark shorts can briefly out-score a muted shirt), pick
// the sequence of candidates that scores well overall without jumping
// around: a small Viterbi pass.
export function locate(frames, bg, scene, color) {
  const per = frames.map((f) => findCandidates(f, bg, scene, color));
  const step = 0.06 * W; // typical movement between frames at 6 fps
  let prev = null; // [{ total, back, c }] for the last frame with candidates
  let gap = 1;
  const states = per.map(({ candidates }) => {
    if (!candidates.length) { gap++; return null; }
    const cur = candidates.map((c) => {
      let total = Math.log(c.score);
      let back = -1;
      if (prev) {
        let best = -Infinity;
        prev.forEach((p, i) => {
          const d = Math.hypot(c.x - p.c.x, c.y - p.c.y) / (step * gap);
          const v = p.total - d * d;
          if (v > best) { best = v; back = i; }
        });
        total += best;
      }
      return { total, back, c };
    });
    prev = cur;
    gap = 1;
    return cur;
  });
  // Walk back from the best final state.
  const chosen = new Array(frames.length).fill(null);
  let k = states.length - 1;
  while (k >= 0 && !states[k]) k--;
  if (k < 0) return chosen;
  let idx = states[k].reduce((bi, s, i, arr) => (s.total > arr[bi].total ? i : bi), 0);
  for (; k >= 0; k--) {
    if (!states[k]) continue;
    chosen[k] = states[k][idx].c;
    idx = states[k][idx].back;
    if (idx < 0) {
      // Chain broken: pick the best of the next frame back on its own.
      let j = k - 1;
      while (j >= 0 && !states[j]) j--;
      if (j >= 0) idx = states[j].reduce((bi, s, i, arr) => (s.total > arr[bi].total ? i : bi), 0);
    }
  }
  return chosen.map((c, i) => (c ? resolve(c, per[i].fg, scene) : null));
}

// Rows where players on each end can appear. A near player's head can be
// above the net tape in the picture, so the bands overlap a little.
function band(scene, side) {
  return side === 'near'
    ? [Math.max(0, scene.netTop - Math.round(0.1 * H)), scene.roiBottom]
    : [0, scene.netBase];
}

// The partner is whoever else is moving on our end: the most common color
// there once our own body is removed.
export function learnPartnerColor(frames, bg, scene, spots, side) {
  const [y0, y1] = band(scene, side);
  const bins = new Map();
  for (let k = 0; k < frames.length; k += 2) {
    const f = frames[k];
    const mine = new Uint8Array(W * H);
    for (const j of spots[k]?.body || []) mine[j] = 1;
    for (let y = y0; y <= y1; y++) {
      for (let x = 0; x < W; x++) {
        const j = y * W + x;
        const i = j * 3;
        if (!scene.roi[j] || mine[j] || !changed(f, bg, i)) continue;
        const key = ((f[i] >> 5) << 6) | ((f[i + 1] >> 5) << 3) | (f[i + 2] >> 5);
        const b = bins.get(key) || { n: 0, r: 0, g: 0, b: 0 };
        b.n++; b.r += f[i]; b.g += f[i + 1]; b.b += f[i + 2];
        bins.set(key, b);
      }
    }
  }
  let best = null;
  for (const b of bins.values()) if (!best || b.n > best.n) best = b;
  if (!best || best.n < 20 * S * S) return null;
  return { r: Math.round(best.r / best.n), g: Math.round(best.g / best.n), b: Math.round(best.b / best.n) };
}

// At contact the hitter's arm and racket stick out from their body. For each
// player on our end, count moving non-shirt pixels around them at contact
// versus a moment earlier. Returns my share of that increase, or null if no
// swing is visible.
export function hitterShare(frames, bg, scene, spots, idx, side, partnerColor) {
  const [y0, y1] = band(scene, side);
  const stats = (k) => {
    const f = frames[k];
    const me = spots[k];
    const skip = new Uint8Array(W * H);
    for (const j of me?.shirt || []) skip[j] = 1;
    let pa = null;
    if (partnerColor) {
      let n = 0; let sx = 0; let sy = 0;
      for (let y = y0; y <= y1; y++) {
        for (let x = 0; x < W; x++) {
          const j = y * W + x;
          if (!scene.roi[j] || skip[j] || !changed(f, bg, j * 3) || !isColor(f, j * 3, partnerColor)) continue;
          skip[j] = 1;
          n++; sx += x; sy += y;
        }
      }
      if (n >= MIN_SHIRT) pa = { x: sx / n, y: sy / n };
    }
    const meXY = me ? { x: me.x * W, y: me.y * H } : null;
    // Reach scales with how big the player looks (perspective).
    const r = me ? Math.max(6 * S, 2.2 * Math.sqrt(me.n)) : 0.08 * W;
    let nMe = 0;
    let nPa = 0;
    for (let y = y0; y <= y1; y++) {
      for (let x = 0; x < W; x++) {
        const j = y * W + x;
        if (!scene.roi[j] || skip[j] || !changed(f, bg, j * 3)) continue;
        const dMe = meXY ? Math.hypot((x - meXY.x) / r, (y - meXY.y) / (r * 1.4)) : Infinity;
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
  if (me + partner < 3 * S * S) return null;
  return me / (me + partner);
}

// Where the player is during a clip: their end of the court, a crop path,
// and (if the clip ends on a strike) whether that strike looks like theirs.
export async function identifyInClip(file, clip, color, { bg, scene }) {
  const frames = await rgbFrames(file, clip.start, clip.end - clip.start);
  const spots = locate(frames, bg, scene, color);
  const votes = { near: 0, far: 0 };
  for (const s of spots) if (s) votes[s.side] += 1;
  const total = votes.near + votes.far;
  const mySide = total === 0 ? null : votes.near >= votes.far ? 'near' : 'far';
  const sideScore = mySide ? votes[mySide] / total : 0;

  const keyframes = [];
  let last = null;
  let lastY = null;
  spots.forEach((s, i) => {
    let x = s ? s.x : last ?? 0.5;
    if (last !== null) x = last + (x - last) * 0.5;
    last = x;
    // Middle of the body (shirt to feet), for zooming in on the player.
    if (s) lastY = (s.y + s.feet) / 2;
    if (i % 3 === 0) {
      const k = { t: Math.round((i / FPS) * 100) / 100, x: Math.round(x * 1000) / 1000 };
      if (lastY !== null) k.y = Math.round(lastY * 1000) / 1000;
      keyframes.push(k);
    }
  });

  let meShare = null;
  if (mySide && clip.lastHit !== undefined) {
    const idx = Math.round((clip.lastHit - clip.start) * FPS);
    const partnerColor = learnPartnerColor(frames, bg, scene, spots, mySide);
    meShare = hitterShare(frames, bg, scene, spots, idx, mySide, partnerColor);
  }
  return {
    mySide,
    sideScore: Number(sideScore.toFixed(2)),
    visible: Number((total / Math.max(1, spots.length)).toFixed(2)),
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
