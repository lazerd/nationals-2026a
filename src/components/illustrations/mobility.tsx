import {
  ExerciseSvg,
  Figure,
  GroundLine,
  Panel,
  MotionArc,
  MotionLine,
  Band,
  PullUpBar,
  Wall,
  hand,
  foot,
  halfKneeling,
  aim,
  planted,
  GROUND_Y,
  type Pose,
} from './Figure';

/* Mobility, stretch and recovery illustrations. */

const STANDING: Pose = {
  hip: [80, 100],
  torso: 180,
  legs: [
    { upper: 4, lower: 4, far: true },
    { upper: -4, lower: -4 },
  ],
  arms: [
    { upper: 8, lower: 12, far: true },
    { upper: -8, lower: -12 },
  ],
};

export function CrossBodyShoulderStretch() {
  const across: Pose = planted({
    ...STANDING,
    arms: [
      { upper: -88, lower: -88, far: true, accent: true },
      { upper: -92, lower: -20 },
    ],
  });
  const pulled: Pose = planted({
    ...STANDING,
    arms: [
      { upper: -96, lower: -96, far: true, accent: true },
      { upper: -100, lower: -14 },
    ],
  });
  return (
    <ExerciseSvg uid="cross-body" title="Cross-body shoulder stretch: one arm straight across the chest at shoulder height, drawn across by the other forearm hooked above the elbow with the shoulder staying down.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={across} />
      </Panel>
      <Panel index={1}>
        <Figure pose={pulled} />
        <MotionLine from={[112, 74]} to={[92, 74]} uid="cross-body" />
        <text x={18} y={126} fill="var(--illo-accent)" fontSize={14} fontWeight={700}>
          30s
        </text>
      </Panel>
    </ExerciseSvg>
  );
}

export function SleeperStretch() {
  // Side-lying, bottom arm out in front, forearm pressed toward the floor.
  const start: Pose = {
    hip: [88, 132],
    torso: 276,
    legs: [
      { upper: 104, lower: 44, far: true },
      { upper: 102, lower: 42 },
    ],
    arms: [
      { upper: -6, lower: -88, far: true, accent: true },
      { upper: -14, lower: -70 },
    ],
  };
  const pressed: Pose = {
    ...start,
    arms: [
      { upper: -6, lower: -30, far: true, accent: true },
      { upper: -14, lower: -46 },
    ],
  };
  return (
    <ExerciseSvg uid="sleeper" title="Sleeper stretch: lying on the serving shoulder rolled slightly back, the top hand gently presses the bottom forearm toward the floor.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={start} />
      </Panel>
      <Panel index={1}>
        <Figure pose={pressed} />
        <MotionArc from={[112, 82]} to={[124, 116]} bow={-14} uid="sleeper" />
      </Panel>
    </ExerciseSvg>
  );
}

export function WristFlexorStretch() {
  const out: Pose = planted({
    ...STANDING,
    arms: [
      { upper: 10, lower: 14, far: true },
      { upper: -90, lower: -90, accent: true },
    ],
  });
  const h = hand(out, 1);
  return (
    <ExerciseSvg uid="wrist-flex" title="Wrist flexor stretch: arm straight out in front palm up with the elbow locked, the other hand drawing the fingers back toward the floor.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={out} />
        <MotionLine from={[h[0] + 4, h[1] - 2]} to={[h[0] + 16, h[1] - 2]} uid="wrist-flex" />
      </Panel>
      <Panel index={1}>
        <Figure pose={out} />
        <MotionArc from={[h[0] + 8, h[1] - 6]} to={[h[0] + 8, h[1] + 18]} bow={-12} uid="wrist-flex" />
        <text x={18} y={126} fill="var(--illo-accent)" fontSize={14} fontWeight={700}>
          30s
        </text>
      </Panel>
    </ExerciseSvg>
  );
}

