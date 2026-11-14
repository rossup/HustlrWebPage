// Date windows and labels for the admin dashboard. Server-side only.
// (Visit numbers themselves come from the bot backend: see ./bot-api.ts.)

/** Zimbabwe is UTC+2 all year (no daylight saving), so days are counted in Harare time. */
export const TZ = 'Africa/Harare';
const OFFSET_MS = 2 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

export interface Window {
  /** Start of the current 7-day window (Harare midnight, 6 days ago) */
  from: Date;
  /** Start of the previous 7-day window */
  prevFrom: Date;
  to: Date;
}

/** The last 7 days including today, and the 7 days before that. */
export function lastSevenDays(now = new Date()): Window {
  const local = new Date(now.getTime() + OFFSET_MS);
  const todayStart = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - OFFSET_MS;
  const from = new Date(todayStart - 6 * DAY_MS);
  return { from, prevFrom: new Date(from.getTime() - 7 * DAY_MS), to: now };
}

/** "YYYY-MM-DD" of a moment, in Harare time */
export const dayKey = (d: Date) => new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 10);
export const dayLabel = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: TZ });
export const dateLabel = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: TZ });

// Friendly names for the `placement` of a WhatsApp button (see placementOf in analytics.ts)
const PLACEMENTS: Record<string, string> = {
  hero: 'Hero',
  nav: 'Navigation',
  'nav-menu': 'Navigation menu',
  'nav-mobile': 'Mobile menu',
  footer: 'Footer',
  'how-it-works': 'How it works',
  'who-we-serve': 'Who we serve',
  services: 'Services',
  'for-providers': 'For providers',
  why: 'Built for WhatsApp',
  questions: 'Questions',
  page: 'Elsewhere',
};
export const placementName = (id: string) =>
  PLACEMENTS[id] ?? id.replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase());
