import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EventSWorldAPIService } from '../api/generated/endpoints.service';
import type { Me } from '../api/generated/models';

/**
 * Profile of the logged-in user from `GET /api/v1/me` (US-002). The global role and the account
 * status live in our database, not in the Supabase token (ADR-0004).
 */
@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  readonly #api = inject(EventSWorldAPIService);
  readonly #profile = signal<Me | null>(null);

  readonly profile = this.#profile.asReadonly();
  readonly isSuperAdmin = computed(() => this.#profile()?.globalRole === 'super_admin');

  #loading: Promise<Me | null> | null = null;

  /** Loads the profile once and reuses it; `refresh` forces a new request. */
  load(refresh = false): Promise<Me | null> {
    if (refresh || !this.#loading) {
      this.#loading = firstValueFrom(this.#api.getMe())
        .then((profile) => {
          this.#profile.set(profile);
          return profile;
        })
        .catch(() => {
          this.#loading = null;
          this.#profile.set(null);
          return null;
        });
    }
    return this.#loading;
  }

  clear(): void {
    this.#loading = null;
    this.#profile.set(null);
  }
}