export function CalfStretch() {
  const straight: Pose = planted({
    hip: [64, 104],
    torso: 206,
    legs: [
      { upper: 30, lower: 30, far: true, accent: true },
      { upper: -34, lower: 10 },
    ],
    arms: [
      { upper: -120, lower: -126, far: true },
      { upper: -116, lower: -122 },
    ],
  });
  const bent: Pose = planted({
    hip: [64, 108],
    torso: 206,
    legs: [
      { upper: 34, lower: 18, far: true, accent: true },
      { upper: -34, lower: 10 },
    ],
    arms: [
      { upper: -120, lower: -126, far: true },
      { upper: -116, lower: -122 },
    ],
  });
  return (
    <ExerciseSvg uid="calf" title="Calf stretch: hands on a wall in a long stride with both feet pointing straight ahead, first with the back knee straight, then with it slightly bent to reach the deeper calf.">
      <Wall x={138} />
      <Wall x={298} />
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={straight} />
      </Panel>
      <Panel index={1}>
        <Figure pose={bent} />
        <MotionArc from={[36, 118]} to={[46, 134]} bow={-10} uid="calf" />
      </Panel>
    </ExerciseSvg>
  );
}

export function HipFlexorStretch() {
  const base = halfKneeling(76);
  const neutral: Pose = { ...base, torso: 186 };
  const tucked: Pose = {
    ...base,
    torso: 176,
    legs: [
      { upper: 0, lower: 90, far: true, accent: true },
      { upper: -90, lower: 0 },
    ],
  };
  return (
    <ExerciseSvg uid="hip-flexor" title="Hip flexor stretch: half-kneeling, squeeze the glute of the kneeling leg and tuck the pelvis under before shifting weight forward.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={neutral} />
      </Panel>
      <Panel index={1}>
        <Figure pose={tucked} />
        <MotionArc from={[54, 132]} to={[76, 122]} bow={-12} uid="hip-flexor" />
      </Panel>
    </ExerciseSvg>
  );
}

export function ThoracicRotationQuadruped() {
  // On hands and knees with the hips sat back. Built from the four points that
  // define the position — knee and hand on the floor, hip and shoulder above
  // them — so the limbs actually reach the ground.
  const HIP: [number, number] = [66, 118];
  const KNEE: [number, number] = [62, 148];
  const SHIN_END: [number, number] = [38, 152];
  const SHOULDER: [number, number] = [114, 116];
  const HAND: [number, number] = [122, 150];

  const build = (elbow: [number, number], hand: [number, number], headAngle: number): Pose => {
    const t = aim(HIP, SHOULDER);
    const thigh = aim(HIP, KNEE);
    const shin = aim(KNEE, SHIN_END);
    const supportUpper = aim(SHOULDER, [118, 132]);
    const supportLower = aim([118, 132], HAND);
    const freeUpper = aim(SHOULDER, elbow);
    const freeLower = aim(elbow, hand);
    return {
      hip: HIP,
      torso: t.angle,
      torsoLen: t.len,
      headAngle,
      legs: [
        { upper: thigh.angle + 5, lower: shin.angle + 5, far: true, upperLen: thigh.len, lowerLen: shin.len },
        { upper: thigh.angle, lower: shin.angle, upperLen: thigh.len, lowerLen: shin.len },
      ],
      arms: [
        { upper: supportUpper.angle, lower: supportLower.angle, far: true, upperLen: supportUpper.len, lowerLen: supportLower.len },
        { upper: freeUpper.angle, lower: freeLower.angle, accent: true, upperLen: freeUpper.len, lowerLen: freeLower.len },
      ],
    };
  };

  // Elbow down and under toward the opposite wrist, then up toward the ceiling.
  const under = build([98, 142], [116, 128], 18);
  const open = build([104, 64], [120, 94], -26);

  return (
    <ExerciseSvg uid="t-quad" title="Quadruped thoracic rotation: on hands and knees with the hips sat back and one hand behind the head, the elbow rotates down and under, then up toward the ceiling with the eyes following it.">
      <GroundLine panel={0} inset={8} />
      <GroundLine panel={1} inset={8} />
      <Panel index={0}>
        <Figure pose={under} />
      </Panel>
      <Panel index={1}>
        <Figure pose={open} />
        <MotionArc from={[100, 140]} to={[104, 62]} bow={26} uid="t-quad" />
      </Panel>
    </ExerciseSvg>
  );
}

