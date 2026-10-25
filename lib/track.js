import { ffmpegStream } from './ffmpeg.js';

// Cheap player tracking by frame differencing. SwingVision footage is shot
// from behind a baseline, so the near player moves in the lower part of the
// frame and the far player in the band above the net. For each side we keep
// the horizontal centroid of moving pixels and how much is moving.

export const TRACK_FPS = 5;
const W = 160;
const H = 90;
const DIFF_THRESHOLD = 18;
export const BANDS = {
  near: [0.55, 1.0],
  far: [0.2, 0.55],
};

// Pure function so it can be tested on synthetic frames.
export function motionFromFrames(prev, cur, w = W, h = H) {
  const out = {};
  for (const [side, [top, bottom]] of Object.entries(BANDS)) {
    const y0 = Math.floor(top * h);
    const y1 = Math.floor(bottom * h);
    let sum = 0;
    let wx = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (Math.abs(cur[i] - prev[i]) > DIFF_THRESHOLD) {
          sum++;
          wx += x;
        }
      }
    }
    out[side] = { x: sum ? (wx / sum + 0.5) / w : 0.5, mag: sum / ((y1 - y0) * w) };
  }
  return out;
}

export async function analyzeMotion(file) {
  const frameBytes = W * H;
  const samples = { near: { x: [], mag: [] }, far: { x: [], mag: [] } };
  let prev = null;
  let buf = Buffer.alloc(0);
  await ffmpegStream(
    ['-i', file, '-an', '-vf', `fps=${TRACK_FPS},scale=${W}:${H},format=gray`, '-f', 'rawvideo'],
    (chunk) => {
      buf = buf.length ? Buffer.concat([buf, chunk]) : chunk;
      while (buf.length >= frameBytes) {
        const frame = Uint8Array.from(buf.subarray(0, frameBytes));
        buf = buf.subarray(frameBytes);
        const m = prev ? motionFromFrames(prev, frame) : { near: { x: 0.5, mag: 0 }, far: { x: 0.5, mag: 0 } };
        for (const side of ['near', 'far']) {
          samples[side].x.push(Number(m[side].x.toFixed(3)));
          samples[side].mag.push(Number(m[side].mag.toFixed(4)));
        }
        prev = frame;
      }
    },
  );
  return { fps: TRACK_FPS, ...samples };
}

// Smoothed horizontal path (0..1) of one player across a clip, sampled every
// `step` seconds with times relative to the clip start, plus how active the
// player was (used to rank clips).
export function playerPath(motion, side, start, end, { step = 0.5, window = 0.75 } = {}) {
  const track = motion?.[side];
  if (!track || !track.x.length) return { keyframes: [{ t: 0, x: 0.5 }], activity: 0 };
  const fps = motion.fps;
  const keyframes = [];
  let last = null;
  let activity = 0;
  let count = 0;
  for (let t = start; t <= end + 1e-6; t += step) {
    const i0 = Math.max(0, Math.floor((t - window) * fps));
    const i1 = Math.min(track.x.length - 1, Math.ceil((t + window) * fps));
    let wsum = 0;
    let xsum = 0;
    for (let i = i0; i <= i1; i++) {
      wsum += track.mag[i];
      xsum += track.mag[i] * track.x[i];
    }
    activity += wsum / Math.max(1, i1 - i0 + 1);
    count++;
    let x = wsum > 0.002 ? xsum / wsum : (last ?? 0.5);
    // Ease toward the target so the virtual camera doesn't jitter.
    if (last !== null) x = last + (x - last) * 0.45;
    last = x;
    keyframes.push({ t: Math.round((t - start) * 100) / 100, x: Math.round(x * 1000) / 1000 });
  }
  return { keyframes, activity: count ? activity / count : 0 };
}
