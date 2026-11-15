// Managing records (providers, bookings, users) through the bot backend. Server-side only.
//
// The bot backend exposes them under {BOT_API_URL}/admin/manage/… with the same
// Authorization: Bearer {BOT_API_KEY} as the dashboard numbers (see ./bot-api.ts).
// Pages read lists with `manageList`; changes go through src/pages/admin/api/[...path].ts.
import { botEnv } from './bot-api';

const TIMEOUT_MS = 10000;

export type Resource = 'providers' | 'bookings' | 'users';

export interface ManagedProvider {
  id: string;
  business_name: string | null;
  full_name: string | null;
  category: string | null;
  location: string | null;
  city: string | null;
  service_areas: string | null;
  contact_number: string | null;
  service_description: string | null;
  verification_status: string | null;
  account_status: string | null;
  active: boolean | null;
  created_at: string | null;
}

export interface ManagedBooking {
  id: string;
  customer_phone: string | null;
  customer_name: string;
  provider_id: string | null;
  provider_name: string;
  status: string | null;
  job_description: string | null;
  service_type: string | null;
  job_timing: string | null;
  preferred_time: string | null;
  amount: number | null;
  created_at: string | null;
}

export interface ManagedUser {
  id: string;
  phone: string | null;
  full_name: string | null;
  role: string | null;
  language: string | null;
  location: string | null;
  created_at: string | null;
  last_active_at: string | null;
  interaction_count: number | null;
}

export interface ManagedList<T> {
  items: T[];
  /** Everything in the database, which can be more than `items` holds */
  total: number;
}

export interface ManageResult {
  status: number;
  body: unknown;
}

/** One call to the bot backend's manage API. Returns null when the backend isn't configured. */
export async function manageRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  options: { body?: unknown; adminEmail?: string } = {},
): Promise<ManageResult | null> {
  const base = botEnv('BOT_API_URL');
  const key = botEnv('BOT_API_KEY');
  if (!base || !key) return null;

  const res = await fetch(new URL(`/admin/manage/${path}`, base), {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(options.adminEmail ? { 'X-Admin-Email': options.adminEmail } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  return { status: res.status, body };
}

/** Every record of one kind, newest first. Null when the bot backend isn't connected or the call fails. */
export async function manageList<T>(resource: Resource): Promise<ManagedList<T> | null> {
  try {
    const result = await manageRequest('GET', resource);
    const body = result?.body as ManagedList<T> | null | undefined;
    if (!result || result.status !== 200 || !body || !Array.isArray(body.items)) {
      if (result) console.error(`[admin] bot API: could not list ${resource} (${result.status})`);
      return null;
    }
    return { items: body.items, total: typeof body.total === 'number' ? body.total : body.items.length };
  } catch (error) {
    console.error(`[admin] could not reach the bot backend for ${resource}`, error);
    return null;
  }
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Harare' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Harare' });

/** "Fri 13 Nov" in Harare time, or "Fri 13 Nov, 14:20" with the time. */
export function when(iso: string | null | undefined, withTime = false): string {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return '—';
  const day = dateFmt.format(date).replace(',', '');
  return withTime ? `${day}, ${timeFmt.format(date)}` : day;
}

/** One label for a provider's standing, matching the bot backend's own rule. */
export function providerStatus(p: Pick<ManagedProvider, 'verification_status' | 'account_status'>): string {
  if ((p.account_status ?? '').toLowerCase() === 'suspended') return 'Suspended';
  const verification = (p.verification_status ?? '').toLowerCase();
  if (verification === 'verified') return 'Verified';
  if (verification === 'pending') return 'Pending';
  if (verification === 'rejected') return 'Rejected';
  return 'Unverified';
}
