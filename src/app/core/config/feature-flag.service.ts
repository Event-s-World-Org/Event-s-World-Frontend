import { Injectable, computed, inject } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagService {
  readonly #configService = inject(ConfigService);

  readonly features = computed(() => this.#configService.config().features);

  isEnabled(flag: string): boolean {
    return this.features()[flag] ?? false;
  }
}
