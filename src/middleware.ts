// Protects the admin pages: only signed-in Supabase users whose email is in ADMIN_EMAILS
// (or invited by a superadmin) get in. Everyone else is sent to /login.
import { defineMiddleware } from 'astro:middleware';
import { type AuthUser, authConfigured, currentUser, isAdmin, isSuperAdmin } from './lib/supabase-auth';

const isAdminPath = (path: string) => path === '/admin' || path.startsWith('/admin/');

export const onRequest = defineMiddleware(async (context, next) => {
  if (!isAdminPath(context.url.pathname)) return next();

  // Local `astro dev` without the Supabase settings in .env: no login, so the pages can be worked on.
  // With them set, the login is checked locally exactly as on the live site.
  if (import.meta.env.DEV && !authConfigured()) {
    context.locals.isSuperAdmin = true;
    return next();
  }

  let user: AuthUser | null = null;
  try {
    user = await currentUser(context.cookies);
  } catch (error) {
    console.error('[admin] could not check the login', error);
  }

  if (!isAdmin(user)) {
    const nextPath = encodeURIComponent(context.url.pathname);
    return context.redirect(`/login?next=${nextPath}`, 302);
  }

  context.locals.adminEmail = user.email;
  context.locals.isSuperAdmin = isSuperAdmin(user);
  const response = await next();
  // Admin pages hold customer details: never cache them anywhere
  try {
    response.headers.set('Cache-Control', 'private, no-store');
  } catch {
    /* some responses have read-only headers */
  }
  return response;
});
