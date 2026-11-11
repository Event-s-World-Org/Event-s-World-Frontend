export interface FeatureFlags {
  coAdmin: boolean;
  teamSplitter: boolean;
  checkIn: boolean;
  refunds: boolean;
  [key: string]: boolean;
}

export interface AppConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  features: FeatureFlags;
}

export const DEFAULT_CONFIG: AppConfig = {
  apiUrl: 'http://localhost:5000',
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'dummy_key',
  features: {
    coAdmin: false,
    teamSplitter: false,
    checkIn: false,
    refunds: false,
  },
};
