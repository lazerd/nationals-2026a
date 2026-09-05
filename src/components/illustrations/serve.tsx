import {
  ExerciseSvg,
  Figure,
  GroundLine,
  Panel,
  MotionArc,
  MedBall,
  Racket,
  TennisBall,
  Wall,
  Platform,
  Band,
  Impact,
  halfKneeling,
  squat,
  hand,
  bothHands,
  planted,
  foot,
  type Pose,
} from './Figure';

/*
  Serve-family illustrations. Panel 1 is the loaded position, panel 2 is the
  finish, and the accent marks whatever segment is doing the work.
*/

export function RotationalWallThrow() {
  const load: Pose = planted({
    hip: [66, 100],
    torso: 172,
    legs: [
      { upper: 26, lower: 4, far: true },
      { upper: -22, lower: -2 },
    ],
    arms: [
      { upper: 34, lower: 52, far: true },
      { upper: 30, lower: 48, accent: true },
    ],
  });
  const fire: Pose = planted({
    hip: [72, 100],
    torso: -170,
    legs: [
      { upper: 30, lower: 34, far: true },
      { upper: -18, lower: -4 },
    ],
    arms: [
      { upper: -72, lower: -80, far: true },
      { upper: -68, lower: -78, accent: true },
    ],
  });
  return (
    <ExerciseSvg uid="rot-throw" title="Rotational wall throw: from a loaded back hip with the chest closed, the hip turns first and the ball is thrown side-on into a wall.">
      <Wall x={146} />
      <Wall x={306} />
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={load} />
        <MedBall x={bothHands(load)[0]} y={bothHands(load)[1]} accent />
      </Panel>
      <Panel index={1}>
        <Figure pose={fire} />
        <MotionArc from={[52, 118]} to={[112, 96]} bow={-24} uid="rot-throw" />
        <MedBall x={130} y={92} accent />
        <Impact x={143} y={92} r={8} />
      </Panel>
    </ExerciseSvg>
  );
}

export function StepBehindRotationalThrow() {
  const step: Pose = planted({
    hip: [58, 100],
    torso: 174,
    legs: [
      { upper: 40, lower: 20, far: true },
      { upper: -30, lower: -6 },
    ],
    arms: [
      { upper: 32, lower: 50, far: true },
      { upper: 28, lower: 46, accent: true },
    ],
  });
  const fire: Pose = planted({
    hip: [80, 100],
    torso: -168,
    legs: [
      { upper: 32, lower: 38, far: true },
      { upper: -20, lower: -4 },
    ],
    arms: [
      { upper: -74, lower: -84, far: true },
      { upper: -70, lower: -80, accent: true },
    ],
  });
  return (
    <ExerciseSvg uid="step-throw" title="Step-behind rotational throw: a shuffle step in, landing with the chest still closed, then the same hip-led throw into the wall.">
      <Wall x={146} />
      <Wall x={306} />
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={step} />
        <MedBall x={bothHands(step)[0]} y={bothHands(step)[1]} accent />
        <MotionArc from={[26, 150]} to={[62, 150]} bow={-14} uid="step-throw" />
      </Panel>
      <Panel index={1}>
        <Figure pose={fire} />
        <MotionArc from={[58, 116]} to={[116, 94]} bow={-24} uid="step-throw" />
        <MedBall x={132} y={90} accent />
        <Impact x={144} y={90} r={8} />
      </Panel>
    </ExerciseSvg>
  );
}

export function HalfKneelingSlam() {
  const base = halfKneeling(74);
  const up: Pose = {
    ...base,
    torso: 180,
    arms: [
      { upper: 172, lower: 174, far: true, accent: true },
      { upper: -172, lower: -174, accent: true },
    ],
  };
  const down: Pose = {
    ...base,
    torso: 202,
    arms: [
      { upper: -118, lower: -150, far: true, accent: true },
      { upper: -122, lower: -154, accent: true },
    ],
  };
  return (
    <ExerciseSvg uid="hk-slam" scale={0.94} title="Half-kneeling overhead slam: from a tall half-kneeling position with the ball overhead and the ribs down, the ball is slammed into the floor in front of the front knee.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={up} />
        <MedBall x={bothHands(up)[0]} y={bothHands(up)[1] - 1} accent />
      </Panel>
      <Panel index={1}>
        <Figure pose={down} />
        <MotionArc from={[80, 34]} to={[124, 132]} bow={24} uid="hk-slam" />
        <MedBall x={130} y={146} accent />
        <Impact x={130} y={157} r={9} />
      </Panel>
    </ExerciseSvg>
  );
}

