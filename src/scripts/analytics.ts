/**
 * Hustlr website analytics
 *
 * Small first-party tracker for the marketing site. It records:
 *   - unique visitors   (random anonymous id kept in localStorage)
 *   - sessions          (new session after 30 minutes without activity)
 *   - page views
 *   - WhatsApp clicks   (the website's version of "started a booking"),
 *                       split into customer vs provider intent and where on the page
 *
 * Events are sent as JSON to PUBLIC_ANALYTICS_ENDPOINT (see ANALYTICS.md).
 * When no endpoint is set, nothing is sent; in `astro dev` events are logged
 * to the browser console instead so you can see them.
 *
 * No names, phone numbers, IP addresses or cookies are created here.
 * Visitors with Do Not Track or Global Privacy Control switched on are not tracked.
 */

const ENDPOINT: string = import.meta.env.PUBLIC_ANALYTICS_ENDPOINT ?? '';
const WA_REF: boolean = import.meta.env.PUBLIC_ANALYTICS_WA_REF === 'true';
const DEV: boolean = import.meta.env.DEV;

const SCHEMA_VERSION = 1;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const KEY_VISITOR = 'hustlr.vid';
const KEY_SESSION = 'hustlr.sid';

type Intent = 'customer' | 'provider';

interface StoredSession {
  id: string;
  started: number;
  last: number;
  seq: number;
}

/* ---------- storage helpers (storage can be blocked or throw) ---------- */

const read = (store: () => Storage, key: string): string | null => {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
};

const write = (store: () => Storage, key: string, value: string): void => {
  try {
    store().setItem(key, value);
  } catch {
    /* private mode or storage disabled: carry on without persistence */
  }
};

const local = () => window.localStorage;

