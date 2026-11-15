// Search (SEO) data: the services and towns Hustlr has landing pages for.
// Each service x town pair gets its own page, e.g. /plumbers/harare, plus a page per
// service (/plumbers) and per town (/areas/harare). Add a town or a service here and
// its pages, sitemap entries and links appear on the next build.

export const SITE_URL = 'https://hustlr.chat';
export const PHONE = '+263 71 935 1207';
export const PHONE_E164 = '+263719351207';

export interface SeoService {
  /** URL slug, e.g. "plumbers" */
  slug: string;
  /** "Plumbers" */
  plural: string;
  /** "plumber" (lower case, for sentences) */
  singular: string;
  /** schema.org serviceType, e.g. "Plumbing" */
  trade: string;
  /** One-line summary used in meta descriptions */
  summary: string;
  /** Jobs people book this trade for (also what people search for) */
  jobs: string[];
  /** Example WhatsApp message; {area} is replaced with a suburb or town */
  ask: string;
}

export const seoServices: SeoService[] = [
  {
    slug: 'plumbers',
    plural: 'Plumbers',
    singular: 'plumber',
    trade: 'Plumbing',
    summary: 'geyser repairs, burst pipes, blocked drains and new fittings',
    jobs: [
      'Geyser repairs and installation',
      'Burst and leaking pipes',
      'Blocked drains and toilets',
      'Taps, sinks and new fittings',
      'Water tank and borehole connections',
      'Bathroom and kitchen plumbing',
    ],
    ask: 'My geyser is leaking in {area}',
  },
  {
    slug: 'electricians',
    plural: 'Electricians',
    singular: 'electrician',
    trade: 'Electrical',
    summary: 'fault finding, wiring, plugs, lights and new installations',
    jobs: [
      'Fault finding and repairs',
      'House wiring and rewiring',
      'Plugs, switches and lights',
      'DB boards and circuit breakers',
      'Solar and inverter connections',
      'Stove and geyser connections',
    ],
    ask: 'The plugs in my kitchen stopped working in {area}',
  },
  {
    slug: 'cleaners',
    plural: 'Cleaners',
    singular: 'cleaner',
    trade: 'Cleaning',
    summary: 'home, office, carpet and after-renovation cleaning',
    jobs: [
      'Home and house cleaning',
      'Office and shop cleaning',
      'Carpet and upholstery cleaning',
      'After-renovation cleaning',
      'Move-in and move-out cleaning',
      'Window cleaning',
    ],
    ask: 'I need home cleaning on Saturday in {area}',
  },
  {
    slug: 'tutors',
    plural: 'Tutors',
    singular: 'tutor',
    trade: 'Tutoring',
    summary: 'maths, sciences, languages, homework help and exam preparation',
    jobs: [
      'Maths and science lessons',
      'ZIMSEC O-Level and A-Level revision',
      'Cambridge (IGCSE) subjects',
      'Grade 7 exam preparation',
      'English and language lessons',
      'Primary school homework help',
    ],
    ask: 'Looking for a maths tutor for Form 4 in {area}',
  },
];

export interface SeoCity {
  slug: string;
  name: string;
  /** Province, for schema and copy */
  province: string;
  /** Well-known suburbs and neighbourhoods (used in copy and example messages) */
  areas: string[];
}

export const seoCities: SeoCity[] = [
  {
    slug: 'harare',
    name: 'Harare',
    province: 'Harare Province',
    areas: ['Avondale', 'Borrowdale', 'Mount Pleasant', 'Greendale', 'Highlands', 'Marlborough', 'Mabelreign', 'Belvedere', 'Hatfield', 'Waterfalls', 'Budiriro', 'Kuwadzana', 'Warren Park', 'Glen View'],
  },
  {
    slug: 'chitungwiza',
    name: 'Chitungwiza',
    province: 'Harare Province',
    areas: ['Zengeza', "St Mary's", 'Seke', 'Makoni', 'Unit L', 'Unit O'],
  },
  {
    slug: 'bulawayo',
    name: 'Bulawayo',
    province: 'Bulawayo Province',
    areas: ['Hillside', 'Suburbs', 'Burnside', 'Bradfield', 'Famona', 'Khumalo', 'Morningside', 'Nkulumane', 'Pumula', 'Cowdray Park', 'Entumbane'],
  },
  {
    slug: 'mutare',
    name: 'Mutare',
    province: 'Manicaland',
    areas: ['Mutare CBD', 'Murambi', 'Palmerston', 'Fairbridge Park', 'Greenside', 'Dangamvura', 'Sakubva', 'Chikanga'],
  },
  {
    slug: 'gweru',
    name: 'Gweru',
    province: 'Midlands',
    areas: ['Gweru CBD', 'Ascot', 'Lundi Park', 'Mkoba', 'Senga', 'Mtapa', 'Southdowns'],
  },
  {
    slug: 'kwekwe',
    name: 'Kwekwe',
    province: 'Midlands',
    areas: ['Kwekwe CBD', 'Newtown', 'Fitchlea', 'Mbizo', 'Amaveni', 'Redcliff'],
  },
  {
    slug: 'masvingo',
    name: 'Masvingo',
    province: 'Masvingo Province',
    areas: ['Masvingo CBD', 'Rhodene', 'Eastvale', 'Mucheke', 'Runyararo'],
  },
  {
    slug: 'victoria-falls',
    name: 'Victoria Falls',
    province: 'Matabeleland North',
    areas: ['Victoria Falls town', 'Chinotimba', 'Mkhosana', 'Aerodrome'],
  },
];

export const serviceBySlug = (slug: string) => seoServices.find((s) => s.slug === slug);
export const cityBySlug = (slug: string) => seoCities.find((c) => c.slug === slug);
