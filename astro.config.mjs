// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// https://astro.build/config
// The site is static, except the admin pages and /api/track, which run on Netlify on each request.
export default defineConfig({
  adapter: netlify(),
});
