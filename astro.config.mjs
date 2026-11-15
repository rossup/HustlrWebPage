// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// https://astro.build/config
// The site is static, except the admin pages and /api/track, which run on Netlify on each request.
export default defineConfig({
  // Used for the sitemap, canonical links and social previews
  site: 'https://hustlr.chat',
  // Pages build as /plumbers/harare.html, served at /plumbers/harare (no trailing slash)
  build: { format: 'file' },
  trailingSlash: 'never',
  adapter: netlify({
    // Local `astro dev` only. The project has no edge functions, and emulating them needs a recent
    // Deno install, so it's switched off. Has no effect on the deployed site.
    devFeatures: { edgeFunctions: false, images: true, environmentVariables: false },
  }),
});
