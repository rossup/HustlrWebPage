-- Website analytics events (see ANALYTICS.md).
-- One row per event sent by src/scripts/analytics.ts via /api/track.
CREATE TABLE IF NOT EXISTS site_events (
  id          bigserial   PRIMARY KEY,
  type        text        NOT NULL,              -- session_start, pageview, wa_click, ...
  ts          timestamptz NOT NULL,              -- when it happened (browser clock, checked by the server)
  visitor_id  text        NOT NULL,              -- random id kept in the visitor's browser
  session_id  text        NOT NULL,              -- new after 30 minutes without activity
  path        text        NOT NULL DEFAULT '/',
  payload     jsonb       NOT NULL DEFAULT '{}'::jsonb,  -- every other field of the event
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_events_ts_idx      ON site_events (ts);
CREATE INDEX IF NOT EXISTS site_events_type_ts_idx ON site_events (type, ts);
