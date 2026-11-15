// Trade x City launch pages at /hire/{trade}-{city} (e.g. /hire/plumber-harare).
// Each entry builds one static page plus its structured data (see buildTradeCitySchema).
// Add a trade or a city here and the pages, links, sitemap entries and schema follow.
import { SITE_URL, seoCities } from './seo';

/** One question and answer, in English (en), ChiShona (sn) or IsiNdebele (nd) */
export interface FaqItem {
  question: string;
  answer: string;
  lang: 'en' | 'sn' | 'nd';
}

export interface TradeInfo {
  /** URL slug, e.g. "plumber" */
  slug: string;
  /** "Plumber" */
  singular: string;
  /** "Plumbers" */
  plural: string;
  /** schema.org serviceType */
  serviceType: string;
  /** Build this trade's pages? Set false until vetted workers are onboarded in these cities. */
  isActive: boolean;
  /** Short ChiShona and IsiNdebele phrases, shown as example messages */
  shona: string;
  ndebele: string;
  /** Longer everyday phrasing, used in the local-language FAQ answer */
  shonaActionPhrase: string;
  ndebeleActionPhrase: string;
  /** Jobs this trade is booked for */
  commonTasks: string[];
  /** Example WhatsApp message; {area} becomes a suburb */
  example: string;
  /**
   * Typical price with its unit, e.g. "$15 – $45 call-out & minor repair" or "$4 – $8 per m² (labor only)".
   * Shown on the page and in the Offer schema only when set. Leave undefined until the figure
   * is confirmed with real providers: a wrong published price misleads customers.
   * Suggested benchmarks to confirm are noted in RATE_BENCHMARKS below.
   */
  typicalRateUsd?: string;
  /** Slug of the matching /{slug}/{city} page from seo.ts, if one exists (that page is the main version) */
  mainPageSlug?: string;
}

export interface CityInfo {
  slug: string;
  name: string;
  region: string;
  /** Build this city's /hire pages? Defaults to true; set false until workers are onboarded there. */
  isActive?: boolean;
  /** The local language the city's FAQ adds next to English: ChiShona (sn) or IsiNdebele (nd) */
  primaryVernacular: 'sn' | 'nd';
  /** One or two sentences of local context */
  localContext: string;
  suburbs: string[];
}

