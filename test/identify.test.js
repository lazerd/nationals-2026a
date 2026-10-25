import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { analyzeAudio, pointEndings } from '../lib/detect.js';
import { sampleColor, sceneBackground, identifyInClip, winnerLikelihood, colorDistance } from '../lib/identify.js';
import { makeDoubles, DOUBLES_RALLIES, doublesStrikes } from './helpers.js';

test('color distance cares about hue more than brightness', () => {
  const red = { r: 210, g: 50, b: 55 };
  assert.ok(colorDistance(red, { r: 150, g: 30, b: 35 }) < colorDistance(red, { r: 200, g: 200, b: 200 }));
});

test('doubles: finds which points I won, across a change of ends', { timeout: 240000 }, async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-'));
  const file = path.join(dir, 'doubles.mp4');
  await makeDoubles(file);

  const { rallies } = await analyzeAudio(file, 44);
  assert.equal(rallies.length, DOUBLES_RALLIES.length);
  // Every strike is assigned to the correct end of the court.
  assert.deepEqual(rallies.flatMap((r) => r.hits.map((h) => h.side)), doublesStrikes().map((s) => s.side));

  // Tap on me (red shirt, near side) at t=5.
  const color = await sampleColor(file, 5, (400 + 80 * Math.sin(10)) / 1280, 595 / 720);
  assert.ok(color.r > 150 && color.g < 100, JSON.stringify(color));

  const bg = await sceneBackground(file, 44);
  const endings = pointEndings(rallies, 44);
  const verdicts = [];
  for (const e of endings) {
    const id = await identifyInClip(file, e, color, { bg });
    const p = winnerLikelihood(e, id);
    verdicts.push(p >= 0.6 ? 'mine' : id.mySide === e.lastSide ? 'partner' : 'theirs');
  }
  assert.deepEqual(verdicts, DOUBLES_RALLIES.map((r) => r.expect));
  await fs.rm(dir, { recursive: true });
});
