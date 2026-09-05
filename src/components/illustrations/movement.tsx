import {
  ExerciseSvg,
  Figure,
  GroundLine,
  Panel,
  MotionArc,
  MotionLine,
  TennisBall,
  Wall,
  Racket,
  Impact,
  hand,
  planted,
  type Pose,
} from './Figure';

/* Movement-family illustrations. */

/** A floor marker. Two per panel for the shuttle drill. */
function Cone({ x, y = 158 }: { x: number; y?: number }) {
  return <path d={`M ${x} ${y - 11} L ${x + 5} ${y} L ${x - 5} ${y} Z`} fill="none" stroke="var(--illo-ground)" strokeWidth={2} strokeLinejoin="round" />;
}

export function PogoHop() {
  const contact: Pose = planted({
    hip: [80, 100],
    torso: 180,
    legs: [
      { upper: 3, lower: 3, far: true },
      { upper: -3, lower: -3, accent: true },
    ],
    arms: [
      { upper: 16, lower: 34, far: true },
      { upper: -16, lower: -34 },
    ],
  });
  const air: Pose = {
    hip: [80, 84],
    torso: 180,
    legs: [
      { upper: 3, lower: 3, far: true },
      { upper: -3, lower: -3, accent: true },
    ],
    arms: [
      { upper: 16, lower: 34, far: true },
      { upper: -16, lower: -34 },
    ],
  };
  return (
    <ExerciseSvg uid="pogo" title="Pogo hops: bounce straight up off stiff ankles with the knees nearly straight, spending as little time on the ground as possible.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={contact} />
      </Panel>
      <Panel index={1}>
        <Figure pose={air} />
        <MotionLine from={[118, 130]} to={[118, 100]} uid="pogo" />
      </Panel>
    </ExerciseSvg>
  );
}

export function SplitStepLateralPushOff() {
  const land: Pose = planted({
    hip: [80, 108],
    torso: 182,
    legs: [
      { upper: 28, lower: 22, far: true },
      { upper: -28, lower: -22, accent: true },
    ],
    arms: [
      { upper: -40, lower: -66, far: true },
      { upper: 40, lower: 66 },
    ],
  });
  const drive: Pose = planted({
    hip: [70, 104],
    torso: 206,
    legs: [
      { upper: 54, lower: 44, far: true, accent: true },
      { upper: -34, lower: -10 },
    ],
    arms: [
      { upper: -50, lower: -78, far: true },
      { upper: 30, lower: 56 },
    ],
  });
  return (
    <ExerciseSvg uid="split-push" title="Split step into a lateral push-off: land already loaded from the split step, then drive off the outside foot and take three hard strides to the side.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={land} />
        <MotionLine from={[80, 62]} to={[80, 82]} uid="split-push" />
      </Panel>
      <Panel index={1}>
        <Figure pose={drive} />
        <MotionLine from={[104, 118]} to={[142, 118]} uid="split-push" />
      </Panel>
    </ExerciseSvg>
  );
}

export function SkaterBound() {
  const push: Pose = planted({
    hip: [46, 104],
    torso: 196,
    legs: [
      { upper: 54, lower: 40, far: true, accent: true },
      { upper: -26, lower: -54 },
    ],
    arms: [
      { upper: -46, lower: -70, far: true },
      { upper: 26, lower: 52 },
    ],
  });
  const stick: Pose = planted({
    hip: [112, 104],
    torso: 188,
    legs: [
      { upper: 44, lower: 72, far: true },
      { upper: -12, lower: 8, accent: true },
    ],
    arms: [
      { upper: -34, lower: -58, far: true },
      { upper: 34, lower: 58 },
    ],
  });
  return (
    <ExerciseSvg uid="skater" title="Skater bound: push off one leg, bound sideways, and stick the landing on the other leg for one full second before going back.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={push} />
        <MotionArc from={[62, 92]} to={[126, 92]} bow={-26} uid="skater" />
      </Panel>
      <Panel index={1}>
        <Figure pose={stick} />
        <text x={30} y={112} fill="var(--illo-accent)" fontSize={15} fontWeight={700}>
          1s
        </text>
      </Panel>
    </ExerciseSvg>
  );
}

