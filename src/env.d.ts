/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Bot backend base URL for the admin API, server-side only (see src/lib/bot-api.ts). */
  readonly BOT_API_URL?: string;
  /** Secret the bot backend checks on admin API calls, server-side only. */
  readonly BOT_API_KEY?: string;
  /** Supabase project URL for admin sign-in, server-side only (see src/lib/supabase-auth.ts). */
  readonly SUPABASE_URL?: string;
  /** Supabase publishable (anon) key, server-side only. Never the secret / service_role key. */
  readonly SUPABASE_ANON_KEY?: string;
  /** Comma-separated emails allowed into /admin, server-side only. */
  readonly ADMIN_EMAILS?: string;
  /** URL that receives website analytics events as JSON (see ANALYTICS.md). Leave empty to send nothing. */
  readonly PUBLIC_ANALYTICS_ENDPOINT?: string;
  /** "true" adds a short session reference to WhatsApp messages started from the site. */
  readonly PUBLIC_ANALYTICS_WA_REF?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    /** Email of the signed-in admin (set by src/middleware.ts) */
    adminEmail?: string;
  }
}
