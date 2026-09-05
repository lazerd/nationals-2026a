/**
 * Single-user configuration. This app has exactly one user and that
 * assumption is baked in everywhere on purpose.
 */

/**
 * IANA timezone. Every 5 AM decision derives from this via Intl.DateTimeFormat,
 * which handles the Nov 1 2026 DST transition on its own. Never store a UTC
 * offset anywhere in this codebase.
 */
export const TZ = 'America/Los_Angeles';

/** Where the 5 AM email goes. */
export const EMAIL_TO = 'darrinjco@gmail.com';

/**
 * Sending identity. clubmode.ai still needs SPF and DKIM records added in
 * Resend before Gmail will reliably keep this out of the spam folder — that
 * happens in Phase 7 and it is not optional for an email that has to land 87
 * mornings running.
 */
export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Nationals <coach@clubmode.ai>';

/** Public origin. Day links in the email are permanent and must never change. */
export const SITE_ORIGIN = process.env.SITE_ORIGIN ?? 'https://nationals.clubmode.ai';

/** The hour, in TZ local wall-clock time, the email should arrive. */
export const SEND_HOUR = 5;

/** One catch-up attempt at 6 AM local if the 5 AM send failed. */
export const CATCHUP_HOUR = 6;