export function Hip9090Switch() {
  // Seated 90/90, hands behind for support, knees rotating across.
  const left: Pose = {
    hip: [86, 130],
    torso: 200,
    legs: [
      { upper: -92, lower: -20, far: true },
      { upper: 88, lower: 20 },
    ],
    arms: [
      { upper: 44, lower: 44, far: true },
      { upper: 40, lower: 40 },
    ],
  };
  const right: Pose = {
    ...left,
    legs: [
      { upper: -92, lower: -168, far: true },
      { upper: 88, lower: 168, accent: true },
    ],
  };
  return (
    <ExerciseSvg uid="hip9090" title="90/90 hip switch: seated with one leg bent in front and one out to the side, both knees lift and rotate across to swap sides while the torso stays tall.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={left} />
      </Panel>
      <Panel index={1}>
        <Figure pose={right} />
        <MotionArc from={[42, 148]} to={[124, 148]} bow={-22} uid="hip9090" />
      </Panel>
    </ExerciseSvg>
  );
}

export function CouchStretch() {
  const base = halfKneeling(88);
  const low: Pose = {
    ...base,
    hip: [88, GROUND_Y - 29],
    torso: 200,
    legs: [
      { upper: 0, lower: 150, far: true },
      { upper: -90, lower: 0 },
    ],
  };
  const tall: Pose = {
    ...low,
    torso: 178,
    legs: [
      { upper: 0, lower: 150, far: true, accent: true },
      { upper: -90, lower: 0 },
    ],
  };
  return (
    <ExerciseSvg uid="couch" title="Couch stretch: rear shin up a wall with the knee close to its base, squeeze the glute to tuck the pelvis, then bring the torso upright only as far as the tuck holds.">
      <Wall x={22} from={60} />
      <Wall x={182} from={60} />
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={low} />
      </Panel>
      <Panel index={1}>
        <Figure pose={tall} />
        <MotionArc from={[122, 96]} to={[108, 62]} bow={12} uid="couch" />
        <text x={124} y={140} fill="var(--illo-accent)" fontSize={13} fontWeight={700}>
          60s
        </text>
      </Panel>
    </ExerciseSvg>
  );
}

export function ShoulderCAR() {
  const front: Pose = planted({
    ...STANDING,
    arms: [{ upper: 8, lower: 12, far: true }, { upper: -92, lower: -92, accent: true }],
  });
  const overhead: Pose = planted({
    ...STANDING,
    arms: [{ upper: 8, lower: 12, far: true }, { upper: -172, lower: -174, accent: true }],
  });
  return (
    <ExerciseSvg uid="shoulder-car" scale={0.88} title="Shoulder CARs: standing tall with the ribs down, one arm traces the slowest possible full circle from the front, overhead, and round behind the back.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={front} />
      </Panel>
      <Panel index={1}>
        <Figure pose={overhead} />
        <MotionArc from={[126, 76]} to={[86, 26]} bow={-24} uid="shoulder-car" />
        <text x={16} y={124} fill="var(--illo-accent)" fontSize={13} fontWeight={700}>
          15s
        </text>
      </Panel>
    </ExerciseSvg>
  );
}

