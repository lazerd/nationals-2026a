import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { detectHits, energyFrames, groupRallies, SAMPLE_RATE, analyzeAudio } from '../lib/detect.js';
import { makeMatch, HIT_TIMES, RALLIES } from './helpers.js';

function synth(seconds, hits) {
  const n = Math.floor(seconds * SAMPLE_RATE);
  const out = new Float32Array(n);
  let seed = 7;
  for (let i = 0; i < n; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    out[i] = 0.003 * (seed / 2147483648 - 0.5);
  }
  for (const t of hits) {
    const i0 = Math.floor(t * SAMPLE_RATE);
    for (let k = 0; k < 0.06 * SAMPLE_RATE && i0 + k < n; k++) {
      out[i0 + k] += 0.8 * Math.sin((2 * Math.PI * 3000 * k) / SAMPLE_RATE) * Math.exp((-90 * k) / SAMPLE_RATE);
    }
  }
  return out;
}

test('detects synthetic ball strikes within 30 ms', () => {
  const hits = [2, 3.1, 4.3, 5.2, 9.5, 10.4];
  const found = detectHits(energyFrames(synth(12, hits)));
  assert.equal(found.length, hits.length);
  found.forEach((t, i) => assert.ok(Math.abs(t - hits[i]) < 0.03, `${t} vs ${hits[i]}`));
});

test('ignores steady noise', () => {
  assert.deepEqual(detectHits(energyFrames(synth(10, []))), []);
});

test('merges strikes closer than the minimum gap', () => {
  const found = detectHits(energyFrames(synth(6, [2, 2.15, 4])));
  assert.equal(found.length, 2);
});

test('groups hits into rallies and drops short exchanges', () => {
  const clips = groupRallies([1, 2, 3, 4, 10, 11, 20, 21, 22], 30);
  assert.deepEqual(clips.map((c) => c.shots), [4, 3]);
  assert.equal(clips[0].start, 0);
  assert.equal(clips[0].end, 5.8);
});

test('long rallies keep their ending', () => {
  const hits = Array.from({ length: 30 }, (_, i) => 5 + i);
  const [clip] = groupRallies(hits, 100, { maxClipSec: 10 });
  assert.equal(clip.end, 34 + 1.8);
  assert.ok(Math.abs(clip.end - clip.start - 10) < 0.02);
});

test('analyzeAudio finds the rallies in a real encoded file', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-'));
  const file = path.join(dir, 'match.mp4');
  await makeMatch(file);
  const { hits, clips } = await analyzeAudio(file, 40);
  assert.equal(hits.length, HIT_TIMES.length);
  assert.equal(clips.length, RALLIES.length);
  assert.deepEqual(clips.map((c) => c.shots), RALLIES.map((r) => r.hits));
  await fs.rm(dir, { recursive: true });
});
