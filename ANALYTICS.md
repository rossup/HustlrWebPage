# Website analytics and the admin dashboard

The website tracks its own part of the funnel: **visitors → sessions → WhatsApp chats started**.
Bookings happen inside WhatsApp, so they are counted by the bot backend, not here.
The optional `ref` (below) is what joins the two.

All the data lives in the **Hustlr bot backend**, next to the WhatsApp chats and bookings. The website only
collects visit events and shows the dashboard; it has no database of its own.

| Piece | Where |
| --- | --- |
| Tracker in the browser | `src/scripts/analytics.ts`, loaded on every page by `src/layouts/HomeLayout.astro` |
| Receives events, forwards them to the bot | `src/pages/api/track.ts` → `POST {BOT_API_URL}/analytics/events` |
| Admin pages (`/admin/*`) | rendered on each request; data from `src/lib/admin-data.ts` |
| Calls the bot for the dashboard numbers | `src/lib/bot-api.ts` → `GET {BOT_API_URL}/admin/summary` |
| Admin login | Netlify Identity: `src/pages/login.astro`, checked in `src/middleware.ts` |

## First-time setup

1. **Install the packages** (from the project folder): `npm install @astrojs/netlify @netlify/identity`
   Commit the updated `package.json` and `package-lock.json`.
2. **Bot backend.** Add the two endpoints in "Bot backend API" below, then add `BOT_API_URL` and `BOT_API_KEY`
   under Netlify → Project configuration → Environment variables. Until then, events are dropped and the
   dashboard shows "not connected".
3. **Login.** Netlify → Project configuration → Identity → **Enable Identity**, set Registration to **Invite only**,
   then Identity → Users → **Invite users**. After the person accepts, open their user → Edit settings → add the role
   **`admin`**. Only users with that role get into `/admin`.
4. Deploy. Identity doesn't run in local `astro dev`, so test logins on a Deploy Preview.

In local `astro dev` there is no login, and without `BOT_API_URL` the admin pages show labelled sample data.
The live site never shows sample data.

## Settings

| Variable | Where | What it does |
| --- | --- | --- |
| `PUBLIC_ANALYTICS_ENDPOINT` | `netlify.toml` (set to `/api/track`) | URL that receives events. Empty = nothing is sent (in `astro dev` events are printed to the browser console). |
| `PUBLIC_ANALYTICS_WA_REF` | Netlify env or `.env` | `true` adds `(ref xxxxxxxx)` to the WhatsApp message a visitor starts from the site. Off by default because it changes the message people send. |
| `BOT_API_URL`, `BOT_API_KEY` | Netlify env only (secret) | The bot backend's address and the shared secret. Used only on the server, never sent to browsers. |

`PUBLIC_*` values are baked into the page at build time, so redeploy after changing them.

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

Assuming the bot backend stores events in a table `site_events(type, ts, visitor_id, session_id, payload jsonb)`:

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

## Bot backend API

The website calls the bot backend **from its server** (never from the browser), with the header
`Authorization: Bearer {BOT_API_KEY}`. Reject anything without the right key with `401`.
Use a long random key and keep it out of Git.

### 1. `POST /analytics/events`: store one website event

The body is one event as described in "Event format" above (JSON), already checked by the website:
`visitor_id` and `session_id` are 32 hex characters, `ts` is an ISO time, admin and login pages are excluded.
Store it (for example in `site_events(type, ts, visitor_id, session_id, path, payload jsonb)`) and answer `204`.
Answer quickly; the website waits at most 4 seconds and never retries.

### 2. `GET /admin/summary?from=…&prevFrom=…&to=…`: the dashboard numbers

`from` → `to` is the current 7-day window (Harare midnight 6 days ago until now); `prevFrom` → `from` is the
7 days before, for comparisons. All three are ISO times. Answer `200` with JSON. Both parts are optional, so you
can ship one before the other; a missing or malformed part shows as "not connected".

```json
{
  "visits": {
    "visitors": 1842, "visitorsPrev": 1610,
    "sessions": 2316, "sessionsPrev": 2090,
    "chats": 274, "chatsPrev": 231,
    "daily": [{ "date": "2026-11-13", "customer": 42, "provider": 12 }],
    "placements": [{ "name": "hero", "value": 112 }]
  },
  "bookings": {
    "bookings": 96, "bookingsPrev": 88, "completed": 71,
    "recent": [
      { "ref": "3c41a9e0", "customer": "Tendai M.", "service": "Plumber", "area": "Avondale, Harare",
        "provider": "Flowline Plumbing", "when": "Fri 13 Nov, 14:20", "source": "Website", "status": "Pending" }
    ],
    "byService": [{ "name": "Plumbers", "value": 34 }],
    "byArea": [{ "name": "Harare & Chitungwiza", "value": 51 }],
    "applications": [
      { "business": "Mhofu Electrical", "trade": "Electrician", "areas": "Harare North", "applied": "Fri 13 Nov", "status": "New" }
    ]
  }
}
```

- `visits`: `visitors` = distinct `visitor_id`; `sessions` = `session_start` events; `chats` = `wa_click` events
  (the "Weekly review queries" above show the SQL). `daily.date` is the Harare date; `customer`/`provider` split
  `wa_click` by `payload.intent`. `placements` is `wa_click` counted by `payload.placement` (raw ids like `hero`;
  the website turns them into labels).
- `bookings`: counts of bookings created in each window; `completed` = current-window bookings whose job is done.
  `recent` is newest first, at most 50; `status` is `Pending`, `Confirmed`, `Completed` or `Cancelled`; `source` is
  `Website` when the chat carried a `(ref …)` from the site, otherwise `WhatsApp`. Show customers by first name and
  initial only. `applications` are providers waiting for approval, `status` `New` or `Details requested`.
- Keep it fast: the page waits at most 8 seconds.
