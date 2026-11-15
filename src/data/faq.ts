// Homepage questions. The FAQ section (src/components/FaqSection.astro) and the
// FAQPage structured data on the homepage both read this list, so the text Google
// and AI assistants see always matches what's on the page, word for word.
export interface FaqItem {
  q: string;
  a: string;
}

export const homeFaqs: FaqItem[] = [
  {
    q: 'What is Hustlr and how does it work?',
    a: 'Hustlr is an AI-powered WhatsApp marketplace in Zimbabwe that connects clients with vetted local skilled workers. You send a message describing the job in English, Shona, or Ndebele, and Hustlr matches you with available tradespeople near your location.',
  },
  {
    q: 'What types of skilled workers can I find on Hustlr?',
    a: 'Clients can hire verified technicians and artisans across major trades, including plumbers, electricians, solar system installers, tilers, painters, carpenters, mechanics, and appliance repair specialists.',
  },
  {
    q: 'Do I need to download an app to use Hustlr?',
    a: 'No. Hustlr operates entirely inside WhatsApp, allowing both clients and skilled workers to request quotes, compare matches, and coordinate jobs using minimal mobile data without installing a separate app.',
  },
  {
    q: 'Which cities and languages does Hustlr support?',
    a: 'Hustlr serves clients and workers across Zimbabwe—including Harare, Bulawayo, Gweru, Mutare, and Masvingo—and supports full conversational matching in English, ChiShona, and IsiNdebele.',
  },
];
