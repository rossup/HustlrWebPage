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
  /** Optional Supabase service_role key for sending admin invitations via /auth/v1/invite, server-side only. */
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
  /** Comma-separated emails allowed into /admin, server-side only. */
  readonly ADMIN_EMAILS?: string;
  /** Comma-separated superadmin emails allowed to invite other admins, server-side only. */
  readonly SUPERADMIN_EMAILS?: string;
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
    /** True when the signed-in admin is a superadmin who can invite other admins */
    isSuperAdmin?: boolean;
  }
}