export function CrossoverStepStart() {
  const ready: Pose = planted({
    hip: [72, 106],
    torso: 184,
    legs: [
      { upper: 20, lower: 14, far: true },
      { upper: -20, lower: -14 },
    ],
    arms: [
      { upper: -36, lower: -62, far: true },
      { upper: 36, lower: 62 },
    ],
  });
  const cross: Pose = planted({
    hip: [78, 102],
    torso: 198,
    legs: [
      { upper: -56, lower: -28, far: true, accent: true },
      { upper: 30, lower: 18 },
    ],
    arms: [
      { upper: -62, lower: -92, far: true },
      { upper: 34, lower: 60 },
    ],
  });
  return (
    <ExerciseSvg uid="crossover" title="Crossover step start: from a ready position, turn the near hip and step the far foot across the body, then accelerate for three strides.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={ready} />
      </Panel>
      <Panel index={1}>
        <Figure pose={cross} />
        <MotionArc from={[74, 150]} to={[124, 142]} bow={-16} uid="crossover" />
      </Panel>
    </ExerciseSvg>
  );
}

export function WallShuffle() {
  // Body in one straight line leaning into the wall; only the legs alternate.
  const leanTorso = 222;
  const support = { upper: 42, lower: 42, far: true } as const;
  const a: Pose = planted({
    hip: [66, 108],
    torso: leanTorso,
    legs: [support, { upper: -30, lower: 26, accent: true }],
    arms: [
      { upper: -128, lower: -132, far: true },
      { upper: -124, lower: -128 },
    ],
  });
  const b: Pose = planted({
    hip: [66, 108],
    torso: leanTorso,
    legs: [{ upper: -34, lower: 22, far: true }, { upper: 42, lower: 42, accent: true }],
    arms: [
      { upper: -128, lower: -132, far: true },
      { upper: -124, lower: -128 },
    ],
  });
  return (
    <ExerciseSvg uid="wall-shuffle" title="Wall shuffle: hands on a wall with the body in a straight leaning line, driving the knees up alternately as fast as possible.">
      <Wall x={140} />
      <Wall x={300} />
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={a} />
      </Panel>
      <Panel index={1}>
        <Figure pose={b} />
        <MotionArc from={[52, 132]} to={[44, 106]} bow={12} uid="wall-shuffle" />
      </Panel>
    </ExerciseSvg>
  );
}

export function Mini5105() {
  const start: Pose = planted({
    hip: [80, 106],
    torso: 190,
    legs: [
      { upper: 24, lower: 16, far: true },
      { upper: -24, lower: -16 },
    ],
    arms: [
      { upper: -40, lower: -66, far: true },
      { upper: 40, lower: 66 },
    ],
  });
  const turn: Pose = planted({
    hip: [96, 116],
    torso: 214,
    legs: [
      { upper: 46, lower: 30, far: true },
      { upper: -34, lower: 4, accent: true },
    ],
    arms: [
      { upper: -96, lower: -126, far: true, accent: true },
      { upper: 20, lower: 48 },
    ],
  });
  return (
    <ExerciseSvg uid="shuttle" title="Mini 5-10-5 shuttle: start in the middle, sprint five yards and touch the line, sprint ten the other way and touch, then sprint back through the middle.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Cone x={22} />
        <Cone x={138} />
        <Figure pose={start} />
        <MotionArc from={[64, 142]} to={[30, 146]} bow={16} uid="shuttle" />
        <MotionArc from={[96, 142]} to={[130, 146]} bow={-16} uid="shuttle" />
      </Panel>
      <Panel index={1}>
        <Cone x={132} />
        <Figure pose={turn} />
        <Impact x={128} y={152} r={8} />
      </Panel>
    </ExerciseSvg>
  );
}

