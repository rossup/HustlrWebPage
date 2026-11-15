// Builds the content and structured data for the search landing pages:
//   /plumbers            one service, all towns
//   /areas/harare        one town, all services
//   /plumbers/harare     one service in one town
import { WA } from '../data/site';
import { PHONE, SITE_URL, seoCities, seoServices, type SeoCity, type SeoService } from '../data/seo';

export interface Crumb { name: string; href: string }
export interface Faq { q: string; a: string }
export interface LinkItem { label: string; href: string; note?: string }

export interface Landing {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  /** Prefilled WhatsApp link */
  waHref: string;
  /** The example message shown on the page */
  example: string;
  crumbs: Crumb[];
  /** "What you can book" list */
  jobsTitle?: string;
  jobs?: string[];
  /** Suburbs list */
  areasTitle?: string;
  areas?: string[];
  /** Main link grid (towns for a service, services for a town) */
  linksTitle: string;
  links: LinkItem[];
  /** Secondary links */
  moreTitle?: string;
  more?: LinkItem[];
  faqs: Faq[];
  schema: object[];
}

const wa = (text: string) => `${WA}?text=${encodeURIComponent(text)}`;
const list = (items: string[]) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
const abs = (path: string) => `${SITE_URL}${path}`;
const ORG = { '@id': `${SITE_URL}/#organization` };

const breadcrumbSchema = (crumbs: Crumb[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.href) })),
});
export const faqSchema = (faqs: Faq[], pagePath = '/') => ({
  '@type': 'FAQPage',
  '@id': `${abs(pagePath)}#faq`,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});
const cityPlace = (c: SeoCity) => ({
  '@type': 'City',
  name: c.name,
  containedInPlace: { '@type': 'Country', name: 'Zimbabwe' },
});
const serviceSchema = (s: SeoService, path: string, name: string, area: object | object[]) => ({
  '@type': 'Service',
  '@id': `${abs(path)}#service`,
  name,
  serviceType: s.trade,
  url: abs(path),
  provider: ORG,
  areaServed: area,
  availableChannel: {
    '@type': 'ServiceChannel',
    name: 'WhatsApp',
    serviceUrl: WA,
    servicePhone: { '@type': 'ContactPoint', telephone: '+263719351207', contactType: 'customer service' },
  },
});

const sharedFaqs = (who: string): Faq[] => [
  {
    q: 'Do I need to download an app?',
    a: `No. Hustlr works inside WhatsApp. Save ${PHONE} or tap the button on this page, then say what you need.`,
  },
  {
    q: `I am a ${who}. How do I get jobs through Hustlr?`,
    a: 'Message Hustlr on WhatsApp and say you want to register as a service provider. Share your name, business, trade and the areas you cover, then reply YES to take the booking requests that come in.',
  },
];

// ---------- /plumbers/harare ----------
export function serviceCityLanding(s: SeoService, c: SeoCity): Landing {
  const path = `/${s.slug}/${c.slug}`;
  const firstArea = c.areas[0];
  const example = s.ask.replace('{area}', firstArea);
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: s.plural, href: `/${s.slug}` },
    { name: c.name, href: path },
  ];
  const faqs: Faq[] = [
    {
      q: `How do I find a ${s.singular} in ${c.name}?`,
      a: `Message Hustlr on WhatsApp (${PHONE}) and describe the job, for example “${example}”. Hustlr suggests ${s.plural.toLowerCase()} who cover your part of ${c.name}, shows you their profile, and sends your booking request to the one you pick.`,
    },
    {
      q: `How much does a ${s.singular} cost in ${c.name}?`,
      a: `It depends on the job. Asking Hustlr to find a ${s.singular} is free, and you agree the price directly with the provider before any work starts.`,
    },
    {
      q: `Which parts of ${c.name} are covered?`,
      a: `Providers list the suburbs they work in, such as ${list(c.areas.slice(0, 6))}. If your area is not listed, say where you are in the chat and Hustlr will check who covers it.`,
    },
    ...sharedFaqs(`${s.singular} in ${c.name}`),
  ];
  return {
    path,
    title: `${s.plural} in ${c.name} | Book on WhatsApp – Hustlr`,
    description: `Need a ${s.singular} in ${c.name}? Find and book local ${s.plural.toLowerCase()} for ${s.summary} in one WhatsApp chat. Free to ask, no app needed.`,
    eyebrow: `${s.plural} · ${c.name}`,
    h1: `${s.plural} in ${c.name}, booked on WhatsApp`,
    lead: `Tell Hustlr what needs doing and where. You get ${s.plural.toLowerCase()} who work in your part of ${c.name}, see their profile, and book with one reply.`,
    waHref: wa(`Hi Hustlr, I need a ${s.singular} in ${c.name}`),
    example,
    crumbs,
    jobsTitle: `What you can book a ${s.singular} for`,
    jobs: s.jobs,
    areasTitle: `Areas of ${c.name}`,
    areas: c.areas,
    linksTitle: `More services in ${c.name}`,
    links: seoServices
      .filter((o) => o.slug !== s.slug)
      .map((o) => ({ label: `${o.plural} in ${c.name}`, href: `/${o.slug}/${c.slug}`, note: o.summary })),
    moreTitle: `${s.plural} in other towns`,
    more: seoCities.filter((o) => o.slug !== c.slug).map((o) => ({ label: `${s.plural} in ${o.name}`, href: `/${s.slug}/${o.slug}` })),
    faqs,
    schema: [serviceSchema(s, path, `${s.plural} in ${c.name}`, cityPlace(c)), breadcrumbSchema(crumbs), faqSchema(faqs, path)],
  };
}

