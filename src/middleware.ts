// Protects the admin pages: only logged-in Netlify Identity users with the "admin" role get in.
// Everyone else is sent to /login. Runs on the server for every /admin request.
import { defineMiddleware } from 'astro:middleware';

const isAdminPath = (path: string) => path === '/admin' || path.startsWith('/admin/');

export const onRequest = defineMiddleware(async (context, next) => {
  if (!isAdminPath(context.url.pathname)) return next();

  // Netlify Identity doesn't run in a local `astro dev` preview, so the check is skipped there.
  if (import.meta.env.DEV) return next();

  let user: { email?: string; roles?: string[] } | null = null;
  try {
    const { getUser } = await import('@netlify/identity');
    user = await getUser();
  } catch (error) {
    console.error('[admin] could not check the login', error);
  }

  if (!user || !(user.roles ?? []).includes('admin')) {
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
