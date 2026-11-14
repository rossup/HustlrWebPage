// Shapes, helpers and sample data for the admin dashboard (/admin).
//
// Live numbers are loaded by src/lib/admin-data.ts from the WhatsApp bot backend (src/lib/bot-api.ts):
// website visits, sessions, WhatsApp chats, bookings and providers.
// The SAMPLE data at the bottom is only used for local previews, when no database is reachable.

export interface Period {
  label: string;
  range: string;
  compare: string;
}

export interface Kpi {
  label: string;
  /** null = this source isn't connected yet */
  value: number | null;
  previous: number | null;
  note: string;
}

export interface DailyChats {
  day: string;
  date: string;
  customer: number;
  provider: number;
}

export interface Row {
  name: string;
  value: number;
}

export interface FunnelStep {
  step: string;
  /** null = this source isn't connected yet */
  value: number | null;
}

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

export interface Application {
  business: string;
  trade: string;
  areas: string;
  applied: string;
  status: 'New' | 'Details requested';
}

export interface AdminData {
  /** true = everything shown is sample data (local preview without a database) */
  sample: boolean;
  /** Which parts the bot backend is sending (false = shown as "not connected") */
  connected: { visits: boolean; bookings: boolean };
  period: Period;
  kpis: Kpi[];
  daily: DailyChats[];
  funnel: FunnelStep[];
  chatsByPlacement: Row[] | null;
  bookingsByService: Row[] | null;
  bookingsByArea: Row[] | null;
  bookings: Booking[] | null;
  applications: Application[] | null;
}

export const bookingStatuses: BookingStatus[] = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

// ---------- Small helpers shared by the admin pages ----------
export const fmt = (n: number) => n.toLocaleString('en-US');
export const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
export const statusClass = (s: string) => `ad-status ad-status--${s.toLowerCase().replace(/\s+/g, '-')}`;

/** Change against the previous period, e.g. "+14%". */
export const change = (value: number | null, previous: number | null): { text: string; dir: 'up' | 'down' | 'flat' } | undefined => {
  if (value === null || previous === null) return undefined;
  if (!previous) return value ? { text: 'New', dir: 'up' } : { text: 'No change', dir: 'flat' };
  const rounded = Math.round(((value - previous) / previous) * 100);
  if (rounded === 0) return { text: 'No change', dir: 'flat' };
  return { text: `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)}%`, dir: rounded > 0 ? 'up' : 'down' };
};

// ---------- SAMPLE DATA (local preview only) ----------
export const sampleData: AdminData = {
  sample: true,
  connected: { visits: true, bookings: true },
  period: { label: 'Last 7 days', range: '7 – 13 Nov 2026', compare: 'previous 7 days' },
  kpis: [
    { label: 'Unique visitors', value: 1842, previous: 1610, note: 'People who opened the website' },
    { label: 'Sessions', value: 2316, previous: 2090, note: 'Visits, including repeat visits' },
    { label: 'WhatsApp chats started', value: 274, previous: 231, note: 'Taps on a WhatsApp button' },
    { label: 'Bookings', value: 96, previous: 88, note: 'Confirmed in WhatsApp' },
  ],
  daily: [
    { day: 'Sat', date: '7 Nov', customer: 24, provider: 6 },
    { day: 'Sun', date: '8 Nov', customer: 19, provider: 4 },
    { day: 'Mon', date: '9 Nov', customer: 31, provider: 9 },
    { day: 'Tue', date: '10 Nov', customer: 28, provider: 7 },
    { day: 'Wed', date: '11 Nov', customer: 35, provider: 8 },
    { day: 'Thu', date: '12 Nov', customer: 38, provider: 11 },
    { day: 'Fri', date: '13 Nov', customer: 42, provider: 12 },
  ],
  funnel: [
    { step: 'Visited the website', value: 1842 },
    { step: 'Started a WhatsApp chat', value: 274 },
    { step: 'Booked a provider', value: 96 },
    { step: 'Job completed', value: 71 },
  ],
  chatsByPlacement: [
    { name: 'Hero', value: 112 },
    { name: 'Navigation', value: 61 },
    { name: 'How it works', value: 38 },
    { name: 'Services', value: 34 },
    { name: 'Footer', value: 29 },
  ],
  bookingsByService: [
    { name: 'Plumbers', value: 34 },
    { name: 'Electricians', value: 27 },
    { name: 'Cleaners', value: 22 },
    { name: 'Tutors', value: 13 },
  ],
  bookingsByArea: [
    { name: 'Harare & Chitungwiza', value: 51 },
    { name: 'Bulawayo', value: 19 },
    { name: 'Mutare', value: 11 },
    { name: 'Gweru & Kwekwe', value: 9 },
    { name: 'Masvingo & Vic Falls', value: 6 },
  ],
  bookings: [
    { ref: '3c41a9e0', customer: 'Tendai M.', service: 'Plumber', area: 'Avondale, Harare', provider: 'Flowline Plumbing', when: 'Fri 13 Nov, 14:20', source: 'Website', status: 'Pending' },
    { ref: '9b72f0d4', customer: 'Rudo C.', service: 'Cleaner', area: 'Hillside, Bulawayo', provider: 'Sparkle Home Care', when: 'Fri 13 Nov, 11:05', source: 'Website', status: 'Confirmed' },
    { ref: 'e15c88a2', customer: 'Farai N.', service: 'Electrician', area: 'Borrowdale, Harare', provider: 'BrightWire Electrical', when: 'Fri 13 Nov, 09:40', source: 'WhatsApp', status: 'Confirmed' },
    { ref: '47ad3b19', customer: 'Nyasha K.', service: 'Tutor', area: 'Mutare CBD', provider: 'A-Grade Tutors', when: 'Thu 12 Nov, 17:30', source: 'Website', status: 'Completed' },
    { ref: 'c0e96f57', customer: 'Blessing S.', service: 'Plumber', area: 'Chitungwiza', provider: 'Flowline Plumbing', when: 'Thu 12 Nov, 13:15', source: 'WhatsApp', status: 'Completed' },
    { ref: '6f2b10cd', customer: 'Tatenda Z.', service: 'Electrician', area: 'Senga, Gweru', provider: 'Midlands Sparks', when: 'Thu 12 Nov, 10:00', source: 'Website', status: 'Cancelled' },
    { ref: 'a83d5e71', customer: 'Chipo D.', service: 'Cleaner', area: 'Mount Pleasant, Harare', provider: 'Sparkle Home Care', when: 'Wed 11 Nov, 15:45', source: 'Website', status: 'Completed' },
    { ref: '1d94c6b8', customer: 'Kudzai P.', service: 'Tutor', area: 'Masvingo', provider: 'A-Grade Tutors', when: 'Wed 11 Nov, 08:30', source: 'WhatsApp', status: 'Pending' },
  ],
  applications: [
    { business: 'Mhofu Electrical', trade: 'Electrician', areas: 'Harare North', applied: 'Fri 13 Nov', status: 'New' },
    { business: 'CleanNest Services', trade: 'Cleaner', areas: 'Bulawayo', applied: 'Thu 12 Nov', status: 'New' },
    { business: 'PipeFix Zimbabwe', trade: 'Plumber', areas: 'Mutare & Rusape', applied: 'Wed 11 Nov', status: 'Details requested' },
    { business: 'Top Marks Tutoring', trade: 'Tutor', areas: 'Gweru & Kwekwe', applied: 'Tue 10 Nov', status: 'New' },
  ],
};
