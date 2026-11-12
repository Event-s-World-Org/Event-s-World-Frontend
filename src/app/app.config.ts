import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localeEsBo from '@angular/common/locales/es-BO';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor, errorInterceptor, idempotencyInterceptor } from './core/api';
import { provideSupabaseClient } from './core/auth';
import { ConfigService } from './core/config';
import { ThemeService } from './core/theme';

registerLocaleData(localeEsBo, 'es-BO');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideHttpClient(
      withFetch(),
      withInterceptors([idempotencyInterceptor, authInterceptor, errorInterceptor]),
    ),
    provideSupabaseClient(),
    { provide: LOCALE_ID, useValue: 'es-BO' },
    provideAppInitializer(async () => {
      inject(ThemeService);
      await inject(ConfigService).loadConfig();
    }),
  ],
};
