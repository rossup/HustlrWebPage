// Builds /llms.txt: a plain-Markdown map of the site for AI assistants (llmstxt.org format:
// one H1, a > summary, plain context, then ## sections that only hold [Title](URL): description links).
// Every link comes from the same data that builds the pages, so it can never point at a page
// that wasn't built. Written to public/llms.txt by src/integrations/generateLlmsTxt.ts.
import { seoCities, seoServices, PHONE } from '../data/seo';
import { ACTIVE_TRADES, ACTIVE_CITIES } from '../data/tradeCityData';

const list = (items: string[]) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

export function buildLlmsTxt(siteUrl: string): string {
  const S = siteUrl.replace(/\/$/, '');
  const towns = seoCities.map((c) => c.name);
  const pageTrades = seoServices.map((s) => s.plural.toLowerCase());
  const hireOnly = ACTIVE_TRADES.filter((t) => !seoServices.some((s) => s.slug === t.mainPageSlug)).map((t) => t.plural.toLowerCase());
  const vernacular = { sn: 'ChiShona', nd: 'IsiNdebele' } as const;

  const lines: string[] = [
    '# Hustlr',
    '',
    '> Hustlr is an AI-powered marketplace that runs inside WhatsApp in Zimbabwe. Homeowners and businesses describe a job in English, ChiShona or IsiNdebele, and Hustlr matches them with vetted local skilled workers nearby. No app download is needed.',
    '',
    `Hustlr (${S.replace(/^https?:\/\//, '')}, WhatsApp ${PHONE}) is built by Zimnovate in Zimbabwe. It is not affiliated with other businesses, agencies or apps named Hustlr outside Zimbabwe.`,
    '',
    'How a booking works: the client messages Hustlr on WhatsApp and describes the job in plain words or a voice note. Hustlr works out the trade and the area, suggests verified providers who cover it, and shows a provider’s profile on request. The client replies YES to send the booking request, the provider confirms in the chat, and the client can reply SAVE to rebook that provider later. Asking for a match is free; the client agrees the price with the provider before work starts. Skilled workers join by messaging "I want to register as a service provider" and listing their trade and the areas they cover.',
    '',
    'Key facts:',
    '- Platform: WhatsApp (no separate app)',
    `- Region: Zimbabwe, including ${list(towns)}`,
    '- Languages: English, ChiShona, IsiNdebele',
    `- Trades with their own pages: ${list([...pageTrades, ...hireOnly])}. Clients can also ask the chat for other trades, such as carpenters and appliance repair.`,
    '- Users: households, small businesses, property managers, and independent tradespeople',
    '',
    '## Core pages',
    '',
    `- [Hustlr homepage](${S}/): What Hustlr is, how WhatsApp matching works, who it serves, and the WhatsApp contact.`,
    `- [Find a pro](${S}/hire): Every trade and town page in one place, grouped by city and service.`,
    `- [FAQ](${S}/#questions): Short answers on how Hustlr works, trades, app-free use, cities and languages.`,
    `- [For Skilled Workers](${S}/workers): Registration guide and onboarding requirements for Zimbabwean tradespeople seeking verified client leads via WhatsApp.`,
    '',
    '## Services',
    '',
    ...seoServices.map((s) => `- [${s.plural} in Zimbabwe](${S}/${s.slug}): ${s.plural} for ${s.summary}, with links to each town.`),
    '',
    '## Towns',
    '',
    ...seoCities.map((c) => `- [Services in ${c.name}](${S}/areas/${c.slug}): ${list(seoServices.map((s, i) => (i === 0 ? s.plural : s.plural.toLowerCase())))} who work in ${c.name}.`),
    '',
    `## Local Trade Pages`,
    '',
    ...ACTIVE_CITIES.flatMap((c) =>
      ACTIVE_TRADES.map((t) => {
        const tasks = t.commonTasks.slice(0, 2).map((x) => x.charAt(0).toLowerCase() + x.slice(1)).join('; ');
        const price = t.typicalRateUsd ? ` Typical price: ${t.typicalRateUsd}.` : '';
        return `- [${t.plural} in ${c.name}](${S}/hire/${t.slug}-${c.slug}): Hire ${t.plural.toLowerCase()} in ${c.name} on WhatsApp (${tasks}); FAQ in English and ${vernacular[c.primaryVernacular]}.${price}`;
      }),
    ),
    '',
    '## Optional',
    '',
    ...seoServices.flatMap((s) => seoCities.map((c) => `- [${s.plural} in ${c.name}](${S}/${s.slug}/${c.slug}): Book ${s.plural.toLowerCase()} in ${c.name} on WhatsApp.`)),
    `- [Sitemap](${S}/sitemap-index.xml): Machine-readable list of every public page.`,
    `- [Privacy policy](${S}/privacy): How Hustlr handles personal information.`,
    `- [Terms and conditions](${S}/terms): Terms for using Hustlr.`,
    '',
  ];
  return lines.join('\n');
}
