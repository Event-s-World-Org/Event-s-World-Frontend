import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService, ParticipantSessionService } from '../../auth';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: { getAccessToken: ReturnType<typeof vi.fn> };
  let participantSessionMock: { getToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = {
      getAccessToken: vi.fn(),
    };
    participantSessionMock = {
      getToken: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ParticipantSessionService, useValue: participantSessionMock },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should attach participant token for /participant/ endpoints', () => {
    participantSessionMock.getToken.mockReturnValue('participant-secret-token');

    http.get('/api/v1/participant/sessions/current').subscribe();

    const req = httpMock.expectOne('/api/v1/participant/sessions/current');
    expect(req.request.headers.get('Authorization')).toBe('Bearer participant-secret-token');
    req.flush({});
  });

  it('should attach Supabase user token for regular API endpoints', async () => {
    authServiceMock.getAccessToken.mockResolvedValue('supabase-jwt-token');

    http.get('/api/v1/events').subscribe();

    // Allow promise resolution
    await Promise.resolve();

    const req = httpMock.expectOne('/api/v1/events');
    expect(req.request.headers.get('Authorization')).toBe('Bearer supabase-jwt-token');
    req.flush({});
  });

  it('should not overwrite existing Authorization header', async () => {
    authServiceMock.getAccessToken.mockResolvedValue('supabase-jwt-token');

    http
      .get('/api/v1/events', {
        headers: { Authorization: 'Bearer already-set-token' },
      })
      .subscribe();

    const req = httpMock.expectOne('/api/v1/events');
    expect(req.request.headers.get('Authorization')).toBe('Bearer already-set-token');
    req.flush({});
  });
});
