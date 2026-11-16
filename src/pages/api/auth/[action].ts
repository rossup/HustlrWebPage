// Admin sign-in endpoints, called by src/pages/login.astro, the admin "Sign out" button,
// and the superadmin "Invite admin" modal.
//   GET  /api/auth/me        who is signed in, and whether they are an admin / superadmin
//   POST /api/auth/login     { email, password }
//   POST /api/auth/logout
//   POST /api/auth/recover   { email }                                  emails a reset link
//   POST /api/auth/password  { accessToken, refreshToken, password }    finishes an invite or reset link
//   POST /api/auth/invite    { email, role? }                           superadmin invites another admin
// Supabase is only ever called from here, see src/lib/supabase-auth.ts.
import type { APIRoute } from 'astro';
import {
  AuthFailure,
  accessTokenFrom,
  clearSession,
  currentUser,
  inviteAdmin,
  isAdmin,
  isSuperAdmin,
  json,
  sameOrigin,
  saveSession,
  sendRecovery,
  setPassword,
  signIn,
  signOut,
  userFor,
} from '../../../lib/supabase-auth';

export const prerender = false;

const MAX_BODY = 8192;
const MIN_PASSWORD = 8;

const text = (value: unknown, max: number): string =>
  typeof value === 'string' && value.length <= max ? value : '';

const fail = (error: unknown): Response => {
  if (error instanceof AuthFailure) {
    if (error.status === 400 || error.status === 401) {
      return json({ error: 'That email and password donâ€™t match.' }, 401);
    }
    if (error.status === 429) return json({ error: 'Too many tries. Wait a minute and try again.' }, 429);
    if (error.status === 503) return json({ error: error.message }, 503);
  }
  console.error('[auth]', error);
  return json({ error: 'Something went wrong. Try again.' }, 502);
};

export const GET: APIRoute = async ({ params, cookies }) => {
  if (params.action !== 'me') return json({ error: 'Not found' }, 404);
  try {
    const user = await currentUser(cookies);
    return json({ email: user?.email ?? null, admin: isAdmin(user), superadmin: isSuperAdmin(user) });
  } catch (error) {
    return fail(error);
  }
};

export const POST: APIRoute = async ({ params, request, cookies, url }) => {
  if (!sameOrigin(request, url)) return json({ error: 'Forbidden' }, 403);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: 'Too large' }, 413);
  let body: Record<string, unknown> = {};
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === 'object') body = parsed;
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  try {
    switch (params.action) {
      case 'login': {
        const email = text(body.email, 320).trim();
        const password = text(body.password, 1024);
        if (!email || !password) return json({ error: 'Type your email and password.' }, 400);
        const session = await signIn(email, password);
        // Non-admins stay signed in so /login can say which account has no access
        saveSession(cookies, session);
        return json({
          email: session.user?.email ?? email,
          admin: isAdmin(session.user),
          superadmin: isSuperAdmin(session.user),
        });
      }

      case 'logout': {
        const accessToken = accessTokenFrom(cookies);
        if (accessToken) await signOut(accessToken);
        clearSession(cookies);
        return json({ ok: true });
      }

      case 'recover': {
        const email = text(body.email, 320).trim();
        if (!email) return json({ error: 'Type your email first.' }, 400);
        try {
          await sendRecovery(email, `${url.origin}/login`);
        } catch (error) {
          // Never reveal whether an email has an account
          if (!(error instanceof AuthFailure) || error.status >= 500 || error.status === 429) throw error;
        }
        return json({ ok: true });
      }

      case 'password': {
        const accessToken = text(body.accessToken, 4096);
        const refreshToken = text(body.refreshToken, 1024);
        const password = text(body.password, 1024);
        if (!accessToken || !refreshToken) return json({ error: 'This link has expired. Ask for a new one.' }, 400);
        if (password.length < MIN_PASSWORD) {
          return json({ error: `Use at least ${MIN_PASSWORD} characters.` }, 400);
        }
        if (!(await userFor(accessToken))) {
          return json({ error: 'This link has expired. Ask for a new one.' }, 401);
        }
        let user;
        try {
          user = await setPassword(accessToken, password);
        } catch (error) {
          // Supabase explains what is wrong with a password it refuses (too weak, same as before)
          if (error instanceof AuthFailure && error.status === 422) return json({ error: error.message }, 400);
          throw error;
        }
        saveSession(cookies, { accessToken, refreshToken, expiresIn: 3600, user });
        return json({ email: user?.email ?? null, admin: isAdmin(user), superadmin: isSuperAdmin(user) });
      }

      case 'invite': {
        const caller = await currentUser(cookies);
        if (!caller) return json({ error: 'Sign in first.' }, 401);
        if (!isSuperAdmin(caller)) {
          return json({ error: 'Only a superadmin can send invitations to other admins.' }, 403);
        }
        const email = text(body.email, 320).trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return json({ error: 'Enter a valid email address.' }, 400);
        }
        const role = body.role === 'superadmin' ? 'superadmin' : 'admin';
        try {
          await inviteAdmin(email, 'https://hustlr.chat', caller.email, role);
        } catch (error) {
          if (error instanceof AuthFailure && error.status < 500 && error.status !== 429) {
            return json({ error: error.message || 'Could not send the invitation.' }, 400);
          }
          throw error;
        }
        return json({ ok: true, email, role });
      }

      default:
        return json({ error: 'Not found' }, 404);
    }
  } catch (error) {
    return fail(error);
  }
};
