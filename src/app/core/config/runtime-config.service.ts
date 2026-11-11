import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { AppConfig, DEFAULT_CONFIG, FeatureFlags } from './runtime-config.types';

@Injectable({
  providedIn: 'root',
})
export class RuntimeConfigService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly configState = signal<AppConfig>(DEFAULT_CONFIG);
  private isLoaded = false;

  readonly config = this.configState.asReadonly();
  readonly apiUrl = computed(() => this.configState().apiUrl);
  readonly supabase = computed(() => this.configState().supabase);
  readonly flags = computed(() => this.configState().featureFlags);

  /**
   * Carga la configuración desde /config.json en tiempo de ejecución.
   * Permite cambiar feature flags y URLs sin necesidad de recompilar la aplicación.
   * Es completamente SSR-safe: en servidor retorna los valores por defecto sin tocar window/localStorage.
   */
  async loadConfig(): Promise<AppConfig> {
    if (this.isLoaded) {
      return this.configState();
    }

    if (!isPlatformBrowser(this.platformId)) {
      this.isLoaded = true;
      return DEFAULT_CONFIG;
    }

    try {
      const response = await fetch('/config.json', { cache: 'no-store' });
      if (response.ok) {
        const loaded: Partial<AppConfig> = await response.json();
        const merged: AppConfig = {
          apiUrl: loaded.apiUrl || DEFAULT_CONFIG.apiUrl,
          supabase: {
            ...DEFAULT_CONFIG.supabase,
            ...(loaded.supabase || {}),
          },
          featureFlags: {
            ...DEFAULT_CONFIG.featureFlags,
            ...(loaded.featureFlags || {}),
          },
        };
        this.configState.set(merged);
      } else {
        console.warn('[RuntimeConfigService] No se pudo cargar /config.json, usando defaults.');
      }
    } catch (error) {
      console.warn('[RuntimeConfigService] Error cargando /config.json:', error);
    }

    this.isLoaded = true;
    return this.configState();
  }

  /**
   * Evalúa si una funcionalidad está activa.
   */
  isEnabled(flagKey: keyof FeatureFlags | string): boolean {
    return Boolean(this.flags()[flagKey as keyof FeatureFlags] ?? false);
  }

  /**
   * Modifica una bandera en caliente (útil para pruebas de QA o demostraciones en vivo).
   */
  setFlag(flagKey: string, value: boolean): void {
    this.configState.update((current) => ({
      ...current,
      featureFlags: {
        ...current.featureFlags,
        [flagKey]: value,
      },
    }));
  }
}