export const TRADES: TradeInfo[] = [
  {
    slug: 'plumber',
    singular: 'Plumber',
    plural: 'Plumbers',
    serviceType: 'Plumbing and Pipe Repair Services',
    isActive: true,
    shona: 'muplamba / kugadzira pombi dzemvura',
    ndebele: 'ukulungisa amapayipi amanzi',
    shonaActionPhrase: 'kugadzira pombi dzemvura, geyser kana booster pump',
    ndebeleActionPhrase: 'ukulungisa amapayipi amanzi, igeyser kumbe ibooster pump',
    commonTasks: [
      'Burst pipe and leak detection',
      'Geyser installation and element replacement',
      'Borehole and JoJo tank booster pump plumbing',
      'Blocked drains and bathroom fittings',
    ],
    example: 'My geyser is leaking in {area}',
    mainPageSlug: 'plumbers',
  },
  {
    slug: 'solar-installer',
    singular: 'Solar Installer',
    plural: 'Solar System Installers',
    serviceType: 'Solar Power and Inverter Installation',
    isActive: true,
    shona: 'kugadzira solar',
    ndebele: 'ukufaka amasolar',
    shonaActionPhrase: 'kuisa solar system, inverter nemabhatiri',
    ndebeleActionPhrase: 'ukufaka amasolar, i-inverter lamabhetri',
    commonTasks: [
      '3kVA to 10kVA hybrid inverter set-up',
      'Lithium (LiFePO4) battery bank sizing',
      'Roof solar panel mounting and earthing',
      'DB board changeover and surge protection',
    ],
    example: 'I need an inverter and batteries installed in {area}',
  },
  {
    slug: 'electrician',
    singular: 'Electrician',
    plural: 'Electricians',
    serviceType: 'Domestic and Commercial Electrical Services',
    isActive: true,
    shona: 'kugadzira magetsi',
    ndebele: 'ukulungisa ugesi',
    shonaActionPhrase: 'kugadzira magetsi, DB board kana wiring yemumba',
    ndebeleActionPhrase: 'ukulungisa ugesi, i-DB board kumbe i-wiring yendlu',
    commonTasks: [
      'DB board repairs, breaker replacements and tripping faults',
      'Full house wiring, tubing and ZESA meter box preparation',
      'Security lighting, gate motor and intercom wiring',
      'Stove, oven and geyser thermostat electrical repairs',
    ],
    example: 'My DB board keeps tripping in {area}',
    mainPageSlug: 'electricians',
  },
  {
    slug: 'tiler',
    singular: 'Tiler',
    plural: 'Tilers',
    serviceType: 'Floor and Wall Tiling Services',
    isActive: true,
    shona: 'kuisa matiles',
    ndebele: 'ukufaka amathayili',
    shonaActionPhrase: 'kuisa matiles epasi neekumadziro mumba',
    ndebeleActionPhrase: 'ukufaka amathayili phansi lasezindongeni endlini',
    commonTasks: [
      'Porcelain and ceramic floor tiling for lounges and kitchens',
      'Bathroom and shower wall tiling with waterproofing',
      'Old tile removal, floor screeding and levelling',
      'Verandah, driveway and outdoor non-slip paving tiles',
    ],
    example: 'I need my kitchen floor tiled in {area}',
  },
  {
    slug: 'painter',
    singular: 'Painter',
    plural: 'Painters',
    serviceType: 'Interior and Exterior Painting Services',
    isActive: true,
    shona: 'kupenda imba',
    ndebele: 'ukupenda indlu',
    shonaActionPhrase: 'kupenda mukati nekunze kwemba kana Durawall',
    ndebeleActionPhrase: 'ukupenda phakathi laphandle kwendlu kumbe i-Durawall',
    commonTasks: [
      'Interior room repainting, crack filling and skim coating',
      'Exterior house and Durawall weatherguard painting',
      'Ceiling repairs, cornices and damp-proofing treatment',
      'Roof painting, steel gate and burglar bar priming',
    ],
    example: 'I want the outside of my house and Durawall painted in {area}',
  },
  {
    slug: 'mechanic',
    singular: 'Mechanic',
    plural: 'Mechanics',
    serviceType: 'Mobile and Workshop Auto Repair Services',
    isActive: true,
    shona: 'kugadzira mota',
    ndebele: 'ukulungisa imota',
    shonaActionPhrase: 'kugadzira mota, servicing kana kuita diagnostics',
    ndebeleActionPhrase: 'ukulungisa imota, i-servicing kumbe i-diagnostics',
    commonTasks: [
      'Mobile call-outs: on-site OBD2 computer diagnostics and cars that won’t start',
      'Minor and major vehicle servicing (oil, filters, spark plugs)',
      'Brake pads, suspension, shocks and wheel bearing repairs',
      'Alternator, starter motor and clutch replacements',
    ],
    example: 'My car won’t start in {area}, I need a mobile mechanic',
  },
];

/**
 * Suggested price benchmarks from the SEO brief. NOT shown anywhere yet.
 * Confirm each with real Hustlr providers, then copy it into that trade's `typicalRateUsd`.
 * Units differ by trade: call-out/diagnostic fees vs. per square metre vs. per system.
 */
export const RATE_BENCHMARKS: Record<string, string> = {
  plumber: '$15 – $45 call-out & minor repair',
  'solar-installer': '$80 – $250 system installation labor',
  electrician: '$15 – $40 call-out & fault finding',
  tiler: '$4 – $8 per m² (labor only)',
  painter: '$2.50 – $5 per m² (or $35 – $70 per standard room labor)',
  mechanic: '$20 – $50 diagnostic & minor service labor',
};

/** Trades whose pages are built */
export const ACTIVE_TRADES = TRADES.filter((t) => t.isActive);

export const CITIES: CityInfo[] = [
  {
    slug: 'harare',
    name: 'Harare',
    region: 'Harare Province',
    primaryVernacular: 'sn',
    localContext:
      'Harare is Zimbabwe’s capital and largest city. Providers list the suburbs they work in, from Borrowdale and Mount Pleasant in the north to Waterfalls in the south, so you are matched with someone who already covers your area.',
    suburbs: ['Avondale', 'Borrowdale', 'Mount Pleasant', 'Mabelreign', 'Greendale', 'Waterfalls'],
  },
  {
    slug: 'bulawayo',
    name: 'Bulawayo',
    region: 'Bulawayo Province',
    primaryVernacular: 'nd',
    localContext:
      'Bulawayo is Zimbabwe’s second-largest city. Providers list the suburbs they cover, from Suburbs and Hillside near the centre to Nkulumane in the west, so you are matched with someone nearby.',
    suburbs: ['Suburbs', 'Hillside', 'Kumalo', 'Famona', 'Nkulumane', 'Burnside'],
  },
];

/** Cities whose /hire pages are built */
export const ACTIVE_CITIES = CITIES.filter((c) => c.isActive !== false);

