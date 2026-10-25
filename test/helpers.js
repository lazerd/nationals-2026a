import { ffmpeg } from '../lib/ffmpeg.js';

// Three rallies of evenly spaced "ball strikes" with quiet gaps between.
export const RALLIES = [
  { from: 3, hits: 8, every: 1.2 },
  { from: 18, hits: 5, every: 1.1 },
  { from: 29, hits: 10, every: 0.9 },
];
export const HIT_TIMES = RALLIES.flatMap((r) => Array.from({ length: r.hits }, (_, i) => +(r.from + i * r.every).toFixed(2)));

// A court in SwingVision's framing (camera high behind one baseline): far
// baseline at y=40, net tape at y=120 with the dark mesh below it down to
// y=150, near service line y=260, near baseline y=400, apron below.
export const NET = { x: 640 / 1280, y: 121 / 720 };
const COURT = `color=c=0x2F6B3A:s=1280x720:r=30:d=DUR,`
  + 'drawbox=x=300:y=40:w=680:h=360:color=0x2E6FC4:t=fill,'
  + 'drawbox=x=300:y=40:w=680:h=360:color=white:t=3,'
  + 'drawbox=x=300:y=258:w=680:h=3:color=white:t=fill,'
  + 'drawbox=x=280:y=122:w=720:h=28:color=0x1C3440@0.75:t=fill,'
  + 'drawbox=x=280:y=119:w=720:h=4:color=white:t=fill';

// A 40 s 1280x720 "match": that court, a near player sweeping left↔right
// below the net, a far player above it, and a sharp 3 kHz pop at every hit
// time over low background noise.
export async function makeMatch(out, { duration = 40, audio = true } = {}) {
  const pops = HIT_TIMES.map((t) => `sin(2*PI*3100*t)*exp(-90*max(0,t-${t}))*gte(t,${t})*lt(t,${t + 0.08})`).join('+');
  const video = [
    `${COURT.replace('DUR', duration)}[court]`,
    `color=c=0xFFD34D:s=60x150:r=30:d=${duration}[near]`,
    `color=c=0xE04DFF:s=24x50:r=30:d=${duration}[far]`,
    "[court][near]overlay=x='640+300*sin(t*0.9)-30':y=200:eval=frame[a]",
    "[a][far]overlay=x='640-200*sin(t*1.3)-12':y=20:eval=frame",
  ].join(';');
  const args = ['-f', 'lavfi', '-i', video];
  if (audio) args.push('-f', 'lavfi', '-i', `aevalsrc='0.004*(random(0)-0.5)+0.8*(${pops})':s=44100:d=${duration}`);
  await ffmpeg([...args, '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p',
    ...(audio ? ['-c:a', 'aac', '-b:a', '128k'] : []), '-shortest', out]);
}

// ---- doubles -------------------------------------------------------------
// Me (red shirt) and my partner (green) start on the near side and switch
// ends at 22 s; opponents wear orange and purple. Strikes alternate ends; near strikes are 12 dB louder. A yellow
// "racket" flashes beside whoever hits the final ball of each exchange.
export const SWITCH_AT = 22;
// Players are a shirt over dark shorts, with a head on top, like real ones.
const me = {
  near: { x: (t) => 480 + 80 * Math.sin(2 * t), y: 210, w: 60, h: 150 },
  far: { x: (t) => 540 + 50 * Math.sin(2 * t), y: 10, w: 30, h: 70 },
};
const partner = {
  near: { x: (t) => 820 + 40 * Math.sin(1.7 * t + 1), y: 210, w: 60, h: 150 },
  far: { x: (t) => 760 + 30 * Math.sin(1.7 * t + 1), y: 10, w: 30, h: 70 },
};
const exprs = {
  me: { near: '480+80*sin(2*t)', far: '540+50*sin(2*t)' },
  partner: { near: '820+40*sin(1.7*t+1)', far: '760+30*sin(1.7*t+1)' },
};
export const ME_TAP = { t: 5, x: (480 + 80 * Math.sin(10)) / 1280, y: (210 + 150 * 0.3) / 720 };

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

  const parts = [`${COURT.replace('DUR', duration)}[c0]`];
  const layers = [];
  // A person: head (skin) on top, shirt in `color`, dark shorts, legs.
  const box = (color, w, h) => {
    if (color === '0xFFE14D') return `color=c=${color}:s=${w}x${h}:r=30:d=${duration}`;
    const head = Math.round(h * 0.15);
    const shirt = Math.round(h * 0.4);
    const shorts = Math.round(h * 0.2);
    return `color=c=0xD9A47E:s=${w}x${h}:r=30:d=${duration},`
      + `drawbox=x=0:y=0:w=${w}:h=${head}:color=0xF4F4F4:t=fill,`
      + `drawbox=x=0:y=${head}:w=${w}:h=${shirt}:color=${color}:t=fill,`
      + `drawbox=x=0:y=${head + shirt}:w=${w}:h=${shorts}:color=0x22252B:t=fill`;
  };
  const first = `lt(t,${SWITCH_AT})`;
  const second = `gte(t,${SWITCH_AT})`;
  // [color, geometry, x expression, y, enable]
  layers.push(['0xE0303A', me.near, exprs.me.near, me.near.y, first]);
  layers.push(['0x9ED36A', partner.near, exprs.partner.near, partner.near.y, first]);
  layers.push(['0xF08A24', { w: 30, h: 70 }, '560+60*sin(1.2*t)', 10, first]);
  layers.push(['0xB04DE0', { w: 30, h: 70 }, '740+60*sin(1.4*t)', 10, first]);
  layers.push(['0xE0303A', me.far, exprs.me.far, me.far.y, second]);
  layers.push(['0x9ED36A', partner.far, exprs.partner.far, partner.far.y, second]);
  layers.push(['0xF08A24', { w: 60, h: 150 }, '500+70*sin(1.2*t)', 210, second]);
  layers.push(['0xB04DE0', { w: 60, h: 150 }, '800+70*sin(1.4*t)', 210, second]);

  for (const r of DOUBLES_RALLIES) {
    const T = +(r.from + (r.hits - 1) * 1.1).toFixed(2);
    const lastSide = (r.hits - 1) % 2 === 0 ? r.first : r.first === 'near' ? 'far' : 'near';
    const mySide = T < SWITCH_AT ? 'near' : 'far';
    const who = r.finisher === 'opp' ? null : r.finisher === 'me' ? me[mySide] : partner[mySide];
    if (r.finisher !== 'opp' && lastSide !== mySide) throw new Error('fixture: finisher on wrong side');
    // Opponents' finishing swing: right of the first opponent box.
    const geo = who || (lastSide === 'near' ? { x: (t) => 500 + 70 * Math.sin(1.2 * t), y: 210, w: 60, h: 150 } : { x: (t) => 560 + 60 * Math.sin(1.2 * t), y: 10, w: 30, h: 70 });
    const big = geo.w > 40;
    // A racket sweeping across the body through contact.
    const x0 = Math.round(geo.x(T) + geo.w / 2);
    const speed = big ? 420 : 240;
    layers.push(['0xFFE14D', { w: big ? 70 : 30, h: big ? 18 : 8 }, `${x0}+(t-${(T - 0.3).toFixed(2)})*${speed}`,
      geo.y + (big ? 40 : 18), `between(t,${(T - 0.3).toFixed(2)},${(T + 0.15).toFixed(2)})`]);
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
