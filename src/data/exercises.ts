import type { Exercise } from './types';

/**
 * The exercise library. Every `exerciseId` referenced by `plan.ts` resolves
 * here. Content is written for a 42-year-old training alone in a garage with
 * nobody to tell him his low back is arching — `commonMistakes` and
 * `redFlags` carry that load.
 */
export const EXERCISES: Exercise[] = [
  // ---------------------------------------------------------------- warm-up
  {
    id: 'band-external-rotation',
    name: 'Band External Rotation',
    category: 'warmup',
    setup:
      'Stand side-on to a band anchored at elbow height, band in the outside hand, elbow pinned against your ribs at 90 degrees.',
    execution: [
      'Tuck a folded towel between your elbow and your ribs so the elbow cannot drift.',
      'Start with the forearm across your stomach, band under tension.',
      'Rotate the forearm outward, away from your body, keeping the elbow glued in place.',
      'Stop when the forearm is roughly in line with your body. Do not force further.',
      'Return slowly over three counts. That slow return is the working half.',
    ],
    cues: [
      'Elbow stays pinned to the ribs',
      'Rotate the forearm, not the shoulder',
      'Slow coming back',
    ],
    commonMistakes: [
      'Letting the elbow drift away from the ribs, which turns this into a shoulder abduction and stops loading the cuff.',
      'Using a band so heavy that the torso twists to help. If your body rotates, the band is too strong.',
      'Snapping back to the start. The eccentric is where the tendon adaptation lives.',
    ],
    whyItMatters:
      'The external rotators decelerate your arm after contact; when they cannot handle the speed you are generating, your shoulder quietly caps how hard you are willing to swing.',
    illustration: 'BandExternalRotation',
    equipment: ['Resistance band', 'Towel (optional)'],
    regressions:
      'Move closer to the anchor for less tension, or do it lying on your side with a 2-3 lb weight and no band at all.',
    redFlags:
      'Stop if you feel a sharp pinch at the front of the shoulder or a click deep in the joint. Ache in the back of the shoulder is normal; pinching in front is not.',
  },
  {
    id: 'band-pull-apart',
    name: 'Band Pull-Apart',
    category: 'warmup',
    setup:
      'Stand tall holding a light band in front of you at chest height, hands roughly shoulder-width, arms straight.',
    execution: [
      'Set your ribs down and your shoulder blades lightly back — do not shrug.',
      'Pull the band apart by driving the hands out and back, leading with the pinkies.',
      'Finish with the band touching your sternum and your shoulder blades together.',
      'Return under control. No collapsing forward at the end of the set.',
    ],
    cues: ['Ribs down', 'Lead with the pinkies', 'Squeeze, do not shrug'],
    commonMistakes: [
      'Shrugging the shoulders up toward the ears, which trains the upper traps you already overuse instead of the mid-back.',
      'Bending the elbows to cheat more range out of a heavy band.',
      'Arching the low back to get the arms further behind you.',
    ],
    whyItMatters:
      'A mid-back that can hold the shoulder blades in position is what lets the serving shoulder rotate from a stable base instead of a sliding one.',
    illustration: 'BandPullApart',
    equipment: ['Resistance band'],
    regressions: 'Widen your grip on the band for less tension.',
    redFlags: 'Stop if you feel nerve-like tingling down either arm.',
  },
  {
    id: 'thoracic-open-book',
    name: 'Thoracic Open-Book',
    category: 'warmup',
    setup:
      'Lie on your side, knees stacked and bent to 90 degrees, arms straight out in front of you with palms together.',
    execution: [
      'Press the top knee down into the bottom knee so the pelvis cannot roll.',
      'Slide the top hand along the bottom hand, then open it in a wide arc toward the floor behind you.',
      'Follow your hand with your eyes and let your head turn with it.',
      'Reach the end range, breathe out, and let the chest settle for one second.',
      'Return along the same arc. Ten slow reps a side.',
    ],
    cues: ['Knees stay stacked and pinned', 'Eyes follow the hand', 'Exhale at the end'],
    commonMistakes: [
      'Letting the top knee lift off, which turns a mid-back rotation into a lumbar twist and gives you the range for free.',
      'Rushing. This is the one warm-up item where slow actually changes something.',
      'Holding the breath at end range instead of exhaling into it.',
    ],
    whyItMatters:
      'Your serve speed is capped by how far your mid-back can turn — if the thoracic spine will not rotate, the low back and shoulder do the job instead, badly.',
    illustration: 'ThoracicOpenBook',
    equipment: [],
    regressions: 'Put a pillow or foam roller between the knees to make the pinned position easier to hold.',
    redFlags: 'Stop if you get low-back pain rather than a stretch across the chest and mid-back.',
  },
  {
    id: 'racket-wrist-snap',
    name: 'Racket Wrist Snaps',
    category: 'warmup',
    setup:
      'Stand holding your racket with a continental grip, arm up in a finished trophy position, elbow high.',
    execution: [
      'Keep the arm still and let the racket head drop behind you.',
      'Snap only the last six inches of the serve — forearm pronates, wrist releases forward.',
      'Let the racket decelerate naturally. Do not muscle it back.',
      'Twenty easy reps. This is a nerve wake-up, not a workout.',
    ],
    cues: ['Only the last six inches', 'Loose grip', 'Easy — this is priming, not training'],
    commonMistakes: [
      'Swinging the whole arm instead of isolating the snap, which defeats the point of doing it.',
      'Gripping tight. A tight grip is the single biggest brake on racket-head speed.',
    ],
    whyItMatters:
      'Racket-head speed is decided in the last 40 milliseconds of the swing, and this wakes up exactly that segment before you ask it to work.',
    illustration: 'RacketWristSnap',
    equipment: ['Racket'],
    regressions: 'Shorten the lever by choking up on the handle.',
    redFlags: 'Stop if the outside of the elbow starts to bite — that is a tennis-elbow warning.',
  },
  {
    id: 'ankle-rocker',
    name: 'Ankle Rocker',
    category: 'warmup',
    setup:
      'Stand facing a wall in a short lunge, front toe about four inches from the wall, hands on the wall.',
    execution: [
      'Keep the front heel flat on the floor for every rep. This is non-negotiable.',
      'Drive the front knee forward over the toes toward the wall.',
      'Touch the wall with the knee if you can, hold for one second, return.',
      'If the heel lifts, slide the foot closer to the wall and work from there.',
    ],
    cues: ['Heel stays down', 'Knee tracks over the second toe', 'Slide closer if the heel lifts'],
    commonMistakes: [
      'Letting the heel pop up, which lets you fake range you do not have.',
      'Letting the knee collapse inward toward the big toe instead of tracking over the middle of the foot.',
    ],
    whyItMatters:
      'Ankle range is what lets you load into a split step and redirect — a stiff ankle makes you take an extra step to change direction, and an extra step is the poach you did not reach.',
    illustration: 'AnkleRocker',
    equipment: [],
    regressions: 'Start with the foot farther from the wall and work closer over the weeks.',
    redFlags: 'Stop if you feel a sharp pinch at the front of the ankle joint rather than a calf stretch.',
  },
  {
    id: 'worlds-greatest-stretch',
    name: "World's Greatest Stretch",
    category: 'warmup',
    setup: 'Start in a push-up position on the floor with hands under your shoulders.',
    execution: [
      'Step the right foot outside the right hand into a deep lunge.',
      'Drop the right elbow toward the instep and hold for one breath.',
      'Bring the right hand back to the floor, then rotate the right arm up to the ceiling, following it with your eyes.',
      'Return the hand, straighten the front leg to feel the hamstring, then step back. Alternate sides.',
    ],
    cues: ['Back knee off the floor', 'Reach tall through the top hand', 'One full breath at each position'],
    commonMistakes: [
      'Letting the back knee rest on the floor, which removes the hip-flexor stretch that is half the point.',
      'Rotating from the low back instead of the mid-back — keep the hips square and let the chest turn.',
      'Racing through it. Each position needs a breath.',
    ],
    whyItMatters:
      'It opens the hip flexor and the mid-back in one movement, and those two together are the range your leg drive and shoulder turn are borrowing from.',
    illustration: 'WorldsGreatestStretch',
    equipment: [],
    regressions: 'Do it with the back knee down if the hip is tight first thing in the morning.',
    redFlags: 'Stop if the front hip pinches deep in the crease rather than stretching.',
  },
  {
    id: 'jump-rope',
    name: 'Jump Rope',
    category: 'warmup',
    setup: 'Rope handles at hip height, elbows close to your sides, weight on the balls of your feet.',
    execution: [
      'Turn the rope with the wrists, not the arms — the elbows barely move.',
      'Bounce an inch off the floor, no more. Knees stay soft but nearly straight.',
      'Land on the balls of the feet and go straight back up. Minimum ground contact.',
      'Breathe through the nose. If you cannot, slow down.',
    ],
    cues: ['Wrists turn the rope', 'Barely leave the floor', 'Quiet feet'],
    commonMistakes: [
      'Jumping too high, which turns a stiffness drill into a conditioning drill and makes your calves the limiting factor.',
      'Turning the rope with the whole arm, which is slower and tires the shoulders before you serve.',
      'Landing flat-footed and loud. Loud is slow.',
    ],
    whyItMatters:
      'It is the cheapest way to build the ankle stiffness that turns a split step into a first step instead of a landing.',
    illustration: 'JumpRope',
    equipment: ['Jump rope'],
    regressions: 'No rope? Do the same footwork miming the turn. The feet are the point.',
    redFlags: 'Stop if the Achilles or the front of the shin gets sharp rather than warm.',
  },
  {
    id: 'pogo-hop',
    name: 'Pogo Hops',
    category: 'movement',
    setup: 'Stand tall, feet hip-width, arms relaxed at your sides or lightly bent.',
    execution: [
      'Hop straight up using only the ankles. Knees stay nearly locked.',
      'Think of your legs as pogo sticks — you are bouncing off the floor, not pushing off it.',
      'Land on the balls of the feet and leave again immediately.',
      'Aim for the shortest possible time on the ground, not the highest jump.',
    ],
    cues: ['Stiff ankles', 'Minimal knee bend', 'Off the floor fast'],
    commonMistakes: [
      'Bending the knees to jump higher, which is a different exercise and trains none of the elastic stiffness you came for.',
      'Sinking into the heels on landing, which bleeds off every bit of stored energy.',
      'Chasing height when the whole metric is ground-contact time.',
    ],
    whyItMatters:
      'Court speed at 42 is an ankle stiffness problem, not a strength problem — this is the drill that makes your split step launch you rather than absorb you.',
    illustration: 'PogoHop',
    equipment: [],
    regressions: 'Do them on one spot with a hand on a wall for balance, or drop to 10 reps a set.',
    redFlags: 'Stop if the Achilles feels sharp or if you feel it in the heel bone. Calf burn is fine.',
  },
  {
    id: 'leg-swing',
    name: 'Leg Swings',
    category: 'warmup',
    setup: 'Stand next to a wall or post with one hand on it for balance.',
    execution: [
      'Swing the outside leg forward and back, relaxed, letting the range build over the reps.',
      'Keep the torso quiet — this is the hip moving, not the spine.',
      'Then turn to face the wall and swing the leg side to side across your body.',
      'Ten each direction, each leg. Never force the end range.',
    ],
    cues: ['Torso stays still', 'Let range build, do not yank it', 'Relaxed leg'],
    commonMistakes: [
      'Arching the low back to get more forward range, which trains the wrong joint.',
      'Starting at full range on rep one instead of building into it.',
    ],
    whyItMatters:
      'It gets the hip moving through the range your first step and your lunging volley will demand two minutes later.',
    illustration: 'LegSwing',
    equipment: [],
    regressions: 'Smaller arcs. Range is not the goal — moving is.',
    redFlags: 'Stop if you feel a pull deep in the groin rather than a general looseness.',
  },
  {
    id: 'a-skip',
    name: 'A-Skips',
    category: 'warmup',
    setup: 'Stand tall with good posture, arms bent at 90 degrees.',
    execution: [
      'Skip forward driving one knee up to hip height while the opposite arm swings.',
      'The support foot stays on the ball of the foot and pops off the ground.',
      'Strike the ground under your hip, not out in front of you.',
      'Stay tall the entire time. No leaning back.',
    ],
    cues: ['Tall posture', 'Knee to hip height', 'Strike under the hip'],
    commonMistakes: [
      'Leaning back to get the knee higher, which is how you teach yourself to overstride.',
      'Reaching the foot out in front, which is a brake on every stride.',
      'Letting the arms cross the body instead of driving front to back.',
    ],
    whyItMatters:
      'It rehearses striking the ground underneath you, which is the difference between accelerating out of a split step and shuffling out of it.',
    illustration: 'ASkip',
    equipment: [],
    regressions: 'March it in place before you skip it.',
    redFlags: 'Stop if a hamstring feels tight or grabby — swap in an easy walk that day.',
  },
  {
    id: 'hip-opener',
    name: 'Hip Openers',
    category: 'warmup',
    setup: 'Stand tall with a hand on a wall for balance.',
    execution: [
      'Lift one knee to hip height in front of you.',
      'Open the knee out to the side in a wide arc, keeping the pelvis level.',
      'Set the foot down, then reverse the arc on the next rep — out to in.',
      'Five each direction, each leg. Slow and controlled.',
    ],
    cues: ['Pelvis stays level', 'Big slow arc', 'Both directions'],
    commonMistakes: [
      'Hiking the hip or leaning the torso away to fake range at the hip joint.',
      'Rushing so the arc becomes a swing with no control at the outside position.',
    ],
    whyItMatters:
      'The drop-step and the wide lunging volley both need the hip to open under load, and this is where you find out this morning whether it will.',
    illustration: 'HipOpener',
    equipment: [],
    regressions: 'Hold the wall with both hands and lower the knee height.',
    redFlags: 'Stop if you feel pinching in the front of the hip crease at the top of the arc.',
  },

  // ------------------------------------------------------------------ serve
  {
    id: 'rotational-wall-throw',
    name: 'Rotational Wall Throw (Side Toss)',
    category: 'serve',
    setup:
      'Stand side-on to a solid wall, about an arm and a half away, feet just wider than shoulders, medicine ball held at your back hip.',
    execution: [
      'Load into the back hip — weight shifts onto the back leg, back knee bends, chest stays turned away from the wall.',
      'Fire the back hip toward the wall first. The chest has not moved yet.',
      'Let the chest follow the hip, then the arms follow the chest. Arms are last, always.',
      'Release hard enough that catching the rebound is annoying.',
      'Reset completely between reps. Walk back to the start. This is a power drill, not a circuit.',
    ],
    cues: [
      'Back hip fires first',
      'Arms are passengers',
      'Throw it like you are angry at the wall',
    ],
    commonMistakes: [
      'Opening the chest at the same time as the hip. This is the single most common 40s fault and it is the same one that costs you 8-10 mph on the serve — if your chest and hip turn together, you have no separation and nothing to whip.',
      'Throwing with the arms and leaving the legs out of it entirely. If your back heel does not come off the floor, your legs are not in the throw.',
      'Rushing the next rep while still breathing from the last one. Every rep is a maximum rep or it is a wasted rep.',
    ],
    whyItMatters:
      'This is your number one serve exercise: it trains the hip-before-shoulder lag that separates a 95 mph serve from an 85 mph one, and it trains it better than anything you can do in a gym.',
    illustration: 'RotationalWallThrow',
    equipment: ['Medicine ball 4-6 lb', 'Wall'],
    regressions:
      'Start from a taller stance with less hip load and throw at 70% until the sequencing feels automatic. If a wall is not available, throw into a fence panel or throw for distance across a lawn.',
    redFlags:
      'Stop if you feel a pull in the side of the trunk or a catch in the low back on the follow-through. Never do this on a shoulder that is already sore.',
  },
  {
    id: 'step-behind-rotational-throw',
    name: 'Step-Behind Rotational Throw',
    category: 'serve',
    setup:
      'Same side-on setup as the side toss, but stand two extra steps away from the wall with the ball at your back hip.',
    execution: [
      'Take a shuffle step toward the wall — the back foot steps behind the front foot.',
      'Land into the back hip with the chest still closed. You are arriving loaded.',
      'Fire the same sequence: hip, chest, arms.',
      'Throw through the ball and let the momentum carry you a step toward the wall.',
      'Full reset and walk back for the next rep.',
    ],
    cues: ['Arrive already loaded', 'Chest stays closed on the landing', 'Let the momentum finish you'],
    commonMistakes: [
      'Letting the chest open during the shuffle step, which spends your separation before you ever start the throw.',
      'Stepping so far that you land off balance and have to stabilise before throwing — you lose all the momentum you just created.',
      'Treating the step as a run-up. It is one step, and it is quick.',
    ],
    whyItMatters:
      'The serve is not a standing throw — it has momentum moving into the court, and this is the version that trains transferring that momentum instead of throwing from a dead stop.',
    illustration: 'StepBehindRotationalThrow',
    equipment: ['Medicine ball 4-6 lb', 'Wall'],
    regressions: 'Drop the step and go back to the plain side toss for a week if the timing feels scrambled.',
    redFlags: 'Stop if the low back catches on the landing or the follow-through.',
  },
  {
    id: 'half-kneeling-slam',
    name: 'Overhead Slam, Half-Kneeling',
    category: 'serve',
    setup:
      'Half-kneeling on one knee, front foot flat, hips square forward, medicine ball held overhead with both hands.',
    execution: [
      'Set your ribs down before you start. Reach the ball up without letting the front of your ribcage flare.',
      'Slam the ball into the floor about a foot in front of your front knee.',
      'Drive the movement from the stomach — think of folding at the mid-section, not throwing with the arms.',
      'Let the arms finish past the knee. Retrieve the ball and reset your ribs before the next rep.',
    ],
    cues: ['Ribs down before you reach', 'Fold from the stomach', 'Slam it, do not place it'],
    commonMistakes: [
      'Arching the low back to get the ball further overhead. You are half-kneeling precisely so you cannot cheat with the hips — if your low back is arching, lower the reach and fix the rib position.',
      'Throwing with the arms and shoulders only, which trains nothing you need and cranks the cuff.',
      'Sitting back onto the rear heel, which unloads the whole front side.',
    ],
    whyItMatters:
      'The abdominal snap that finishes your serve — the part after the shoulder has already turned — is trained here and almost nowhere else.',
    illustration: 'HalfKneelingSlam',
    equipment: ['Medicine ball 4-6 lb', 'Non-bouncing ball surface'],
    regressions:
      'Use a lighter ball and a shorter reach. If the knee is uncomfortable, kneel on a folded towel.',
    redFlags:
      'Stop if you feel a pinch in the front of the shoulder at the top of the reach, or if the low back is doing the work instead of the stomach.',
  },
  {
    id: 'weighted-shadow-serve',
    name: 'Weighted Shadow Serve',
    category: 'serve',
    setup:
      'Stand in your exact serve stance holding a racket with a cover on it, or two rackets stacked, no ball.',
    execution: [
      'Move into the trophy position slowly — deliberately slower than you would ever serve.',
      'Pause and feel the shoulders stay closed while the hips have already begun to open. That gap is the whole drill.',
      'From there, accelerate through the swing at real speed.',
      'Decelerate under control. Reset your feet before the next rep.',
      'After the weighted reps, take a normal racket and repeat the pattern at full speed to wake it up.',
    ],
    cues: ['Slow into the trophy', 'Hips open, shoulders wait', 'Fast out of it'],
    commonMistakes: [
      'Swinging the weighted racket at full speed through the whole motion, which grooves a slower pattern and is how shoulders get hurt.',
      'Skipping the plain-racket reps at the end. Without them you have taught your nervous system to swing slow.',
      'Doing it with no feet — the legs are part of the pattern even in shadow.',
    ],
    whyItMatters:
      'It lets you feel the hip-before-shoulder separation at a speed slow enough to actually notice it, then immediately transfer that feel to a real racket.',
    illustration: 'WeightedShadowServe',
    equipment: ['Racket', 'Racket cover or second racket'],
    regressions: 'Use just the plain racket if the shoulder is not fresh. The pattern matters more than the load.',
    redFlags:
      'Stop if the shoulder aches during the weighted reps. Never add weight to a swing on a cranky cuff — swap the whole day for the mobility session.',
  },
  {
    id: 'live-serve',
    name: 'Live Serves',
    category: 'serve',
    setup: 'On court with a basket or a handful of balls, serving to a real target.',
    execution: [
      'Same routine every time: same ball bounces, same breath, same toss.',
      'Full first-serve intent on every rep. These are not rally serves.',
      'Take a full reset between serves. Quality only.',
      'Record what the day asks for — speed on a radar, or how many landed in.',
    ],
    cues: ['Same routine every ball', 'Full intent, then rest', 'Toss consistency first'],
    commonMistakes: [
      'Serving a fast basket to get through the reps. Speed work with short rest is conditioning, and conditioning makes you slower.',
      'Chasing pace with an inconsistent toss. If the toss varies, you decelerate mid-swing to make contact — fixing the toss often returns 4 mph that was always there.',
      'Not writing the numbers down, which makes the whole 12 weeks unmeasurable.',
    ],
    whyItMatters:
      'Everything else in this program is a proxy; this is the actual skill, and it is where the transfer either shows up or does not.',
    illustration: 'LiveServe',
    equipment: ['Racket', 'Balls', 'Court', 'Radar or phone app (optional)'],
    regressions: 'Half the reps at 80% to groove the toss, then the rest at full pace.',
    redFlags: 'Stop the session if the shoulder or the elbow starts to ache. There is no serve worth an October tendon flare.',
  },
  {
    id: 'serve-stance-jump',
    name: 'Serve-Stance Jump',
    category: 'serve',
    setup: 'Set up in your exact serve stance — same foot positions you use to serve, no racket.',
    execution: [
      'Load down into the legs the way you load for a serve. Do not turn it into a squat.',
      'Jump up and forward-left if you are a right-hander — the direction you actually leave the ground on serve.',
      'Land soft, absorbing through the ankles and hips.',
      'Reset your feet completely before the next rep. This is not for height.',
    ],
    cues: ['Your serve stance, exactly', 'Up and into the court', 'Land soft, reset fully'],
    commonMistakes: [
      'Jumping straight up. The direction is the entire point — straight up trains a vertical jump, not a serve.',
      'Turning it into a deep squat jump, which is a slower movement than the one you make on a serve.',
      'Grinding out reps back to back. Full reset or it stops being a power drill.',
    ],
    whyItMatters:
      'It trains the leg drive in the exact direction and from the exact stance you use to serve, which is the only version that transfers.',
    illustration: 'ServeStanceJump',
    equipment: [],
    regressions: 'Jump to a lower height with the same direction. Direction beats height every time.',
    redFlags: 'Stop if the knees or the Achilles are sore on landing. Land quiet or stop for the day.',
  },
  {
    id: 'scoop-toss',
    name: 'Scoop Toss',
    category: 'serve',
    setup:
      'Stand with the medicine ball on the floor between your feet, feet a little wider than shoulders, in an open outdoor space.',
    execution: [
      'Squat down and grip the ball low, arms straight, chest up.',
      'Explode up through the legs and throw the ball up and behind you as high as you can.',
      'Go through full triple extension — ankles, knees, hips all straight at the finish.',
      'Do not turn around to watch it. Make sure nothing is behind you first.',
      'Retrieve, reset, and go again with full rest.',
    ],
    cues: ['Chest up in the bottom', 'Everything straightens at once', 'Throw it over your head, not out in front'],
    commonMistakes: [
      'Rounding the back to reach the ball, which puts a heavy load on the low back in the worst position for it.',
      'Throwing forward instead of up and back, which is a different movement entirely and cuts the hip extension out.',
      'Stopping short of full extension — if your hips are not straight at the finish, you did not train leg drive.',
    ],
    whyItMatters:
      'It is leg drive in one movement — the whole ground-up chain your serve depends on, expressed at maximum speed.',
    illustration: 'ScoopToss',
    equipment: ['Medicine ball 4-6 lb', 'Open space'],
    regressions: 'Use a lighter ball and throw for less height until the pattern is clean.',
    redFlags: 'Stop immediately if the low back rounds or aches. Make sure the space behind you is clear before every rep.',
  },
  {
    id: 'pronation-snap',
    name: 'Pronation Snaps',
    category: 'serve',
    setup:
      'Elbow bent to 90 degrees with the upper arm supported on your other hand or resting on a table, holding a light band or a 2-3 lb weight.',
    execution: [
      'Start with the palm facing up.',
      'Rotate the forearm fast to palm-down. Fast is the point — this is a speed drill.',
      'Control the rotation slowly back to palm-up over three counts.',
      'The upper arm never moves. Only the forearm rotates.',
    ],
    cues: ['Fast one way, slow the other', 'Upper arm stays parked', 'Light load, high speed'],
    commonMistakes: [
      'Using a weight heavy enough that the fast half becomes slow, which turns a speed drill into a strength drill and trains the wrong thing.',
      'Letting the whole arm rotate at the shoulder instead of isolating the forearm.',
      'Skipping the slow return, which is where the tissue tolerance is actually built.',
    ],
    whyItMatters:
      'Racket-head speed lives in the last 40 milliseconds of the swing, and forearm pronation is the segment that produces it.',
    illustration: 'PronationSnap',
    equipment: ['Light band or 2-3 lb weight'],
    regressions: 'Do it with no load at all, just fast rotation, if the elbow is sensitive.',
    redFlags: 'Stop if the outside of the elbow starts to ache. That is a tennis-elbow signal and it does not get better by pushing through.',
  },
  {
    id: 'serve-first-volley',
    name: 'Serve + First Volley',
    category: 'serve',
    setup: 'On court, serving with the intention of coming in behind it.',
    execution: [
      'Serve at full first-serve intent.',
      'Take two hard steps in as the ball crosses the net.',
      'Split step as your opponent — or your imagined opponent — makes contact.',
      'Play the first volley from wherever the split step leaves you. Do not try to get further in than you actually can.',
    ],
    cues: ['Two hard steps, then split', 'Split as they contact, not before', 'Volley from where you land'],
    commonMistakes: [
      'Splitting too early, which means you are standing still while the ball is being struck and gives away the reaction advantage the split step exists to create.',
      'Slowing the serve down to make the move in easier. The serve stays full pace.',
      'Trying to reach the service line every time instead of splitting where you actually are.',
    ],
    whyItMatters:
      'It ties the serve to the movement that follows it, which is the sequence that actually wins doubles points rather than just the serve on its own.',
    illustration: 'ServeFirstVolley',
    equipment: ['Racket', 'Balls', 'Court'],
    regressions: 'Shadow it without a ball, working just the serve-to-split rhythm.',
    redFlags: 'Skip it if the legs are heavy — a sloppy split step under fatigue is how ankles roll.',
  },

  // --------------------------------------------------------------- movement
  {
    id: 'split-step-lateral-pushoff',
    name: 'Split-Step → Lateral Push-Off',
    category: 'movement',
    setup: 'Stand in a ready position with a few metres of clear space either side of you.',
    execution: [
      'Small split step — hop just off the floor and land with the feet a little wider than shoulders.',
      'Land already loaded, weight on the balls of the feet, hips low. You are landing into a spring, not onto a floor.',
      'Immediately drive off the outside foot and take three hard strides to that side.',
      'Decelerate, walk back, and alternate the direction each rep.',
    ],
    cues: ['Land already loaded', 'Push the ground away sideways', 'Three hard strides, not a jog'],
    commonMistakes: [
      'Landing, pausing, then deciding. The whole drill is about eliminating that pause — you should be moving out of the landing, not after it.',
      'Split-stepping too high, which puts you in the air longer and makes you late.',
      'Pushing off the inside foot, which crosses you up and costs a step.',
    ],
    whyItMatters:
      'This is the poach — the ability to leave the split step sideways at full speed is what turns a ball you watched into a ball you put away.',
    illustration: 'SplitStepLateralPushOff',
    equipment: [],
    regressions: 'Take two strides instead of three, or do the split step and the push-off as separate movements until the timing joins up.',
    redFlags: 'Stop if you feel a grab in the groin or hamstring on the push-off.',
  },
  {
    id: 'skater-bound',
    name: 'Skater Bounds',
    category: 'movement',
    setup: 'Stand on one leg with space to bound sideways in both directions.',
    execution: [
      'Push off the standing leg and bound laterally, landing on the opposite leg.',
      'Stick the landing for one full second. Count it. Frozen, balanced, quiet.',
      'Only then push off in the other direction.',
      'The stick is the exercise. The bound is just how you get there.',
    ],
    cues: ['Stick it for one full second', 'Land quiet', 'Knee tracks over the toes'],
    commonMistakes: [
      'Bouncing straight into the next bound. Without the stick you are training a rhythm, not deceleration, and deceleration is what you actually lack.',
      'Letting the landing knee collapse inward — that is the position knees get hurt in and it means the hip is not controlling the landing.',
      'Bounding for distance and landing out of control. Shorter and stuck beats longer and wobbly every time.',
    ],
    whyItMatters:
      'Every lunging volley ends with you absorbing force on one leg, and this is the drill that teaches the leg to catch you instead of buckle.',
    illustration: 'SkaterBound',
    equipment: [],
    regressions: 'Bound a shorter distance, or touch the free foot down lightly to help balance while you build up to a clean stick.',
    redFlags: 'Stop if the knee wobbles inward on landing and you cannot correct it, or if the ankle rolls at all.',
  },
  {
    id: 'crossover-step-start',
    name: 'Crossover Step Start',
    category: 'movement',
    setup: 'Ready position, facing forward, with clear space to accelerate to one side.',
    execution: [
      'From ready, turn the near hip and step the far foot across your body.',
      'The first step goes across, not out — that is what makes it faster than a shuffle.',
      'Accelerate for three strides, staying low for the first two.',
      'Decelerate, reset, alternate sides.',
    ],
    cues: ['Turn the hip, do not reach the foot', 'First step crosses the body', 'Stay low for two strides'],
    commonMistakes: [
      'Taking a false step backward before crossing over, which costs the tenth of a second the drill exists to save.',
      'Standing straight up on the first stride instead of staying low, which kills acceleration.',
      'Shuffling instead of crossing over. For anything more than one step away, a shuffle is the slower choice.',
    ],
    whyItMatters:
      'For any ball more than a step away — the poach, the wide return — the crossover beats the shuffle, and most 40s players default to the shuffle out of habit.',
    illustration: 'CrossoverStepStart',
    equipment: [],
    regressions: 'Walk through the crossover step slowly until the hip turn leads, then add speed.',
    redFlags: 'Stop if the hip pinches on the turn or the groin grabs.',
  },
  {
    id: 'wall-shuffle',
    name: 'Wall Shuffle',
    category: 'movement',
    setup:
      'Hands on a wall at shoulder height, body in a straight line leaning into it at roughly 45 degrees, weight on the balls of the feet.',
    execution: [
      'Drive one knee up to hip height while the other leg stays extended into the ground.',
      'Switch legs as fast as you can, keeping the body line straight.',
      'The foot strikes underneath the hip, never out in front.',
      'Go for the prescribed seconds at maximum turnover, then rest fully.',
    ],
    cues: ['Straight body line', 'Strike under the hip', 'Maximum turnover, not maximum range'],
    commonMistakes: [
      'Letting the hips sag toward the wall, which breaks the line and takes the glutes out of the drill.',
      'Reaching the foot forward instead of striking under the hip — that is a brake in a drill about acceleration.',
      'Going too long. Ten to twelve seconds is a set; beyond that it becomes a conditioning drill and the turnover drops.',
    ],
    whyItMatters:
      'It is pure leg turnover speed with none of the deceleration cost, which lets you train the top end of your stride rate in a garage.',
    illustration: 'WallShuffle',
    equipment: ['Wall'],
    regressions: 'Lean less steeply, or alternate legs at a controlled tempo before going to maximum speed.',
    redFlags: 'Stop if the hip flexor cramps or a hamstring feels tight.',
  },
  {
    id: 'mini-5-10-5',
    name: 'Mini 5-10-5',
    category: 'movement',
    setup:
      'Two markers five yards apart with a start line in the middle. Start in an athletic stance straddling the middle.',
    execution: [
      'Sprint to one marker and touch the ground at the line.',
      'Turn and sprint all the way to the far marker, touch.',
      'Sprint back through the middle. That is one rep.',
      'Rest a full minute between reps. A full minute, timed.',
    ],
    cues: ['Get low into the turn', 'Plant the outside foot', 'Full minute rest — actually time it'],
    commonMistakes: [
      'Staying tall into the turns, which forces you to take extra steps to change direction and is where the time goes.',
      'Cutting the rest short. This is a speed drill, and a tired rep teaches your body a slower pattern.',
      'Rounding the turn instead of planting and redirecting.',
    ],
    whyItMatters:
      'It is brutal, brief, and exactly the shape of a doubles point — and a tenth of a second here is the difference between reaching a poach and watching it.',
    illustration: 'Mini5105',
    equipment: ['Two markers', 'Five yards of space', 'Timer'],
    regressions: 'Shorten to three yards each way, or run it at 80% while the turns are still sloppy.',
    redFlags:
      'Stop if a calf or hamstring feels tight on the plant. This is the highest-risk drill in the program for a 42-year-old — never do it cold.',
  },
  {
    id: 'drop-step-retreat',
    name: 'Drop-Step Retreat',
    category: 'movement',
    setup: 'Ready position at an imagined net, with space to retreat behind you.',
    execution: [
      'Drop-step: turn the hip and step the near foot back and out, opening your body to that side.',
      'Take three crossover strides retreating, staying side-on rather than backpedalling.',
      'Jump and shadow-swing an overhead at the end.',
      'Land, reset forward to the start, and do the other side.',
    ],
    cues: ['Turn and open, do not backpedal', 'Cross over, stay side-on', 'Get behind the ball, then swing'],
    commonMistakes: [
      'Backpedalling instead of turning and running. Backpedalling is slow and it is how people fall over going back for a lob.',
      'Watching the imagined ball over the wrong shoulder, which twists you up in the last stride.',
      'Not getting fully behind the ball before swinging, which is what turns an overhead into a defensive lob.',
    ],
    whyItMatters:
      'This is the shot that ends 40s doubles matches — the lob over your head — and being able to retreat fast enough to hit it as an offensive overhead changes what your opponents can do to you.',
    illustration: 'DropStepRetreat',
    equipment: ['Racket (optional)'],
    regressions: 'Do the drop-step and two strides without the jump until the footwork is smooth.',
    redFlags:
      'Stop if you feel unstable landing from the jump. If you have any history of Achilles trouble, keep the feet on the ground and shadow the swing.',
  },
  {
    id: 'deceleration-drop',
    name: 'Deceleration Drops',
    category: 'movement',
    setup: 'Clear space of about ten metres to accelerate into.',
    execution: [
      'Take four hard strides forward at real speed.',
      'Stop dead. Not a gradual slow-down — stop.',
      'Hold a low athletic position for two full seconds: hips back, knees bent, chest up, weight balanced.',
      'Walk back and reset. Every rep starts fresh.',
    ],
    cues: ['Four strides at real speed', 'Stop dead, do not coast', 'Hold low for two full seconds'],
    commonMistakes: [
      'Coasting to a stop over several steps, which trains nothing — the braking is the exercise.',
      'Stopping upright with straight legs, which puts the load on the knee joint instead of the muscles.',
      'Going at 70% so that stopping is easy. If stopping is easy, you did not accelerate.',
    ],
    whyItMatters:
      'Braking ability is what lets you attack a short ball without recovering late — if you cannot stop, you subconsciously do not go.',
    illustration: 'DecelerationDrop',
    equipment: [],
    regressions: 'Three strides at 80% and build the speed over the weeks.',
    redFlags: 'Stop if the knees ache on the braking step or a quad feels strained.',
  },
  {
    id: 'ball-drop-reaction',
    name: 'Ball Drop Reaction',
    category: 'movement',
    setup:
      'Stand a step in front of a wall holding a tennis ball at shoulder height, or with a partner holding it.',
    execution: [
      'Drop the ball from shoulder height and let it bounce once.',
      'React and catch it before the second bounce.',
      'Each rep, start a step further away. Keep going until you miss.',
      'Solo alternative: toss the ball at a wall and react to the rebound, varying the angle.',
    ],
    cues: ['React, do not anticipate', 'First step is everything', 'Move further back each rep'],
    commonMistakes: [
      'Leaning or pre-loading before the drop, which is anticipation, not reaction — start from a genuinely neutral ready position.',
      'Staying at the same distance all set, which stops challenging the first step once it gets easy.',
      'Watching your feet instead of the ball.',
    ],
    whyItMatters:
      'Doubles is a reaction game at the net, and this trains the gap between seeing the ball and moving — the only part of court speed that is not about your legs.',
    illustration: 'BallDropReaction',
    equipment: ['Tennis ball', 'Wall'],
    regressions: 'Start closer and allow two bounces.',
    redFlags: 'Stop if you are diving or lunging out of control to reach it — the point is a fast first step, not a save.',
  },

  // --------------------------------------------------------------- strength
  {
    id: 'split-squat',
    name: 'Rear-Foot-Elevated Split Squat',
    category: 'strength',
    setup:
      'Stand in a long stride with the rear foot resting on a chair or bench behind you, torso tall, front foot flat.',
    execution: [
      'Lower straight down over three slow seconds. The rear knee travels toward the floor.',
      'Go as deep as you can keep the front heel flat and the torso upright.',
      'Drive up fast through the front heel.',
      'Do all reps on one side, then switch. Hold a weight in one or both hands to load it.',
    ],
    cues: ['Three seconds down, fast up', 'Front heel stays flat', 'Torso tall, not folded forward'],
    commonMistakes: [
      'Taking too short a stride, which turns it into a knee-dominant squat and lights up the front of the knee.',
      'Rushing the lowering phase, which throws away the eccentric strength that is the whole reason this beats a normal squat.',
      'Letting the front knee drift inward. Track it over the second toe.',
    ],
    whyItMatters:
      'Your back leg on the serve is a spring that has to load and release, and this is the exercise that gives that spring something to release.',
    illustration: 'SplitSquat',
    equipment: ['Chair or bench', 'Weight (optional)'],
    regressions:
      'Do it as a plain split squat with both feet on the floor, or hold a doorframe for balance while you build the pattern.',
    redFlags:
      'Stop if the front of the knee hurts rather than the thigh and glute working. Rear-knee discomfort usually means the stride is too short.',
  },
  {
    id: 'split-squat-jump',
    name: 'Split Squat Jump',
    category: 'strength',
    setup: 'Stand in a split stance, both feet on the floor, front knee bent, torso tall.',
    execution: [
      'Dip briefly into the split position — this is a quick countermovement, not a slow squat.',
      'Jump straight up as high as you can, keeping the split stance in the air.',
      'Land in the same stance, absorbing softly through the front leg.',
      'Full reset between reps. Complete one side before switching.',
    ],
    cues: ['Quick dip, explosive up', 'Same stance in the air', 'Land quiet'],
    commonMistakes: [
      'Switching feet in the air, which is a different and much more demanding drill than the one prescribed here.',
      'Sinking into a deep slow squat before jumping, which removes the elastic element.',
      'Landing hard on a locked front leg.',
    ],
    whyItMatters:
      'It is the split-squat pattern expressed at speed, which is what the leg actually has to do in the two tenths of a second your serve gives it.',
    illustration: 'SplitSquatJump',
    equipment: [],
    regressions: 'Do a fast bodyweight split squat with no jump, driving hard out of the bottom.',
    redFlags: 'Stop if you land loudly or the front knee caves. Skip this entirely on a sore Achilles or patellar tendon.',
  },
  {
    id: 'eccentric-heel-raise',
    name: 'Eccentric Heel Raise',
    category: 'strength',
    setup:
      'Stand with the balls of both feet on a step or a book, heels hanging off, one hand on a wall for balance.',
    execution: [
      'Rise up onto the toes using both feet.',
      'Shift all your weight onto one foot at the top.',
      'Lower on that one foot over three slow seconds, letting the heel drop below the step.',
      'Step back onto two feet to rise again. Alternate legs.',
    ],
    cues: ['Up on two, down on one', 'Three seconds down, every rep', 'Full range at the bottom'],
    commonMistakes: [
      'Dropping fast, which skips the eccentric load that is the entire mechanism of the exercise.',
      'Cutting the range short at the bottom so the calf never lengthens under load.',
      'Leaning heavily on the wall so the arms take the weight.',
    ],
    whyItMatters:
      'This is the single best Achilles and calf-tear prevention there is, and at 42 with three months of plyometrics ahead of you it is non-negotiable.',
    illustration: 'EccentricHeelRaise',
    equipment: ['Step or thick book', 'Wall for balance'],
    regressions: 'Do it flat on the floor with no step, or lower on two feet while you build tolerance.',
    redFlags:
      'Mild calf soreness is expected and fine. Stop if you feel a sharp point of pain in the Achilles tendon itself, or any morning stiffness that takes more than a few minutes to walk off.',
  },
  {
    id: 'single-leg-rdl',
    name: 'Single-Leg RDL',
    category: 'strength',
    setup: 'Stand on one leg, knee softly bent, the other leg ready to travel straight back behind you.',
    execution: [
      'Hinge at the hip — push the hips backward and let the chest lower toward the floor.',
      'The back leg travels straight back, staying in line with your spine like a see-saw.',
      'Reach toward the floor with the opposite hand. Touch it if you can, without rounding.',
      'Drive the standing hip forward to stand up. Squeeze the glute at the top.',
    ],
    cues: ['Hinge, do not squat', 'Back leg and spine make one line', 'Hips stay square to the floor'],
    commonMistakes: [
      'Letting the back hip open toward the ceiling, which turns it into a rotation and lets the hamstring off the hook — keep the hips level like headlights pointing at the ground.',
      'Rounding the back to touch the floor. Range is not the goal; a flat back is.',
      'Bending the standing knee to reach lower, which turns a hinge into a squat.',
    ],
    whyItMatters:
      'It builds the hamstring and glute in the lengthened position where hamstrings actually tear, and it exposes the left-right imbalance the lateral bound test will measure.',
    illustration: 'SingleLegRDL',
    equipment: ['Weight (optional)'],
    regressions: 'Keep the back toe lightly on the floor for balance, or hold a wall with one hand.',
    redFlags: 'Stop if you feel a pull at the very top of the hamstring near the sit bone — that area is slow to heal.',
  },
  {
    id: 'pallof-press',
    name: 'Pallof Press',
    category: 'strength',
    setup:
      'Stand side-on to a band anchored at chest height, band held in both hands at your sternum, feet shoulder-width, a step away from the anchor so the band is under tension.',
    execution: [
      'Brace the stomach and set the ribs down.',
      'Press the hands straight out from the chest until the arms are extended.',
      'The band will try to rotate you toward the anchor. Do not let it. Hold there for the prescribed time.',
      'Bring the hands back to the chest under control, then switch sides.',
    ],
    cues: ['Do not let the band turn you', 'Ribs down, glutes on', 'Breathe while you hold'],
    commonMistakes: [
      'Leaning away from the anchor to make it easier, which replaces core work with a side bend.',
      'Holding your breath for the whole set. You should be able to breathe normally throughout.',
      'Letting the hips rotate open — the resistance to rotation has to happen at the trunk, not the feet.',
    ],
    whyItMatters:
      'A trunk that can resist rotation is what lets you transmit rotation on the serve — power leaks out of a torso that gives way instead of transferring.',
    illustration: 'PallofPress',
    equipment: ['Resistance band', 'Anchor point'],
    regressions: 'Stand closer to the anchor for less tension, or do it half-kneeling to take the feet out of it.',
    redFlags: 'Stop if the low back arches and you cannot correct it, or if you feel it in the low back rather than the sides of the trunk.',
  },
  {
    id: 'push-up',
    name: 'Push-Up',
    category: 'strength',
    setup:
      'Hands slightly wider than shoulders, body in a straight line from head to heels. Feet elevated on a chair for the harder version.',
    execution: [
      'Set the ribs down and squeeze the glutes so the body is one rigid line.',
      'Lower over two to three seconds, elbows at roughly 45 degrees to the body, not flared to 90.',
      'Touch the chest close to the floor.',
      'Press back up without letting the hips sag or pike.',
    ],
    cues: ['One rigid line', 'Elbows at 45 degrees', 'Slow down, controlled up'],
    commonMistakes: [
      'Letting the hips sag, which loads the low back and takes the abs out entirely.',
      'Flaring the elbows straight out to the sides, which is the position that grinds the front of the shoulder.',
      'Cutting the range short at the bottom.',
    ],
    whyItMatters:
      'It keeps the front of the shoulder and the trunk strong enough to tolerate the throwing volume the rest of this program is asking for.',
    illustration: 'PushUp',
    equipment: ['Chair (optional)'],
    regressions: 'Hands on a bench or a kitchen counter. Keep the same rigid line, just at an easier angle.',
    redFlags: 'Stop if the front of the shoulder pinches at the bottom. Narrow the hands and reduce the depth.',
  },
  {
    id: 'copenhagen-plank',
    name: 'Copenhagen Plank',
    category: 'strength',
    setup:
      'Lie on your side propped on your forearm, with the top leg resting on a chair at about knee height.',
    execution: [
      'Press the top leg down into the chair and lift the hips until the body is a straight line.',
      'The bottom leg hangs free or lightly supports you, depending on the version.',
      'Hold for the prescribed time, breathing normally.',
      'Lower under control. Do not drop.',
    ],
    cues: ['Straight line, hips lifted', 'Press the top leg into the chair', 'Breathe'],
    commonMistakes: [
      'Letting the hips drop backward so the body is not in line, which removes almost all the adductor load.',
      'Going for the full long-lever version too early. The knee-supported version done well beats the hard version done badly.',
      'Holding the breath, which you will pay for on the second side.',
    ],
    whyItMatters:
      'It is groin insurance for the lunging volley, and the adductor is one of the most common mid-season tears in 40s doubles.',
    illustration: 'CopenhagenPlank',
    equipment: ['Chair'],
    regressions: 'Rest the top knee on the chair instead of the ankle. That halves the lever and is the correct starting point for most people.',
    redFlags: 'Stop at any sharp pull in the groin. This one is easy to overdo on week one.',
  },

  // --------------------------------------------------------------- mobility
  {
    id: 'cross-body-shoulder-stretch',
    name: 'Cross-Body Shoulder Stretch',
    category: 'mobility',
    setup: 'Stand or sit tall. Bring one arm straight across your chest at shoulder height.',
    execution: [
      'Use the other forearm to draw the arm across, hooking above the elbow, not below it.',
      'Keep the shoulder of the stretching arm down — do not let it ride up toward your ear.',
      'Hold and breathe. You should feel it in the back of the shoulder.',
      'Release slowly and switch sides.',
    ],
    cues: ['Pull above the elbow', 'Shoulder stays down', 'Feel it in the back, not the front'],
    commonMistakes: [
      'Pulling below the elbow, which levers the elbow joint instead of stretching the shoulder capsule.',
      'Letting the shoulder shrug up, which lets the joint escape the stretch entirely.',
      'Rotating the torso to get further, which removes the stretch you were after.',
    ],
    whyItMatters:
      'The back of the serving shoulder tightens over a throwing block, and that tightness quietly steals the range your follow-through needs.',
    illustration: 'CrossBodyShoulderStretch',
    equipment: [],
    regressions: 'Do less range. This should be a firm stretch, never a strain.',
    redFlags: 'Stop if you feel pinching at the front or the top of the shoulder rather than a stretch behind it.',
  },
  {
    id: 'sleeper-stretch',
    name: 'Sleeper Stretch',
    category: 'mobility',
    setup:
      'Lie on the side of your serving shoulder, that arm out in front at 90 degrees to your body, elbow bent to 90 degrees, forearm pointing at the ceiling.',
    execution: [
      'Roll slightly back so you are not resting directly on the point of the shoulder.',
      'Use the top hand to press the bottom forearm gently toward the floor in front of you.',
      'Go slowly. A little range goes a long way here.',
      'Hold, breathe, then release slowly.',
    ],
    cues: ['Roll back off the point of the shoulder', 'Gentle pressure only', 'Stop well before pain'],
    commonMistakes: [
      'Pressing hard and fast. This stretch is easy to overdo and an irritated cuff sets you back weeks.',
      'Lying directly on the tip of the shoulder, which pinches the joint and gives a false stretch.',
      'Letting the shoulder blade roll forward instead of stabilising it against the floor.',
    ],
    whyItMatters:
      'Internal rotation range in the back shoulder is the first thing to disappear in a throwing block, and losing it is what turns a healthy shoulder into a sore one.',
    illustration: 'SleeperStretch',
    equipment: [],
    regressions: 'Do the cross-body stretch instead — it targets similar tissue with much less risk.',
    redFlags:
      'Stop immediately at any pinch in the front of the shoulder. If the shoulder is already irritated, skip this one entirely.',
  },
  {
    id: 'wrist-flexor-stretch',
    name: 'Wrist Flexor Stretch',
    category: 'mobility',
    setup: 'Extend one arm straight in front of you, palm up, elbow straight.',
    execution: [
      'Use the other hand to draw the fingers back toward the floor.',
      'Keep the elbow completely straight — a bent elbow lets the stretch escape.',
      'Hold and breathe, then shake the forearm out loose for a few seconds.',
      'Switch sides.',
    ],
    cues: ['Elbow locked straight', 'Gentle, sustained pull', 'Shake it out after'],
    commonMistakes: [
      'Bending the elbow, which removes most of the stretch.',
      'Yanking the fingers back hard, which irritates the tendons you are trying to look after.',
    ],
    whyItMatters:
      'The forearm does the last 40 milliseconds of the serve, and keeping it long is a large part of not getting tennis elbow in week nine.',
    illustration: 'WristFlexorStretch',
    equipment: [],
    regressions: 'Do it with the elbow slightly bent if the stretch is too strong.',
    redFlags: 'Stop if you feel tingling in the fingers or a sharp pull at either side of the elbow.',
  },
  {
    id: 'calf-stretch',
    name: 'Calf Stretch',
    category: 'mobility',
    setup: 'Hands on a wall, one foot back in a long stride, both feet pointing straight ahead.',
    execution: [
      'Keep the back knee straight and press the back heel into the floor. Hold.',
      'Then bend the back knee slightly, keeping the heel down, to move the stretch lower into the Achilles.',
      'Hold each position for the prescribed time.',
      'Switch sides.',
    ],
    cues: ['Back heel stays down', 'Toes point straight ahead', 'Straight knee, then bent knee'],
    commonMistakes: [
      'Letting the back foot turn out, which lets the arch collapse and takes the stretch away from the calf.',
      'Only doing the straight-knee version and never the bent-knee one, which leaves the deeper calf muscle untouched.',
    ],
    whyItMatters:
      'A short calf limits ankle range, and ankle range is what your split step and your change of direction are built on.',
    illustration: 'CalfStretch',
    equipment: ['Wall'],
    regressions: 'Shorter stride.',
    redFlags: 'Stop at any sharp pain in the Achilles tendon rather than a stretch in the muscle belly.',
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Hip Flexor Stretch',
    category: 'mobility',
    setup: 'Half-kneeling on one knee with the front foot flat and the front knee over the ankle.',
    execution: [
      'Squeeze the glute of the kneeling leg first. This is what actually creates the stretch.',
      'Tuck the pelvis under — think of pointing your belt buckle at your chin.',
      'Only then shift your weight slightly forward. You should feel it in the front of the kneeling hip.',
      'Hold, breathe, switch sides.',
    ],
    cues: ['Squeeze the glute first', 'Tuck the pelvis', 'Do not lunge forward to find it'],
    commonMistakes: [
      'Lunging forward without tucking the pelvis, which arches the low back and gives you a low-back stretch instead of a hip-flexor one.',
      'Skipping the glute squeeze, which is what makes this work at all.',
    ],
    whyItMatters:
      'Hip flexor length is leg-drive range — a tight hip flexor puts a ceiling on how far you can extend into the serve.',
    illustration: 'HipFlexorStretch',
    equipment: [],
    regressions: 'Kneel on a folded towel and use a smaller weight shift.',
    redFlags: 'Stop if you feel it in the low back instead of the front of the hip.',
  },
  {
    id: 'thoracic-rotation-quadruped',
    name: 'Thoracic Rotation, Quadruped',
    category: 'mobility',
    setup: 'On hands and knees, one hand behind your head, elbow pointing out to the side.',
    execution: [
      'Sit your hips back slightly toward your heels to lock the low back out of the movement.',
      'Rotate the elbow down and under toward the opposite wrist.',
      'Then rotate open, driving the elbow up toward the ceiling and following it with your eyes.',
      'Ten slow reps, then switch sides.',
    ],
    cues: ['Hips back to lock the low back', 'Follow the elbow with your eyes', 'Move from the ribs'],
    commonMistakes: [
      'Rotating from the low back instead of the mid-back — sitting the hips back is what prevents this, so do not skip it.',
      'Letting the supporting elbow bend and the shoulder collapse.',
      'Going fast. Slow is what changes range here.',
    ],
    whyItMatters:
      'Your serve speed is capped by how much your mid-back can turn, and this is the most direct way to work on it.',
    illustration: 'ThoracicRotationQuadruped',
    equipment: [],
    regressions: 'Sit right back on your heels in a child’s pose position and rotate from there.',
    redFlags: 'Stop if the low back or the neck complains rather than the mid-back working.',
  },
  {
    id: 'hip-90-90-switch',
    name: '90/90 Hip Switch',
    category: 'mobility',
    setup:
      'Sit on the floor with one leg in front bent to 90 degrees and the other out to the side bent to 90 degrees, hands behind you for support.',
    execution: [
      'Sit as tall as you can. If you cannot, put your hands further behind you or sit on a cushion.',
      'Lift both knees and rotate them across to the other side, so the positions swap.',
      'Lower under control and sit tall again before the next switch.',
      'Fifteen slow switches. Keep the feet quiet.',
    ],
    cues: ['Sit tall throughout', 'Control the lower', 'Move from the hips, not the back'],
    commonMistakes: [
      'Rounding the low back and slumping, which trades hip rotation for spinal flexion.',
      'Throwing the knees across with momentum instead of controlling them.',
      'Pushing into a range the hip does not have and forcing the knee to absorb it.',
    ],
    whyItMatters:
      'Hip internal and external rotation is what your back hip needs on the serve and what your front hip needs on a wide volley.',
    illustration: 'Hip9090Switch',
    equipment: ['Cushion (optional)'],
    regressions: 'Sit on a cushion or a folded blanket to raise the hips, and use your hands on the floor for support.',
    redFlags: 'Stop at any pinch in the front of the hip or pain on the inside of the knee.',
  },
  {
    id: 'couch-stretch',
    name: 'Couch Stretch',
    category: 'mobility',
    setup:
      'Half-kneeling with the rear shin up against a couch or a wall, rear knee close to the base, front foot flat.',
    execution: [
      'Squeeze the glute of the rear leg to tuck the pelvis under. Do this before anything else.',
      'Bring the torso upright a little at a time, only as far as you can hold the tuck.',
      'Breathe. Sixty seconds a side. It is a long hold on purpose.',
      'Come out slowly and switch.',
    ],
    cues: ['Glute squeeze locks the pelvis', 'Upright only as far as the tuck holds', 'Long breaths'],
    commonMistakes: [
      'Sitting up tall while the low back arches, which gives an impressive-looking position and no hip-flexor stretch at all.',
      'Putting the rear knee too far from the wall, which makes it a quad stretch instead.',
      'Cutting the hold short. This tissue needs time.',
    ],
    whyItMatters:
      'Hip flexor length is directly the range your leg drive has to work in, and it is the first thing that shortens when you sit at a desk all day.',
    illustration: 'CouchStretch',
    equipment: ['Couch or wall', 'Cushion for the knee'],
    regressions: 'Put the rear foot on a low step instead of a wall, and use a cushion under the knee.',
    redFlags: 'Stop if the knee hurts on the floor or you feel it in the low back rather than the hip.',
  },
  {
    id: 'shoulder-car',
    name: 'Shoulder CARs',
    category: 'mobility',
    setup: 'Stand tall, arms at your sides, ribs down, standing as if being pulled up by the crown of your head.',
    execution: [
      'Raise one arm in front of you as slowly as you possibly can, thumb leading.',
      'Continue overhead, then rotate the palm outward as the arm travels behind you.',
      'Bring it down behind your back and rotate the palm to return to the start.',
      'One full circle should take fifteen to twenty seconds. Five each side.',
    ],
    cues: ['As slow as you can go', 'Ribs stay down', 'Body stays still — only the arm moves'],
    commonMistakes: [
      'Going fast, which turns a joint-control drill into an arm circle and trains nothing.',
      'Letting the ribs flare or the torso lean to get the arm further overhead — the range has to come from the shoulder.',
      'Skipping the behind-the-back portion, which is exactly the range that matters most for serving.',
    ],
    whyItMatters:
      'It is active range at the end of the shoulder’s reach, which is where your serve operates and where passive stretching never actually gets you.',
    illustration: 'ShoulderCAR',
    equipment: [],
    regressions: 'Do a smaller circle within pain-free range and grow it week by week.',
    redFlags: 'Stop at the point in the circle where you feel a pinch, and work up to that point rather than through it.',
  },
  {
    id: 'band-internal-rotation',
    name: 'Band Internal Rotation',
    category: 'mobility',
    setup:
      'Stand side-on to a band anchored at elbow height, band in the inside hand, elbow pinned to the ribs at 90 degrees.',
    execution: [
      'Start with the forearm rotated out away from your body under band tension.',
      'Rotate the forearm in across your stomach, elbow staying pinned.',
      'Return slowly over three counts against the band.',
      'Keep the torso completely still throughout.',
    ],
    cues: ['Elbow pinned to the ribs', 'Torso stays square', 'Slow on the way back'],
    commonMistakes: [
      'Twisting the torso to move the hand further, which is the body finding a way around the work.',
      'Using too heavy a band, which turns a control exercise into a wrestle.',
    ],
    whyItMatters:
      'Internal rotators accelerate the arm through the serve, and the cuff needs both directions trained, not just the external rotation everyone remembers.',
    illustration: 'BandInternalRotation',
    equipment: ['Resistance band'],
    regressions: 'Step closer to the anchor for less tension.',
    redFlags: 'Stop if the front of the shoulder pinches.',
  },
  {
    id: 'band-scaption',
    name: 'Band Scaption',
    category: 'mobility',
    setup: 'Stand on the middle of a band, holding an end in each hand, arms at your sides, thumbs up.',
    execution: [
      'Raise both arms up and out at roughly 30 degrees in front of the body — not straight ahead, not straight out to the side.',
      'Thumbs point up the whole way, like pouring from two jugs the wrong way.',
      'Stop at shoulder height. Do not shrug.',
      'Lower slowly over three counts.',
    ],
    cues: ['Thirty degrees in front of the body', 'Thumbs up', 'Stop at shoulder height, no shrug'],
    commonMistakes: [
      'Raising straight out to the side, which is the position that pinches the cuff for many people.',
      'Shrugging at the top, which hands the work to the upper traps.',
      'Going above shoulder height with a band, which is more range than this drill needs.',
    ],
    whyItMatters:
      'It strengthens the shoulder in the plane it actually works in, which is what keeps the blade positioned properly when you serve.',
    illustration: 'BandScaption',
    equipment: ['Resistance band'],
    regressions: 'Do it with no band at all, or one arm at a time.',
    redFlags: 'Stop if there is a painful arc partway up. Work below that point and get the shoulder looked at.',
  },
  {
    id: 'dead-hang',
    name: 'Dead Hang',
    category: 'mobility',
    setup: 'Hang from a pull-up bar with an overhand grip, hands roughly shoulder-width.',
    execution: [
      'Let the shoulders rise toward the ears for the first few seconds and simply hang.',
      'Then gently pull the shoulder blades down a fraction — an active hang, not a full pull-up.',
      'Keep the ribs down and the legs relaxed. Breathe.',
      'Step down under control rather than dropping.',
    ],
    cues: ['Relax first, then set the blades', 'Ribs down', 'Step down, do not drop'],
    commonMistakes: [
      'Dropping off the bar at the end, which is a lot of load on a cold shoulder for no benefit.',
      'Hanging with the ribs flared and the low back arched.',
      'Doing it at all if the shoulder is irritated — it belongs in the optional column.',
    ],
    whyItMatters:
      'It decompresses the shoulder and the mid-back after a week of throwing, and it is the cheapest overhead position you can get.',
    illustration: 'DeadHang',
    equipment: ['Pull-up bar'],
    regressions: 'Keep your feet on the floor and take some of your weight, or skip it — the plan marks it optional.',
    redFlags: 'Skip it entirely if the shoulder is sore. This is the most optional item in the program.',
  },
  {
    id: 'easy-aerobic',
    name: 'Easy Aerobic Flush',
    category: 'mobility',
    setup: 'Walk, easy bike, or easy swim. Outside is better than a machine.',
    execution: [
      'Nasal breathing only. If you have to open your mouth, slow down.',
      'You should be able to hold a full conversation the whole way.',
      'Keep it in the 12 to 15 minute range. This is a flush, not a workout.',
      'Do not turn it into intervals because you feel good.',
    ],
    cues: ['Nose breathing only', 'Conversational the whole way', 'Resist making it hard'],
    commonMistakes: [
      'Pushing the pace because it feels too easy. The easy day being genuinely easy is what makes the hard days hard.',
      'Skipping it because it does not feel like training. Blood flow on Sunday is what shows up on Monday.',
    ],
    whyItMatters:
      'At 42 adaptation happens between sessions, and gentle circulation on the easy day is a real part of that, not filler.',
    illustration: 'EasyAerobic',
    equipment: [],
    regressions: 'A ten minute walk counts.',
    redFlags: 'If you are breathing hard, you are going too hard. That is the only rule here.',
  },
  {
    id: 'foam-roll',
    name: 'Foam Roll / Ball Work',
    category: 'mobility',
    setup: 'A foam roller or a lacrosse ball, on the floor, with five minutes and no rush.',
    execution: [
      'Calves: roll slowly, pausing on the tender spots for twenty to thirty seconds.',
      'Quads: same, one leg at a time.',
      'Lats: lie on your side with the arm overhead and roll the outside of the ribcage.',
      'Upper back: roller across the mid-back, hands behind the head, breathe out as you extend over it.',
    ],
    cues: ['Pause on the spot, do not roll past it', 'Breathe out into the tender spots', 'Slower than feels natural'],
    commonMistakes: [
      'Rolling fast back and forth, which feels productive and does very little.',
      'Rolling directly on the low back, which is not a place a roller belongs.',
      'Grinding hard enough that you brace against it — if you are holding your breath, ease off.',
    ],
    whyItMatters:
      'It is the cheapest way to keep the calves and lats from tightening over 12 weeks of jumping and throwing.',
    illustration: 'FoamRoll',
    equipment: ['Foam roller or lacrosse ball'],
    regressions: 'Use a softer roller or take some of your weight with your hands.',
    redFlags: 'Never roll directly over a joint, the low back, or a bruise. Numbness or tingling means get off it.',
  },
  {
    id: 'visualization',
    name: 'Visualization',
    category: 'mobility',
    setup: 'Sit somewhere quiet, eyes closed, phone away.',
    execution: [
      'Play points in your head in real time. Not highlights — actual points, at actual speed.',
      'See your serve going where you aimed it. Feel the contact, do not just watch it.',
      'Include the poach you took and the return you read. Play your partner’s side too.',
      'If a point goes badly in your head, replay it going well. End on a good one.',
    ],
    cues: ['Real time, not fast forward', 'Feel it, do not just watch it', 'Finish on a point you won'],
    commonMistakes: [
      'Treating it as filler and skipping it. Imagery has real measured transfer to both skill and nerves.',
      'Only imagining winners. Rehearse the ordinary rally balls too, because that is what most points are made of.',
      'Watching yourself from the stands instead of seeing it through your own eyes.',
    ],
    whyItMatters:
      'It rehearses the skill and the composure at the same time, and on the morning of Nov 30 it will be the only training you can still do.',
    illustration: 'Visualization',
    equipment: [],
    regressions: 'Two minutes counts. Start there if five feels long.',
    redFlags: 'If it makes you anxious rather than settled, shorten it and focus only on the serve toss.',
  },
];

const BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id: string): Exercise | undefined {
  return BY_ID.get(id);
}

/** Throws on an unknown id. Use in components where the FK is guaranteed by the validator. */
export function requireExercise(id: string): Exercise {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`Unknown exerciseId: ${id}`);
  return found;
}
