import {
  ExerciseSvg,
  Figure,
  GroundLine,
  Panel,
  MotionArc,
  MotionLine,
  Band,
  Racket,
  Wall,
  hand,
  planted,
  aim,
  type Pose,
} from './Figure';

/* Warm-up-family illustrations. */

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

export function BandExternalRotation() {
  const inward: Pose = planted({
    ...STANDING,
    arms: [{ upper: 8, lower: 12, far: true }, { upper: -6, lower: 62, accent: true }],
  });
  const outward: Pose = planted({
    ...STANDING,
    arms: [{ upper: 8, lower: 12, far: true }, { upper: -6, lower: -78, accent: true }],
  });
  const h1 = hand(inward, 1);
  const h2 = hand(outward, 1);
  return (
    <ExerciseSvg uid="band-er" title="Band external rotation: elbow pinned against the ribs at ninety degrees, the forearm rotates outward away from the body, then returns slowly.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={inward} />
        <Band from={[h1[0], h1[1]]} to={[146, 84]} amp={3.5} zigs={6} />
      </Panel>
      <Panel index={1}>
        <Figure pose={outward} />
        <Band from={[h2[0], h2[1]]} to={[146, 84]} amp={3.5} zigs={7} accent />
        <MotionArc from={[h2[0] + 18, h2[1] + 22]} to={[h2[0] - 6, h2[1] - 12]} bow={14} uid="band-er" />
      </Panel>
    </ExerciseSvg>
  );
}

export function BandPullApart() {
  const together: Pose = planted({
    ...STANDING,
    arms: [
      { upper: -84, lower: -86, far: true },
      { upper: -80, lower: -82 },
    ],
  });
  const apart: Pose = planted({
    ...STANDING,
    arms: [
      { upper: 96, lower: 94, far: true, accent: true },
      { upper: -84, lower: -86, accent: true },
    ],
  });
  return (
    <ExerciseSvg uid="pull-apart" title="Band pull-apart: arms straight in front at chest height, pulling the band apart until it touches the sternum with the shoulder blades squeezed and no shrug.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={together} />
        <Band from={[hand(together, 0)[0], hand(together, 0)[1]]} to={[hand(together, 1)[0], hand(together, 1)[1]]} amp={3} zigs={5} />
      </Panel>
      <Panel index={1}>
        <Figure pose={apart} />
        <Band from={[hand(apart, 0)[0], hand(apart, 0)[1]]} to={[hand(apart, 1)[0], hand(apart, 1)[1]]} amp={3} zigs={9} accent />
        <MotionLine from={[68, 118]} to={[40, 118]} uid="pull-apart" />
        <MotionLine from={[92, 118]} to={[120, 118]} uid="pull-apart" />
      </Panel>
    </ExerciseSvg>
  );
}

export function ThoracicOpenBook() {
  // Side-lying, facing right. Knees stay stacked and pinned while only the top
  // arm travels, which is the whole point of the drill.
  const HIP: [number, number] = [92, 132];
  const KNEE: [number, number] = [126, 128];
  const FOOT: [number, number] = [120, 152];
  const SHOULDER: [number, number] = [46, 130];

  const build = (topHand: [number, number], sweeping: boolean): Pose => {
    const t = aim(HIP, SHOULDER);
    const thigh = aim(HIP, KNEE);
    const shin = aim(KNEE, FOOT);
    const reach = aim(SHOULDER, topHand);
    return {
      hip: HIP,
      torso: t.angle,
      torsoLen: t.len,
      headAngle: sweeping ? -22 : 0,
      legs: [
        { upper: thigh.angle + 5, lower: shin.angle + 5, far: true, upperLen: thigh.len, lowerLen: shin.len },
        { upper: thigh.angle, lower: shin.angle, upperLen: thigh.len, lowerLen: shin.len },
      ],
      arms: [
        { upper: -92, lower: -92, far: true, upperLen: 22, lowerLen: 20 },
        { upper: reach.angle, lower: reach.angle, accent: true, upperLen: reach.len / 2, lowerLen: reach.len / 2 },
      ],
    };
  };

  const closed = build([90, 128], false);
  const open = build([18, 146], true);

  return (
    <ExerciseSvg uid="open-book" title="Thoracic open-book: lying on your side with the knees stacked and pinned, the top arm sweeps in a wide arc to the floor behind you while the eyes follow the hand.">
      <GroundLine panel={0} inset={6} />
      <GroundLine panel={1} inset={6} />
      <Panel index={0}>
        <Figure pose={closed} />
      </Panel>
      <Panel index={1}>
        <Figure pose={open} />
        <MotionArc from={[88, 120]} to={[26, 138]} bow={44} uid="open-book" />
      </Panel>
    </ExerciseSvg>
  );
}

