// Everything the admin pages show, from the bot backend (./bot-api.ts). Server-side only.
// In a local preview without the bot backend, the sample data is shown instead and the pages say so.
// Sample data is never shown on the live site, and never mixed with real numbers.
import { sampleData, type AdminData, type DailyChats } from '../data/admin';
import { loadBotSummary } from './bot-api';
import { DAY_MS, dateLabel, dayKey, dayLabel, lastSevenDays, placementName } from './visits';

const rangeFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Harare' });

export async function loadAdminData(): Promise<AdminData> {
  const win = lastSevenDays();
  const summary = await loadBotSummary(win).catch((error) => {
    console.error('[admin] could not reach the bot backend', error);
    return undefined;
  });

  // Local preview with no bot backend configured: show the sample so the pages can be designed
  if (summary === null && import.meta.env.DEV) return sampleData;

  const visits = summary?.visits;
  const bot = summary?.bookings;

  // Seven days, oldest first, filled with zeros where the bot sent nothing
  const byDate = new Map((visits?.daily ?? []).map((d) => [d.date, d]));
  const daily: DailyChats[] = visits
    ? Array.from({ length: 7 }, (_, i) => {
        const d = new Date(win.from.getTime() + i * DAY_MS);
        const row = byDate.get(dayKey(d));
        return { day: dayLabel.format(d), date: dateLabel.format(d), customer: row?.customer ?? 0, provider: row?.provider ?? 0 };
      })
    : [];

  const off = 'Bot backend not connected';
  return {
    sample: false,
    connected: { visits: !!visits, bookings: !!bot },
    period: { label: 'Last 7 days', range: rangeFmt.formatRange(win.from, win.to), compare: 'previous 7 days' },
    kpis: [
      { label: 'Unique visitors', value: visits?.visitors ?? null, previous: visits?.visitorsPrev ?? null, note: visits ? 'People who opened the website' : off },
      { label: 'Sessions', value: visits?.sessions ?? null, previous: visits?.sessionsPrev ?? null, note: visits ? 'Visits, including repeat visits' : off },
      { label: 'WhatsApp chats started', value: visits?.chats ?? null, previous: visits?.chatsPrev ?? null, note: visits ? 'Taps on a WhatsApp button' : off },
      { label: 'Bookings', value: bot?.bookings ?? null, previous: bot?.bookingsPrev ?? null, note: bot ? 'Made in WhatsApp' : off },
    ],
    daily,
    funnel: [
      { step: 'Visited the website', value: visits?.visitors ?? null },
      { step: 'Started a WhatsApp chat', value: visits?.chats ?? null },
      { step: 'Booked a provider', value: bot?.bookings ?? null },
      { step: 'Job completed', value: bot?.completed ?? null },
    ],
    chatsByPlacement: visits ? visits.placements.map((p) => ({ name: placementName(p.name), value: p.value })) : null,
    bookingsByService: bot?.byService ?? null,
    bookingsByArea: bot?.byArea ?? null,
    bookings: bot?.recent.slice(0, 50) ?? null,
    applications: bot?.applications ?? null,
  };
}
