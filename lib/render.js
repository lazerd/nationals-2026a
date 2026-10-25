import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ffmpeg } from './ffmpeg.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FONT = {
  black: path.join(ROOT, 'assets/fonts/Inter-Black.otf'),
  bold: path.join(ROOT, 'assets/fonts/Inter-Bold.otf'),
  medium: path.join(ROOT, 'assets/fonts/Inter-Medium.otf'),
};

export const OUT_W = 1080;
export const OUT_H = 1920;
const FPS = 30;
const FOCUS_H = 1100; // height of the sharp video band in "focus" layout
const ACCENT = '0xC6F432';
const NAVY = '0x0B1F3A';
const FADE = 0.2;
const INTRO_SEC = 2.4;
const OUTRO_SEC = 2.2;
const REPLAY_SRC_SEC = 2.6;

export const BRAND = process.env.BRAND_NAME || 'ClubMode';

const ENCODE = [
  '-c:v', 'libx264', '-preset', process.env.X264_PRESET || 'veryfast', '-crf', '20',
  '-pix_fmt', 'yuv420p', '-r', String(FPS), '-video_track_timescale', '15360',
  '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2',
];

// Escapes a path for use inside a filtergraph option value.
function fpath(p) {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
}

// Piecewise-linear expression of `t` through the given keyframes.
export function pathExpr(keyframes) {
  const k = keyframes.length ? keyframes : [{ t: 0, x: 0.5 }];
  let expr = k[k.length - 1].x.toFixed(3);
  for (let i = k.length - 2; i >= 0; i--) {
    const a = k[i];
    const b = k[i + 1];
    const dt = Math.max(0.01, b.t - a.t);
    const seg = `${a.x.toFixed(3)}+(${(b.x - a.x).toFixed(3)})*(t-${a.t.toFixed(2)})/${dt.toFixed(2)}`;
    expr = `if(lt(t,${b.t.toFixed(2)}),${seg},${expr})`;
  }
  return `if(lt(t,${k[0].t.toFixed(2)}),${k[0].x.toFixed(3)},${expr})`;
}

// Picks which layout actually applies for this source shape.
export function resolveLayout(layout, src) {
  const landscape = src.width / src.height > 1.05;
  if (!landscape) return 'full';
  if (layout === 'focus' && Math.round((FOCUS_H * src.width) / src.height) <= OUT_W) return 'full';
  return layout;
}

function blurredBackground(input, label) {
  return `${input}scale=270:480:force_original_aspect_ratio=increase,crop=270:480,boxblur=10:2,` +
    `eq=brightness=-0.18:saturation=1.15,scale=${OUT_W}:${OUT_H}${label}`;
}

// Filter chain turning the trimmed source into a 1080x1920 frame.
function frameChain(layout, src, keyframes) {
  const px = pathExpr(keyframes);
  if (layout === 'follow') {
    const cw = Math.floor((src.height * 9) / 16 / 2) * 2;
    return `[0:v]setpts=PTS-STARTPTS,crop=${cw}:ih:x='max(0,min(iw-ow,(${px})*iw-ow/2))':y=0,` +
      `scale=${OUT_W}:${OUT_H},setsar=1[base]`;
  }
  const fg = layout === 'focus'
    ? `scale=-2:${FOCUS_H},crop=${OUT_W}:${FOCUS_H}:x='max(0,min(iw-ow,(${px})*iw-ow/2))':y=0`
    : `scale=${OUT_W}:${OUT_H}:force_original_aspect_ratio=decrease`;
  return `[0:v]setpts=PTS-STARTPTS,split[s1][s2];${blurredBackground('[s1]', '[bg]')};` +
    `[s2]${fg},setsar=1[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1[base]`;
}

function text(file, font, size, color, x, y, extra = '') {
  return `drawtext=fontfile='${fpath(font)}':textfile='${fpath(file)}':fontsize=${size}:fontcolor=${color}:` +
    `x=${x}:y=${y}${extra ? `:${extra}` : ''}`;
}

function nameSize(name, max, budget) {
  return Math.max(48, Math.min(max, Math.floor(budget / Math.max(4, name.length))));
}

async function writeText(dir, name, value) {
  const file = path.join(dir, `${name}.txt`);
  await fs.writeFile(file, value);
  return file;
}

function audioInput(src) {
  return src.hasAudio ? [] : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo'];
}

