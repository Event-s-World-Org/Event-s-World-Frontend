import { Injectable, computed, inject } from '@angular/core';
import { FeatureFlag } from './config.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagService {
  readonly #configService = inject(ConfigService);

  readonly features = computed(() => this.#configService.config().features);

  /** Typed on purpose: a misspelled flag is a compile error, not a silent `false`. */
  isEnabled(flag: FeatureFlag): boolean {
    return this.features()[flag] ?? false;
  }
}
