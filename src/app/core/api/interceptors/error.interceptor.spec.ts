import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ParticipantSessionService } from '../../auth';
import { ApiError, DEFAULT_ERROR_MESSAGE, ERROR_MESSAGES } from '../../errors';
import { errorInterceptor } from './error.interceptor';
import { TEST_API_URL, provideTestConfig } from './test-support';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn>; url: string };

  beforeEach(() => {
    router = { navigate: vi.fn(), url: '/panel/eventos/456' };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideTestConfig(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: router },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function fail(path: string, body: object | string, status: number): ApiError | undefined {
    let captured: ApiError | undefined;
    http.get(`${TEST_API_URL}${path}`).subscribe({ error: (error: ApiError) => (captured = error) });
    httpMock.expectOne(`${TEST_API_URL}${path}`).flush(body, { status, statusText: 'Error' });
    return captured;
  }

  it('redirects a 401 to /login with the current page as returnUrl', () => {
    fail('/api/v1/me/events', {}, 401);

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/panel/eventos/456' },
    });
  });

  it('sends a participant 401 to link recovery and clears the participant session', () => {
    const participant = TestBed.inject(ParticipantSessionService);
    participant.setSession('expired-token');

    fail('/api/v1/participant/registration', {}, 401);

    expect(router.navigate).toHaveBeenCalledWith(['/mi-inscripcion/recuperar']);
    expect(participant.getToken()).toBeNull();
  });

  it('redirects a 403 to the no-permission page', () => {
    fail('/api/v1/admin/overview', {}, 403);

    expect(router.navigate).toHaveBeenCalledWith(['/403']);
  });

  it('translates a known backend code to its Spanish message', () => {
    const error = fail(
      '/api/v1/public/events/fiesta/registrations',
      { code: 'registrations.capacity_full', detail: 'Capacity reached.' },
      409,
    );

    expect(error?.userMessage).toBe(ERROR_MESSAGES['registrations.capacity_full']);
    expect(error?.status).toBe(409);
  });

  it('shows the generic Spanish message for an unknown code, never the technical detail', () => {
    const error = fail('/api/v1/me', { code: 'unknown.code', detail: 'NullReferenceException' }, 400);

    expect(error?.userMessage).toBe(DEFAULT_ERROR_MESSAGE);
    expect(error?.detail).toBe('NullReferenceException');
  });

  it('does not touch errors from other hosts', () => {
    let captured: unknown;
    http.get('https://other.example/x').subscribe({ error: (error) => (captured = error) });
    httpMock.expectOne('https://other.example/x').flush({}, { status: 401, statusText: 'Error' });

    expect(captured).not.toBeInstanceOf(ApiError);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
