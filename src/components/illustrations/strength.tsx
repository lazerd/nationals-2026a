import {
  ExerciseSvg,
  Figure,
  GroundLine,
  Panel,
  MotionArc,
  MotionLine,
  Platform,
  Band,
  hand,
  planted,
  aim,
  GROUND_Y,
  type Pose,
} from './Figure';

/* Strength-family illustrations. */

export function EccentricHeelRaise() {
  const stepY = 132;
  const up: Pose = {
    hip: [80, 74],
    torso: 180,
    legs: [
      { upper: 3, lower: 3, far: true, accent: true },
      { upper: -3, lower: -3, accent: true },
    ],
    arms: [
      { upper: -64, lower: -84, far: true },
      { upper: -60, lower: -80 },
    ],
  };
  const down: Pose = {
    hip: [80, 88],
    torso: 180,
    legs: [
      { upper: 30, lower: 34, far: true },
      { upper: -2, lower: -2, accent: true },
    ],
    arms: [
      { upper: -64, lower: -84, far: true },
      { upper: -60, lower: -80 },
    ],
  };
  return (
    <ExerciseSvg uid="heel-raise" title="Eccentric heel raise: rise onto the toes of both feet on a step, shift onto one foot, then lower that heel below the step over three slow seconds.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Platform x={54} y={stepY} w={52} h={11} />
        <Figure pose={up} />
        <MotionLine from={[126, 108]} to={[126, 88]} uid="heel-raise" />
      </Panel>
      <Panel index={1}>
        <Platform x={54} y={stepY} w={52} h={11} />
        <Figure pose={down} />
        <MotionLine from={[126, 92]} to={[126, 118]} uid="heel-raise" />
        <text x={16} y={112} fill="var(--illo-accent)" fontSize={14} fontWeight={700}>
          3s
        </text>
      </Panel>
    </ExerciseSvg>
  );
}

export function SingleLegRDL() {
  const tall: Pose = planted({
    hip: [80, 100],
    torso: 180,
    legs: [
      { upper: 22, lower: 40, far: true },
      { upper: -2, lower: -2, accent: true },
    ],
    arms: [
      { upper: 8, lower: 12, far: true },
      { upper: -8, lower: -12 },
    ],
  });
  // Back leg and spine make one line: torso and far thigh are the same angle.
  const hinge: Pose = {
    hip: [70, 100],
    torso: 252,
    legs: [
      { upper: 72, lower: 72, far: true },
      { upper: -4, lower: -6, accent: true },
    ],
    arms: [
      { upper: -6, lower: -4, far: true },
      { upper: 2, lower: 4 },
    ],
  };
  return (
    <ExerciseSvg uid="sl-rdl" title="Single-leg RDL: hinge at the hip so the back leg and the spine make one straight line, reaching toward the floor with a flat back, then drive the standing hip forward to stand up.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={planted(tall)} />
      </Panel>
      <Panel index={1}>
        <Figure pose={hinge} />
        <MotionArc from={[104, 70]} to={[128, 118]} bow={-16} uid="sl-rdl" />
      </Panel>
    </ExerciseSvg>
  );
}

export function PallofPress() {
  const chest: Pose = planted({
    hip: [92, 104],
    torso: 180,
    legs: [
      { upper: 14, lower: 10, far: true },
      { upper: -14, lower: -10 },
    ],
    arms: [
      { upper: -80, lower: -150, far: true },
      { upper: -76, lower: -146 },
    ],
  });
  const pressed: Pose = planted({
    hip: [92, 104],
    torso: 180,
    legs: [
      { upper: 14, lower: 10, far: true },
      { upper: -14, lower: -10 },
    ],
    arms: [
      { upper: -92, lower: -92, far: true, accent: true },
      { upper: -88, lower: -88, accent: true },
    ],
  });
  const h1 = hand(chest, 1);
  const h2 = hand(pressed, 1);
  return (
    <ExerciseSvg uid="pallof" title="Pallof press: standing side-on to an anchored band held at the sternum, press the hands straight out and refuse to let the band rotate you.">
      <GroundLine panel={0} />
      <GroundLine panel={1} />
      <Panel index={0}>
        <Figure pose={chest} />
        <Band from={[h1[0], h1[1]]} to={[146, 74]} amp={3.5} zigs={6} />
      </Panel>
      <Panel index={1}>
        <Figure pose={pressed} />
        <Band from={[h2[0], h2[1]]} to={[146, 74]} amp={3.5} zigs={6} accent />
        <MotionLine from={[64, 96]} to={[36, 96]} uid="pallof" />
      </Panel>
    </ExerciseSvg>
  );
}