async function renderClip({ src, file, dir, idx, clip, layout, labels, replay, onProgress }) {
  const start = replay ? Math.max(clip.start, clip.end - REPLAY_SRC_SEC - 0.4) : clip.start;
  const srcDur = replay ? Math.min(REPLAY_SRC_SEC, clip.end - start) : clip.end - clip.start;
  const speed = replay ? 0.5 : 1;
  const outDur = srcDur / speed;
  const keyframes = (clip.keyframes || [{ t: 0, x: 0.5 }])
    .map((k) => ({ t: k.t - (start - clip.start), x: k.x }))
    .filter((k, i, all) => k.t >= 0 || (all[i + 1] && all[i + 1].t > 0));

  const label = clip.label || (clip.shots ? `RALLY  ·  ${clip.shots} SHOTS` : 'HIGHLIGHT');
  const tag = await writeText(dir, `tag${idx}`, replay ? 'SLOW-MO REPLAY' : label);
  const overlays = [
    text(labels.name, FONT.black, nameSize(labels.nameValue, 64, 1500), 'white', '(w-text_w)/2', 150,
      'box=1:boxcolor=black@0.45:boxborderw=22'),
    labels.sub ? text(labels.sub, FONT.medium, 36, 'white@0.9', '(w-text_w)/2', 262, 'shadowcolor=black@0.6:shadowx=2:shadowy=2') : null,
    text(tag, FONT.bold, 42, replay ? 'black' : ACCENT, '(w-text_w)/2', 'h-330',
      replay ? `box=1:boxcolor=${ACCENT}:boxborderw=18` : 'box=1:boxcolor=black@0.5:boxborderw=18'),
    text(labels.brand, FONT.black, 34, 'white@0.85', '(w-text_w)/2', 'h-170', 'shadowcolor=black@0.6:shadowx=2:shadowy=2'),
  ].filter(Boolean).join(',');

  const slow = replay ? `,setpts=${1 / speed}*PTS` : '';
  const vf = `${frameChain(layout, src, keyframes)};[base]${overlays}${slow},fps=${FPS},` +
    `fade=t=in:st=0:d=${FADE},fade=t=out:st=${(outDur - FADE).toFixed(3)}:d=${FADE}[v]`;
  const aIn = src.hasAudio ? '[0:a]' : '[1:a]';
  const af = `${aIn}atrim=0:${srcDur.toFixed(3)},asetpts=PTS-STARTPTS${replay ? ',atempo=0.5' : ''},` +
    `aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:st=0:d=${FADE},` +
    `afade=t=out:st=${(outDur - FADE).toFixed(3)}:d=${FADE}[a]`;

  const out = path.join(dir, `seg${String(idx).padStart(3, '0')}.mp4`);
  await ffmpeg([
    '-ss', start.toFixed(3), '-t', srcDur.toFixed(3), '-i', file, ...audioInput(src),
    '-filter_complex', `${vf};${af}`, '-map', '[v]', '-map', '[a]', '-t', outDur.toFixed(3), ...ENCODE, out,
  ], { duration: outDur, onProgress });
  return { file: out, duration: outDur };
}

async function renderIntro({ src, file, dir, best, labels, onProgress }) {
  const kicker = await writeText(dir, 'kicker', 'MATCH HIGHLIGHTS');
  const size = nameSize(labels.nameValue, 120, 1750);
  const parts = [
    blurredBackground('[0:v]setpts=PTS-STARTPTS,', '[bg]'),
    `[bg]${[
      text(kicker, FONT.bold, 40, ACCENT, '(w-text_w)/2', 760),
      text(labels.name, FONT.black, size, 'white', '(w-text_w)/2', 830),
      labels.sub ? text(labels.sub, FONT.medium, 42, 'white@0.9', '(w-text_w)/2', 860 + size + 20) : null,
      labels.club ? text(labels.club, FONT.medium, 36, 'white@0.7', '(w-text_w)/2', 860 + size + 90) : null,
      text(labels.brand, FONT.black, 34, 'white@0.85', '(w-text_w)/2', 'h-170'),
    ].filter(Boolean).join(',')},fps=${FPS},fade=t=in:st=0:d=0.35,fade=t=out:st=${INTRO_SEC - FADE}:d=${FADE}[v]`,
    `anullsrc=r=48000:cl=stereo,atrim=0:${INTRO_SEC}[a]`,
  ];
  const start = Math.max(0, best.start);
  const out = path.join(dir, 'seg000_intro.mp4');
  await ffmpeg([
    '-ss', start.toFixed(3), '-t', String(INTRO_SEC + 0.2), '-i', file,
    '-filter_complex', parts.join(';'), '-map', '[v]', '-map', '[a]', '-t', String(INTRO_SEC), ...ENCODE, out,
  ], { duration: INTRO_SEC, onProgress });
  return { file: out, duration: INTRO_SEC };
}