export function BandInternalRotation() {
  const outward: Pose = planted({
    ...STANDING,
    arms: [{ upper: 8, lower: 12, far: true }, { upper: -6, lower: -78, accent: true }],
  });
  const inward: Pose = planted({
    ...STANDING,
    arms: [{ upper: 8, lower: 12, far: true }, { upper: -6, lower: 62, accent: true }],
  });
  const h1 = hand(outward, 1);
  const h2 = hand(inward, 1);
  return (
    <ExerciseSvg uid="band-ir" title="Band internal rotation: elbow pinned to the ribs, the forearm rotates in across the stomach against the band, then returns slowly with the torso completely still.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={outward} />
        <Band from={[h1[0], h1[1]]} to={[14, 84]} amp={3.5} zigs={7} />
      </Panel>
      <Panel index={1}>
        <Figure pose={inward} />
        <Band from={[h2[0], h2[1]]} to={[14, 84]} amp={3.5} zigs={6} accent />
        <MotionArc from={[h2[0] - 16, h2[1] - 18]} to={[h2[0] + 4, h2[1] + 12]} bow={12} uid="band-ir" />
      </Panel>
    </ExerciseSvg>
  );
}

export function BandScaption() {
  const low: Pose = planted({
    ...STANDING,
    arms: [
      { upper: 22, lower: 20, far: true },
      { upper: -22, lower: -20 },
    ],
  });
  const raised: Pose = planted({
    ...STANDING,
    arms: [
      { upper: 108, lower: 106, far: true, accent: true },
      { upper: -96, lower: -94, accent: true },
    ],
  });
  const lf = foot(low, 1);
  return (
    <ExerciseSvg uid="scaption" title="Band scaption: standing on the band with thumbs up, both arms raise about thirty degrees in front of the body to shoulder height without shrugging.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={low} />
        <Band from={[hand(low, 1)[0], hand(low, 1)[1]]} to={[lf[0], 156]} amp={3} zigs={4} />
        <Band from={[hand(low, 0)[0], hand(low, 0)[1]]} to={[lf[0], 156]} amp={3} zigs={4} />
      </Panel>
      <Panel index={1}>
        <Figure pose={raised} />
        <Band from={[hand(raised, 1)[0], hand(raised, 1)[1]]} to={[80, 156]} amp={3} zigs={8} accent />
        <Band from={[hand(raised, 0)[0], hand(raised, 0)[1]]} to={[80, 156]} amp={3} zigs={8} accent />
        <MotionArc from={[124, 112]} to={[132, 78]} bow={12} uid="scaption" />
      </Panel>
    </ExerciseSvg>
  );
}

export function DeadHang() {
  const legs = [
    { upper: 4, lower: 152, far: true },
    { upper: -2, lower: 148 },
  ];
  const relaxed: Pose = {
    hip: [80, 112],
    torso: 180,
    torsoLen: 40,
    legs,
    arms: [
      { upper: 175, lower: 177, far: true, upperLen: 24, lowerLen: 22 },
      { upper: -175, lower: -177, upperLen: 24, lowerLen: 22 },
    ],
  };
  // Active hang: the blades set down a fraction, so the body drops slightly.
  const active: Pose = { ...relaxed, hip: [80, 118], torsoLen: 42 };
  return (
    <ExerciseSvg uid="dead-hang" title="Dead hang: hanging from a bar with an overhand grip and the knees bent back, first letting the shoulders rise, then gently setting the shoulder blades down with the ribs down.">
      <PullUpBar y={24} from={26} to={134} />
      <PullUpBar y={24} from={186} to={294} />
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={relaxed} />
      </Panel>
      <Panel index={1}>
        <Figure pose={active} />
        <MotionLine from={[124, 58]} to={[124, 76]} uid="dead-hang" />
        <text x={16} y={140} fill="var(--illo-accent)" fontSize={13} fontWeight={700}>
          30s
        </text>
      </Panel>
    </ExerciseSvg>
  );
}

