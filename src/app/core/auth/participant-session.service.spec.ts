import { TestBed } from '@angular/core/testing';
import { ParticipantSessionService } from './participant-session.service';

describe('ParticipantSessionService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('keeps the participant token in memory only (NFR-04.1)', () => {
    const service = TestBed.inject(ParticipantSessionService);

    service.setSession('participant-token', 'reg-456');

    expect(service.getToken()).toBe('participant-token');
    expect(service.getRegistrationId()).toBe('reg-456');
    expect(service.isAuthenticated()).toBe(true);
    expect(sessionStorage.length).toBe(0);
    expect(localStorage.length).toBe(0);
  });

  it('forgets the session when cleared', () => {
    const service = TestBed.inject(ParticipantSessionService);
    service.setSession('participant-token', 'reg-456');

    service.clearSession();

    expect(service.getToken()).toBeNull();
    expect(service.getRegistrationId()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