export function PushUp() {
  // Side view, head to the right. The body is one rigid line from head to
  // heels; the arms drop vertically to the floor and only the elbows change.
  const top: Pose = {
    hip: [70, 120],
    torso: 262,
    torsoLen: 40,
    legs: [
      { upper: 62, lower: 62, far: true, upperLen: 29, lowerLen: 29 },
      { upper: 58, lower: 58, upperLen: 29, lowerLen: 29 },
    ],
    arms: [
      { upper: 4, lower: 2, far: true, upperLen: 22, lowerLen: 22 },
      { upper: -2, lower: -2, upperLen: 22, lowerLen: 22 },
    ],
  };
  const bottom: Pose = {
    hip: [70, 138],
    torso: 262,
    torsoLen: 40,
    legs: [
      { upper: 72, lower: 72, far: true, upperLen: 29, lowerLen: 29 },
      { upper: 68, lower: 68, upperLen: 29, lowerLen: 29 },
    ],
    arms: [
      { upper: 46, lower: -44, far: true, upperLen: 22, lowerLen: 22, accent: true },
      { upper: 42, lower: -48, upperLen: 22, lowerLen: 22, accent: true },
    ],
  };
  return (
    <ExerciseSvg uid="push-up" title="Push-up: body held in one rigid line from head to heels, lowering the chest toward the floor with the elbows at forty-five degrees rather than flared out to the sides.">
      <GroundLine panel={0} inset={6} />
      <GroundLine panel={1} inset={6} />
      <Panel index={0}>
        <Figure pose={top} />
      </Panel>
      <Panel index={1}>
        <Figure pose={bottom} />
        <MotionLine from={[112, 96]} to={[112, 120]} uid="push-up" />
      </Panel>
    </ExerciseSvg>
  );
}

export function CopenhagenPlank() {
  // Built from the three points that actually define the position: the
  // supporting elbow on the floor, the shoulder above it, and the top foot on
  // the chair. The only difference between panels is where the hip sits
  // relative to the line between the other two.
  const ELBOW: [number, number] = [40, 156];
  const SHOULDER: [number, number] = [48, 132];
  const FOOT: [number, number] = [144, 116];

  const build = (hip: [number, number], accent: boolean): Pose => {
    const t = aim(hip, SHOULDER);
    const l = aim(hip, FOOT);
    const u = aim(SHOULDER, ELBOW);
    return {
      hip,
      torso: t.angle,
      torsoLen: t.len,
      arms: [
        { upper: u.angle, lower: -90, far: true, upperLen: u.len, lowerLen: 20 },
        { upper: u.angle, lower: -90, upperLen: u.len, lowerLen: 20 },
      ],
      legs: [
        { upper: l.angle + 4, lower: l.angle + 4, far: true, upperLen: l.len / 2, lowerLen: l.len / 2 },
        { upper: l.angle, lower: l.angle, accent, upperLen: l.len / 2, lowerLen: l.len / 2 },
      ],
    };
  };

  // On the line between shoulder and foot: the hips are up where they belong.
  const lifted = build([96, 124], true);
  // Well below it: the hips have dropped and the adductor is off the hook.
  const sag = build([96, 146], false);

  return (
    <ExerciseSvg uid="copenhagen" title="Copenhagen plank: side-lying propped on a forearm with the top leg resting on a chair, pressing that leg down to lift the hips until the body is one straight line.">
      <GroundLine panel={0} inset={6} />
      <GroundLine panel={1} inset={6} />
      <Panel index={0}>
        <Platform x={FOOT[0] - 14} y={FOOT[1] + 6} w={30} h={GROUND_Y - FOOT[1] - 6} />
        <Figure pose={sag} />
      </Panel>
      <Panel index={1}>
        <Platform x={FOOT[0] - 14} y={FOOT[1] + 6} w={30} h={GROUND_Y - FOOT[1] - 6} />
        <Figure pose={lifted} />
        <MotionLine from={[96, 150]} to={[96, 128]} uid="copenhagen" />
      </Panel>
    </ExerciseSvg>
  );
}
