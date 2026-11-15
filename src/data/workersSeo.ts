// /workers: the page for tradespeople who want to join Hustlr. Steps and FAQs live here so
// the visible page and its structured data (HowTo, FAQPage) always match word for word.
// Uses WebPage + HowTo, not JobPosting: Hustlr isn't an employer offering a salaried job.
import { SITE_URL } from './seo';

export interface WorkerFaqItem {
  question: string;
  answer: string;
  lang: 'en' | 'sn' | 'nd';
}

export interface WorkerStep {
  step: number;
  title: string;
  detail: string;
}

export const WORKERS_PATH = '/workers';
export const WORKER_WA_TEXT = 'Hi Hustlr, I want to register as a skilled worker.';

export const WORKER_STEPS: WorkerStep[] = [
  {
    step: 1,
    title: "Send 'Join' on WhatsApp",
    detail:
      'Tap the registration button to open Hustlr on WhatsApp and select your primary trade and city, in English, ChiShona or IsiNdebele.',
  },
  {
    step: 2,
    title: 'Verify Your Trade & Location',
    detail:
      'Share your name, the suburbs and towns you work in (for example Harare, Bulawayo, Gweru or Mutare), your National ID, and proof of skill or photos of past work.',
  },
  {
    step: 3,
    title: 'Receive Local Client Requests',
    detail:
      'When a homeowner or business near you needs your trade, Hustlr sends the job details straight to your WhatsApp so you can quote and get hired.',
  },
];

export const WORKER_FAQS: WorkerFaqItem[] = [
  {
    lang: 'en',
    question: 'How do I register as a skilled worker on Hustlr in Zimbabwe?',
    answer:
      "Tap any 'Register on WhatsApp' button on this page to message Hustlr directly. Our WhatsApp assistant guides you through selecting your trade, choosing your city and suburbs, and completing quick profile verification in English, Shona, or Ndebele—no app download needed.",
  },
  {
    lang: 'en',
    question: 'Does it cost money to join Hustlr as a tradesperson?',
    answer:
      'Creating your worker profile and completing verification on WhatsApp is free. You only engage with real local client requests in your chosen trade and city, with clear terms explained upfront inside WhatsApp.',
  },
  {
    lang: 'en',
    question: 'Which trades and cities are currently onboarding workers?',
    answer:
      'Hustlr is actively onboarding vetted plumbers, solar system installers, electricians, tilers, painters, carpenters, mechanics, and appliance technicians across Harare, Bulawayo, Gweru, Mutare, and Masvingo.',
  },
  {
    lang: 'sn',
    question: 'Ndinojoiner sei paHustlr kuti ndiwane mabasa emaoko paWhatsApp?',
    answer:
      "Dzvanya bhatani rekuti 'Register on WhatsApp' utumire meseji kuHustlr neChiShona kana Chirungu. Unosarudza basa rako (seplumbing, solar, magetsi, matiles kana makanika), guta rako, wotumira umbowo hwebasa rako kuti utange kuwana makasitoma ari pedyo newe.",
  },
  {
    lang: 'nd',
    question: 'Ngingangena njani kuHustlr ukuze ngithole imisebenzi yezandla kuWhatsApp?',
    answer:
      "Cindezela u-'Register on WhatsApp' uthumele umlayezo kuHustlr ngesiNdebele kumbe ngesiNgisi. Khetha umsebenzi wakho (njenge-plumbing, solar, ugesi, amathayili kumbe ukulungisa izimota) ledolobho okulo ukuze uhlanganiswe lamakhasimende aseduze lawe.",
  },
];

const LANG_TAG = { en: 'en-ZW', sn: 'sn', nd: 'nd' } as const;

/** WebPage + HowTo + BreadcrumbList + FAQPage, linked to the site's Organization and WebSite by @id */
export function buildWorkersPageSchema() {
  const pageUrl = `${SITE_URL}${WORKERS_PATH}`;
  return {
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: 'Join Hustlr as a Skilled Worker | Get Jobs on WhatsApp in Zimbabwe',
        description:
          'Register free on WhatsApp to get verified client leads in Harare, Bulawayo and across Zimbabwe as a plumber, electrician, solar installer, tiler, painter or mechanic.',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        inLanguage: ['en-ZW', 'sn', 'nd'],
      },
      {
        '@type': 'HowTo',
        '@id': `${pageUrl}#howto`,
        name: 'How to Register as a Skilled Tradesperson on Hustlr via WhatsApp',
        description: 'Three-step WhatsApp sign-up for Zimbabwean artisans and technicians to receive local client requests.',
        totalTime: 'PT5M',
        isPartOf: { '@id': `${pageUrl}#webpage` },
        step: WORKER_STEPS.map((s) => ({ '@type': 'HowToStep', position: s.step, name: s.title, text: s.detail })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Hustlr Zimbabwe', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'For Skilled Workers', item: pageUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        isPartOf: { '@id': `${pageUrl}#webpage` },
        mainEntity: WORKER_FAQS.map((f) => ({
          '@type': 'Question',
          inLanguage: LANG_TAG[f.lang],
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', inLanguage: LANG_TAG[f.lang], text: f.answer },
        })),
      },
    ],
  };
}