export function DropStepRetreat() {
  const ready: Pose = planted({
    hip: [58, 106],
    torso: 184,
    legs: [
      { upper: 20, lower: 14, far: true },
      { upper: -20, lower: -14 },
    ],
    arms: [
      { upper: -50, lower: -76, far: true },
      { upper: -44, lower: -70 },
    ],
  });
  const retreat: Pose = planted({
    hip: [100, 100],
    torso: 168,
    legs: [
      { upper: -44, lower: -20, far: true, accent: true },
      { upper: 34, lower: 22 },
    ],
    arms: [
      { upper: 40, lower: 62, far: true },
      { upper: -168, lower: -174 },
    ],
  });
  const rh = hand(ready, 1);
  const th = hand(retreat, 1);
  return (
    <ExerciseSvg uid="drop-step" scale={0.9} title="Drop-step retreat: turn the hip and open the body, take three crossover strides back rather than backpedalling, then jump and swing an overhead.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={ready} />
        <Racket x={rh[0]} y={rh[1]} angle={-80} len={16} />
        <MotionArc from={[86, 128]} to={[124, 136]} bow={-14} uid="drop-step" />
      </Panel>
      <Panel index={1}>
        <Figure pose={retreat} />
        <Racket x={th[0]} y={th[1]} angle={-172} len={18} accent />
      </Panel>
    </ExerciseSvg>
  );
}

export function DecelerationDrop() {
  const run: Pose = planted({
    hip: [50, 100],
    torso: 202,
    legs: [
      { upper: 46, lower: 76, far: true },
      { upper: -44, lower: -4 },
    ],
    arms: [
      { upper: -58, lower: -104, far: true },
      { upper: 46, lower: 92 },
    ],
  });
  const stop: Pose = planted({
    hip: [102, 118],
    torso: 196,
    legs: [
      { upper: 40, lower: -6, far: true },
      { upper: -40, lower: 6, accent: true },
    ],
    arms: [
      { upper: 30, lower: 66, far: true },
      { upper: -30, lower: -66 },
    ],
  });
  return (
    <ExerciseSvg uid="decel" title="Deceleration drop: four hard strides forward, then stop dead and hold a low athletic position for two full seconds.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={run} />
        <MotionLine from={[92, 120]} to={[136, 120]} uid="decel" />
      </Panel>
      <Panel index={1}>
        <Figure pose={stop} />
        <text x={26} y={118} fill="var(--illo-accent)" fontSize={15} fontWeight={700}>
          2s
        </text>
      </Panel>
    </ExerciseSvg>
  );
}

export function BallDropReaction() {
  const hold: Pose = planted({
    hip: [66, 104],
    torso: 182,
    legs: [
      { upper: 16, lower: 12, far: true },
      { upper: -16, lower: -12 },
    ],
    arms: [
      { upper: 20, lower: 40, far: true },
      { upper: -104, lower: -108, accent: true },
    ],
  });
  const react: Pose = planted({
    hip: [78, 112],
    torso: 208,
    legs: [
      { upper: 48, lower: 14, far: true },
      { upper: -40, lower: 6 },
    ],
    arms: [
      { upper: 20, lower: 44, far: true },
      { upper: -104, lower: -120, accent: true },
    ],
  });
  const hh = hand(hold, 1);
  return (
    <ExerciseSvg uid="ball-drop" title="Ball drop reaction: drop a ball from shoulder height, let it bounce once, and catch it before the second bounce, starting a step further away each rep.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={hold} />
        <TennisBall x={hh[0] + 8} y={hh[1] + 2} />
        <MotionLine from={[hh[0] + 8, hh[1] + 12]} to={[hh[0] + 8, 150]} uid="ball-drop" />
      </Panel>
      <Panel index={1}>
        <Figure pose={react} />
        <MotionArc from={[42, 154]} to={[104, 96]} bow={-22} uid="ball-drop" />
        <TennisBall x={112} y={92} />
      </Panel>
    </ExerciseSvg>
  );
}
