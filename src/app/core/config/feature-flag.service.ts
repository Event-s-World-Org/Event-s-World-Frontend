import { Injectable, computed, inject } from '@angular/core';
import { RuntimeConfigService } from './runtime-config.service';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagService {
  private readonly runtimeConfig = inject(RuntimeConfigService);

  readonly canReviewPayments = computed(() =>
    this.runtimeConfig.isEnabled('enablePaymentReview'),
  );

  readonly canAccessSettings = computed(() =>
    this.runtimeConfig.isEnabled('enableSettings'),
  );

  readonly canExportCsv = computed(() =>
    this.runtimeConfig.isEnabled('enableCsvExport'),
  );

  readonly canRegisterInPerson = computed(() =>
    this.runtimeConfig.isEnabled('enableInPersonRegistration'),
  );

  readonly canSyncRealtime = computed(() =>
    this.runtimeConfig.isEnabled('enableRealtimeSync'),
  );

  readonly canExplorePublicEvents = computed(() =>
    this.runtimeConfig.isEnabled('enablePublicExplore'),
  );

  isEnabled(flagKey: string): boolean {
    return this.runtimeConfig.isEnabled(flagKey);
  }
}
