import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { AppConfig, DEFAULT_CONFIG } from './config.model';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  readonly #platformId = inject(PLATFORM_ID);
  readonly #config = signal<AppConfig>(DEFAULT_CONFIG);
  readonly #isLoaded = signal<boolean>(false);

  readonly config = this.#config.asReadonly();
  readonly isLoaded = this.#isLoaded.asReadonly();

  get apiUrl(): string {
    return this.#config().apiUrl;
  }

  get supabaseUrl(): string {
    return this.#config().supabaseUrl;
  }

  get supabaseAnonKey(): string {
    return this.#config().supabaseAnonKey;
  }

  async loadConfig(): Promise<AppConfig> {
    if (!isPlatformBrowser(this.#platformId)) {
      // In SSR, do not touch localStorage, window or fetch relative URLs.
      this.#isLoaded.set(true);
      return this.#config();
    }

    try {
      const response = await fetch('/config.json', {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn(`Failed to load /config.json (HTTP ${response.status}). Using default config.`);
        this.#isLoaded.set(true);
        return this.#config();
      }

      const json = (await response.json()) as Partial<AppConfig>;
      const mergedConfig: AppConfig = {
        ...DEFAULT_CONFIG,
        ...json,
        features: {
          ...DEFAULT_CONFIG.features,
          ...(json.features ?? {}),
        },
      };

      this.#config.set(mergedConfig);
      this.#isLoaded.set(true);
      return mergedConfig;
    } catch (error) {
      console.warn('Error loading /config.json. Using default config.', error);
      this.#isLoaded.set(true);
      return this.#config();
    }
  }

  setConfig(newConfig: Partial<AppConfig>): void {
    this.#config.update((current) => ({
      ...current,
      ...newConfig,
      features: {
        ...current.features,
        ...(newConfig.features ?? {}),
      },
    }));
  }
}
