import { isPlatformBrowser } from '@angular/common';
import { InjectionToken, PLATFORM_ID, Provider, inject } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConfigService } from '../config';

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient | null>(
  'SUPABASE_CLIENT',
);

export function provideSupabaseClient(): Provider {
  return {
    provide: SUPABASE_CLIENT,
    useFactory: () => {
      const platformId = inject(PLATFORM_ID);
      const configService = inject(ConfigService);

      if (!isPlatformBrowser(platformId)) {
        // SSR Safe: Never instantiate Supabase in SSR to avoid touching localStorage or window
        return null;
      }

      const { supabaseUrl, supabaseAnonKey } = configService.config();

      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    },
  };
}