export function EasyAerobic() {
  const a: Pose = planted({
    hip: [66, 100],
    torso: 182,
    legs: [
      { upper: 26, lower: 34, far: true },
      { upper: -22, lower: -8 },
    ],
    arms: [
      { upper: -30, lower: -54, far: true },
      { upper: 28, lower: 52 },
    ],
  });
  const b: Pose = planted({
    hip: [94, 100],
    torso: 182,
    legs: [
      { upper: -24, lower: -10, far: true },
      { upper: 28, lower: 36 },
    ],
    arms: [
      { upper: 28, lower: 52, far: true },
      { upper: -30, lower: -54 },
    ],
  });
  return (
    <ExerciseSvg uid="aerobic" title="Easy aerobic flush: an easy walk, bike or swim at a pace slow enough to breathe through the nose and hold a conversation.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={a} />
      </Panel>
      <Panel index={1}>
        <Figure pose={b} />
        <MotionLine from={[30, 140]} to={[64, 140]} uid="aerobic" />
        <text x={100} y={44} fill="var(--illo-accent)" fontSize={13} fontWeight={700}>
          easy
        </text>
      </Panel>
    </ExerciseSvg>
  );
}

export function FoamRoll() {
  // Rolling the calves: propped on the hands with one calf on the roller.
  const near: Pose = {
    hip: [96, 124],
    torso: 250,
    legs: [
      { upper: 96, lower: 96, far: true },
      { upper: 92, lower: 92, accent: true },
    ],
    arms: [
      { upper: 22, lower: 40, far: true },
      { upper: 18, lower: 36 },
    ],
  };
  const far: Pose = { ...near, hip: [82, 124] };
  const rollerNear = foot(near, 1);
  const rollerFar = foot(far, 1);
  return (
    <ExerciseSvg uid="foam-roll" title="Foam rolling: propped on the hands with a calf on the roller, rolling slowly and pausing on the tender spots rather than sweeping back and forth.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={near} />
        <circle cx={rollerNear[0] - 4} cy={150} r={9} fill="none" stroke="var(--illo-equip)" strokeWidth={2.5} />
      </Panel>
      <Panel index={1}>
        <Figure pose={far} />
        <circle cx={rollerFar[0] - 4} cy={150} r={9} fill="none" stroke="var(--illo-accent)" strokeWidth={2.5} />
        <MotionLine from={[60, 128]} to={[34, 128]} uid="foam-roll" />
        <text x={96} y={54} fill="var(--illo-accent)" fontSize={13} fontWeight={700}>
          20s
        </text>
      </Panel>
    </ExerciseSvg>
  );
}

export function Visualization() {
  // Seated, eyes closed. The second panel is what he is seeing.
  const seated: Pose = {
    hip: [72, 122],
    torso: 180,
    legs: [
      { upper: -86, lower: -6, far: true },
      { upper: -82, lower: -2 },
    ],
    arms: [
      { upper: -50, lower: -12, far: true },
      { upper: -46, lower: -8 },
    ],
  };
  const serving: Pose = {
    hip: [80, 108],
    torso: 176,
    torsoLen: 34,
    legs: [
      { upper: 10, lower: 8, far: true },
      { upper: -10, lower: -8 },
    ],
    arms: [
      { upper: 40, lower: 60, far: true },
      { upper: -163, lower: -172, accent: true },
    ],
  };
  return (
    <ExerciseSvg uid="viz" title="Visualization: sitting quietly with the eyes closed, playing real points at real speed and feeling the serve rather than only watching it.">
      <GroundLine panel={0} />
      <Panel index={0}>
        <Figure pose={seated} />
        <MotionArc from={[100, 74]} to={[136, 62]} bow={-12} uid="viz" dashed />
      </Panel>
      <Panel index={1}>
        <g opacity={0.55}>
          <Figure pose={serving} />
        </g>
        <rect x={12} y={30} width={136} height={116} rx={6} fill="none" stroke="var(--illo-accent)" strokeWidth={1.5} strokeDasharray="4 5" />
      </Panel>
    </ExerciseSvg>
  );
}