export const hirePath = (trade: TradeInfo, city: CityInfo) => `/hire/${trade.slug}-${city.slug}`;

/** The page Google should treat as the main version (an existing /plumbers/harare page, or this one). */
export const hireCanonicalPath = (trade: TradeInfo, city: CityInfo) =>
  trade.mainPageSlug && seoCities.some((c) => c.slug === city.slug) ? `/${trade.mainPageSlug}/${city.slug}` : hirePath(trade, city);

/**
 * Local FAQ for one /hire page: two English questions plus one in the city's main local
 * language (ChiShona for Harare, IsiNdebele for Bulawayo). The page renders this exact list
 * and buildTradeCitySchema turns the same list into FAQPage data, so they always match.
 */
export function buildTradeCityFaqs(trade: TradeInfo, city: CityInfo): FaqItem[] {
  const lower = trade.singular.toLowerCase();
  const article = /^[aeiou]/i.test(lower) ? 'an' : 'a';
  const suburbs = city.suburbs.slice(0, 3).join(', ');
  const faqs: FaqItem[] = [
    {
      lang: 'en',
      question: `How much does ${article} ${lower} cost in ${city.name}?`,
      answer: `It depends on the job and any parts needed. Asking Hustlr is free: describe the job on WhatsApp, get matched with ${trade.plural.toLowerCase()} in ${city.name}, and agree the price with the provider before any work starts.`,
    },
    {
      lang: 'en',
      question: `Which ${city.name} suburbs do Hustlr ${trade.plural.toLowerCase()} cover?`,
      answer: `Providers list the areas they work in, including ${suburbs} and surrounding suburbs. Tell Hustlr where you are in the chat and it matches you with ${trade.plural.toLowerCase()} who cover your area.`,
    },
  ];
  if (city.primaryVernacular === 'sn') {
    faqs.push({
      lang: 'sn',
      question: `Ndingawana sei ${lower} akavimbika mu${city.name} paWhatsApp?`,
      answer: `Tumira meseji kuHustlr paWhatsApp neChiShona kana Chirungu uchitsanangura basa raunoda (${trade.shonaActionPhrase}) nenzvimbo yako mu${city.name}. Hustlr inokubatanidza nemhizha dzakavimbika dziri pedyo newe pasina kudhawunirodha imwe app.`,
    });
  } else {
    faqs.push({
      lang: 'nd',
      question: `Ngingamthola njani u-${lower} othembekileyo e${city.name} kuWhatsApp?`,
      answer: `Thumela umlayezo kuHustlr kuWhatsApp ngesiNdebele kumbe ngesiNgisi uchaza umsebenzi owufunayo (${trade.ndebeleActionPhrase}) lendawo okuyo e${city.name}. IHustlr ikuhlanganisa lezingcwethi ezithembekileyo eziseduze lawe ngaphandle kokudawuniloda enye i-app.`,
    });
  }
  return faqs;
}

const LANG_TAG = { en: 'en-ZW', sn: 'sn', nd: 'nd' } as const;

/** Structured data for one /hire page: Service, BreadcrumbList and FAQPage, linked to the site's Organization by @id. */
export function buildTradeCitySchema(trade: TradeInfo, city: CityInfo, pageUrl: string, faqs: FaqItem[]) {
  const rate = trade.typicalRateUsd;
  return {
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: `${trade.plural} in ${city.name}`,
        serviceType: trade.serviceType,
        url: pageUrl,
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: {
          '@type': 'City',
          name: city.name,
          containedInPlace: { '@type': 'Country', name: 'Zimbabwe' },
        },
        availableLanguage: ['English', 'Shona', 'Ndebele'],
        availableChannel: { '@type': 'ServiceChannel', name: 'WhatsApp', serviceUrl: 'https://wa.me/263719351207' },
        // Mirrors the visible "Price" block on the page
        offers: rate
          ? {
              '@type': 'Offer',
              priceCurrency: 'USD',
              description: `Typical ${trade.singular.toLowerCase()} price in ${city.name}: ${rate}. The final price is agreed with the provider before work starts.`,
            }
          : {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: `Asking Hustlr for ${/^[aeiou]/i.test(trade.singular) ? 'an' : 'a'} ${trade.singular.toLowerCase()} is free. You agree the price for the job with the provider before work starts.`,
            },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Hustlr Zimbabwe', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: `${trade.plural} in ${city.name}`, item: pageUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          inLanguage: LANG_TAG[f.lang],
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', inLanguage: LANG_TAG[f.lang], text: f.answer },
        })),
      },
    ],
  };
}
