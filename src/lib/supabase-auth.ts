// Admin sign-in with Supabase Auth. Server-side only.
//
// The browser never talks to Supabase: /login posts to this site's own /api/auth/* endpoints, which
// call Supabase and keep the session in HttpOnly cookies. src/middleware.ts checks those cookies on
// every /admin request.
//
// Who is an admin: a Supabase Auth user whose confirmed email is listed in ADMIN_EMAILS.
//
// Environment variables (Netlify: Project configuration > Environment variables; locally: .env):
//   SUPABASE_URL        e.g. https://your-project-id.supabase.co
//   SUPABASE_ANON_KEY   the project's publishable (anon) key. Never the secret / service_role key.
//   ADMIN_EMAILS        comma-separated admin emails, e.g. "you@example.com, partner@example.com"
import type { AstroCookies } from 'astro';

const ACCESS_COOKIE = 'hz_admin_at';
const REFRESH_COOKIE = 'hz_admin_rt';
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const TIMEOUT_MS = 8000;

type EnvName = 'SUPABASE_URL' | 'SUPABASE_ANON_KEY' | 'ADMIN_EMAILS';

const env = (name: EnvName): string | undefined =>
  ((import.meta.env[name] as string | undefined) ?? process.env[name])?.trim() || undefined;

export interface AuthUser {
  email: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires */
  expiresIn: number;
  user: AuthUser | null;
}

/** A failure the person signing in can be told about. */
export class AuthFailure extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export const authConfigured = (): boolean => !!env('SUPABASE_URL') && !!env('SUPABASE_ANON_KEY');

const adminEmails = (): string[] =>
  (env('ADMIN_EMAILS') ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isAdmin = (user: AuthUser | null): user is AuthUser =>
  !!user && adminEmails().includes(user.email.toLowerCase());

async function call(
  path: string,
  init: { method?: string; body?: unknown; accessToken?: string } = {},
): Promise<any> {
  const base = env('SUPABASE_URL');
  const key = env('SUPABASE_ANON_KEY');
  if (!base || !key) throw new AuthFailure('Admin sign-in is not set up yet.', 503);

  let response: Response;
  try {
    response = await fetch(`${base.replace(/\/+$/, '')}/auth/v1${path}`, {
      method: init.method ?? 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${init.accessToken ?? key}`,
        ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new AuthFailure('Could not reach the sign-in service. Try again.', 502);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.msg ?? data?.error_description ?? data?.message ?? 'Sign-in failed.';
    throw new AuthFailure(String(detail), response.status);
  }
  return data;
}

// Only an email Supabase has confirmed counts, so nobody gets in on an address they don't own.
const toUser = (raw: any): AuthUser | null =>
  raw && typeof raw.email === 'string' && (raw.email_confirmed_at || raw.confirmed_at)
    ? { email: raw.email }
    : null;

const toSession = (raw: any): Session => {
  if (!raw || typeof raw.access_token !== 'string' || typeof raw.refresh_token !== 'string') {
    throw new AuthFailure('Sign-in failed.', 502);
  }
  return {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
    expiresIn: Number(raw.expires_in) > 0 ? Number(raw.expires_in) : 3600,
    user: toUser(raw.user),
  };
};

export const signIn = async (email: string, password: string): Promise<Session> =>
  toSession(await call('/token?grant_type=password', { method: 'POST', body: { email, password } }));

const refresh = async (refreshToken: string): Promise<Session> =>
  toSession(
    await call('/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: refreshToken } }),
  );

/** The user a token belongs to, checked with Supabase. Null when the token is no longer valid. */
export const userFor = async (accessToken: string): Promise<AuthUser | null> => {
  try {
    return toUser(await call('/user', { accessToken }));
  } catch (error) {
    if (error instanceof AuthFailure && error.status < 500) return null;
    throw error;
  }
};

/** Emails a reset link that lands on `redirectTo` (must be allowed in Supabase > Auth > URL configuration). */
export const sendRecovery = async (email: string, redirectTo: string): Promise<void> => {
  await call(`/recover?redirect_to=${encodeURIComponent(redirectTo)}`, { method: 'POST', body: { email } });
};

/** Sets the password for the account an invite or reset link signed in. */
export const setPassword = async (accessToken: string, password: string): Promise<AuthUser | null> =>
  toUser(await call('/user', { method: 'PUT', accessToken, body: { password } }));

export const signOut = async (accessToken: string): Promise<void> => {
  try {
    await call('/logout', { method: 'POST', accessToken });
  } catch {
    /* already signed out, or Supabase unreachable: the cookies are cleared either way */
  }
};

const cookieOptions = (maxAge: number) => ({
  path: '/',
  httpOnly: true,
  // localhost is plain http in `astro dev`
  secure: !import.meta.env.DEV,
  sameSite: 'lax' as const,
  maxAge,
});

export const saveSession = (cookies: AstroCookies, session: Session): void => {
  cookies.set(ACCESS_COOKIE, session.accessToken, cookieOptions(session.expiresIn));
  cookies.set(REFRESH_COOKIE, session.refreshToken, cookieOptions(REFRESH_MAX_AGE));
};

export const clearSession = (cookies: AstroCookies): void => {
  cookies.delete(ACCESS_COOKIE, { path: '/' });
  cookies.delete(REFRESH_COOKIE, { path: '/' });
};

export const accessTokenFrom = (cookies: AstroCookies): string | undefined =>
  cookies.get(ACCESS_COOKIE)?.value || undefined;

/**
 * The signed-in user for this request, or null. Renews the session from the refresh cookie when the
 * access token has expired. Says nothing about admin rights: check `isAdmin` on the result.
 */
export const currentUser = async (cookies: AstroCookies): Promise<AuthUser | null> => {
  const accessToken = accessTokenFrom(cookies);
  if (accessToken) {
    const user = await userFor(accessToken);
    if (user) return user;
  }

  const refreshToken = cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;
  try {
    const session = await refresh(refreshToken);
    saveSession(cookies, session);
    return session.user;
  } catch (error) {
    if (error instanceof AuthFailure && error.status < 500) clearSession(cookies);
    return null;
  }
};

/** Browsers send Origin on every POST: refuse one that comes from another site. */
export const sameOrigin = (request: Request, url: URL): boolean => {
  const origin = request.headers.get('origin');
  return !origin || origin === url.origin;
};

export const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
