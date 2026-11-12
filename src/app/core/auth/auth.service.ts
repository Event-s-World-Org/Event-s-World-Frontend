import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './tokens';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #supabase = inject(SUPABASE_CLIENT);
  readonly #platformId = inject(PLATFORM_ID);

  readonly #session = signal<Session | null>(null);
  readonly #user = signal<User | null>(null);
  readonly #globalRole = signal<'user' | 'super_admin' | null>(null);

  readonly session = this.#session.asReadonly();
  readonly user = this.#user.asReadonly();
  readonly globalRole = this.#globalRole.asReadonly();
  readonly isAuthenticated = computed(() => !!this.#session());
  readonly isSuperAdmin = computed(() => this.#globalRole() === 'super_admin');

  constructor() {
    if (isPlatformBrowser(this.#platformId) && this.#supabase) {
      this.#initSession();
    }
  }

  async #initSession(): Promise<void> {
    if (!this.#supabase) return;

    try {
      const { data } = await this.#supabase.auth.getSession();
      if (data?.session) {
        this.#setSession(data.session);
      }

      this.#supabase.auth.onAuthStateChange((_event, session) => {
        this.#setSession(session);
      });
    } catch (error) {
      console.warn('Failed to initialize Supabase session:', error);
    }
  }

  #setSession(session: Session | null): void {
    this.#session.set(session);
    this.#user.set(session?.user ?? null);
    if (session?.user?.app_metadata && typeof session.user.app_metadata['global_role'] === 'string') {
      this.#globalRole.set(session.user.app_metadata['global_role'] as 'user' | 'super_admin');
    } else {
      this.#globalRole.set(session?.user ? 'user' : null);
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (!isPlatformBrowser(this.#platformId) || !this.#supabase) {
      return null;
    }

    const currentSession = this.#session();
    if (currentSession?.access_token) {
      // Check if expired, refresh if needed
      const expiresAt = currentSession.expires_at;
      const now = Math.floor(Date.now() / 1000);
      if (expiresAt && expiresAt > now + 60) {
        return currentSession.access_token;
      }
    }

    try {
      const { data, error } = await this.#supabase.auth.getSession();
      if (error || !data?.session) {
        return null;
      }
      this.#setSession(data.session);
      return data.session.access_token;
    } catch {
      return null;
    }
  }

  async checkAuthenticated(): Promise<boolean> {
    if (!isPlatformBrowser(this.#platformId) || !this.#supabase) {
      return false;
    }
    const token = await this.getAccessToken();
    return !!token;
  }

  async signOut(): Promise<void> {
    if (!isPlatformBrowser(this.#platformId) || !this.#supabase) {
      this.#setSession(null);
      return;
    }
    try {
      await this.#supabase.auth.signOut();
    } finally {
      this.#setSession(null);
    }
  }

  // Helper for tests / manual overrides
  setTestSession(session: Session | null, role: 'user' | 'super_admin' | null = 'user'): void {
    this.#session.set(session);
    this.#user.set(session?.user ?? null);
    this.#globalRole.set(role);
  }
}