const randomId = (): string => {
  // 128 random bits as hex (crypto.getRandomValues also works on plain http)
  const bytes = new Uint8Array(16);
  try {
    crypto.getRandomValues(bytes);
  } catch {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

/* ---------- opt-out ---------- */

const optedOut = (): boolean => {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true;
};

/* ---------- visitor + session ---------- */

let newVisitor = false;

const visitorId = (): string => {
  let id = read(local, KEY_VISITOR);
  if (!id) {
    id = randomId();
    newVisitor = true;
    write(local, KEY_VISITOR, id);
  }
  return id;
};

/**
 * Returns the current session, creating a new one when there is none
 * or the last activity was more than 30 minutes ago.
 */
const touchSession = (): { session: StoredSession; isNew: boolean } => {
  const now = Date.now();
  let session: StoredSession | null = null;
  try {
    const raw = read(local, KEY_SESSION);
    session = raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    session = null;
  }

  const expired = !session || now - session.last > SESSION_TIMEOUT_MS;
  if (expired) {
    session = { id: randomId(), started: now, last: now, seq: 0 };
  } else {
    session!.last = now;
  }
  write(local, KEY_SESSION, JSON.stringify(session));
  return { session: session!, isNew: expired };
};

/* ---------- context ---------- */

const deviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
};

const campaign = () => {
  const p = new URLSearchParams(location.search);
  return {
    utm_source: p.get('utm_source'),
    utm_medium: p.get('utm_medium'),
    utm_campaign: p.get('utm_campaign'),
    utm_content: p.get('utm_content'),
  };
};

const externalReferrer = (): string | null => {
  if (!document.referrer) return null;
  try {
    const ref = new URL(document.referrer);
    return ref.host === location.host ? null : ref.host;
  } catch {
    return null;
  }
};

/* ---------- sending ---------- */

const send = (type: string, props: Record<string, unknown> = {}): void => {
  const { session, isNew } = touchSession();
  session.seq += 1;
  write(local, KEY_SESSION, JSON.stringify(session));

  const event = {
    v: SCHEMA_VERSION,
    type,
    ts: new Date().toISOString(),
    visitor_id: visitorId(),
    session_id: session.id,
    seq: session.seq,
    path: location.pathname,
    device: deviceType(),
    lang: navigator.language,
    ...props,
  };

  // A new session always gets its own start event first, with where the visit came from.
  if (isNew && type !== 'session_start') {
    session.seq -= 1;
    write(local, KEY_SESSION, JSON.stringify(session));
    send('session_start', {
      new_visitor: newVisitor,
      landing_path: location.pathname,
      referrer: externalReferrer(),
      ...campaign(),
    });
    send(type, props);
    return;
  }

  if (!ENDPOINT) {
    if (DEV) console.info('[hustlr-analytics]', event);
    return;
  }

  // Sent as text/plain so cross-origin endpoints work without a CORS preflight.
  const body = JSON.stringify(event);
  try {
    const sent = navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
    if (sent) return;
  } catch {
    /* fall through to fetch */
  }
  fetch(ENDPOINT, {
    method: 'POST',
    body,
    keepalive: true,
    // text/plain keeps this a "simple" request: no CORS preflight needed
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
  }).catch(() => {
    /* analytics must never break the page */
  });
};

/* ---------- WhatsApp clicks ---------- */

const isWhatsApp = (a: HTMLAnchorElement): boolean => /(^|\.)wa\.me$|whatsapp\.com$/.test(a.hostname);

const intentOf = (a: HTMLAnchorElement): Intent => {
  if (a.dataset.intent === 'provider' || a.dataset.intent === 'customer') return a.dataset.intent;
  const text = new URL(a.href).searchParams.get('text') ?? '';
  return /provider|register/i.test(text) ? 'provider' : 'customer';
};

/** Where on the page the link sits: nav, footer, or the id of the nearest section. */
const placementOf = (a: HTMLElement): string => {
  if (a.dataset.placement) return a.dataset.placement;
  if (a.closest('.footer, footer')) return 'footer';
  if (a.closest('.nav-panel')) return 'nav-mobile';
  if (a.closest('.menu, [role="menu"], .nav-menu')) return 'nav-menu';
  if (a.closest('nav, header')) return 'nav';
  const section = a.parentElement?.closest('section[id], [id]');
  if (section?.id === 'top') return 'hero';
  return section?.id || 'page';
};

/**
 * Optional: add a short reference to the prefilled WhatsApp message so the bot
 * can tie a chat (and the booking that follows) back to this website session.
 * Off unless PUBLIC_ANALYTICS_WA_REF=true, because it changes the message people send.
 */
const withRef = (a: HTMLAnchorElement, sessionId: string): void => {
  if (!WA_REF) return;
  const url = new URL(a.href);
  const text = url.searchParams.get('text');
  if (text?.includes('(ref ')) return;
  const ref = `ref ${sessionId.slice(0, 8)}`;
  // encodeURIComponent (not URLSearchParams) so spaces become %20, which WhatsApp always reads as spaces
  url.search = `?text=${encodeURIComponent(text ? `${text} (${ref})` : `Hi Hustlr (${ref})`)}`;
  a.href = url.toString();
};

const onClick = (e: Event): void => {
  const target = e.target as Element | null;
  const a = target?.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!a || !isWhatsApp(a)) return;

  const { session } = touchSession();
  withRef(a, session.id);
  send('wa_click', {
    intent: intentOf(a),
    placement: placementOf(a),
    label: (a.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80),
    ref: WA_REF ? session.id.slice(0, 8) : null,
  });
};

/* ---------- start ---------- */

declare global {
  interface Window {
    hustlrTrack?: (type: string, props?: Record<string, unknown>) => void;
  }
}

if (typeof window !== 'undefined' && !optedOut() && !window.hustlrTrack) {
  window.hustlrTrack = send;
  send('pageview', { title: document.title });
  // capture phase so the ref is added before the browser follows the link
  document.addEventListener('click', onClick, { capture: true });
  // middle-click / open in new tab
  document.addEventListener('auxclick', onClick, { capture: true });
}

export {};
