import type { Day } from '../../src/data/types';
import { requireExercise } from '../../src/data/exercises';
import { dayNumber, daysUntilNationals } from '../../src/data/plan';

/**
 * The 5 AM email. It is read on a lock screen, half awake, so it says one
 * thing and offers one button.
 *
 * Table-based with inline styles only. No flexbox, no grid, no <style> block,
 * no external CSS — Gmail strips or ignores all of it. Single column, 600px
 * max, nothing below 16px, button 48px tall.
 */

const INK = '#e6edef';
const QUIET = '#93a6ad';
const GROUND = '#0a1114';
const SURFACE = '#111a1e';
const LINE = '#223038';
const ACCENT = '#ff5a1e';
const ACCENT_INK = '#0a1114';

function prescriptionLine(sets: number, reps?: number, seconds?: number, perSide?: boolean): string {
  // Long durations read as minutes. "Easy Aerobic Flush 780s" is not something
  // anyone parses on a lock screen at 5 AM.
  const amount =
    reps !== undefined ? String(reps) : (seconds ?? 0) >= 120 ? `${Math.round((seconds ?? 0) / 60)} min` : `${seconds}s`;
  const core = sets > 1 ? `${sets}×${amount}` : amount;
  return perSide ? `${core}/side` : core;
}

export function subjectFor(day: Day): string {
  if (day.sessionType === 'match') return 'Nationals. Warm up, then go and play.';
  const n = dayNumber(day.date);
  const prefix = day.isTestDay ? '📊 TEST DAY · ' : '';
  const number = n === null ? '' : `Day ${n} · `;
  return `${prefix}${number}${day.title} · ${day.estimatedMinutes} min`;
}

/** Movement names only, no sets — enough to know what is coming without tapping. */
function mainNames(day: Day): { name: string; amount: string }[] {
  return day.main.map((s) => ({
    name: requireExercise(s.exerciseId).name.replace(/\s*\(.*\)$/, ''),
    amount: prescriptionLine(s.sets, s.reps, s.seconds, s.perSide),
  }));
}

/**
 * Cues for each main-work movement, for the bridge email that has to stand on
 * its own while the site is not yet deployed.
 */
function mainCues(day: Day): { name: string; cues: string[] }[] {
  return day.main.map((s) => {
    const ex = requireExercise(s.exerciseId);
    return { name: ex.name.replace(/\s*\(.*\)$/, ''), cues: ex.cues };
  });
}

export function textFor(day: Day, origin: string, inlineCues = false): string {
  const url = `${origin}/day/${day.date}`;
  const out = day.sessionType === 'match'
    ? [
        'NATIONALS',
        '',
        day.oneLineJob,
        '',
        'Warm-up: ' + mainNames(day).map((m) => `${m.name} ${m.amount}`).join(', '),
        '',
        'The work is done. Go and play.',
        '',
        url,
      ]
    : [
        subjectFor(day),
        '',
        day.oneLineJob,
        '',
        `Open today's session: ${url}`,
        '',
        "What's in it:",
        ...mainNames(day).map((m) => `  - ${m.name} ${m.amount}`),
        '',
        `${daysUntilNationals(day.date)} days to Nationals.`,
      ];

  if (inlineCues && day.sessionType !== 'match') {
    out.push('', 'Cues:');
    for (const { name, cues } of mainCues(day)) {
      out.push(`  ${name}`);
      for (const c of cues) out.push(`    - ${c}`);
    }
  }
  return out.join('\n');
}

const button = (url: string, label: string) => `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" bgcolor="${ACCENT}" style="border-radius:8px;">
                    <a href="${url}" style="display:block;padding:15px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;line-height:18px;color:${ACCENT_INK};text-decoration:none;border-radius:8px;">${label}</a>
                  </td>
                </tr>
              </table>`;

