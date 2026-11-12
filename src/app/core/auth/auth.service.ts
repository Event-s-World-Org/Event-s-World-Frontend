import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import type { GoTrueClient, Session, User } from '@supabase/auth-js';
import { ConfigService } from '../config';
import { SUPABASE_AUTH, supabaseStorageKey } from './supabase-auth';

/**
 * Supabase session of a user with an account (ADR-0004). The Supabase client is loaded only
 * when a session may exist (one is stored) or when a flow asks for it (login, sign-up), so
 * anonymous visitors never download it.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #loadClient = inject(SUPABASE_AUTH);
  readonly #config = inject(ConfigService);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly #session = signal<Session | null>(null);
  readonly session = this.#session.asReadonly();
  readonly user = computed<User | null>(() => this.#session()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.#session());

  #initialized: Promise<GoTrueClient | null> | null = null;

  constructor() {
    if (this.#isBrowser && this.#hasStoredSession()) {
      void this.client();
    }
  }

  /** The Supabase Auth client (null on the server). Login and sign-up flows use it directly. */
  client(): Promise<GoTrueClient | null> {
    this.#initialized ??= this.#loadClient().then(async (client) => {
      if (!client) {
        return null;
      }
      const { data } = await client.getSession();
      this.#session.set(data.session);
      client.onAuthStateChange((_event, session) => this.#session.set(session));
      return client;
    });
    return this.#initialized;
  }

  /** A valid access token, refreshed by Supabase when needed; null without a session. */
  async getAccessToken(): Promise<string | null> {
    if (!this.#isBrowser || (!this.#initialized && !this.#hasStoredSession())) {
      return null;
    }
    const client = await this.client();
    if (!client) {
      return null;
    }
    const { data } = await client.getSession();
    return data.session?.access_token ?? null;
  }

  async checkAuthenticated(): Promise<boolean> {
    return (await this.getAccessToken()) !== null;
  }

  async signOut(): Promise<void> {
    const client = this.#initialized ? await this.client() : null;
    await client?.signOut();
    this.#session.set(null);
  }

  #hasStoredSession(): boolean {
    try {
      return localStorage.getItem(supabaseStorageKey(this.#config.config().supabaseUrl)) !== null;
    } catch {
      return false;
    }
  }
}
