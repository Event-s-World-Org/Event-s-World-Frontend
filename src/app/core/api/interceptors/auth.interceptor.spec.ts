import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService, ParticipantSessionService } from '../../auth';
import { authInterceptor } from './auth.interceptor';
import { TEST_API_URL, provideTestConfig } from './test-support';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let getAccessToken: ReturnType<typeof vi.fn>;
  let participant: ParticipantSessionService;

  beforeEach(() => {
    getAccessToken = vi.fn().mockResolvedValue('supabase-jwt');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideTestConfig(),
        { provide: AuthService, useValue: { getAccessToken } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    participant = TestBed.inject(ParticipantSessionService);
  });

  afterEach(() => httpMock.verify());

  const flushAsync = () => new Promise((resolve) => setTimeout(resolve));

  it('adds the Supabase token to backend requests', async () => {
    http.get(`${TEST_API_URL}/api/v1/me/events`).subscribe();
    await flushAsync();

    const req = httpMock.expectOne(`${TEST_API_URL}/api/v1/me/events`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer supabase-jwt');
    req.flush([]);
  });

  it('adds the participant token to participant endpoints', () => {
    participant.setSession('participant-token');

    http.get(`${TEST_API_URL}/api/v1/participant/registration`).subscribe();

    const req = httpMock.expectOne(`${TEST_API_URL}/api/v1/participant/registration`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer participant-token');
    expect(getAccessToken).not.toHaveBeenCalled();
    req.flush({});
  });

  it('sends anonymous public endpoints without a token or a session lookup', () => {
    http.get(`${TEST_API_URL}/api/v1/public/events`).subscribe();

    const req = httpMock.expectOne(`${TEST_API_URL}/api/v1/public/events`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(getAccessToken).not.toHaveBeenCalled();
    req.flush({});
  });

  it('never sends a token to another host', () => {
    http.get('https://other-host.example/api/v1/me').subscribe();

    const req = httpMock.expectOne('https://other-host.example/api/v1/me');
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(getAccessToken).not.toHaveBeenCalled();
    req.flush({});
  });

  it('keeps an Authorization header set by the caller', () => {
    http
      .get(`${TEST_API_URL}/api/v1/me`, { headers: { Authorization: 'Bearer custom' } })
      .subscribe();

    const req = httpMock.expectOne(`${TEST_API_URL}/api/v1/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer custom');
    req.flush({});
  });
});
