// Post-build SEO/GEO gate for hustlr.chat. Zero dependencies: Node built-ins only.
// Runs after `astro build` (see "build" in package.json) and exits with code 1 if any
// built page, JSON-LD graph, sitemap or llms.txt entry is out of line, so Netlify
// stops the deploy instead of publishing the regression.
//
//   npm run build          build + audit
//   npm run audit:seo      audit an existing dist/ only
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve('dist');
const SITE = 'https://hustlr.chat';
const ORG_ID = `${SITE}/#organization`;
const AI_BOTS = ['OAI-SearchBot', 'GPTBot', 'ClaudeBot', 'Google-Extended'];
const PLACEHOLDERS = ['[YOUR_PRODUCTION_DOMAIN]', '[YOUR_WHATSAPP_NUMBER]', '2637XXXXXXXX', 'localhost:', '127.0.0.1'];

const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`[FAIL] ${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`[WARN] ${where}: ${msg}`);

// ---------- helpers ----------
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
const text = (html) => decode(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const norm = (s) => decode(String(s)).replace(/\s+/g, ' ').trim();

/** Value of attribute `name` on the first tag matching `tagRe` */
function attr(html, tagRe, name) {
  const tag = html.match(tagRe)?.[0];
  if (!tag) return null;
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? decode(m[2] ?? m[3]) : null;
}

/** URL path ("/hire/plumber-harare") for a dist file ("hire/plumber-harare.html" or ".../index.html") */
function routeOf(rel) {
  let r = '/' + rel.replace(/\\/g, '/').replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
  return r.length > 1 ? r.replace(/\/$/, '') : '/';
}

/** Does a site URL path exist in dist/? */
function existsInDist(urlPath) {
  const p = urlPath.split('#')[0].split('?')[0] || '/';
  if (p === '/') return fs.existsSync(path.join(DIST, 'index.html'));
  const clean = p.replace(/^\/|\/$/g, '');
  return [clean, `${clean}.html`, `${clean}/index.html`].some((f) => fs.existsSync(path.join(DIST, f)));
}

function htmlFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '_astro') continue; // bundled assets
      out.push(...htmlFiles(full));
    } else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

// ---------- og:image files ----------
const OG_MAX_BYTES = 300 * 1024; // WhatsApp drops preview images over 300KB
const ogChecked = new Map(); // pathname -> already reported
function checkOgImage(where, pathname) {
  if (ogChecked.has(pathname)) return;
  ogChecked.set(pathname, true);
  const file = path.join(DIST, decodeURIComponent(pathname).replace(/^\//, ''));
  if (!/\.(jpe?g|png)$/i.test(pathname)) warn(where, `og:image ${pathname} should be a JPG or PNG (WhatsApp skips WebP/SVG previews)`);
  if (!fs.existsSync(file)) {
    warn(where, `og:image file ${pathname} is not in dist/: add a 1200x630 JPG under 300KB to public${pathname}`);
    return;
  }
  const bytes = fs.statSync(file).size;
  if (bytes > OG_MAX_BYTES) fail(where, `og:image ${pathname} is ${(bytes / 1024).toFixed(1)}KB; WhatsApp drops previews over 300KB`);
}

// ---------- 1. every built page ----------
/**
 * Audits one page. Exported shape kept simple so the same checks can run anywhere.
 * Returns { route, indexable, canonical, hireSlug }.
 */
export function auditPage(rel, html) {
  const route = routeOf(rel);
  const where = rel.replace(/\\/g, '/');
  const robots = attr(html, /<meta\s[^>]*name=["']robots["'][^>]*>/i, 'content') ?? '';
  const indexable = !/noindex/i.test(robots);

  for (const p of PLACEHOLDERS) if (html.includes(p)) fail(where, `contains placeholder or dev address "${p}"`);

  // Title and description
  const title = norm(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  if (!title) fail(where, 'missing or empty <title>');
  const desc = attr(html, /<meta\s[^>]*name=["']description["'][^>]*>/i, 'content') ?? '';
  if (indexable && desc.trim().length < 50) fail(where, `meta description missing or under 50 characters (${desc.trim().length})`);

  // Exactly one non-empty <h1> on pages search engines index. Hidden pages (login) may swap
  // several hidden <h1> panels, so they only need at least one.
  const h1s = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) ?? [];
  if (indexable ? h1s.length !== 1 : h1s.length === 0) fail(where, `expected ${indexable ? 'exactly 1' : 'at least 1'} <h1>, found ${h1s.length}`);
  else if (!text(h1s[0]).trim()) fail(where, '<h1> is empty');

  if (!indexable) return { route, indexable, canonical: null, hireSlug: null }; // 404, login: no canonical/schema needed

  // Canonical: https, our domain, no trailing slash except the homepage
  const canonical = attr(html, /<link\s[^>]*rel=["']canonical["'][^>]*>/i, 'href');
  if (!canonical) fail(where, 'missing <link rel="canonical">');
  else {
    let u;
    try {
      u = new URL(canonical);
    } catch {
      fail(where, `canonical is not a valid URL: ${canonical}`);
    }
    if (u) {
      if (u.origin !== SITE) fail(where, `canonical must be on ${SITE} (found ${canonical})`);
      if (u.pathname !== '/' && u.pathname.endsWith('/')) fail(where, `canonical has a trailing slash: ${canonical}`);
      if (!existsInDist(u.pathname)) fail(where, `canonical points to a page that wasn't built: ${u.pathname}`);
    }
  }

  if (!/<link\s[^>]*rel=["']alternate["'][^>]*href=["']\/llms\.txt["']/i.test(html)) warn(where, 'missing <link rel="alternate" href="/llms.txt">');
  if (!/<meta\s[^>]*property=["']og:title["']/i.test(html)) fail(where, 'missing og:title');

  // og:image: absolute https URL on our domain, file built, under WhatsApp's 300KB limit
  const ogImage = attr(html, /<meta\s[^>]*property=["']og:image["'][^>]*>/i, 'content');
  if (!ogImage) fail(where, 'missing og:image');
  else if (!ogImage.startsWith('https://')) fail(where, `og:image must be an absolute https:// URL (found "${ogImage}")`);
  else {
    const u = new URL(ogImage);
    if (u.origin !== SITE) warn(where, `og:image is hosted outside ${SITE}: ${ogImage}`);
    else checkOgImage(where, u.pathname);
    const head = html.slice(0, html.search(/<\/head>/i) + 1 || html.length);
    const ogAt = head.search(/property=["']og:image["']/i);
    const ldAt = head.search(/application\/ld\+json/i);
    if (ldAt !== -1 && ogAt > ldAt) warn(where, 'og:image comes after the JSON-LD block; keep link-preview tags near the top of <head>');
  }

  // JSON-LD: valid JSON, one connected @graph, every @id reference resolves
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (blocks.length === 0) fail(where, 'no JSON-LD block');
  if (blocks.length > 1) warn(where, `${blocks.length} separate JSON-LD blocks (expected one @graph)`);
  const nodes = [];
  for (const b of blocks) {
    try {
      const data = JSON.parse(b[1]);
      nodes.push(...(Array.isArray(data['@graph']) ? data['@graph'] : [data]));
    } catch (e) {
      fail(where, `invalid JSON-LD: ${e.message}`);
    }
  }
  const ids = new Set(nodes.map((n) => n['@id']).filter(Boolean));
  const refs = [];
  const collect = (v) => {
    if (Array.isArray(v)) v.forEach(collect);
    else if (v && typeof v === 'object') {
      if (Object.keys(v).length === 1 && typeof v['@id'] === 'string') refs.push(v['@id']);
      else Object.values(v).forEach(collect);
    }
  };
  nodes.forEach((n) => Object.entries(n).forEach(([k, v]) => k !== '@id' && collect(v)));
  for (const r of new Set(refs)) if (!ids.has(r)) fail(where, `JSON-LD references "${r}" but no node has that @id`);

  const org = nodes.find((n) => n['@type'] === 'Organization');
  if (!org || org['@id'] !== ORG_ID) fail(where, `Organization node with @id ${ORG_ID} missing`);
  if (JSON.stringify(nodes).includes('aggregateRating')) fail(where, 'aggregateRating found: only publish ratings that are shown on the page');

  // FAQPage must match the visible page word for word (questions and answers)
  const pageText = text(html);
  for (const faq of nodes.filter((n) => n['@type'] === 'FAQPage')) {
    if (!Array.isArray(faq.mainEntity) || faq.mainEntity.length === 0) fail(where, 'FAQPage has no questions');
    for (const q of faq.mainEntity ?? []) {
      if (!pageText.includes(norm(q.name))) fail(where, `FAQ question not visible on page: "${q.name}"`);
      if (!pageText.includes(norm(q.acceptedAnswer?.text ?? ''))) fail(where, `FAQ answer not visible on page for: "${q.name}"`);
    }
  }

  // /hire pages: Service tied to the Organization, FAQ present, one language tag per FAQ item
  let hireSlug = null;
  const m = route.match(/^\/hire\/([a-z0-9-]+)$/);
  if (m) {
    hireSlug = m[1];
    const svc = nodes.find((n) => n['@type'] === 'Service');
    if (!svc) fail(where, 'missing Service node');
    else if (svc.provider?.['@id'] !== ORG_ID) fail(where, `Service.provider must be {"@id": "${ORG_ID}"}`);
    if (!nodes.some((n) => n['@type'] === 'FAQPage')) fail(where, 'missing FAQPage node');
    if (!/<details\b[^>]*\blang=["'](sn|nd)["']/i.test(html)) fail(where, 'no ChiShona (sn) or IsiNdebele (nd) FAQ <details> found');
  }

  // /workers: WebPage + HowTo + FAQPage, tied to the Organization, never JobPosting
  if (route === '/workers') {
    for (const type of ['WebPage', 'HowTo', 'FAQPage', 'BreadcrumbList'])
      if (!nodes.some((n) => n['@type'] === type)) fail(where, `missing ${type} node`);
    const page = nodes.find((n) => n['@type'] === 'WebPage');
    if (page && page.about?.['@id'] !== ORG_ID) fail(where, `WebPage.about must be {"@id": "${ORG_ID}"}`);
    if (page && page.isPartOf?.['@id'] !== `${SITE}/#website`) fail(where, `WebPage.isPartOf must be {"@id": "${SITE}/#website"}`);
    const howto = nodes.find((n) => n['@type'] === 'HowTo');
    for (const st of howto?.step ?? []) if (!pageText.includes(norm(st.name)) || !pageText.includes(norm(st.text))) fail(where, `HowTo step not visible on page: "${st.name}"`);
    if (nodes.some((n) => n['@type'] === 'JobPosting')) fail(where, 'JobPosting is not allowed on the sign-up page');
  }

  return { route, indexable, canonical, hireSlug };
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('dist/ not found. Run `astro build` first.');
    process.exit(1);
  }
  const files = htmlFiles(DIST);
  if (files.length === 0) {
    console.error('No HTML files in dist/.');
    process.exit(1);
  }

  const pages = files.map((f) => auditPage(path.relative(DIST, f), fs.readFileSync(f, 'utf-8')));
  const homepage = pages.find((p) => p.route === '/');
  if (!homepage) fail('dist/index.html', 'homepage missing');
  if (!pages.some((p) => p.route === '/workers')) fail('dist/workers.html', 'the /workers page was not built');
  const builtHire = new Set(pages.map((p) => p.hireSlug).filter(Boolean));

  // ---------- 2. llms.txt: format, every link built, every /hire page listed ----------
  const llmsFile = path.join(DIST, 'llms.txt');
  if (!fs.existsSync(llmsFile)) fail('dist/llms.txt', 'missing');
  else {
    const llms = fs.readFileSync(llmsFile, 'utf-8');
    if (!llms.startsWith('# Hustlr\n')) fail('dist/llms.txt', 'must start with "# Hustlr" (llmstxt.org format)');
    if (!/^> /m.test(llms)) fail('dist/llms.txt', 'missing "> " summary line');
    const h1s = llms.match(/^# /gm) ?? [];
    if (h1s.length !== 1) fail('dist/llms.txt', `expected one "# " heading, found ${h1s.length}`);
    if (/^#{3,} /m.test(llms)) fail('dist/llms.txt', 'uses ### headings; only one # and ## link sections are allowed');
    const links = [...llms.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((x) => x[1]);
    const listedHire = new Set();
    for (const link of links) {
      const u = new URL(link);
      if (u.origin !== SITE) fail('dist/llms.txt', `link not on ${SITE}: ${link}`);
      if (!existsInDist(u.pathname)) fail('dist/llms.txt', `links ${u.pathname}, which wasn't built`);
      const hm = u.pathname.match(/^\/hire\/([a-z0-9-]+)$/);
      if (hm) listedHire.add(hm[1]);
    }
    for (const slug of builtHire) if (!listedHire.has(slug)) fail('dist/llms.txt', `built page /hire/${slug} is not listed`);
    if (!links.some((l) => new URL(l).pathname === '/workers')) fail('dist/llms.txt', '/workers is not listed');
    for (const p of PLACEHOLDERS) if (llms.includes(p)) fail('dist/llms.txt', `contains placeholder or dev address "${p}"`);
  }

  // ---------- 3. robots.txt ----------
  const robotsFile = path.join(DIST, 'robots.txt');
  if (!fs.existsSync(robotsFile)) fail('dist/robots.txt', 'missing');
  else {
    const robots = fs.readFileSync(robotsFile, 'utf-8');
    for (const bot of AI_BOTS) if (!robots.includes(`User-agent: ${bot}`)) warn('dist/robots.txt', `${bot} not listed`);
    if (!robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`)) fail('dist/robots.txt', `missing "Sitemap: ${SITE}/sitemap-index.xml"`);
  }

  // ---------- 4. sitemaps: present, every URL built, every main-version page listed ----------
  for (const f of ['sitemap-index.xml', 'sitemap.xml']) if (!fs.existsSync(path.join(DIST, f))) fail(`dist/${f}`, 'missing');
  const smFile = path.join(DIST, 'sitemap.xml');
  if (fs.existsSync(smFile)) {
    const locs = [...fs.readFileSync(smFile, 'utf-8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]);
    const inSitemap = new Set(locs.map((l) => new URL(l).pathname));
    for (const l of locs) {
      const u = new URL(l);
      if (u.origin !== SITE) fail('dist/sitemap.xml', `URL not on ${SITE}: ${l}`);
      if (!existsInDist(u.pathname)) fail('dist/sitemap.xml', `lists ${u.pathname}, which wasn't built`);
    }
    for (const p of pages) {
      if (!p.indexable || !p.canonical) continue;
      const self = new URL(p.canonical).pathname === p.route;
      if (self && !inSitemap.has(p.route)) fail('dist/sitemap.xml', `indexable page ${p.route} is missing`);
      if (!self && inSitemap.has(p.route)) fail('dist/sitemap.xml', `${p.route} is listed but its canonical points to ${p.canonical}`);
    }
  }

  // ---------- report ----------
  console.log(`\nSEO audit: ${pages.length} HTML pages, ${builtHire.size} /hire pages, Organization ${ORG_ID}`);
  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    warnings.forEach((w) => console.warn('  ' + w));
  }
  if (errors.length) {
    console.error(`\nSEO audit failed with ${errors.length} problem(s):`);
    errors.forEach((e) => console.error('  ' + e));
    process.exit(1);
  }
  console.log('\n[PASS] Pages, canonicals, JSON-LD graphs, FAQ parity, sitemap and llms.txt all check out.\n');
}

// Run when called directly (node scripts/audit-seo.mjs), not when imported
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
