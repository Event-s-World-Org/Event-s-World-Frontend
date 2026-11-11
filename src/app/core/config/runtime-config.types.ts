export interface SupabaseConfig {
  readonly url: string;
  readonly anonKey: string;
}

export interface FeatureFlags {
  readonly enablePaymentReview: boolean;
  readonly enableSettings: boolean;
  readonly enableCsvExport: boolean;
  readonly enableInPersonRegistration: boolean;
  readonly enableRealtimeSync: boolean;
  readonly enablePublicExplore: boolean;
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
