import type { Day } from '../../src/data/types';
import { PLAN, getDay, FIRST_DATE, NATIONALS_DATE } from '../../src/data/plan';
import { localDate, localHour, shiftDate } from './time';
import { completeEmail, htmlFor, subjectFor, textFor } from './email';

export interface Env {
  LOG: KVNamespace;
  RESEND_API_KEY: string;
  TZ: string;
  EMAIL_TO: string;
  EMAIL_FROM: string;
  SITE_ORIGIN: string;
  SEND_HOUR: string;
}

interface SendLog {
  date: string;
  status: 'sent' | 'failed' | 'skipped';
  at: string;
  subject?: string;
  messageId?: string;
  error?: string;
  attempts?: number;
  catchUp?: boolean;
}

const RETRIES = 3;
const BACKOFF_MS = 30_000;
/** One day after the last email, so the program-complete note has a slot. */
const COMPLETE_DATE = shiftDate(NATIONALS_DATE, 1);

const sentKey = (d: string) => `sent:${d}`;
const logKey = (d: string) => `log:${d}`;
const errorKey = (d: string) => `error:${d}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** What today's email would be, if there is one. */
function planFor(date: string): { kind: 'day'; day: Day } | { kind: 'complete' } | null {
  const day = getDay(date);
  if (day) return { kind: 'day', day };
  if (date === COMPLETE_DATE) return { kind: 'complete' };
  return null;
}

function compose(env: Env, target: NonNullable<ReturnType<typeof planFor>>) {
  if (target.kind === 'complete') return completeEmail(env.SITE_ORIGIN);
  return {
    subject: subjectFor(target.day),
    html: htmlFor(target.day, env.SITE_ORIGIN),
    text: textFor(target.day, env.SITE_ORIGIN),
  };
}

async function sendViaResend(
  env: Env,
  message: { subject: string; html: string; text: string },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [env.EMAIL_TO],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { ok: false, error: `HTTP ${res.status} ${body.slice(0, 300)}` };
  }
  const json = (await res.json()) as { id?: string };
  return { ok: true, id: json.id ?? 'unknown' };
}

/**
 * Sends, retrying twice with 30s backoff.
 *
 * The `sent:` key is written only after Resend confirms, never before. If all
 * three attempts fail the key stays absent, which is exactly what lets the
 * 6 AM tick pick the day back up.
 */
async function deliver(env: Env, date: string, catchUp: boolean): Promise<SendLog> {
  const target = planFor(date);
  if (!target) {
    return { date, status: 'skipped', at: new Date().toISOString(), error: 'no email scheduled for this date' };
  }

  const message = compose(env, target);
  let lastError = '';

  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    const result = await sendViaResend(env, message);
    if (result.ok) {
      const entry: SendLog = {
        date,
        status: 'sent',
        at: new Date().toISOString(),
        subject: message.subject,
        messageId: result.id,
        attempts: attempt,
        ...(catchUp ? { catchUp: true } : {}),
      };
      // Only now. A `sent:` key written before a confirmed send is how a
      // morning goes silent and nobody finds out until the next day.
      await env.LOG.put(sentKey(date), '1', { expirationTtl: 60 * 60 * 24 * 30 });
      await env.LOG.put(logKey(date), JSON.stringify(entry), { expirationTtl: 60 * 60 * 24 * 60 });
      await env.LOG.delete(errorKey(date));
      return entry;
    }
    lastError = result.error;
    if (attempt < RETRIES) await sleep(BACKOFF_MS);
  }

  const entry: SendLog = {
    date,
    status: 'failed',
    at: new Date().toISOString(),
    subject: message.subject,
    error: lastError,
    attempts: RETRIES,
    ...(catchUp ? { catchUp: true } : {}),
  };
  await env.LOG.put(errorKey(date), lastError, { expirationTtl: 60 * 60 * 24 * 7 });
  await env.LOG.put(logKey(date), JSON.stringify(entry), { expirationTtl: 60 * 60 * 24 * 60 });
  return entry;
}

/**
 * The decision, separated from the sending so a dry run can exercise exactly
 * the same logic without touching the network.
 */
export interface Decision {
  now: string;
  timeZone: string;
  localDate: string;
  localHour: number;
  sendHour: number;
  action: 'send' | 'catch-up' | 'wrong-hour' | 'already-sent' | 'nothing-scheduled' | 'after-program';
  subject?: string;
  reason: string;
}

export async function decide(env: Env, now: Date, alreadySent: boolean): Promise<Decision> {
  const tz = env.TZ;
  const hour = localHour(now, tz);
  const date = localDate(now, tz);
  const sendHour = Number(env.SEND_HOUR ?? 5);

  const base: Omit<Decision, 'action' | 'reason'> = {
    now: now.toISOString(),
    timeZone: tz,
    localDate: date,
    localHour: hour,
    sendHour,
  };

  if (date > COMPLETE_DATE) {
    return { ...base, action: 'after-program', reason: 'the program is over; nothing sends after ' + COMPLETE_DATE };
  }
  if (date < FIRST_DATE) {
    return { ...base, action: 'nothing-scheduled', reason: `the program starts ${FIRST_DATE}` };
  }

  const target = planFor(date);
  if (!target) {
    return { ...base, action: 'nothing-scheduled', reason: 'no day in the plan for this date' };
  }

  const subject = compose(env, target).subject;

  if (alreadySent) {
    return { ...base, action: 'already-sent', subject, reason: `sent:${date} is already set` };
  }
  if (hour === sendHour) {
    return { ...base, action: 'send', subject, reason: `local hour is ${sendHour}` };
  }
  if (hour === sendHour + 1) {
    // The 5 AM attempt failed or the worker was down. One late email beats none.
    return { ...base, action: 'catch-up', subject, reason: `local hour is ${sendHour + 1} and nothing was sent today` };
  }
  return { ...base, action: 'wrong-hour', subject, reason: `local hour is ${hour}, waiting for ${sendHour}` };
}

async function run(env: Env, now: Date): Promise<{ decision: Decision; log?: SendLog }> {
  const date = localDate(now, env.TZ);
  const alreadySent = (await env.LOG.get(sentKey(date))) !== null;
  const decision = await decide(env, now, alreadySent);

  if (decision.action !== 'send' && decision.action !== 'catch-up') return { decision };

  const log = await deliver(env, date, decision.action === 'catch-up');
  return { decision, log };
}

const worker = {
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(run(env, new Date()).then(({ decision, log }) => {
      console.log(JSON.stringify({ decision, log }));
    }));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body, null, 2), {
        status,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });

    // /health — the last 7 days of send results. A missed morning should be
    // diagnosable in ten seconds, not by reading logs.
    if (url.pathname === '/health') {
      const today = localDate(new Date(), env.TZ);
      const days: (SendLog | { date: string; status: 'no-record' })[] = [];
      for (let i = 0; i < 7; i++) {
        const d = shiftDate(today, -i);
        const raw = await env.LOG.get(logKey(d));
        days.push(raw ? (JSON.parse(raw) as SendLog) : { date: d, status: 'no-record' });
      }
      const missed = days.filter(
        (d) => d.status !== 'sent' && d.date <= today && d.date >= FIRST_DATE && getDay(d.date),
      );
      return json({
        ok: missed.length === 0,
        timeZone: env.TZ,
        today,
        localHour: localHour(new Date(), env.TZ),
        programDays: PLAN.length,
        missed: missed.map((d) => d.date),
        days,
      });
    }

    // ?dry=1 — run the whole decision, return what would be sent, send nothing.
    // ?at=<iso> to test another moment, ?full=1 to include the rendered HTML.
    if (url.searchParams.get('dry') === '1') {
      const at = url.searchParams.get('at');
      const now = at ? new Date(at) : new Date();
      if (Number.isNaN(now.getTime())) return json({ error: `unparseable ?at=${at}` }, 400);

      const date = localDate(now, env.TZ);
      const alreadySent = (await env.LOG.get(sentKey(date)).catch(() => null)) !== null;
      const decision = await decide(env, now, alreadySent);
      const target = planFor(date);
      const message = target ? compose(env, target) : null;

      return json({
        dryRun: true,
        decision,
        wouldSend: decision.action === 'send' || decision.action === 'catch-up',
        to: env.EMAIL_TO,
        from: env.EMAIL_FROM,
        subject: message?.subject ?? null,
        text: message?.text ?? null,
        ...(url.searchParams.get('full') === '1' ? { html: message?.html ?? null } : {}),
      });
    }

    // Manual trigger, for the first real send and for recovering a missed day.
    if (url.pathname === '/send' && request.method === 'POST') {
      const auth = request.headers.get('authorization');
      if (!env.RESEND_API_KEY || auth !== `Bearer ${env.RESEND_API_KEY}`) {
        return json({ error: 'unauthorized' }, 401);
      }
      const force = url.searchParams.get('force') === '1';
      const date = url.searchParams.get('date') ?? localDate(new Date(), env.TZ);
      if (!force && (await env.LOG.get(sentKey(date))) !== null) {
        return json({ skipped: true, reason: `sent:${date} is already set; pass force=1 to override` });
      }
      return json(await deliver(env, date, false));
    }

    return json({
      service: 'nationals-email',
      timeZone: env.TZ,
      localDate: localDate(new Date(), env.TZ),
      localHour: localHour(new Date(), env.TZ),
      routes: ['/health', '/?dry=1[&at=<iso>][&full=1]', 'POST /send?date=&force='],
    });
  },
};

export default worker;
