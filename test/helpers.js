import { ffmpeg } from '../lib/ffmpeg.js';

// Three rallies of evenly spaced "ball strikes" with quiet gaps between.
export const RALLIES = [
  { from: 3, hits: 8, every: 1.2 },
  { from: 18, hits: 5, every: 1.1 },
  { from: 29, hits: 10, every: 0.9 },
];
export const HIT_TIMES = RALLIES.flatMap((r) => Array.from({ length: r.hits }, (_, i) => +(r.from + i * r.every).toFixed(2)));

// A 40 s 1280x720 "match": a court, a near player sweeping left↔right in the
// lower band, a far player in the upper band, and a sharp 3 kHz pop at every
// hit time over low background noise.
export async function makeMatch(out, { duration = 40, audio = true } = {}) {
  const pops = HIT_TIMES.map((t) => `sin(2*PI*3100*t)*exp(-90*max(0,t-${t}))*gte(t,${t})*lt(t,${t + 0.08})`).join('+');
  const video = [
    `color=c=0x2F6B3A:s=1280x720:r=30:d=${duration},`
      + 'drawbox=x=240:y=180:w=800:h=470:color=white@0.9:t=4,'
      + 'drawbox=x=0:y=380:w=1280:h=6:color=white@0.9:t=fill[court]',
    `color=c=0xFFD34D:s=60x150:r=30:d=${duration}[near]`,
    `color=c=0x4DB3FF:s=36x80:r=30:d=${duration}[far]`,
    "[court][near]overlay=x='640+380*sin(t*0.9)-30':y=520:eval=frame[a]",
    "[a][far]overlay=x='640-260*sin(t*1.3)-18':y=250:eval=frame",
  ].join(';');
  const args = ['-f', 'lavfi', '-i', video];
  if (audio) args.push('-f', 'lavfi', '-i', `aevalsrc='0.004*(random(0)-0.5)+0.8*(${pops})':s=44100:d=${duration}`);
  await ffmpeg([...args, '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p',
    ...(audio ? ['-c:a', 'aac', '-b:a', '128k'] : []), '-shortest', out]);
}
