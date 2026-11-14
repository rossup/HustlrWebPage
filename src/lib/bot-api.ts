// Everything the dashboard shows comes from the Hustlr WhatsApp bot backend. Server-side only.
//
// The bot backend owns the data (website visits, WhatsApp chats, bookings, providers) and exposes:
//   POST {BOT_API_URL}/analytics/events   one website event, forwarded by src/pages/api/track.ts
//   GET  {BOT_API_URL}/admin/summary?from=<ISO>&prevFrom=<ISO>&to=<ISO>   the numbers below
// Both need the header  Authorization: Bearer {BOT_API_KEY}.  Full contract: ANALYTICS.md, "Bot backend API".
//
// Netlify environment variables (Project configuration > Environment variables):
//   BOT_API_URL   e.g. https://api.hustlr.chat
//   BOT_API_KEY   a long random secret, the same value the bot backend checks
// This site only calls the bot from its server, so the key never reaches a visitor's browser.
import type { Application, Booking, Row } from '../data/admin';
import type { Window } from './visits';

export interface VisitData {
  visitors: number;
  visitorsPrev: number;
  sessions: number;
  sessionsPrev: number;
  /** Taps on a WhatsApp button on the website */
  chats: number;
  chatsPrev: number;
  /** One entry per day in the current window: date is "YYYY-MM-DD" in Harare time */
  daily: { date: string; customer: number; provider: number }[];
  /** Taps per button position (the event's `placement`, e.g. "hero") */
  placements: Row[];
}

export interface BookingData {
  /** Bookings made in the current window (from → to), and in the window before (prevFrom → from) */
  bookings: number;
  bookingsPrev: number;
  /** Bookings in the current window whose job is finished */
  completed: number;
  /** Most recent bookings first, up to 50 */
  recent: Booking[];
  byService: Row[];
  byArea: Row[];
  /** Providers who asked to join and haven't been approved yet */
  applications: Application[];
}

/** Each part is optional, so the bot can ship visits and bookings separately. */
export interface BotSummary {
  visits?: VisitData;
  bookings?: BookingData;
}

const TIMEOUT_MS = 8000;

export const botEnv = (name: 'BOT_API_URL' | 'BOT_API_KEY'): string | undefined =>
  (import.meta.env[name] as string | undefined) ?? process.env[name];

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isRows = (x: unknown): x is Row[] =>
  Array.isArray(x) && x.every((r) => r && typeof r.name === 'string' && isNum(r.value));

const validVisits = (v: any): v is VisitData =>
  !!v &&
  [v.visitors, v.visitorsPrev, v.sessions, v.sessionsPrev, v.chats, v.chatsPrev].every(isNum) &&
  Array.isArray(v.daily) &&
  v.daily.every((d: any) => d && typeof d.date === 'string' && isNum(d.customer) && isNum(d.provider)) &&
  isRows(v.placements);

const validBookings = (b: any): b is BookingData =>
  !!b &&
  [b.bookings, b.bookingsPrev, b.completed].every(isNum) &&
  Array.isArray(b.recent) &&
  isRows(b.byService) &&
  isRows(b.byArea) &&
  Array.isArray(b.applications);

/** Returns null when the bot backend isn't configured yet. Throws when it is but the call fails. */
export async function loadBotSummary(win: Window): Promise<BotSummary | null> {
  const base = botEnv('BOT_API_URL');
  const key = botEnv('BOT_API_KEY');
  if (!base || !key) return null;

  const url = new URL('/admin/summary', base);
  url.searchParams.set('from', win.from.toISOString());
  url.searchParams.set('prevFrom', win.prevFrom.toISOString());
  url.searchParams.set('to', win.to.toISOString());

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`bot API answered ${res.status}`);

  const body = (await res.json()) as Record<string, unknown>;
  // A part with an unexpected shape is treated as "not connected", so the page never breaks
  const summary: BotSummary = {};
  if (validVisits(body.visits)) summary.visits = body.visits;
  else if (body.visits !== undefined) console.error('[admin] bot API: unexpected shape for "visits"');
  if (validBookings(body.bookings)) summary.bookings = body.bookings;
  else if (body.bookings !== undefined) console.error('[admin] bot API: unexpected shape for "bookings"');
  return summary;
}
