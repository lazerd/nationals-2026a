import type { ReactNode } from 'react';

/**
 * The figure system every exercise illustration is built from.
 *
 * ANGLES. One convention throughout: degrees from straight-down, positive
 * clockwise on screen. So 0 is hanging down, 180 is straight up, -90 points
 * right, 90 points left. A standing figure is `torso: 180, thigh: 0, shin: 0`.
 *
 * Limbs are nested rotation groups (hip -> thigh -> shin, shoulder -> upper
 * arm -> forearm) rather than pre-computed coordinates. That keeps poses
 * readable as joint angles and means a pose can be transitioned to another
 * pose by CSS alone, which is what the play affordance uses.
 *
 * Colour comes from CSS variables only. No hardcoded hex in any SVG.
 */

export const PANEL_W = 160;
export const PANEL_H = 180;
export const GROUND_Y = 158;

const TORSO_W = 21;
const LIMB_W = 8.5;
const FORE_W = 7;
const HEAD_R = 9;

export interface LimbPose {
  /** Upper segment: thigh, or upper arm. */
  upper: number;
  /** Lower segment: shin, or forearm. */
  lower: number;
  /** Draw this limb in the accent colour — the part that is doing the work. */
  accent?: boolean;
  /** Draw dim, for the far side of the body. */
  far?: boolean;
  upperLen?: number;
  lowerLen?: number;
}

export interface Pose {
  /** Hip position in panel coordinates. */
  hip: [number, number];
  /** Torso direction. 180 is upright. */
  torso?: number;
  torsoLen?: number;
  /** Head lean relative to the torso. */
  headAngle?: number;
  accentTorso?: boolean;
  /** Rendered back-to-front, so put the far-side limb first. */
  arms?: LimbPose[];
  legs?: LimbPose[];
}

const stroke = (accent?: boolean, far?: boolean) =>
  accent ? 'var(--illo-accent)' : far ? 'var(--illo-figure-dim)' : 'var(--illo-figure)';

function Limb({
  pose,
  upperLen,
  lowerLen,
  upperW,
  lowerW,
}: {
  pose: LimbPose;
  upperLen: number;
  lowerLen: number;
  upperW: number;
  lowerW: number;
}) {
  const c = stroke(pose.accent, pose.far);
  const u = pose.upperLen ?? upperLen;
  const l = pose.lowerLen ?? lowerLen;
  return (
    <g transform={`rotate(${pose.upper})`}>
      <line x1={0} y1={0} x2={0} y2={u} stroke={c} strokeWidth={upperW} strokeLinecap="round" />
      <g transform={`translate(0 ${u}) rotate(${pose.lower - pose.upper})`}>
        {/* joint circle keeps the bend readable at phone size */}
        <circle cx={0} cy={0} r={lowerW / 2 + 0.6} fill={c} />
        <line x1={0} y1={0} x2={0} y2={l} stroke={c} strokeWidth={lowerW} strokeLinecap="round" />
      </g>
    </g>
  );
}

/** A simplified human figure posed by joint angles. */
export function Figure({ pose }: { pose: Pose }) {
  const torso = pose.torso ?? 180;
  const torsoLen = pose.torsoLen ?? 40;
  const legs = pose.legs ?? [{ upper: 0, lower: 0 }];
  const arms = pose.arms ?? [{ upper: 0, lower: 0 }];

  return (
    <g transform={`translate(${pose.hip[0]} ${pose.hip[1]})`}>
      {legs.map((leg, i) => (
        <Limb key={`l${i}`} pose={leg} upperLen={29} lowerLen={29} upperW={LIMB_W} lowerW={FORE_W} />
      ))}

      <g transform={`rotate(${torso})`}>
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={torsoLen}
          stroke={pose.accentTorso ? 'var(--illo-accent)' : 'var(--illo-figure)'}
          strokeWidth={TORSO_W}
          strokeLinecap="round"
        />
        <g transform={`translate(0 ${torsoLen})`}>
          {arms.map((arm, i) => (
            <Limb key={`a${i}`} pose={{ ...arm, upper: arm.upper - torso, lower: arm.lower - torso }} upperLen={24} lowerLen={22} upperW={FORE_W} lowerW={FORE_W} />
          ))}
          <g transform={`rotate(${pose.headAngle ?? 0})`}>
            <line x1={0} y1={-1} x2={0} y2={7} stroke="var(--illo-figure)" strokeWidth={7.5} strokeLinecap="round" />
            <circle cx={0} cy={HEAD_R + 7} r={HEAD_R} fill="var(--illo-figure)" />
          </g>
        </g>
      </g>
    </g>
  );
}

