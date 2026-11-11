import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthStore } from '../../features/auth/services/auth.store';
import { AppError } from '../errors/error-catalog.types';
import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';
import { idempotencyInterceptor } from './idempotency.interceptor';

describe('HTTP Interceptors & Error Handling (TS-014)', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let routerNavigateSpy: ReturnType<typeof vi.fn>;

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    routerNavigateSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([
            authInterceptor,
            idempotencyInterceptor,
            errorInterceptor,
          ]),
        ),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            url: '/panel/eventos/ev-01',
            navigate: routerNavigateSpy,
          },
        },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: vi.fn().mockReturnValue(true),
          },
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('debe adjuntar el token Authorization Bearer en peticiones autenticadas', () => {
    localStorage.setItem('events_world_auth_token', 'jwt_token_123');

    httpClient.get('/api/v1/events').subscribe();

    const req = httpTesting.expectOne('/api/v1/events');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt_token_123');
    req.flush([]);
  });

  it('debe adjuntar el token de participante en rutas de participante', () => {
    sessionStorage.setItem('ew_participant_token', 'part_token_999');

    httpClient.get('/api/v1/participant/profile').subscribe();

    const req = httpTesting.expectOne('/api/v1/participant/profile');
    expect(req.request.headers.get('Authorization')).toBe('Bearer part_token_999');
    req.flush({});
  });

  it('debe adjuntar cabecera Idempotency-Key en operaciones mutantes POST', () => {
    httpClient.post('/api/v1/registrations', { name: 'Ana' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/registrations');
    const key = req.request.headers.get('Idempotency-Key');
    expect(key).toBeTruthy();
    expect(key?.length).toBeGreaterThan(10);
    req.flush({ success: true });
  });

  it('debe capturar error 401 y redirigir a /auth/login con returnUrl', () => {
    let capturedError: AppError | undefined;

    httpClient.get('/api/v1/events').subscribe({
      next: () => {
        throw new Error('No debe ser exitoso');
      },
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    const req = httpTesting.expectOne('/api/v1/events');
    req.flush({ code: 'AUTH_SESSION_EXPIRED' }, { status: 401, statusText: 'Unauthorized' });

    expect(capturedError).toBeDefined();
    expect(capturedError?.status).toBe(401);
    expect(capturedError?.message).toBe('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/panel/eventos/ev-01' },
    });
  });

  it('debe traducir codigos de error conocidos del backend a mensajes legibles en espanol', () => {
    let capturedError: AppError | undefined;

    httpClient.post('/api/v1/registrations', {}).subscribe({
      next: () => {
        throw new Error('No debe ser exitoso');
      },
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    const req = httpTesting.expectOne('/api/v1/registrations');
    req.flush(
      { code: 'EVENT_CAPACITY_EXCEEDED', title: 'Capacidad llena' },
      { status: 409, statusText: 'Conflict' },
    );

    expect(capturedError).toBeDefined();
    expect(capturedError?.status).toBe(409);
    expect(capturedError?.message).toBe(
      'Se han agotado los cupos disponibles para este evento.',
    );
  });

  it('debe manejar errores desconocidos o excepciones inesperadas mostrando el mensaje generico en espanol', () => {
    let capturedError: AppError | undefined;

    httpClient.get('/api/v1/unknown').subscribe({
      next: () => {
        throw new Error('No debe ser exitoso');
      },
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    const req = httpTesting.expectOne('/api/v1/unknown');
    req.flush(
      { code: 'UNEXPECTED_INTERNAL_CRASH_999' },
      { status: 500, statusText: 'Server Error' },
    );

    expect(capturedError).toBeDefined();
    expect(capturedError?.status).toBe(500);
    expect(capturedError?.message).toBe(
      'Ocurrió un error inesperado al procesar tu solicitud. Por favor intenta de nuevo.',
    );
  });
});
