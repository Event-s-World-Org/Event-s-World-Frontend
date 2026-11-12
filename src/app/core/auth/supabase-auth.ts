import { isPlatformBrowser } from '@angular/common';
import { InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import type { GoTrueClient } from '@supabase/auth-js';
import { ConfigService } from '../config';

/** Loads the Supabase Auth client on demand. Resolves `null` on the server (SSR-safe). */
export type SupabaseAuthLoader = () => Promise<GoTrueClient | null>;

/**
 * Only the Auth part of Supabase is used (sign-up, login, sessions, password reset); there is no
 * Realtime, Storage or Data API. `@supabase/auth-js` is imported lazily, so it stays out of the
 * initial bundle and pages that never need a session (public SSR pages) never download it.
 */
export const SUPABASE_AUTH = new InjectionToken<SupabaseAuthLoader>('SUPABASE_AUTH', {
  providedIn: 'root',
  factory: () => {
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    const config = inject(ConfigService);
    let client: Promise<GoTrueClient | null> | null = null;

    return () => {
      if (!isBrowser) {
        return Promise.resolve(null);
      }
      client ??= import('@supabase/auth-js').then(({ AuthClient }) => {
        const { supabaseUrl, supabasePublishableKey } = config.config();
        return new AuthClient({
          url: `${supabaseUrl}/auth/v1`,
          headers: { apikey: supabasePublishableKey },
          storageKey: supabaseStorageKey(supabaseUrl),
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        });
      });
      return client;
    };
  },
});

/** Same key supabase-js uses (`sb-<project-ref>-auth-token`), so sessions stay compatible. */
export function supabaseStorageKey(supabaseUrl: string): string {
  try {
    return `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  } catch {
    return 'sb-auth-token';
  }
}
