// Post-deploy: tell IndexNow (Bing, Yandex and other engines that share it) about every page
// in the sitemap. Run AFTER the deploy is live, never as part of the build:
//   npm run ping:indexnow
// Zero dependencies: Node built-ins and fetch only (Node 18+).
//
// IndexNow checks ownership by fetching https://<host>/<key>.txt, so this script confirms that
// file is live and matches before it submits anything.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10000; // IndexNow's per-request limit

const stop = (msg) => {
  console.error(`[FAIL] ${msg}`);
  process.exit(1);
};

// ---------- key: environment first, then the local .env ----------
function keyFromDotEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return undefined;
  for (const line of fs.readFileSync(file, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^\s*INDEXNOW_KEY\s*=\s*["']?([^"'\s#]+)["']?/);
    if (m) return m[1];
  }
  return undefined;
}
const apiKey = (process.env.INDEXNOW_KEY || keyFromDotEnv() || '').trim();
if (!/^[a-zA-Z0-9-]{8,128}$/.test(apiKey)) stop('INDEXNOW_KEY is missing or invalid (8-128 letters, digits or dashes). Set it in .env or the environment.');

// ---------- URLs: every <loc> in the built sitemaps ----------
if (!fs.existsSync(DIST)) stop('dist/ not found. Run `npm run build` (and deploy) first.');
// sitemap.xml (ours) and sitemap-0.xml, sitemap-1.xml... (@astrojs/sitemap); sitemap-index.xml only lists sitemaps, so skip it
const sitemaps = fs.readdirSync(DIST).filter((f) => /^sitemap(-\d+)?\.xml$/.test(f));
if (sitemaps.length === 0) stop('no sitemap.xml or sitemap-N.xml in dist/.');
const urls = new Set();
for (const f of sitemaps) {
  for (const m of fs.readFileSync(path.join(DIST, f), 'utf-8').matchAll(/<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/gi)) urls.add(m[1]);
}
const urlList = [...urls];
if (urlList.length === 0) stop('no <loc> URLs found in the sitemaps.');
const host = new URL(urlList[0]).host;
const foreign = urlList.filter((u) => new URL(u).host !== host);
if (foreign.length) stop(`all URLs must be on ${host}; found ${foreign.length} on other hosts (e.g. ${foreign[0]}).`);
if (urlList.length > MAX_URLS) stop(`${urlList.length} URLs is over IndexNow's ${MAX_URLS} limit per request; split the submission.`);

// ---------- pre-flight: is the key file live? ----------
const keyLocation = `https://${host}/${apiKey}.txt`;
console.log(`Checking ${keyLocation} ...`);
let live;
try {
  live = await fetch(keyLocation, { redirect: 'follow', headers: { 'cache-control': 'no-cache' } });
} catch (e) {
  stop(`couldn't reach ${keyLocation} (${e.message}). Is the site deployed and online?`);
}
const body = live.ok ? (await live.text()).trim() : '';
if (!live.ok) stop(`${keyLocation} returned HTTP ${live.status}. Deploy the site (with public/${apiKey}.txt) and run this again.`);
if (body !== apiKey) stop(`${keyLocation} is live but doesn't contain the key from INDEXNOW_KEY. Check public/${apiKey}.txt matches .env.`);

// ---------- submit ----------
console.log(`Submitting ${urlList.length} URLs for ${host} to IndexNow ...`);
let res;
try {
  res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: apiKey, keyLocation, urlList }),
  });
} catch (e) {
  stop(`couldn't reach ${ENDPOINT} (${e.message}).`);
}
if (res.status === 200 || res.status === 202) {
  console.log(`[PASS] IndexNow accepted ${urlList.length} URLs (HTTP ${res.status}${res.status === 202 ? ', key verification pending' : ''}).`);
} else {
  const hint = { 400: 'bad request format', 403: 'key not valid for this host', 422: 'URLs don\'t belong to the host or key mismatch', 429: 'too many requests, try later' }[res.status] ?? '';
  stop(`IndexNow rejected the submission (HTTP ${res.status}${hint ? `: ${hint}` : ''}). ${(await res.text()).slice(0, 300)}`);
}