export function WeightedShadowServe() {
  const trophy: Pose = planted({
    hip: [80, 100],
    torso: 184,
    legs: [
      { upper: 16, lower: 12, far: true },
      { upper: -14, lower: -10 },
    ],
    arms: [
      { upper: -146, lower: -166, far: true },
      { upper: 124, lower: 172, accent: true },
    ],
  });
  const contact: Pose = planted({
    hip: [80, 102],
    torso: 176,
    legs: [
      { upper: 10, lower: 8, far: true },
      { upper: -10, lower: -8 },
    ],
    arms: [
      { upper: 40, lower: 60, far: true },
      { upper: -163, lower: -172, accent: true },
    ],
  });
  const th = hand(trophy, 1);
  const ch = hand(contact, 1);
  return (
    <ExerciseSvg uid="shadow-serve" scale={0.8} title="Weighted shadow serve: a slow trophy position where the hips have opened but the shoulders are still closed, then acceleration through contact.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={trophy} />
        <Racket x={th[0]} y={th[1]} angle={150} len={20} accent />
      </Panel>
      <Panel index={1}>
        <Figure pose={contact} />
        <Racket x={ch[0]} y={ch[1]} angle={-172} len={20} accent />
        <MotionArc from={[54, 60]} to={[88, 22]} bow={-20} uid="shadow-serve" />
      </Panel>
    </ExerciseSvg>
  );
}

export function LiveServe() {
  const toss: Pose = planted({
    hip: [70, 100],
    torso: 184,
    legs: [
      { upper: 16, lower: 12, far: true },
      { upper: -14, lower: -10 },
    ],
    arms: [
      { upper: -166, lower: -176, far: true, accent: true },
      { upper: 130, lower: 174 },
    ],
  });
  const strike: Pose = planted({
    hip: [70, 104],
    torso: 176,
    legs: [
      { upper: 12, lower: 10, far: true },
      { upper: -10, lower: -8 },
    ],
    arms: [
      { upper: 40, lower: 60, far: true },
      { upper: -163, lower: -172, accent: true },
    ],
  });
  const sh = hand(strike, 1);
  return (
    <ExerciseSvg uid="live-serve" scale={0.8} title="Live serve: a consistent toss, then a full first-serve strike to a target.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={toss} />
        <TennisBall x={44} y={30} />
        <MotionArc from={[46, 62]} to={[44, 38]} bow={8} uid="live-serve" />
      </Panel>
      <Panel index={1}>
        <Figure pose={strike} />
        <Racket x={sh[0]} y={sh[1]} angle={-172} len={20} accent />
        <TennisBall x={74} y={22} />
        <Impact x={74} y={22} r={10} />
        <MotionArc from={[92, 26]} to={[142, 74]} bow={-18} uid="live-serve" />
      </Panel>
    </ExerciseSvg>
  );
}

export function ServeStanceJump() {
  const load: Pose = planted({
    hip: [58, 112],
    torso: 194,
    legs: [
      { upper: 46, lower: -22, far: true },
      { upper: -12, lower: 26, accent: true },
    ],
    arms: [
      { upper: 34, lower: 58, far: true },
      { upper: 28, lower: 52 },
    ],
  });
  const air: Pose = {
    hip: [104, 78],
    torso: 184,
    legs: [
      { upper: 14, lower: 12, far: true },
      { upper: -6, lower: -4, accent: true },
    ],
    arms: [
      { upper: -152, lower: -170, far: true },
      { upper: 146, lower: 170 },
    ],
  };
  return (
    <ExerciseSvg uid="stance-jump" scale={0.84} title="Serve-stance jump: load in your exact serve stance, then jump up and forward into the court rather than straight up.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={load} />
      </Panel>
      <Panel index={1}>
        <Figure pose={air} />
        <MotionArc from={[52, 128]} to={[100, 84]} bow={16} uid="stance-jump" />
      </Panel>
    </ExerciseSvg>
  );
}

export function ScoopToss() {
  const low: Pose = {
    ...squat(78, 34),
    arms: [
      { upper: 16, lower: 4, far: true, accent: true },
      { upper: -12, lower: -2, accent: true },
    ],
  };
  const tall: Pose = planted({
    hip: [80, 96],
    torso: 174,
    legs: [
      { upper: 5, lower: 5, far: true },
      { upper: -5, lower: -5 },
    ],
    arms: [
      { upper: 168, lower: 176, far: true, accent: true },
      { upper: -168, lower: -176, accent: true },
    ],
  });
  return (
    <ExerciseSvg uid="scoop" scale={0.9} title="Scoop toss: squat down with the ball between the feet, then explode through full triple extension and throw the ball up and behind you.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={low} />
        <MedBall x={bothHands(low)[0]} y={bothHands(low)[1] + 4} accent />
      </Panel>
      <Panel index={1}>
        <Figure pose={tall} />
        <MotionArc from={[96, 124]} to={[126, 34]} bow={-24} uid="scoop" />
        <MedBall x={130} y={24} r={9} accent />
      </Panel>
    </ExerciseSvg>
  );
}

