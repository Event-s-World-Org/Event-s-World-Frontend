export interface SupabaseConfig {
  readonly url: string;
  readonly anonKey: string;
}

export interface FeatureFlags {
  /** Revisión de pagos online y comprobantes (US-009) - Fuera de la demo */
  readonly enablePaymentReview: boolean;
  /** Configuración avanzada de cuenta/plataforma (US-030) - Fuera de la demo */
  readonly enableSettings: boolean;
  /** Exportación de asistentes a formato CSV (US-022) - Incluida en demo */
  readonly enableCsvExport: boolean;
  /** Flujo táctil de inscripción presencial en puerta (US-024) - Estrella de la demo */
  readonly enableInPersonRegistration: boolean;
  /** Sincronización multi-dispositivo en tiempo real (SSE) */
  readonly enableRealtimeSync: boolean;
  /** Catálogo público de eventos (US-013) */
  readonly enablePublicExplore: boolean;
  /** Banderas adicionales dinámicas */
  readonly [key: string]: boolean;
}

export interface AppConfig {
  readonly apiUrl: string;
  readonly supabase: SupabaseConfig;
  readonly featureFlags: FeatureFlags;
}

export const DEFAULT_CONFIG: AppConfig = {
  apiUrl: 'http://localhost:5000/api/v1',
  supabase: {
    url: 'https://rutowgkwewybymkimnkd.supabase.co',
    anonKey: '',
  },
  featureFlags: {
    enablePaymentReview: false,
    enableSettings: false,
    enableCsvExport: true,
    enableInPersonRegistration: true,
    enableRealtimeSync: true,
    enablePublicExplore: false,
  },
};
