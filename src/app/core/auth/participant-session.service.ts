import { Injectable, computed, signal } from '@angular/core';

/**
 * Short-lived participant token (30 minutes) obtained from the personal link (US-010).
 * It lives ONLY in memory (NFR-04.1): no storage an XSS could read. After a reload the
 * participant opens the personal link again.
 */
@Injectable({
  providedIn: 'root',
})
export class ParticipantSessionService {
  readonly #token = signal<string | null>(null);
  readonly #registrationId = signal<string | null>(null);

  readonly token = this.#token.asReadonly();
  readonly registrationId = this.#registrationId.asReadonly();
  readonly isAuthenticated = computed(() => !!this.#token());

  setSession(token: string, registrationId?: string): void {
    this.#token.set(token);
    this.#registrationId.set(registrationId ?? null);
  }

  getToken(): string | null {
    return this.#token();
  }

  getRegistrationId(): string | null {
    return this.#registrationId();
  }

  clearSession(): void {
    this.#token.set(null);
    this.#registrationId.set(null);
  }
}
