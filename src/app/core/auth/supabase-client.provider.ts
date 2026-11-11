import { isPlatformBrowser } from '@angular/common';
import { InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { RuntimeConfigService } from '../config/runtime-config.service';

export interface SupabaseClientStub {
  auth: {
    getSession(): Promise<{ data: { session: unknown }; error: unknown }>;
    signOut(): Promise<{ error: unknown }>;
  };
}

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClientStub | null>(
  'SUPABASE_CLIENT',
);

export function provideSupabaseClient() {
  return {
    provide: SUPABASE_CLIENT,
    useFactory: (): SupabaseClientStub | null => {
      const platformId = inject(PLATFORM_ID);
      const runtimeConfig = inject(RuntimeConfigService);

      if (!isPlatformBrowser(platformId)) {
        return null;
      }

      const { url, anonKey } = runtimeConfig.supabase();
      if (!url || !anonKey) {
        return null;
      }

      return {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          signOut: async () => ({ error: null }),
        },
      };
    },
  };
}