// ---------- /plumbers ----------
export function serviceLanding(s: SeoService): Landing {
  const path = `/${s.slug}`;
  const example = s.ask.replace('{area}', 'Avondale, Harare');
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: s.plural, href: path },
  ];
  const towns = seoCities.map((c) => c.name);
  const faqs: Faq[] = [
    {
      q: `How do I find a ${s.singular} near me in Zimbabwe?`,
      a: `Message Hustlr on WhatsApp (${PHONE}), say what needs doing and where you are, for example “${example}”. Hustlr suggests ${s.plural.toLowerCase()} who cover your area and sends your booking request to the one you choose.`,
    },
    {
      q: `Which towns can I find ${s.plural.toLowerCase()} in?`,
      a: `${list(towns)}, with more towns on the way. If your town is not listed, ask in the chat.`,
    },
    {
      q: `How much does a ${s.singular} cost?`,
      a: `It depends on the job. Asking Hustlr is free, and you agree the price directly with the provider before any work starts.`,
    },
    ...sharedFaqs(s.singular),
  ];
  return {
    path,
    title: `${s.plural} in Zimbabwe | Book on WhatsApp – Hustlr`,
    description: `Find and book ${s.plural.toLowerCase()} in Harare, Bulawayo, Mutare and across Zimbabwe for ${s.summary}. One WhatsApp chat, free to ask, no app needed.`,
    eyebrow: `${s.plural} · Zimbabwe`,
    h1: `${s.plural} near you, booked on WhatsApp`,
    lead: `${s.plural} for ${s.summary}, in ${list(towns.slice(0, 4))} and more. Say what you need and Hustlr finds who does it.`,
    waHref: wa(`Hi Hustlr, I need a ${s.singular}`),
    example,
    crumbs,
    jobsTitle: `What you can book a ${s.singular} for`,
    jobs: s.jobs,
    linksTitle: `${s.plural} by town`,
    links: seoCities.map((c) => ({ label: `${s.plural} in ${c.name}`, href: `/${s.slug}/${c.slug}`, note: list(c.areas.slice(0, 3)) })),
    moreTitle: 'Other services',
    more: seoServices.filter((o) => o.slug !== s.slug).map((o) => ({ label: o.plural, href: `/${o.slug}` })),
    faqs,
    schema: [
      serviceSchema(s, path, `${s.plural} in Zimbabwe`, seoCities.map(cityPlace)),
      breadcrumbSchema(crumbs),
      faqSchema(faqs, path),
    ],
  };
}

// ---------- /areas/harare ----------
export function cityLanding(c: SeoCity): Landing {
  const path = `/areas/${c.slug}`;
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: c.name, href: path },
  ];
  const trades = seoServices.map((s) => s.plural.toLowerCase());
  const example = seoServices[0].ask.replace('{area}', c.areas[0]);
  const faqs: Faq[] = [
    {
      q: `What services can I book in ${c.name}?`,
      a: `${list(seoServices.map((s) => s.plural))}, with more trades on the way. Not sure who you need? Describe the job in the chat.`,
    },
    {
      q: `How do I book a service in ${c.name}?`,
      a: `Message Hustlr on WhatsApp (${PHONE}) and say what needs doing and where, for example “${example}”. Pick a provider, reply YES, and the provider messages you to confirm.`,
    },
    {
      q: 'How much does it cost?',
      a: 'Asking Hustlr is free. You agree the price for the job directly with the provider before any work starts.',
    },
    ...sharedFaqs(`service provider in ${c.name}`),
  ];
  return {
    path,
    title: `Plumbers, Electricians & Cleaners in ${c.name} – Hustlr`,
    description: `Book ${list(trades)} in ${c.name}, from ${list(c.areas.slice(0, 3))} and more, in one WhatsApp chat. Free to ask, no app needed.`,
    eyebrow: `${c.name} · ${c.province}`,
    h1: `Local services in ${c.name}, booked on WhatsApp`,
    lead: `${list(seoServices.map((s) => s.plural))} who work in ${c.name}. Say what you need and where, and Hustlr finds who does it.`,
    waHref: wa(`Hi Hustlr, I need help with a job in ${c.name}`),
    example,
    crumbs,
    areasTitle: `Areas of ${c.name}`,
    areas: c.areas,
    linksTitle: `Services in ${c.name}`,
    links: seoServices.map((s) => ({ label: `${s.plural} in ${c.name}`, href: `/${s.slug}/${c.slug}`, note: s.summary })),
    moreTitle: 'Other towns',
    more: seoCities.filter((o) => o.slug !== c.slug).map((o) => ({ label: o.name, href: `/areas/${o.slug}` })),
    faqs,
    schema: [
      {
        '@type': 'CollectionPage',
        '@id': `${abs(path)}#page`,
        name: `Local services in ${c.name}`,
        url: abs(path),
        about: cityPlace(c),
        publisher: ORG,
      },
      breadcrumbSchema(crumbs),
      faqSchema(faqs, path),
    ],
  };
}
