// POST /api/track: receives one website analytics event from the browser (src/scripts/analytics.ts)
// and forwards it to the Hustlr bot backend, which stores it next to the WhatsApp chats and bookings.
// Forwarding from here keeps BOT_API_KEY on the server. See ANALYTICS.md, "Bot backend API".
import type { APIRoute } from 'astro';

export const prerender = false;

const ID = /^[0-9a-f]{32}$/;
const TYPE = /^[a-z][a-z0-9_]{1,39}$/;
const MAX_BODY = 4096;
const MAX_CLOCK_SKEW_MS = 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 4000;

const env = (name: string): string | undefined =>
  (import.meta.env[name] as string | undefined) ?? process.env[name];

// Always answer 204: analytics must never show errors to visitors or reveal anything.
const done = () => new Response(null, { status: 204 });

export const POST: APIRoute = async ({ request }) => {
  const raw = await request.text();
  if (!raw || raw.length > MAX_BODY) return done();

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw);
  } catch {
    return done();
  }
  if (!event || typeof event !== 'object') return done();

  const { v, type, visitor_id, session_id, path } = event;
  if (v !== 1 || typeof type !== 'string' || !TYPE.test(type)) return done();
  if (typeof visitor_id !== 'string' || !ID.test(visitor_id)) return done();
  if (typeof session_id !== 'string' || !ID.test(session_id)) return done();

  const page = typeof path === 'string' && path.startsWith('/') ? path.slice(0, 200) : '/';
  // Staff using the admin pages are not website visitors
  if (/^\/(admin|login)(\/|$)/.test(page)) return done();

  // Trust the browser's clock only within a day of the server's
  const now = Date.now();
  let when = typeof event.ts === 'string' ? Date.parse(event.ts) : NaN;
  if (!Number.isFinite(when) || Math.abs(now - when) > MAX_CLOCK_SKEW_MS) when = now;

  const base = env('BOT_API_URL');
  const key = env('BOT_API_KEY');
  if (!base || !key) return done(); // bot backend not connected yet: drop the event

  try {
    await fetch(new URL('/analytics/events', base), {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...event, path: page, ts: new Date(when).toISOString() }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error('[track] could not forward event to the bot backend', error);
  }
  return done();
};