// ---------------------------------------------------------------- scaffolding

/** Positions its children inside panel 0 (start) or panel 1 (end). */
export function Panel({
  index,
  step,
  flip,
  scale,
  children,
}: {
  index: 0 | 1;
  /** The small numeral in the corner. The two panels are a sequence. */
  step?: string;
  flip?: boolean;
  /** Shrinks the figure about the ground line, for poses that reach overhead. */
  scale?: number;
  children: ReactNode;
}) {
  const x = index * PANEL_W;
  const inner: string[] = [];
  if (flip) inner.push(`translate(${PANEL_W} 0) scale(-1 1)`);
  if (scale && scale !== 1) {
    inner.push(`translate(${PANEL_W / 2} ${GROUND_Y}) scale(${scale}) translate(${-PANEL_W / 2} ${-GROUND_Y})`);
  }
  return (
    <g transform={`translate(${x} 0)`}>
      <text x={10} y={22} fill="var(--illo-ground)" fontSize={13} fontWeight={700}>
        {step ?? String(index + 1)}
      </text>
      <g transform={inner.length ? inner.join(' ') : undefined}>{children}</g>
    </g>
  );
}

export function GroundLine({ panel = 0, y = GROUND_Y, inset = 12 }: { panel?: 0 | 1; y?: number; inset?: number }) {
  const x = panel * PANEL_W;
  return (
    <line
      x1={x + inset}
      y1={y}
      x2={x + PANEL_W - inset}
      y2={y}
      stroke="var(--illo-ground)"
      strokeWidth={2}
      strokeLinecap="round"
    />
  );
}

export function Wall({ x, from = 14, to = GROUND_Y }: { x: number; from?: number; to?: number }) {
  return (
    <g>
      <line x1={x} y1={from} x2={x} y2={to} stroke="var(--illo-ground)" strokeWidth={3} strokeLinecap="round" />
      {Array.from({ length: 5 }, (_, i) => {
        const y = from + 8 + i * ((to - from - 10) / 4);
        return <line key={i} x1={x} y1={y} x2={x + (x > PANEL_W ? 7 : -7)} y2={y + 6} stroke="var(--illo-ground)" strokeWidth={1.5} />;
      })}
    </g>
  );
}

/** A step, bench, chair seat or box. */
export function Platform({ x, y, w = 34, h = 10 }: { x: number; y: number; w?: number; h?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={2} fill="none" stroke="var(--illo-ground)" strokeWidth={2} />;
}

// ------------------------------------------------------------------ equipment

/** Medicine ball. Circle with a texture hatch so it does not read as a head. */
export function MedBall({ x, y, r = 10, accent }: { x: number; y: number; r?: number; accent?: boolean }) {
  const c = accent ? 'var(--illo-accent)' : 'var(--illo-equip)';
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="none" stroke={c} strokeWidth={2.5} />
      <line x1={x - r * 0.6} y1={y - r * 0.35} x2={x + r * 0.6} y2={y - r * 0.35} stroke={c} strokeWidth={1.4} />
      <line x1={x - r * 0.6} y1={y + r * 0.35} x2={x + r * 0.6} y2={y + r * 0.35} stroke={c} strokeWidth={1.4} />
    </g>
  );
}

/** Resistance band, drawn as a zigzag between two points. */
export function Band({
  from,
  to,
  amp = 4,
  zigs = 7,
  accent,
}: {
  from: [number, number];
  to: [number, number];
  amp?: number;
  zigs?: number;
  accent?: boolean;
}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const pts: string[] = [];
  for (let i = 0; i <= zigs; i++) {
    const t = i / zigs;
    const off = i === 0 || i === zigs ? 0 : (i % 2 === 0 ? amp : -amp);
    pts.push(`${x1 + dx * t + nx * off},${y1 + dy * t + ny * off}`);
  }
  return (
    <polyline
      points={pts.join(' ')}
      fill="none"
      stroke={accent ? 'var(--illo-accent)' : 'var(--illo-equip)'}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  );
}

