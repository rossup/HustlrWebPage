// Protects the admin pages: only signed-in Supabase users whose email is in ADMIN_EMAILS get in.
// Everyone else is sent to /login. Runs on the server for every /admin request.
import { defineMiddleware } from 'astro:middleware';
import { authConfigured, currentUser, isAdmin } from './lib/supabase-auth';

const isAdminPath = (path: string) => path === '/admin' || path.startsWith('/admin/');

export const onRequest = defineMiddleware(async (context, next) => {
  if (!isAdminPath(context.url.pathname)) return next();

  // Local `astro dev` without the Supabase settings in .env: no login, so the pages can be worked on.
  // With them set, the login is checked locally exactly as on the live site.
  if (import.meta.env.DEV && !authConfigured()) return next();

  let user: { email: string } | null = null;
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
  const response = await next();
  // Admin pages hold customer details: never cache them anywhere
  try {
    response.headers.set('Cache-Control', 'private, no-store');
  } catch {
    /* some responses have read-only headers */
  }
  return response;
});
