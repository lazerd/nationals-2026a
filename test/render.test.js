import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { probe } from '../lib/ffmpeg.js';
import { analyzeAudio, scoreClip } from '../lib/detect.js';
import { analyzeMotion, playerPath } from '../lib/track.js';
import { renderReel, pathExpr, resolveLayout } from '../lib/render.js';
import { makeMatch } from './helpers.js';

test('pathExpr interpolates between keyframes', () => {
  const expr = pathExpr([{ t: 0, x: 0.2 }, { t: 1, x: 0.6 }]);
  const evalAt = (t) => Function('t', 'lt', `const iff=(c,a,b)=>c?a:b; return ${expr.replace(/if\(/g, 'iff(')}`)(t, (a, b) => a < b);
  assert.equal(evalAt(0).toFixed(2), '0.20');
  assert.equal(evalAt(0.5).toFixed(2), '0.40');
  assert.equal(evalAt(3).toFixed(2), '0.60');
});

test('portrait sources fall back to full layout', () => {
  assert.equal(resolveLayout('focus', { width: 1080, height: 1920 }), 'full');
  assert.equal(resolveLayout('follow', { width: 1920, height: 1080 }), 'follow');
});

test('tracks the near player moving across the frame', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-'));
  const file = path.join(dir, 'match.mp4');
  await makeMatch(file, { duration: 8, audio: false });
  const motion = await analyzeMotion(file);
  // Near box centre is 640+380*sin(0.9t): right of centre around t≈1.7, left around t≈5.2.
  const right = playerPath(motion, 'near', 1.4, 2.0).keyframes.at(-1).x;
  const left = playerPath(motion, 'near', 4.9, 5.5).keyframes.at(-1).x;
  assert.ok(right > 0.6, `right ${right}`);
  assert.ok(left < 0.4, `left ${left}`);
  await fs.rm(dir, { recursive: true });
});

for (const layout of ['focus', 'full', 'follow']) {
  test(`renders a 1080x1920 reel (${layout})`, { timeout: 180000 }, async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-'));
    const file = path.join(dir, 'match.mp4');
    await makeMatch(file);
    const src = await probe(file);
    const [{ clips }, motion] = await Promise.all([analyzeAudio(file, src.duration), analyzeMotion(file)]);
    const prepared = clips.map((c) => {
      const p = playerPath(motion, 'near', c.start, c.end);
      return { ...c, keyframes: p.keyframes, score: scoreClip(c, p.activity) };
    });
    const out = path.join(dir, 'reel.mp4');
    const progress = [];
    const res = await renderReel({
      source: file, src, clips: prepared, workDir: path.join(dir, 'work'), outFile: out,
      playerName: "Jordan O'Neil", subtitle: 'vs. Riverside: Semis', clubName: 'Bay Club', layout,
      onProgress: (p) => progress.push(p),
    });
    const info = await probe(out);
    assert.equal(info.width, 1080);
    assert.equal(info.height, 1920);
    assert.ok(info.hasAudio);
    assert.ok(Math.abs(info.duration - res.duration) < 0.5, `${info.duration} vs ${res.duration}`);
    assert.equal(progress.at(-1), 1);
    await fs.rm(dir, { recursive: true });
  });
}

test('mixes in a music track', { timeout: 180000 }, async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-'));
  const file = path.join(dir, 'match.mp4');
  await makeMatch(file, { duration: 12, audio: false });
  const music = path.join(dir, 'music.m4a');
  const { ffmpeg } = await import('../lib/ffmpeg.js');
  await ffmpeg(['-f', 'lavfi', '-i', 'sine=f=440:d=3', '-c:a', 'aac', music]);
  const src = await probe(file);
  const out = path.join(dir, 'reel.mp4');
  await renderReel({
    source: file, src, clips: [{ start: 2, end: 7, shots: 4 }], workDir: path.join(dir, 'work'), outFile: out,
    playerName: 'Sam', layout: 'focus', musicFile: music,
  });
  const info = await probe(out);
  assert.ok(info.hasAudio);
  assert.ok(info.duration > 9);
  await fs.rm(dir, { recursive: true });
});
