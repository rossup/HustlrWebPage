// /sitemap-index.xml: points crawlers at /sitemap.xml (the list of every public page).
// Same file name @astrojs/sitemap uses, so robots.txt and Search Console stay valid
// whichever way the sitemap is generated.
import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/seo';

export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${SITE_URL}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>\n</sitemapindex>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
