import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ParticipantSessionService } from './participant-session.service';

describe('ParticipantSessionService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('in browser', () => {
    it('should store and retrieve token in memory and sessionStorage, NEVER in localStorage', () => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const service = TestBed.inject(ParticipantSessionService);

      service.setSession('test-token-123', 'reg-456');

      expect(service.getToken()).toBe('test-token-123');
      expect(service.getRegistrationId()).toBe('reg-456');
      expect(service.isAuthenticated()).toBe(true);
      expect(sessionStorage.getItem('ew_participant_token')).toBe('test-token-123');
      expect(sessionStorage.getItem('ew_registration_id')).toBe('reg-456');

      // Crucial acceptance rule: localStorage is NEVER touched for participant token
      expect(localStorage.getItem('ew_participant_token')).toBeNull();

      service.clearSession();
      expect(service.getToken()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(sessionStorage.getItem('ew_participant_token')).toBeNull();
    });
  });

  describe('in SSR (server)', () => {
    it('should not throw and not touch sessionStorage or localStorage in SSR', () => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });
      const service = TestBed.inject(ParticipantSessionService);

      service.setSession('ssr-token');
      expect(service.getToken()).toBe('ssr-token');
      expect(sessionStorage.getItem('ew_participant_token')).toBeNull();
    });
  });
});
