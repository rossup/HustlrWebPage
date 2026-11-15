// /sitemap.xml: every public page, for Google and Bing. Built once at deploy time.
import type { APIRoute } from 'astro';
import { SITE_URL, seoCities, seoServices } from '../data/seo';

const paths = [
  '/',
  ...seoServices.map((s) => `/${s.slug}`),
  ...seoCities.map((c) => `/areas/${c.slug}`),
  ...seoServices.flatMap((s) => seoCities.map((c) => `/${s.slug}/${c.slug}`)),
  '/privacy',
  '/terms',
];

const priority = (p: string) => (p === '/' ? '1.0' : p.split('/').length === 2 && !['/privacy', '/terms'].includes(p) ? '0.9' : p.startsWith('/privacy') || p.startsWith('/terms') ? '0.3' : '0.8');

export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = paths
    .map((p) => `  <url><loc>${SITE_URL}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod><priority>${priority(p)}</priority></url>`)
    .join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
