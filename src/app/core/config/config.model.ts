export interface FeatureFlags {
  /** `[Next]` features, shown as "próximamente" while off. */
  coAdmin: boolean;
  teamSplitter: boolean;
  checkIn: boolean;
  refunds: boolean;
  /** Organizer menu items the demo hides (Docs demo plan): payment review and event settings. */
  paymentReview: boolean;
  eventSettings: boolean;
}

export type FeatureFlag = keyof FeatureFlags;

export interface AppConfig {
  /** Backend origin, without a trailing slash. The client calls `${apiUrl}/api/v1/...`. */
  apiUrl: string;
  supabaseUrl: string;
  /** Supabase publishable key (formerly "anon key"). Public by design (frontend.md §9). */
  supabasePublishableKey: string;
  features: FeatureFlags;
}

export const DEFAULT_CONFIG: AppConfig = {
  apiUrl: 'http://localhost:5037',
  supabaseUrl: '',
  supabasePublishableKey: '',
  features: {
    coAdmin: false,
    teamSplitter: false,
    checkIn: false,
    refunds: false,
    paymentReview: true,
    eventSettings: true,
  },
};
