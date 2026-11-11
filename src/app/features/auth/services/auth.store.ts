import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'organizer' | 'admin';
  avatarInitials: string;
}

const AUTH_STORAGE_KEY = 'events_world_auth_user';

const VALID_USERNAME = 'shadith';
const VALID_PASSWORD = 'Santiago1:8';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  readonly currentUser = signal<UserProfile | null>(this.loadUserFromStorage());

  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  readonly displayName = computed(
    () => this.currentUser()?.name || 'Shadith Cuenca',
  );

  private readonly router = inject(Router);

  login(
    usernameInput: string,
    passwordInput: string,
  ): { success: boolean; message?: string } {
    const userClean = usernameInput.trim().toLowerCase();
    const passClean = passwordInput.trim();

    if (userClean === VALID_USERNAME && passClean === VALID_PASSWORD) {
      const profile: UserProfile = {
        id: 'org-shadith-01',
        username: 'Shadith',
        name: 'Shadith Cuenca',
        email: 'shadith@eventsworld.bo',
        role: 'organizer',
        avatarInitials: 'SC',
      };

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      }
      this.currentUser.set(profile);
      return { success: true };
    }

    return {
      success: false,
      message: 'Usuario o contraseña incorrectos. Intenta con Shadith y su contraseña autorizada.',
    };
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    this.currentUser.set(null);
    void this.router.navigate(['/auth/login']);
  }

  private loadUserFromStorage(): UserProfile | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        id: 'org-shadith-01',
        username: 'Shadith',
        name: 'Shadith Cuenca',
        email: 'shadith@eventsworld.bo',
        role: 'organizer',
        avatarInitials: 'SC',
      };
    }

    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as UserProfile;
      }
      const defaultUser: UserProfile = {
        id: 'org-shadith-01',
        username: 'Shadith',
        name: 'Shadith Cuenca',
        email: 'shadith@eventsworld.bo',
        role: 'organizer',
        avatarInitials: 'SC',
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    } catch {
      return null;
    }
  }
}
