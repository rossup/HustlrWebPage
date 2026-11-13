# Website analytics

The website tracks its own part of the funnel: **visitors → sessions → WhatsApp chats started**.
Bookings happen inside WhatsApp, so they are counted by the bot/admin backend, not here.
The optional `ref` (below) is what joins the two.

Code: `src/scripts/analytics.ts`, loaded on every page by `src/layouts/HomeLayout.astro`.

## Setup

Copy `.env.example` to `.env` and set:

| Variable | What it does |
| --- | --- |
| `PUBLIC_ANALYTICS_ENDPOINT` | URL that receives events. Empty = nothing is sent (in `astro dev` events are printed to the browser console). |
| `PUBLIC_ANALYTICS_WA_REF` | `true` adds `(ref xxxxxxxx)` to the WhatsApp message a visitor starts from the site. Off by default because it changes the message people send. |

Rebuild after changing these (`npm run build`); they are baked into the page at build time.

## What is tracked

| Metric | How |
| --- | --- |
| Unique visitors | Random anonymous id stored in the browser (`localStorage`, key `hustlr.vid`). Same browser = same visitor. |
| Sessions | New session after 30 minutes with no activity (`hustlr.sid`). Each session starts with a `session_start` event. |
| Page views | `pageview` on every page load. |
| WhatsApp chats started | `wa_click` on any `wa.me` link, with `intent` (`customer` / `provider`) and `placement` (`nav`, `hero`, `how-it-works`, `footer`, …). |

Not tracked: names, phone numbers, IP addresses (the site never reads them), cookies.
Visitors with **Do Not Track** or **Global Privacy Control** switched on are not tracked at all.

## Event format

Each event is one `POST` to the endpoint. The body is JSON sent with `Content-Type: text/plain`
(this avoids a CORS preflight), so parse the raw body as JSON. The endpoint should reply `204`
and allow the site's origin (`Access-Control-Allow-Origin`).

Fields on every event:

```json
{
  "v": 1,
  "type": "pageview",
  "ts": "2026-11-13T10:52:04.120Z",
  "visitor_id": "8b0f…",
  "session_id": "3c41…",
  "seq": 2,
  "path": "/",
  "device": "mobile",
  "lang": "en-ZW"
}
```

Extra fields by type:

| `type` | Extra fields |
| --- | --- |
| `session_start` | `new_visitor` (bool), `landing_path`, `referrer` (other site's host or null), `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` |
| `pageview` | `title` |
| `wa_click` | `intent`, `placement`, `label` (button text), `ref` (8 chars, or null when the ref option is off) |

Custom events can be sent from any page script with `window.hustlrTrack('name', { … })`.

## Linking website visits to bookings

With `PUBLIC_ANALYTICS_WA_REF=true`, a visitor who clicks *Chat on WhatsApp* sends a first message like
`Hi Hustlr (ref 3c41a9e0)`. The bot can read the ref with `/\(ref ([0-9a-f]{8})\)/`, store it on the
user/booking, and the admin interface can then report bookings that came from the website
(join `wa_click.ref` to the booking's ref).

## Weekly review queries

Assuming the endpoint stores events in a table `site_events(type, ts, visitor_id, session_id, payload jsonb)`:

```sql
-- New visitors, sessions and WhatsApp chats started, per week
SELECT date_trunc('week', ts) AS week,
       count(DISTINCT visitor_id)                                   AS unique_visitors,
       count(*) FILTER (WHERE type = 'session_start' AND (payload->>'new_visitor')::bool) AS new_visitors,
       count(*) FILTER (WHERE type = 'session_start')               AS sessions,
       count(DISTINCT session_id) FILTER (WHERE type = 'wa_click' AND payload->>'intent' = 'customer') AS sessions_starting_customer_chat,
       count(DISTINCT session_id) FILTER (WHERE type = 'wa_click' AND payload->>'intent' = 'provider') AS sessions_starting_provider_signup
FROM site_events
GROUP BY 1
ORDER BY 1 DESC;

-- Which buttons start chats
SELECT payload->>'placement' AS placement, payload->>'intent' AS intent, count(*)
FROM site_events
WHERE type = 'wa_click' AND ts > now() - interval '7 days'
GROUP BY 1, 2
ORDER BY 3 DESC;
```
