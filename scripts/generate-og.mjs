// Generates the two WhatsApp/social preview cards in public/:
//   og-default.jpg  (customers; used on every page unless a page sets its own)
//   og-workers.jpg  (tradespeople; used on /workers)
// Run with `npm run gen:og` after changing the copy below, then commit the JPGs.
//
// All text sits inside a centred 600x520 card, so WhatsApp's square crop of forwarded
// links (the middle 630x630) never cuts a word. Uses sharp, which Astro already installs.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve('public');
const MAX_BYTES = 150 * 1024; // our ceiling; WhatsApp's hard limit is 300KB
const FONT = "Inter, 'Segoe UI', system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif";

// Brand colours (src/styles/home.css)
const C = { ink: '#0b1f16', ink2: '#12301f', card: '#0e2a1c', yellow: '#f4c20d', mint: '#3dcc8d', mintSoft: '#8fd1a8', text: '#f4f1ea', body: '#c5d4cb' };

/** Escape text for SVG. Pass raw strings ("Tilers & Mechanics"), never pre-escaped ones. */
const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// Hustlr wordmark, embedded so the card needs no external files
const logoSvg = fs.readFileSync(path.join(PUBLIC_DIR, 'assets', 'logo-reverse.svg'), 'utf-8');
const logoInner = logoSvg.slice(logoSvg.indexOf('>', logoSvg.indexOf('<svg')) + 1, logoSvg.lastIndexOf('</svg>'));

function bannerSvg({ badge, line1, line2, subtitle, pills }) {
  const pillW = 176;
  const gap = 14;
  const startX = Math.round((1200 - (pills.length * pillW + (pills.length - 1) * gap)) / 2);
  const pillSvg = pills
    .map((label, i) => {
      const x = startX + i * (pillW + gap);
      const first = i === 0;
      return `<g transform="translate(${x} 470)">
        <rect width="${pillW}" height="44" rx="22" fill="${first ? C.yellow : 'none'}" stroke="${first ? C.yellow : C.mint}" stroke-opacity="${first ? 1 : 0.6}" stroke-width="1.5"/>
        <text x="${pillW / 2}" y="28.5" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="700" fill="${first ? C.ink : C.text}">${escapeXml(label)}</text>
      </g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.ink}"/>
      <stop offset="1" stop-color="${C.ink2}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="110" cy="90" r="200" fill="${C.mint}" fill-opacity="0.07"/>
  <circle cx="1100" cy="560" r="230" fill="${C.yellow}" fill-opacity="0.07"/>

  <!-- Safe zone: everything readable stays inside this 600x520 card -->
  <rect x="300" y="55" width="600" height="520" rx="28" fill="${C.card}" fill-opacity="0.85" stroke="${C.mint}" stroke-opacity="0.3" stroke-width="2"/>

  <svg x="525" y="84" width="150" height="54" viewBox="42 52 446 160" fill="none">${logoInner}</svg>

  <rect x="${600 - 175}" y="160" width="350" height="36" rx="18" fill="${C.mint}" fill-opacity="0.14"/>
  <text x="600" y="184" text-anchor="middle" font-family="${FONT}" font-size="14.5" font-weight="800" letter-spacing="1.6" fill="${C.mintSoft}">${escapeXml(badge)}</text>

  <text x="600" y="262" text-anchor="middle" font-family="${FONT}" font-size="46" font-weight="800" letter-spacing="-1.2" fill="${C.text}">${escapeXml(line1)}</text>
  <text x="600" y="318" text-anchor="middle" font-family="${FONT}" font-size="46" font-weight="800" letter-spacing="-1.2" fill="${C.yellow}">${escapeXml(line2)}</text>

  <text x="600" y="378" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="500" fill="${C.body}">${escapeXml(subtitle)}</text>
  <text x="600" y="420" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="700" fill="${C.mintSoft}">English • ChiShona • IsiNdebele</text>

  ${pillSvg}
</svg>`;
}

const BANNERS = [
  {
    filename: 'og-default.jpg',
    badge: 'WHATSAPP TRADES MARKETPLACE',
    line1: 'Hire Vetted Skilled',
    line2: 'Workers on WhatsApp',
    subtitle: 'Plumbers, Solar, Electricians, Tilers & Mechanics',
    pills: ['No App Needed', 'Vetted Pros', 'Zim-Wide'],
  },
  {
    filename: 'og-workers.jpg',
    badge: 'FOR ZIMBABWEAN TRADESPEOPLE',
    line1: 'Get Verified Client',
    line2: 'Jobs on WhatsApp',
    subtitle: 'Free Worker Registration • Local Suburb Leads',
    pills: ['Free Signup', 'No App Needed', 'Direct Quotes'],
  },
];

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
for (const b of BANNERS) {
  const out = path.join(PUBLIC_DIR, b.filename);
  await sharp(Buffer.from(bannerSvg(b)))
    .resize(1200, 630)
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(out);
  const bytes = fs.statSync(out).size;
  if (bytes > MAX_BYTES) {
    console.error(`[FAIL] public/${b.filename} is ${bytes} bytes (${(bytes / 1024).toFixed(1)}KB), over the 150KB ceiling`);
    process.exit(1);
  }
  console.log(`[PASS] public/${b.filename}: ${bytes} bytes (${(bytes / 1024).toFixed(1)}KB), 1200x630`);
}