export function PronationSnap() {
  const base: Pose = planted({
    hip: [78, 104],
    torso: 180,
    legs: [
      { upper: 5, lower: 5, far: true },
      { upper: -5, lower: -5 },
    ],
    arms: [{ upper: 8, lower: 12, far: true }],
  });
  // Upper arm parked against the ribs, forearm horizontal: the rotation is
  // shown by which way the band pulls off the hand, not by the arm moving.
  const palmUp: Pose = {
    ...base,
    arms: [{ upper: 8, lower: 12, far: true }, { upper: -4, lower: -92, accent: true }],
  };
  const palmDown: Pose = {
    ...base,
    arms: [{ upper: 8, lower: 12, far: true }, { upper: -4, lower: -92, accent: true }],
  };
  const h = hand(palmUp, 1);
  return (
    <ExerciseSvg uid="pronation" title="Pronation snaps: with the elbow bent to ninety degrees and the upper arm parked against the ribs, the forearm rotates fast from palm-up to palm-down and returns slowly.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={palmUp} />
        <Band from={[h[0], h[1] - 4]} to={[h[0], 44]} amp={3.5} zigs={6} accent />
        <MotionArc from={[h[0] - 13, h[1] + 13]} to={[h[0] + 13, h[1] + 13]} bow={11} uid="pronation" />
      </Panel>
      <Panel index={1}>
        <Figure pose={palmDown} />
        <Band from={[h[0], h[1] + 4]} to={[h[0], 152]} amp={3.5} zigs={6} accent />
        <MotionArc from={[h[0] + 13, h[1] - 13]} to={[h[0] - 13, h[1] - 13]} bow={11} uid="pronation" />
      </Panel>
    </ExerciseSvg>
  );
}

export function ServeFirstVolley() {
  const serve: Pose = planted({
    hip: [50, 102],
    torso: 176,
    legs: [
      { upper: 12, lower: 10, far: true },
      { upper: -10, lower: -8 },
    ],
    arms: [
      { upper: 40, lower: 60, far: true },
      { upper: -163, lower: -172, accent: true },
    ],
  });
  const split: Pose = planted({
    hip: [86, 106],
    torso: 172,
    legs: [
      { upper: 26, lower: 18, far: true },
      { upper: -26, lower: -18, accent: true },
    ],
    arms: [
      { upper: -46, lower: -70, far: true },
      { upper: -56, lower: -78 },
    ],
  });
  const sh = hand(serve, 1);
  return (
    <ExerciseSvg uid="serve-volley" scale={0.82} title="Serve plus first volley: serve at full pace, take two hard steps in, then split step as the opponent makes contact.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={serve} />
        <Racket x={sh[0]} y={sh[1]} angle={-172} len={20} accent />
        <MotionArc from={[70, 140]} to={[128, 140]} bow={-18} uid="serve-volley" />
      </Panel>
      <Panel index={1}>
        <Figure pose={split} />
        <Racket x={hand(split, 1)[0]} y={hand(split, 1)[1]} angle={-70} len={16} />
        <MotionArc from={[86, 140]} to={[86, 122]} bow={10} uid="serve-volley" />
      </Panel>
    </ExerciseSvg>
  );
}

export function SplitSquatJump() {
  const dip: Pose = planted({
    hip: [80, 122],
    torso: 188,
    legs: [
      { upper: 56, lower: -28, far: true },
      { upper: -34, lower: 32 },
    ],
    arms: [
      { upper: 34, lower: 50, far: true },
      { upper: -34, lower: -50 },
    ],
  });
  const air: Pose = {
    hip: [80, 82],
    torso: 180,
    legs: [
      { upper: 30, lower: 22, far: true },
      { upper: -22, lower: -14, accent: true },
    ],
    arms: [
      { upper: 150, lower: 168, far: true },
      { upper: -150, lower: -168 },
    ],
  };
  return (
    <ExerciseSvg uid="ss-jump" title="Split squat jump: a quick dip in a split stance, then a jump straight up keeping the same stance in the air, landing softly.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={dip} />
      </Panel>
      <Panel index={1}>
        <Figure pose={air} />
        <MotionArc from={[112, 140]} to={[112, 96]} bow={14} uid="ss-jump" />
      </Panel>
    </ExerciseSvg>
  );
}

export function SplitSquat() {
  const top: Pose = {
    hip: [84, 100],
    torso: 178,
    legs: [
      { upper: 52, lower: -30, far: true },
      { upper: -16, lower: 12 },
    ],
    arms: [
      { upper: 8, lower: 12, far: true },
      { upper: -8, lower: -12 },
    ],
  };
  const bottom: Pose = {
    hip: [84, 122],
    torso: 178,
    legs: [
      { upper: 62, lower: -46, far: true },
      { upper: -26, lower: 30, accent: true },
    ],
    arms: [
      { upper: 8, lower: 12, far: true },
      { upper: -8, lower: -12 },
    ],
  };
  const rearTop = foot(top, 0);
  const rearBottom = foot(bottom, 0);
  return (
    <ExerciseSvg uid="split-squat" title="Rear-foot-elevated split squat: rear foot on a bench, lower straight down over three seconds keeping the front heel flat, then drive up fast.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Platform x={rearTop[0] - 20} y={rearTop[1] + 5} w={32} h={9} />
        <Figure pose={top} />
      </Panel>
      <Panel index={1}>
        <Platform x={rearBottom[0] - 20} y={rearBottom[1] + 5} w={32} h={9} />
        <Figure pose={bottom} />
        <MotionArc from={[118, 92]} to={[118, 126]} bow={12} uid="split-squat" />
      </Panel>
    </ExerciseSvg>
  );
}
