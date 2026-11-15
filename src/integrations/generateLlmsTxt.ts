// Astro integration: writes public/llms.txt from the site's data on every `astro dev` start
// and every `astro build` (before public/ is copied into dist/), so the deployed file always
// lists exactly the pages that were built. The file stays in Git, so flipping `isActive`
// on a trade or city shows up as a readable diff.
import type { AstroIntegration } from 'astro';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { buildLlmsTxt } from '../lib/llmsTxt';

export function generateLlmsTxt(): AstroIntegration {
  let siteUrl = '';
  let publicDir = '';

  const write = (log: (msg: string) => void) => {
    const content = buildLlmsTxt(siteUrl);
    const file = join(publicDir, 'llms.txt');
    let current = '';
    try {
      current = readFileSync(file, 'utf-8');
    } catch {
      // first run: no file yet
    }
    if (current === content) return; // unchanged: don't touch the file (avoids needless reloads and Git noise)
    mkdirSync(publicDir, { recursive: true });
    writeFileSync(file, content, 'utf-8');
    log(`Updated public/llms.txt (${(content.match(/\/hire\//g) ?? []).length} local trade pages)`);
  };

  return {
    name: 'hustlr-generate-llms-txt',
    hooks: {
      'astro:config:done': ({ config, logger }) => {
        if (!config.site) throw new Error('[hustlr-generate-llms-txt] set `site` in astro.config.mjs');
        // Same domain as canonical tags and the sitemap, no trailing slash (trailingSlash: 'never')
        siteUrl = config.site.replace(/\/$/, '');
        publicDir = fileURLToPath(config.publicDir);
        // Covers `astro dev`; `astro build` writes again below
        write((m) => logger.info(m));
      },
      'astro:build:start': ({ logger }) => write((m) => logger.info(m)),
    },
  };
}
