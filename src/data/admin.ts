// Data for the admin dashboard (/admin).
//
// SAMPLE DATA: every number and name below is a placeholder so the page can be
// designed and reviewed. Replace these exports with real data from the analytics
// endpoint (see ANALYTICS.md) and the WhatsApp bot / bookings backend.
// The page only reads the shapes below, so nothing else needs to change.

export const isSampleData = true;

export const period = {
  label: 'Last 7 days',
  range: '7 – 13 Nov 2026',
  compare: 'previous 7 days',
};

export interface Kpi {
  label: string;
  value: number;
  previous: number;
  note: string;
}

export const kpis: Kpi[] = [
  { label: 'Unique visitors', value: 1842, previous: 1610, note: 'People who opened the website' },
  { label: 'Sessions', value: 2316, previous: 2090, note: 'Visits, including repeat visits' },
  { label: 'WhatsApp chats started', value: 274, previous: 231, note: 'Taps on a WhatsApp button' },
  { label: 'Bookings', value: 96, previous: 88, note: 'Confirmed in WhatsApp' },
];

// WhatsApp chats started per day, split by who started them.
export const daily = [
  { day: 'Sat', date: '7 Nov', customer: 24, provider: 6 },
  { day: 'Sun', date: '8 Nov', customer: 19, provider: 4 },
  { day: 'Mon', date: '9 Nov', customer: 31, provider: 9 },
  { day: 'Tue', date: '10 Nov', customer: 28, provider: 7 },
  { day: 'Wed', date: '11 Nov', customer: 35, provider: 8 },
  { day: 'Thu', date: '12 Nov', customer: 38, provider: 11 },
  { day: 'Fri', date: '13 Nov', customer: 42, provider: 12 },
];

// Website visit -> finished job.
export const funnel = [
  { step: 'Visited the website', value: 1842 },
  { step: 'Started a WhatsApp chat', value: 274 },
  { step: 'Booked a provider', value: 96 },
  { step: 'Job completed', value: 71 },
];

export const bookingsByService = [
  { name: 'Plumbers', value: 34 },
  { name: 'Electricians', value: 27 },
  { name: 'Cleaners', value: 22 },
  { name: 'Tutors', value: 13 },
];

// Which button on the website started the chat (the `placement` field in analytics).
export const chatsByPlacement = [
  { name: 'Hero', value: 112 },
  { name: 'Navigation', value: 61 },
  { name: 'How it works', value: 38 },
  { name: 'Services', value: 34 },
  { name: 'Footer', value: 29 },
];

export const bookingsByArea = [
  { name: 'Harare & Chitungwiza', value: 51 },
  { name: 'Bulawayo', value: 19 },
  { name: 'Mutare', value: 11 },
  { name: 'Gweru & Kwekwe', value: 9 },
  { name: 'Masvingo & Vic Falls', value: 6 },
];

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Booking {
  ref: string;
  customer: string;
  service: string;
  area: string;
  provider: string;
  when: string;
  source: 'Website' | 'WhatsApp';
  status: BookingStatus;
}

export const bookingStatuses: BookingStatus[] = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

export const bookings: Booking[] = [
  { ref: '3c41a9e0', customer: 'Tendai M.', service: 'Plumber', area: 'Avondale, Harare', provider: 'Flowline Plumbing', when: 'Fri 13 Nov, 14:20', source: 'Website', status: 'Pending' },
  { ref: '9b72f0d4', customer: 'Rudo C.', service: 'Cleaner', area: 'Hillside, Bulawayo', provider: 'Sparkle Home Care', when: 'Fri 13 Nov, 11:05', source: 'Website', status: 'Confirmed' },
  { ref: 'e15c88a2', customer: 'Farai N.', service: 'Electrician', area: 'Borrowdale, Harare', provider: 'BrightWire Electrical', when: 'Fri 13 Nov, 09:40', source: 'WhatsApp', status: 'Confirmed' },
  { ref: '47ad3b19', customer: 'Nyasha K.', service: 'Tutor', area: 'Mutare CBD', provider: 'A-Grade Tutors', when: 'Thu 12 Nov, 17:30', source: 'Website', status: 'Completed' },
  { ref: 'c0e96f57', customer: 'Blessing S.', service: 'Plumber', area: 'Chitungwiza', provider: 'Flowline Plumbing', when: 'Thu 12 Nov, 13:15', source: 'WhatsApp', status: 'Completed' },
  { ref: '6f2b10cd', customer: 'Tatenda Z.', service: 'Electrician', area: 'Senga, Gweru', provider: 'Midlands Sparks', when: 'Thu 12 Nov, 10:00', source: 'Website', status: 'Cancelled' },
  { ref: 'a83d5e71', customer: 'Chipo D.', service: 'Cleaner', area: 'Mount Pleasant, Harare', provider: 'Sparkle Home Care', when: 'Wed 11 Nov, 15:45', source: 'Website', status: 'Completed' },
  { ref: '1d94c6b8', customer: 'Kudzai P.', service: 'Tutor', area: 'Masvingo', provider: 'A-Grade Tutors', when: 'Wed 11 Nov, 08:30', source: 'WhatsApp', status: 'Pending' },
];

export interface Application {
  business: string;
  trade: string;
  areas: string;
  applied: string;
  status: 'New' | 'Details requested';
}

// Providers who messaged "I want to register as a service provider" and are waiting for review.
export const applications: Application[] = [
  { business: 'Mhofu Electrical', trade: 'Electrician', areas: 'Harare North', applied: 'Fri 13 Nov', status: 'New' },
  { business: 'CleanNest Services', trade: 'Cleaner', areas: 'Bulawayo', applied: 'Thu 12 Nov', status: 'New' },
  { business: 'PipeFix Zimbabwe', trade: 'Plumber', areas: 'Mutare & Rusape', applied: 'Wed 11 Nov', status: 'Details requested' },
  { business: 'Top Marks Tutoring', trade: 'Tutor', areas: 'Gweru & Kwekwe', applied: 'Tue 10 Nov', status: 'New' },
];

// ---------- Small helpers shared by the admin pages ----------
export const fmt = (n: number) => n.toLocaleString('en-US');
export const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
export const statusClass = (s: string) => `ad-status ad-status--${s.toLowerCase().replace(/\s+/g, '-')}`;

/** Change against the previous period, e.g. "+14%". */
export const change = (value: number, previous: number): { text: string; dir: 'up' | 'down' | 'flat' } => {
  if (!previous) return { text: 'New', dir: 'flat' };
  const rounded = Math.round(((value - previous) / previous) * 100);
  if (rounded === 0) return { text: 'No change', dir: 'flat' };
  return { text: `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)}%`, dir: rounded > 0 ? 'up' : 'down' };
};
