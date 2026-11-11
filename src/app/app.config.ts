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
import { RuntimeConfigService } from './core/config/runtime-config.service';
import {
  authInterceptor,
  errorInterceptor,
  idempotencyInterceptor,
} from './core/interceptors';

registerLocaleData(localeEsBo, 'es-BO');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, idempotencyInterceptor, errorInterceptor]),
    ),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideAppInitializer(() => {
      const configService = inject(RuntimeConfigService);
      return configService.loadConfig();
    }),
    { provide: LOCALE_ID, useValue: 'es-BO' },
  ],
};
