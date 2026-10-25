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

// ---- doubles -------------------------------------------------------------
// Me (red) and my partner (white) start on the near side and switch ends at
// 22 s. Strikes alternate ends; near strikes are 12 dB louder. A yellow
// "racket" flashes beside whoever hits the final ball of each exchange.
export const SWITCH_AT = 22;
const me = {
  near: { x: (t) => 400 + 80 * Math.sin(2 * t), y: 520, w: 60, h: 150 },
  far: { x: (t) => 480 + 50 * Math.sin(2 * t), y: 250, w: 36, h: 80 },
};
const partner = {
  near: { x: (t) => 880 + 40 * Math.sin(1.7 * t + 1), y: 520, w: 60, h: 150 },
  far: { x: (t) => 800 + 30 * Math.sin(1.7 * t + 1), y: 250, w: 36, h: 80 },
};
const exprs = {
  me: { near: '400+80*sin(2*t)', far: '480+50*sin(2*t)' },
  partner: { near: '880+40*sin(1.7*t+1)', far: '800+30*sin(1.7*t+1)' },
};

// first: side of the first strike; finisher: who hits the last ball.
export const DOUBLES_RALLIES = [
  { from: 2, hits: 5, first: 'near', finisher: 'me', expect: 'mine' },
  { from: 10, hits: 4, first: 'near', finisher: 'opp', expect: 'theirs' },
  { from: 17, hits: 3, first: 'near', finisher: 'partner', expect: 'partner' },
  { from: 24, hits: 3, first: 'far', finisher: 'me', expect: 'mine' },
  { from: 32, hits: 5, first: 'near', finisher: 'opp', expect: 'theirs' },
  { from: 40.5, hits: 1, first: 'far', finisher: 'me', expect: 'mine' },
];

export function doublesStrikes() {
  return DOUBLES_RALLIES.flatMap((r) => Array.from({ length: r.hits }, (_, i) => {
    const side = i % 2 === 0 ? r.first : r.first === 'near' ? 'far' : 'near';
    return { t: +(r.from + i * 1.1).toFixed(2), side };
  }));
}

export async function makeDoubles(out, { duration = 44 } = {}) {
  const strikes = doublesStrikes();
  const pops = strikes.map(({ t, side }) =>
    `${side === 'near' ? 0.8 : 0.2}*sin(2*PI*3100*t)*exp(-90*max(0,t-${t}))*gte(t,${t})*lt(t,${t + 0.08})`).join('+');

  const parts = [
    `color=c=0x2F6B3A:s=1280x720:r=30:d=${duration},`
      + 'drawbox=x=240:y=180:w=800:h=470:color=white@0.9:t=4,'
      + 'drawbox=x=0:y=380:w=1280:h=6:color=white@0.9:t=fill[c0]',
  ];
  const layers = [];
  const box = (color, w, h) => `color=c=${color}:s=${w}x${h}:r=30:d=${duration}`;
  const first = `lt(t,${SWITCH_AT})`;
  const second = `gte(t,${SWITCH_AT})`;
  // [color, geometry, x expression, y, enable]
  layers.push(['0xE0303A', me.near, exprs.me.near, me.near.y, first]);
  layers.push(['0xF2F2F2', partner.near, exprs.partner.near, partner.near.y, first]);
  layers.push(['0x3A6FE0', { w: 36, h: 80 }, '520+60*sin(1.2*t)', 250, first]);
  layers.push(['0x3A6FE0', { w: 36, h: 80 }, '760+60*sin(1.4*t)', 250, first]);
  layers.push(['0xE0303A', me.far, exprs.me.far, me.far.y, second]);
  layers.push(['0xF2F2F2', partner.far, exprs.partner.far, partner.far.y, second]);
  layers.push(['0x3A6FE0', { w: 60, h: 150 }, '420+70*sin(1.2*t)', 520, second]);
  layers.push(['0x3A6FE0', { w: 60, h: 150 }, '860+70*sin(1.4*t)', 520, second]);

  for (const r of DOUBLES_RALLIES) {
    const T = +(r.from + (r.hits - 1) * 1.1).toFixed(2);
    const lastSide = (r.hits - 1) % 2 === 0 ? r.first : r.first === 'near' ? 'far' : 'near';
    const mySide = T < SWITCH_AT ? 'near' : 'far';
    const who = r.finisher === 'opp' ? null : r.finisher === 'me' ? me[mySide] : partner[mySide];
    if (r.finisher !== 'opp' && lastSide !== mySide) throw new Error('fixture: finisher on wrong side');
    // Opponents' finishing swing: right of the first opponent box.
    const geo = who || (lastSide === 'near' ? { x: (t) => 420 + 70 * Math.sin(1.2 * t), y: 520, w: 60, h: 150 } : { x: (t) => 520 + 60 * Math.sin(1.2 * t), y: 250, w: 36, h: 80 });
    const big = geo.w > 40;
    // A racket sweeping across the body through contact.
    const x0 = Math.round(geo.x(T) + geo.w / 2);
    const speed = big ? 420 : 240;
    layers.push(['0xFFE14D', { w: big ? 70 : 30, h: big ? 18 : 8 }, `${x0}+(t-${(T - 0.3).toFixed(2)})*${speed}`,
      geo.y + (big ? 40 : 20), `between(t,${(T - 0.3).toFixed(2)},${(T + 0.15).toFixed(2)})`]);
  }

  layers.forEach(([color, g], i) => parts.push(`${box(color, g.w, g.h)}[l${i}]`));
  layers.forEach(([, , x, y, enable], i) => {
    const next = i === layers.length - 1 ? '' : `[c${i + 1}]`;
    parts.push(`[c${i}][l${i}]overlay=x='${x}-${layers[i][1].w / 2}':y=${y}:eval=frame:enable='${enable}'${next}`);
  });

  await ffmpeg(['-f', 'lavfi', '-i', parts.join(';'),
    '-f', 'lavfi', '-i', `aevalsrc='0.004*(random(0)-0.5)+(${pops})':s=44100:d=${duration}`,
    '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', out]);
  return { me, SWITCH_AT };
}
