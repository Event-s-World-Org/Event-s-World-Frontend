import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

/** localStorage key. The inline script in index.html reads the same key before first paint. */
export const THEME_STORAGE_KEY = 'ew-theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';
const PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system'];

/**
 * Light / dark / system theme (NFR-01.2, FR-01.7). Toggles the `dark` class on <html>, which
 * switches every Salar Cristal token in styles.css. The preference is stored in localStorage;
 * syncing it with the user profile comes with US-030.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly systemPrefersDark = signal(false);

  readonly preference = signal<ThemePreference>('system');
  readonly isDark = computed(
    () =>
      this.preference() === 'dark' || (this.preference() === 'system' && this.systemPrefersDark()),
  );

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    this.preference.set(this.readStoredPreference());

    const media = this.document.defaultView?.matchMedia?.(DARK_QUERY);
    if (media) {
      this.systemPrefersDark.set(media.matches);
      const onChange = (event: MediaQueryListEvent) => this.systemPrefersDark.set(event.matches);
      media.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => media.removeEventListener('change', onChange));
    }

    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
    });
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
    if (!this.isBrowser) {
      return;
    }
    try {
      if (preference === 'system') {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, preference);
      }
    } catch {
      // Storage can be unavailable (private mode, blocked site data): the theme still applies.
    }
  }

  private readStoredPreference(): ThemePreference {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return PREFERENCES.includes(saved as ThemePreference) ? (saved as ThemePreference) : 'system';
    } catch {
      return 'system';
    }
  }
}