/** Racket: ellipse head on a handle. `angle` is degrees from straight-down. */
export function Racket({
  x,
  y,
  angle = 0,
  len = 26,
  accent,
}: {
  x: number;
  y: number;
  angle?: number;
  len?: number;
  accent?: boolean;
}) {
  const c = accent ? 'var(--illo-accent)' : 'var(--illo-equip)';
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <line x1={0} y1={0} x2={0} y2={len} stroke={c} strokeWidth={2.5} strokeLinecap="round" />
      <ellipse cx={0} cy={len + 11} rx={7.5} ry={11} fill="none" stroke={c} strokeWidth={2.5} />
    </g>
  );
}

export function TennisBall({ x, y, r = 4, accent = true }: { x: number; y: number; r?: number; accent?: boolean }) {
  return <circle cx={x} cy={y} r={r} fill={accent ? 'var(--illo-accent)' : 'var(--illo-equip)'} />;
}

export function PullUpBar({ y = 22, from = 20, to = 300 }: { y?: number; from?: number; to?: number }) {
  return <line x1={from} y1={y} x2={to} y2={y} stroke="var(--illo-ground)" strokeWidth={3} strokeLinecap="round" />;
}

// --------------------------------------------------------------------- motion

/**
 * The curved arrow that makes a static drawing readable. `bow` bends the path;
 * positive bows one way, negative the other.
 */
export function MotionArc({
  from,
  to,
  bow = 26,
  uid,
  dashed,
}: {
  from: [number, number];
  to: [number, number];
  bow?: number;
  uid: string;
  dashed?: boolean;
}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bow;
  const cy = my + (dx / len) * bow;
  return (
    <path
      d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
      fill="none"
      stroke="var(--illo-accent)"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeDasharray={dashed ? '5 5' : undefined}
      markerEnd={`url(#${uid}-arrow)`}
    />
  );
}

/** A short straight motion cue, for drills where the path is a line not an arc. */
export function MotionLine({ from, to, uid }: { from: [number, number]; to: [number, number]; uid: string }) {
  return (
    <line
      x1={from[0]}
      y1={from[1]}
      x2={to[0]}
      y2={to[1]}
      stroke="var(--illo-accent)"
      strokeWidth={2.2}
      strokeLinecap="round"
      markerEnd={`url(#${uid}-arrow)`}
    />
  );
}

/** Impact or contact mark — a few short rays. */
export function Impact({ x, y, r = 9 }: { x: number; y: number; r?: number }) {
  return (
    <g stroke="var(--illo-accent)" strokeWidth={2} strokeLinecap="round">
      {[-60, -20, 20, 60].map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={x + Math.cos(rad) * r * 0.55}
            y1={y + Math.sin(rad) * r * 0.55}
            x2={x + Math.cos(rad) * r}
            y2={y + Math.sin(rad) * r}
          />
        );
      })}
    </g>
  );
}

// -------------------------------------------------------------------- wrapper

/**
 * Every exercise illustration renders through this. Fixed 320x180 viewBox, no
 * fixed width or height, a real title for screen readers, and the arrowhead
 * marker namespaced per illustration so two on one page cannot collide.
 */