export function RacketWristSnap() {
  const back: Pose = planted({
    ...STANDING,
    arms: [{ upper: 10, lower: 14, far: true }, { upper: -168, lower: 150, accent: true }],
  });
  const through: Pose = planted({
    ...STANDING,
    arms: [{ upper: 10, lower: 14, far: true }, { upper: -168, lower: -178, accent: true }],
  });
  const h1 = hand(back, 1);
  const h2 = hand(through, 1);
  return (
    <ExerciseSvg uid="wrist-snap" scale={0.84} title="Racket wrist snaps: from a finished trophy position with a high elbow, only the last six inches of the serve are repeated as the forearm pronates and the wrist releases.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={back} />
        <Racket x={h1[0]} y={h1[1]} angle={140} len={18} accent />
      </Panel>
      <Panel index={1}>
        <Figure pose={through} />
        <Racket x={h2[0]} y={h2[1]} angle={-176} len={18} accent />
        <MotionArc from={[52, 74]} to={[86, 34]} bow={-18} uid="wrist-snap" />
      </Panel>
    </ExerciseSvg>
  );
}

export function AnkleRocker() {
  const back: Pose = planted({
    hip: [64, 106],
    torso: 200,
    legs: [
      { upper: 38, lower: 30, far: true },
      { upper: -28, lower: 8 },
    ],
    arms: [
      { upper: -118, lower: -124, far: true },
      { upper: -114, lower: -120 },
    ],
  });
  const forward: Pose = planted({
    hip: [70, 106],
    torso: 200,
    legs: [
      { upper: 36, lower: 28, far: true },
      { upper: -44, lower: 22, accent: true },
    ],
    arms: [
      { upper: -118, lower: -124, far: true },
      { upper: -114, lower: -120 },
    ],
  });
  return (
    <ExerciseSvg uid="ankle-rocker" title="Ankle rocker: in a short lunge facing a wall, drive the front knee forward over the toes toward the wall while the front heel stays flat on the floor.">
      <Wall x={136} />
      <Wall x={296} />
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={back} />
      </Panel>
      <Panel index={1}>
        <Figure pose={forward} />
        <MotionArc from={[86, 128]} to={[116, 124]} bow={-10} uid="ankle-rocker" />
      </Panel>
    </ExerciseSvg>
  );
}

export function WorldsGreatestStretch() {
  const lunge: Pose = planted({
    hip: [62, 116],
    torso: 214,
    legs: [
      { upper: 74, lower: 66, far: true },
      { upper: -56, lower: 16 },
    ],
    arms: [
      { upper: -30, lower: -26, far: true },
      { upper: -26, lower: -22 },
    ],
  });
  const rotate: Pose = planted({
    hip: [62, 116],
    torso: 210,
    legs: [
      { upper: 74, lower: 66, far: true },
      { upper: -56, lower: 16 },
    ],
    arms: [
      { upper: -26, lower: -22, far: true },
      { upper: 160, lower: 172, accent: true },
    ],
  });
  return (
    <ExerciseSvg uid="wgs" title="World's greatest stretch: step into a deep lunge with the back knee off the floor, drop the elbow to the instep, then rotate the top arm to the ceiling and follow it with your eyes.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={lunge} />
      </Panel>
      <Panel index={1}>
        <Figure pose={rotate} />
        <MotionArc from={[74, 110]} to={[62, 44]} bow={-22} uid="wgs" />
      </Panel>
    </ExerciseSvg>
  );
}

