/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** URL that receives website analytics events as JSON (see ANALYTICS.md). Leave empty to send nothing. */
  readonly PUBLIC_ANALYTICS_ENDPOINT?: string;
  /** "true" adds a short session reference to WhatsApp messages started from the site. */
  readonly PUBLIC_ANALYTICS_WA_REF?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