async function renderOutro({ dir, labels, onProgress }) {
  const brandBig = await writeText(dir, 'brandBig', BRAND.toUpperCase());
  const made = await writeText(dir, 'made', `Made with ${BRAND} Reels`);
  const vf = `color=c=${NAVY}:s=${OUT_W}x${OUT_H}:r=${FPS}:d=${OUTRO_SEC},${[
    text(brandBig, FONT.black, 120, ACCENT, '(w-text_w)/2', 820),
    text(made, FONT.medium, 42, 'white@0.85', '(w-text_w)/2', 980),
    labels.club ? text(labels.club, FONT.medium, 36, 'white@0.6', '(w-text_w)/2', 1050) : null,
  ].filter(Boolean).join(',')},fade=t=in:st=0:d=${FADE},fade=t=out:st=${OUTRO_SEC - 0.4}:d=0.4[v]`;
  const out = path.join(dir, 'seg999_outro.mp4');
  await ffmpeg([
    '-filter_complex', `${vf};anullsrc=r=48000:cl=stereo,atrim=0:${OUTRO_SEC}[a]`,
    '-map', '[v]', '-map', '[a]', '-t', String(OUTRO_SEC), ...ENCODE, out,
  ], { duration: OUTRO_SEC, onProgress });
  return { file: out, duration: OUTRO_SEC };
}

// Builds the reel. `clips` must be in the order they should play; each may
// carry `keyframes` from playerPath() and a `score` used to pick the replay.
export async function renderReel({
  source, src, clips, workDir, outFile,
  playerName, subtitle = '', clubName = '', layout = 'focus', replayBest = true, musicFile = null,
  onProgress = () => {},
}) {
  if (!clips.length) throw new Error('Pick at least one clip.');
  await fs.mkdir(workDir, { recursive: true });
  const effLayout = resolveLayout(layout, src);
  const labels = {
    nameValue: playerName.toUpperCase(),
    name: await writeText(workDir, 'name', playerName.toUpperCase()),
    sub: subtitle ? await writeText(workDir, 'sub', subtitle) : null,
    club: clubName ? await writeText(workDir, 'club', clubName) : null,
    brand: await writeText(workDir, 'brand', BRAND.toUpperCase()),
  };
  const best = clips.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a), clips[0]);

  // Plan segments up front so progress can be weighted by duration.
  const plan = [{ kind: 'intro', dur: INTRO_SEC }];
  clips.forEach((clip) => {
    plan.push({ kind: 'clip', clip, dur: clip.end - clip.start });
    if (replayBest && clip === best && clip.end - clip.start >= 3) plan.push({ kind: 'replay', clip, dur: REPLAY_SRC_SEC * 2 });
  });
  plan.push({ kind: 'outro', dur: OUTRO_SEC });
  const total = plan.reduce((n, p) => n + p.dur, 0) * (musicFile ? 1.1 : 1);
  let done = 0;

  const segments = [];
  for (const [i, step] of plan.entries()) {
    const report = (f) => onProgress(Math.min(0.99, (done + f * step.dur) / total));
    const common = { src, file: source, dir: workDir, labels, onProgress: report };
    if (step.kind === 'intro') segments.push(await renderIntro({ ...common, best }));
    else if (step.kind === 'outro') segments.push(await renderOutro(common));
    else segments.push(await renderClip({ ...common, idx: i, clip: step.clip, layout: effLayout, replay: step.kind === 'replay' }));
    done += step.dur;
  }

  const list = path.join(workDir, 'concat.txt');
  await fs.writeFile(list, segments.map((s) => `file '${s.file.replace(/'/g, "'\\''")}'`).join('\n'));
  const duration = segments.reduce((n, s) => n + s.duration, 0);
  const joined = musicFile ? path.join(workDir, 'joined.mp4') : outFile;
  await ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', joined]);

  if (musicFile) {
    const fadeAt = Math.max(0, duration - 1.5).toFixed(3);
    await ffmpeg([
      '-i', joined, '-stream_loop', '-1', '-i', musicFile,
      '-filter_complex',
      `[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.45,atrim=0:${duration.toFixed(3)},` +
      `afade=t=in:st=0:d=0.5,afade=t=out:st=${fadeAt}:d=1.5[m];[0:a]volume=0.9[c];` +
      '[c][m]amix=inputs=2:duration=first:normalize=0[a]',
      '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', outFile,
    ], { duration, onProgress: (f) => onProgress(Math.min(0.99, (done + f * duration * 0.1) / total)) });
  }
  onProgress(1);
  return { duration, layout: effLayout };
}
