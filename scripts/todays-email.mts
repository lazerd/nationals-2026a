/**
 * The bridge sender's payload.
 *
 * Prints today's email as JSON. Guards on the local wall-clock hour exactly
 * the way the Cloudflare worker does, so this can be fired at both 12:00 and
 * 13:00 UTC and still send precisely once a day across the Nov 1 DST change:
 * whichever firing lands on 5 AM Pacific is the one that produces an email.
 *
 *   npx tsx scripts/todays-email.mts            # respects the 5 AM guard
 *   npx tsx scripts/todays-email.mts --force    # ignore the guard
 *   npx tsx scripts/todays-email.mts --date 2026-10-19
 */
import { getDay, FIRST_DATE, NATIONALS_DATE } from '../src/data/plan';
import { htmlFor, subjectFor, textFor, completeEmail } from '../worker/src/email';
import { localDate, localHour } from '../worker/src/time';
import { EMAIL_TO, SITE_ORIGIN, TZ, SEND_HOUR } from '../src/config';

const args = process.argv.slice(2);
const force = args.includes('--force');
const dateArg = args[args.indexOf('--date') + 1];
const explicitDate = args.includes('--date') ? dateArg : null;

const now = new Date();
const date = explicitDate ?? localDate(now, TZ);
const hour = localHour(now, TZ);

const emit = (o: Record<string, unknown>) => {
  console.log(JSON.stringify({ timeZone: TZ, localDate: date, localHour: hour, ...o }, null, 2));
};

const COMPLETE_DATE = (() => {
  const d = new Date(`${NATIONALS_DATE}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
})();

if (!force && !explicitDate && hour !== SEND_HOUR) {
  emit({ send: false, reason: `local hour is ${hour}, not ${SEND_HOUR}` });
  process.exit(0);
}
if (date < FIRST_DATE) {
  emit({ send: false, reason: `the program starts ${FIRST_DATE}` });
  process.exit(0);
}
if (date > COMPLETE_DATE) {
  emit({ send: false, reason: 'the program is over' });
  process.exit(0);
}

if (date === COMPLETE_DATE) {
  const done = completeEmail(SITE_ORIGIN);
  emit({ send: true, to: EMAIL_TO, ...done });
  process.exit(0);
}

const day = getDay(date);
if (!day) {
  emit({ send: false, reason: 'no day in the plan for this date' });
  process.exit(0);
}

// Cues go inline: until Pages is deployed the button has nothing to open, and
// the email has to stand on its own in a garage at 6 AM.
emit({
  send: true,
  to: EMAIL_TO,
  subject: subjectFor(day),
  text: textFor(day, SITE_ORIGIN, true),
  html: htmlFor(day, SITE_ORIGIN, true),
});