export function JumpRope() {
  const down: Pose = planted({
    ...STANDING,
    arms: [
      { upper: 40, lower: 76, far: true },
      { upper: -40, lower: -76 },
    ],
  });
  const up: Pose = {
    hip: [80, 90],
    torso: 180,
    legs: [
      { upper: 4, lower: 4, far: true, accent: true },
      { upper: -4, lower: -4, accent: true },
    ],
    arms: [
      { upper: 40, lower: 76, far: true },
      { upper: -40, lower: -76 },
    ],
  };
  const hd = hand(down, 1);
  const hu = hand(up, 1);
  return (
    <ExerciseSvg uid="rope" title="Jump rope: the wrists turn the rope while the elbows stay close to the sides, bouncing barely an inch off the floor on the balls of the feet.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={down} />
        <path d={`M ${hd[0]} ${hd[1]} Q 80 178 ${160 - hd[0]} ${hd[1]}`} fill="none" stroke="var(--illo-equip)" strokeWidth={2} />
      </Panel>
      <Panel index={1}>
        <Figure pose={up} />
        <path d={`M ${hu[0]} ${hu[1]} Q 80 26 ${160 - hu[0]} ${hu[1]}`} fill="none" stroke="var(--illo-accent)" strokeWidth={2} />
        <MotionLine from={[126, 132]} to={[126, 112]} uid="rope" />
      </Panel>
    </ExerciseSvg>
  );
}

export function LegSwing() {
  const backSwing: Pose = planted({
    hip: [80, 100],
    torso: 178,
    legs: [
      { upper: 2, lower: 2, far: true },
      { upper: 40, lower: 44, accent: true },
    ],
    arms: [
      { upper: -104, lower: -110, far: true },
      { upper: 10, lower: 14 },
    ],
  });
  const foreSwing: Pose = {
    hip: [80, 100],
    torso: 178,
    legs: [
      { upper: 2, lower: 2, far: true },
      { upper: -52, lower: -48, accent: true },
    ],
    arms: [
      { upper: -104, lower: -110, far: true },
      { upper: 10, lower: 14 },
    ],
  };
  return (
    <ExerciseSvg uid="leg-swing" title="Leg swings: holding a wall for balance, the outside leg swings relaxed forward and back with the torso staying still, letting the range build over the reps.">
      <Wall x={144} />
      <Wall x={304} />
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={backSwing} />
      </Panel>
      <Panel index={1}>
        <Figure pose={planted(foreSwing, 158)} />
        <MotionArc from={[52, 150]} to={[116, 122]} bow={-24} uid="leg-swing" />
      </Panel>
    </ExerciseSvg>
  );
}

export function ASkip() {
  const drive: Pose = planted({
    hip: [70, 100],
    torso: 182,
    legs: [
      { upper: 6, lower: 6, far: true },
      { upper: -86, lower: -10, accent: true },
    ],
    arms: [
      { upper: -66, lower: -104, far: true },
      { upper: 54, lower: 96 },
    ],
  });
  const strike: Pose = planted({
    hip: [92, 100],
    torso: 182,
    legs: [
      { upper: -60, lower: -12, far: true },
      { upper: 4, lower: 4, accent: true },
    ],
    arms: [
      { upper: 54, lower: 96, far: true },
      { upper: -66, lower: -104 },
    ],
  });
  return (
    <ExerciseSvg uid="a-skip" title="A-skips: skipping forward tall, driving one knee to hip height with the opposite arm, and striking the ground underneath the hip rather than out in front.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={drive} />
      </Panel>
      <Panel index={1}>
        <Figure pose={strike} />
        <MotionArc from={[46, 108]} to={[84, 140]} bow={-16} uid="a-skip" />
      </Panel>
    </ExerciseSvg>
  );
}

export function HipOpener() {
  const front: Pose = planted({
    hip: [74, 100],
    torso: 180,
    legs: [
      { upper: 4, lower: 4, far: true },
      { upper: -84, lower: -14, accent: true },
    ],
    arms: [
      { upper: -110, lower: -116, far: true },
      { upper: 12, lower: 16 },
    ],
  });
  const out: Pose = planted({
    hip: [74, 100],
    torso: 180,
    legs: [
      { upper: 4, lower: 4, far: true },
      { upper: -48, lower: 4, accent: true },
    ],
    arms: [
      { upper: -110, lower: -116, far: true },
      { upper: 12, lower: 16 },
    ],
  });
  return (
    <ExerciseSvg uid="hip-opener" title="Hip openers: lift the knee to hip height, then open it out to the side in a wide arc while the pelvis stays level, reversing the direction on alternate reps.">
      <Wall x={144} />
      <Wall x={304} />
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={front} />
      </Panel>
      <Panel index={1}>
        <Figure pose={out} />
        <MotionArc from={[96, 84]} to={[112, 116]} bow={-14} uid="hip-opener" />
      </Panel>
    </ExerciseSvg>
  );
}
