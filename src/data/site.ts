// Shared site data used by the homepage, nav, footer and other pages.

// WhatsApp: +263 71 935 1207
export const WA = 'https://wa.me/263719351207';
export const WA_PROVIDER = `${WA}?text=${encodeURIComponent('Hi Hustlr, I want to register as a service provider')}`;

// WhatsApp glyph used on every button (all buttons open WhatsApp)
export const waIcon = `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>`;

export const steps = [
  { n: '1', title: 'Say what you need', text: 'Type it the way you would tell a friend.' },
  { n: '2', title: 'Meet your match', text: 'Hustlr suggests providers for your job and area.' },
  { n: '3', title: 'Book it', text: 'Pick one. The provider messages to confirm.' },
];

export const services = [
  {
    id: 'plumbers',
    name: 'Plumbers',
    text: 'Leaks, burst pipes, geysers, blocked drains and new fittings.',
    ask: 'My geyser is leaking in Avondale',
    icon: '<path d="M12 3c3.5 4.2 6 7.6 6 10.6A6 6 0 0 1 6 13.6C6 10.6 8.5 7.2 12 3z"/><path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.4"/>',
  },
  {
    id: 'electricians',
    name: 'Electricians',
    text: 'Faults, wiring, plugs, lights and new installations.',
    ask: 'The plugs in my kitchen stopped working',
    icon: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',
  },
  {
    id: 'cleaners',
    name: 'Cleaners',
    text: 'Homes, offices, carpets and after-renovation cleaning.',
    ask: 'I need home cleaning on Saturday',
    icon: '<path d="M4 20.5h16"/><path d="M7 20.5l1.2-6h7.6l1.2 6"/><path d="M12 14.5V3.5"/><path d="M18.5 4.5l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z"/>',
  },
  {
    id: 'tutors',
    name: 'Tutors',
    text: 'Help with school subjects, homework and exam preparation.',
    ask: 'Looking for a maths tutor for Form 4',
    icon: '<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c1.6 1.4 3.5 2 5.5 2s3.9-.6 5.5-2V11"/><path d="M21.5 9v5"/>',
  },
];

export const proBenefits = [
  {
    title: 'Jobs come to you',
    text: 'Booking requests from people nearby who are ready to hire. No flyers, adverts or website needed.',
    icon: '<path d="M4 8.5h16v11H4z"/><path d="M9 8.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2.5"/><path d="M4 13h16"/>',
  },
  {
    title: 'Work in your areas',
    text: 'Tell Hustlr the suburbs and towns you cover, and get jobs where you already work.',
    icon: '<path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  },
  {
    title: 'Accept in one reply',
    text: 'Every request shows the service, the time and the place. Reply YES to take the job.',
    icon: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7L16.2 9.5"/>',
  },
  {
    title: 'A profile that sells for you',
    text: 'Customers see your business name, trade, areas and what you do before they book.',
    icon: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M14.5 10h3M14.5 13.5h3"/>',
  },
  {
    title: 'Customers come back',
    text: 'Happy customers can save you to their favourites and rebook you with one message.',
    icon: '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/>',
  },
  {
    title: 'Nothing new to learn',
    text: 'No app and no dashboard. Run it all from the WhatsApp you already use every day.',
    icon: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  },
];

// ---------- Testimonials ----------
// Real quotes only, from customers and providers who agreed to be quoted.
// The homepage section stays hidden on the live site until this list has at least one entry.
// Example of the shape (replace with a real one):
//   { quote: 'What they said, in their words.', name: 'First name + initial', role: 'Customer', detail: 'Plumber booked in Avondale, Harare' },
export interface Testimonial {
  quote: string;
  name: string;
  role: 'Customer' | 'Provider' | 'Partner';
  /** Short context: the job or trade and the area, e.g. "Cleaner booked in Hillside, Bulawayo". */
  detail?: string;
}

export const testimonials: Testimonial[] = [];

// DRAFTS: suggested wording, not real quotes yet.
// Shown only when you run the site locally (astro dev), never on the live site.
// To publish one: send it to the person, use the words they approve, and move it into `testimonials` above.
export const draftTestimonials: Testimonial[] = [
  {
    quote: 'Booking requests come straight to my WhatsApp with the job, the time and the place. I reply YES and the customer knows I am coming.',
    name: 'Jona Mugondora',
    role: 'Provider',
    detail: 'Plumber',
  },
  {
    quote: 'I told Hustlr the suburbs I cover, and now the jobs I get are in the areas where I already work. There was no app to learn.',
    name: 'Shepherd Mubaiwa',
    role: 'Provider',
    detail: 'Electrician',
  },
  {
    quote: 'We described the job in one WhatsApp chat and saw the provider’s profile before we said yes. Booking took a few messages.',
    name: 'uncommon.org',
    role: 'Customer',
  },
  {
    quote: 'Our graduates can list their trade and the areas they cover, then take bookings on the phones they already have.',
    name: 'Nyamuroro VTC',
    role: 'Partner',
    detail: 'Vocational training centre',
  },
];
