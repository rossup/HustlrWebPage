// Changes made from the admin pages (add, edit, verify, suspend, delete…), passed on to the bot backend.
//   POST   /admin/api/providers                 add          PATCH  /admin/api/providers/<id>   edit
//   POST   /admin/api/providers/<id>/verify     (or reject, suspend, restore)
//   POST   /admin/api/providers/<id>/approve-badge   (or reject-badge, with {"reason": "..."})
//   DELETE /admin/api/providers/<id>            delete permanently
// The same add / edit / delete routes exist for bookings and users.
//
// Being under /admin, every request has already passed the admin login check in src/middleware.ts.
// BOT_API_KEY stays on the server: the browser only ever talks to this endpoint.
import type { APIRoute } from 'astro';
import { manageRequest } from '../../../lib/bot-manage';
import { json, sameOrigin } from '../../../lib/supabase-auth';

export const prerender = false;

const MAX_BODY = 16384;
const ID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const COLLECTION = /^(providers|bookings|users)$/;
const RECORD = new RegExp(`^(providers|bookings|users)/${ID}$`);
const PROVIDER_ACTION = new RegExp(`^providers/${ID}/(verify|reject|suspend|restore)$`);
// Guaranteed badge decisions. Their body is read like any other POST, so reject-badge can carry its reason.
const BADGE_ACTION = new RegExp(`^providers/${ID}/(approve|reject)-badge$`);

const ALLOWED: Record<string, RegExp[]> = {
  POST: [COLLECTION, PROVIDER_ACTION, BADGE_ACTION],
  PATCH: [RECORD],
  DELETE: [RECORD],
};

/** The bot backend's error, as one sentence an admin can act on. */
function errorText(body: unknown): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = Array.isArray(d?.loc) ? String(d.loc[d.loc.length - 1]).replace(/_/g, ' ') : '';
        const message = String(d?.msg ?? '').replace(/^Value error, /, '');
        return field && field !== 'body' ? `${field}: ${message}` : message;
      })
      .filter(Boolean)
      .join('. ');
  }
  return 'The change could not be saved.';
}

const handle: APIRoute = async ({ params, request, url, locals }) => {
  if (!sameOrigin(request, url)) return json({ error: 'Forbidden' }, 403);

  const path = (params.path ?? '').toLowerCase();
  const method = request.method as 'POST' | 'PATCH' | 'DELETE';
  if (!ALLOWED[method]?.some((pattern) => pattern.test(path))) return json({ error: 'Not found' }, 404);

  let body: unknown;
  if (method !== 'DELETE' && !PROVIDER_ACTION.test(path)) {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ error: 'Too large' }, 413);
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      return json({ error: 'Bad request' }, 400);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Bad request' }, 400);
  }

  try {
    const result = await manageRequest(method, path, { body, adminEmail: locals.adminEmail });
    if (!result) return json({ error: 'The bot backend is not connected.' }, 503);
    if (result.status >= 200 && result.status < 300) return json({ ok: true, record: result.body });
    if (result.status === 401 || result.status === 503) {
      console.error(`[admin] bot API refused a change (${result.status})`);
      return json({ error: 'The bot backend refused the request. Check BOT_API_KEY.' }, 502);
    }
    return json({ error: errorText(result.body) }, result.status);
  } catch (error) {
    console.error('[admin] could not reach the bot backend', error);
    return json({ error: 'Could not reach the bot backend. Try again.' }, 502);
  }
};

export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
