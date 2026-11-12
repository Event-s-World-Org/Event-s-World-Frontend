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
import {
  apiBaseUrlInterceptor,
  authInterceptor,
  errorInterceptor,
  idempotencyInterceptor,
} from './core/api/interceptors';
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
      // Order matters: the base URL first, so the others see the final backend URL.
      withInterceptors([
        apiBaseUrlInterceptor,
        idempotencyInterceptor,
        authInterceptor,
        errorInterceptor,
      ]),
    ),
    { provide: LOCALE_ID, useValue: 'es-BO' },
    provideAppInitializer(async () => {
      inject(ThemeService);
      await inject(ConfigService).loadConfig();
    }),
  ],
};