export function ExerciseSvg({
  uid,
  title,
  scale = 1,
  children,
  className,
}: {
  uid: string;
  /** Describes the movement, not just the name. Read aloud by screen readers. */
  title: string;
  /**
   * Shrinks the whole drawing about the ground line. Poses that reach a racket
   * overhead need it. It applies to both panels at once, so the figure never
   * changes size between the start position and the end position.
   */
  scale?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${PANEL_W * 2} ${PANEL_H}`}
      role="img"
      aria-labelledby={`${uid}-title`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={`${uid}-title`}>{title}</title>
      <line
        x1={PANEL_W}
        y1={26}
        x2={PANEL_W}
        y2={PANEL_H - 12}
        stroke="var(--illo-ground)"
        strokeWidth={1}
        strokeDasharray="2 6"
        opacity={0.7}
      />
      <defs>
        <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--illo-accent)" />
        </marker>
      </defs>
      {scale === 1 ? (
        children
      ) : (
        <g transform={`translate(${PANEL_W} ${GROUND_Y}) scale(${scale}) translate(${-PANEL_W} ${-GROUND_Y})`}>
          {children}
        </g>
      )}
    </svg>
  );
}

/** Standing pose, the base most illustrations vary from. */
export const STAND: Pose = {
  hip: [80, 100],
  torso: 180,
  arms: [
    { upper: 6, lower: 10, far: true },
    { upper: -6, lower: -10 },
  ],
  legs: [
    { upper: 4, lower: 4, far: true },
    { upper: -4, lower: -4 },
  ],
};

// ------------------------------------------------------------ pose geometry
// Equipment has to sit in the figure's hands, not near them. These resolve the
// same forward-kinematic chain the renderer uses, so a ball drawn at
// `hand(pose, 1)` is held rather than floating.

const seg = (from: [number, number], angle: number, len: number): [number, number] => {
  const r = (angle * Math.PI) / 180;
  return [from[0] - len * Math.sin(r), from[1] + len * Math.cos(r)];
};

export function shoulder(pose: Pose): [number, number] {
  return seg(pose.hip, pose.torso ?? 180, pose.torsoLen ?? 40);
}

export function elbow(pose: Pose, i = pose.arms ? pose.arms.length - 1 : 0): [number, number] {
  const a = pose.arms?.[i] ?? { upper: 0, lower: 0 };
  return seg(shoulder(pose), a.upper, a.upperLen ?? 24);
}

/** Where the hand actually is. Index defaults to the near-side arm. */
export function hand(pose: Pose, i = pose.arms ? pose.arms.length - 1 : 0): [number, number] {
  const a = pose.arms?.[i] ?? { upper: 0, lower: 0 };
  return seg(elbow(pose, i), a.lower, a.lowerLen ?? 22);
}

export function knee(pose: Pose, i = pose.legs ? pose.legs.length - 1 : 0): [number, number] {
  const l = pose.legs?.[i] ?? { upper: 0, lower: 0 };
  return seg(pose.hip, l.upper, l.upperLen ?? 29);
}

/** Where the foot actually is. Index defaults to the near-side leg. */
export function foot(pose: Pose, i = pose.legs ? pose.legs.length - 1 : 0): [number, number] {
  const l = pose.legs?.[i] ?? { upper: 0, lower: 0 };
  return seg(knee(pose, i), l.lower, l.lowerLen ?? 29);
}

/**
 * Solves the joint angle and segment length that lands exactly on `to`. Lying
 * and propped positions are far easier to author from the two or three points
 * that actually define them than from guessed angles.
 */
export function aim(from: [number, number], to: [number, number]): { angle: number; len: number } {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  return { angle: (Math.atan2(-dx, dy) * 180) / Math.PI, len: Math.hypot(dx, dy) };
}

/** Midpoint between both hands, for two-handed equipment. */
export function bothHands(pose: Pose): [number, number] {
  const n = pose.arms?.length ?? 1;
  const a = hand(pose, 0);
  const b = hand(pose, n - 1);
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/** Shifts a whole pose so its lowest foot rests on the ground line. */
export function planted(pose: Pose, groundY = GROUND_Y): Pose {
  const n = pose.legs?.length ?? 1;
  const lowest = Math.max(...Array.from({ length: n }, (_, i) => foot(pose, i)[1]));
  const dy = groundY - lowest;
  return { ...pose, hip: [pose.hip[0], pose.hip[1] + dy] };
}

// --------------------------------------------------------- posture recipes
// The two postures that are hardest to eyeball. Deriving them once keeps every
// illustration that uses them anatomically consistent.

/**
 * Half-kneeling, facing right. The rear knee rests on the ground with the shin
 * along the floor; the front shin is vertical. Hip height falls out of the
 * thigh length, so the figure kneels rather than hovers.
 */
export function halfKneeling(x = 80, groundY = GROUND_Y): Pose {
  return {
    hip: [x, groundY - 29],
    torso: 180,
    legs: [
      { upper: 0, lower: 90, far: true },
      { upper: -90, lower: 0 },
    ],
    arms: [
      { upper: 6, lower: 10, far: true },
      { upper: -6, lower: -10 },
    ],
  };
}

/**
 * Deep squat, facing right. `depth` is how far the hip sits above the ground;
 * the shin angle is solved so the foot lands exactly on the ground line.
 */
export function squat(x = 80, depth = 33, thighAngle = -55, groundY = GROUND_Y): Pose {
  const hipY = groundY - depth;
  const kneeY = hipY + 29 * Math.cos((thighAngle * Math.PI) / 180);
  const drop = Math.min(1, Math.max(-1, (groundY - kneeY) / 29));
  const shin = (Math.acos(drop) * 180) / Math.PI;
  return {
    hip: [x, hipY],
    torso: 200,
    legs: [
      { upper: thighAngle + 6, lower: shin + 6, far: true },
      { upper: thighAngle, lower: shin },
    ],
    arms: [
      { upper: 10, lower: 14, far: true },
      { upper: -10, lower: -14 },
    ],
  };
}