export function htmlFor(day: Day, origin: string, inlineCues = false): string {
  const url = `${origin}/day/${day.date}`;
  const n = dayNumber(day.date);
  const out = daysUntilNationals(day.date);
  const isMatch = day.sessionType === 'match';
  const font = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`;

  const eyebrow = isMatch
    ? 'November 30'
    : [
        day.weekNumber === 0 ? 'On-ramp' : `Week ${day.weekNumber}`,
        n !== null ? `Day ${n}` : null,
        day.isTestDay ? 'Test day' : null,
      ]
        .filter(Boolean)
        .join(' &middot; ');

  // Match morning still lists the warm-up: the plain-text alternative always
  // did, and he should not have to tap to see four items.
  const rows = `
            <tr>
              <td style="padding:26px 24px 0 24px;">
                <p style="margin:0 0 10px 0;font-family:${font};font-size:13px;line-height:18px;color:${QUIET};">${isMatch ? 'Warm-up' : 'What&rsquo;s in it'}</p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  ${mainNames(day)
                    .map(
                      (m) => `<tr>
                    <td style="padding:5px 0;font-family:${font};font-size:16px;line-height:22px;color:${INK};">${m.name}</td>
                    <td align="right" style="padding:5px 0;font-family:${font};font-size:16px;line-height:22px;color:${QUIET};white-space:nowrap;">${m.amount}</td>
                  </tr>`,
                    )
                    .join('')}
                </table>
              </td>
            </tr>`;

  const closing = isMatch
    ? `<p style="margin:0;font-family:${font};font-size:17px;line-height:26px;color:${INK};">The work is done. Warm up, then go and play.</p>`
    : `<p style="margin:0;font-family:${font};font-size:15px;line-height:22px;color:${QUIET};">${out} ${out === 1 ? 'day' : 'days'} to Nationals.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light">
<title>${subjectFor(day)}</title>
</head>
<body style="margin:0;padding:0;background-color:${GROUND};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${day.oneLineJob}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${GROUND};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background-color:${SURFACE};border-radius:14px;">
        <tr>
          <td style="padding:26px 24px 0 24px;">
            <p style="margin:0 0 6px 0;font-family:${font};font-size:13px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${isMatch ? ACCENT : QUIET};">${eyebrow}</p>
            <h1 style="margin:0;font-family:${font};font-size:${isMatch ? 34 : 26}px;line-height:1.15;font-weight:700;color:${INK};">${day.title}</h1>
            <p style="margin:8px 0 0 0;font-family:${font};font-size:15px;line-height:22px;color:${QUIET};">${day.dayOfWeek} &middot; ${day.estimatedMinutes} min${day.isDeload ? ' &middot; deload' : ''}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 24px 0 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${LINE};border-radius:10px;">
              <tr><td style="padding:16px 18px;font-family:${font};font-size:19px;line-height:27px;font-weight:600;color:${INK};">${day.oneLineJob}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 24px 0 24px;">${button(url, isMatch ? 'Open the warm-up &rarr;' : "Open today's session &rarr;")}</td>
        </tr>
        ${rows}
        ${
          inlineCues && !isMatch
            ? `<tr><td style="padding:26px 24px 0 24px;">
                <p style="margin:0 0 10px 0;font-family:${font};font-size:13px;line-height:18px;color:${QUIET};">Cues</p>
                ${mainCues(day)
                  .map(
                    (m) => `<p style="margin:0 0 12px 0;font-family:${font};font-size:15px;line-height:22px;color:${INK};"><strong>${m.name}</strong><br>${m.cues
                      .map((c) => `<span style="color:${QUIET};">${c}</span>`)
                      .join('<br>')}</p>`,
                  )
                  .join('')}
              </td></tr>`
            : ''
        }
        ${day.coachNote ? `<tr><td style="padding:26px 24px 0 24px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="3" bgcolor="${ACCENT}" style="width:3px;line-height:1px;font-size:0;">&nbsp;</td><td style="padding:2px 0 2px 14px;font-family:${font};font-size:16px;line-height:24px;color:${INK};">${day.coachNote}</td></tr></table></td></tr>` : ''}
        <tr>
          <td style="padding:26px 24px 26px 24px;border-top:1px solid ${LINE};">
            ${closing}
          </td>
        </tr>
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">
        <tr><td align="center" style="padding:16px 24px;font-family:${font};font-size:13px;line-height:20px;color:#54666e;">
          <a href="${origin}/plan" style="color:#54666e;text-decoration:underline;">The whole plan</a>
          &nbsp;&middot;&nbsp;
          <a href="${origin}/progress" style="color:#54666e;text-decoration:underline;">Progress</a>
        </td></tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** The one-off email the morning after the program ends. */
export function completeEmail(origin: string): { subject: string; html: string; text: string } {
  const font = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`;
  return {
    subject: 'Twelve weeks. Done.',
    text: [
      'Twelve weeks. Done.',
      '',
      'Eighty-four sessions, three tests, and Nationals behind you.',
      'No more 5 AM emails from here.',
      '',
      `${origin}/progress`,
    ].join('\n'),
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Twelve weeks. Done.</title></head>
<body style="margin:0;padding:0;background-color:${GROUND};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${GROUND};"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background-color:${SURFACE};border-radius:14px;">
<tr><td style="padding:32px 24px;">
<h1 style="margin:0;font-family:${font};font-size:30px;line-height:1.15;font-weight:700;color:${INK};">Twelve weeks. Done.</h1>
<p style="margin:14px 0 0 0;font-family:${font};font-size:17px;line-height:26px;color:${INK};">Eighty-four sessions, three tests, and Nationals behind you.</p>
<p style="margin:14px 0 24px 0;font-family:${font};font-size:16px;line-height:24px;color:${QUIET};">No more 5 AM emails from here. The pages stay up — every day you did is still there.</p>
${button(`${origin}/progress`, 'See the twelve weeks &rarr;')}
</td></tr></table></td></tr></table></body></html>`,
  };
}
