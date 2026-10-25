import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ffmpeg } from '../lib/ffmpeg.js';
import { sampleColor, sceneBackground, analyzeScene, identifyInClip } from '../lib/identify.js';

// Checks player finding on a real SwingVision court (tree shade, fences, a
// neighbouring court) by animating cut-outs of the real players over the
// real, emptied court. Needs a 1920x1080 still of that match, which isn't
// committed: CLUBMODE_REAL_FRAME=/path/to/frame.png npm test
// The coordinates below are for that frame.
const FRAME = process.env.CLUBMODE_REAL_FRAME;

test('real court: follows the tapped player at both ends', { skip: !FRAME && 'set CLUBMODE_REAL_FRAME', timeout: 300000 }, async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-real-'));
  const p = (f) => path.join(dir, f);
  // Empty court: paint out the four players.
  await ffmpeg(['-i', FRAME, '-vf', 'delogo=x=1095:y=190:w=110:h=225,delogo=x=800:y=130:w=80:h=140,'
    + 'delogo=x=875:y=70:w=55:h=90,delogo=x=1000:y=95:w=55:h=90', p('plate.png')]);
  await ffmpeg(['-i', FRAME, '-vf', 'crop=90:212:1110:198', p('me.png')]);
  await ffmpeg(['-i', FRAME, '-vf', 'crop=70:130:805:135', p('partner.png')]);
  const blue = '0x3a8cdd';
  const D = 12;
  const S = 6;
  const L = (i, extra = '') => `[${i}]loop=-1:1,fps=30,trim=0:${D},setpts=PTS-STARTPTS,colorkey=${blue}:0.16:0.05${extra}`;
  // Teams switch ends at 6 s; opponents are recolored cut-outs.
  const graph = [
    `[0]loop=-1:1,fps=30,trim=0:${D},setpts=PTS-STARTPTS[bg]`,
    `${L(1)},split[mn][mfs]`, '[mfs]scale=36:85[mf]',
    `${L(2)},split[pn][pfs]`, '[pfs]scale=28:52[pf]',
    `${L(3, ',hue=h=170:s=1.6')},split[o1ns][o1fs]`, '[o1fs]scale=28:52[o1f]', '[o1ns]scale=95:176[o1n]',
    `${L(4, ',hue=h=120:s=2.5')},split[o2ns][o2fs]`, '[o2fs]scale=36:85[o2f]', '[o2ns]scale=90:212[o2n]',
    `[bg][pn]overlay=x='805+40*sin(1.1*t)':y=135:eval=frame:enable='lt(t,${S})'[a]`,
    `[a][mn]overlay=x='1110+140*sin(1.5*t)':y=198:eval=frame:enable='lt(t,${S})'[b]`,
    `[b][o1f]overlay=x='900+40*sin(1.3*t)':y=100:eval=frame:enable='lt(t,${S})'[c]`,
    `[c][o2f]overlay=x='1060+50*sin(1.7*t)':y=75:eval=frame:enable='lt(t,${S})'[d]`,
    `[d][mf]overlay=x='880+80*sin(2*t)':y=75:eval=frame:enable='gte(t,${S})'[e]`,
    `[e][pf]overlay=x='1100+40*sin(1.4*t)':y=108:eval=frame:enable='gte(t,${S})'[f]`,
    `[f][o1n]overlay=x='760+120*sin(1.2*t)':y=230:eval=frame:enable='gte(t,${S})'[h]`,
    `[h][o2n]overlay=x='1150+100*sin(1.6*t)':y=260:eval=frame:enable='gte(t,${S})'`,
  ].join(';');
  const video = p('court.mp4');
  await ffmpeg(['-i', p('plate.png'), '-i', p('me.png'), '-i', p('partner.png'), '-i', p('partner.png'), '-i', p('me.png'),
    '-filter_complex', graph, '-t', String(D), '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', video]);

  const color = await sampleColor(video, 0, 1150 / 1920, 285 / 1080);
  const bg = await sceneBackground(video, D);
  const scene = analyzeScene(bg, { x: 900 / 1920, y: 172 / 1080 });
  // Net tape ~16% down, net base ~22%, near baseline ~55%.
  assert.ok(Math.abs(scene.netTop / 270 - 0.16) < 0.015, `netTop ${scene.netTop}`);
  assert.ok(Math.abs(scene.netBase / 270 - 0.22) < 0.02, `netBase ${scene.netBase}`);
  assert.ok(Math.abs(scene.bottom / 270 - 0.55) < 0.02, `baseline ${scene.bottom}`);

  const expected = {
    near: (t) => (1155 + 140 * Math.sin(1.5 * t)) / 1920,
    far: (t) => (898 + 80 * Math.sin(2 * t)) / 1920,
  };
  for (const [side, start, end] of [['near', 0.2, 5.8], ['far', 6.2, 11.8]]) {
    const r = await identifyInClip(video, { start, end }, color, { bg, scene });
    assert.equal(r.mySide, side);
    assert.ok(r.sideScore > 0.9, `${side} sideScore ${r.sideScore}`);
    const errs = r.keyframes.slice(1).map((k) => Math.abs(k.x - expected[side](start + k.t))).sort((a, b) => a - b);
    assert.ok(errs[errs.length >> 1] < 0.02, `${side} median x error ${errs[errs.length >> 1]}`);
  }
  await fs.rm(dir, { recursive: true });
});
