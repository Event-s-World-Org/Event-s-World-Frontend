import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

const PARTICIPANT_TOKEN_KEY = 'ew_participant_token';
const REGISTRATION_ID_KEY = 'ew_registration_id';

@Injectable({
  providedIn: 'root',
})
export class ParticipantSessionService {
  readonly #platformId = inject(PLATFORM_ID);
  readonly #token = signal<string | null>(null);
  readonly #registrationId = signal<string | null>(null);

  readonly token = this.#token.asReadonly();
  readonly registrationId = this.#registrationId.asReadonly();
  readonly isAuthenticated = computed(() => !!this.#token());

  constructor() {
    if (isPlatformBrowser(this.#platformId)) {
      const storedToken = sessionStorage.getItem(PARTICIPANT_TOKEN_KEY);
      const storedRegistrationId = sessionStorage.getItem(REGISTRATION_ID_KEY);
      if (storedToken) {
        this.#token.set(storedToken);
      }
      if (storedRegistrationId) {
        this.#registrationId.set(storedRegistrationId);
      }
    }
  }

  setSession(token: string, registrationId?: string): void {
    this.#token.set(token);
    if (registrationId) {
      this.#registrationId.set(registrationId);
    }

    if (isPlatformBrowser(this.#platformId)) {
      sessionStorage.setItem(PARTICIPANT_TOKEN_KEY, token);
      if (registrationId) {
        sessionStorage.setItem(REGISTRATION_ID_KEY, registrationId);
      }
    }
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

    if (isPlatformBrowser(this.#platformId)) {
      sessionStorage.removeItem(PARTICIPANT_TOKEN_KEY);
      sessionStorage.removeItem(REGISTRATION_ID_KEY);
    }
  }
}
