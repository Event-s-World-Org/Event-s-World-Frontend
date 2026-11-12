import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_ERROR_MESSAGE, ERROR_MESSAGES, ApiError } from '../../errors';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let routerMock: { navigate: ReturnType<typeof vi.fn>; url: string };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
      url: '/panel/eventos/456',
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: routerMock },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should redirect to /login with returnUrl on 401 Unauthorized', () => {
    let capturedError: unknown;

    http.get('/api/v1/protected').subscribe({
      next: () => expect.unreachable('Should have failed'),
      error: (err) => {
        capturedError = err;
      },
    });

    const req = httpMock.expectOne('/api/v1/protected');
    req.flush({ code: 'UNAUTHORIZED' }, { status: 401, statusText: 'Unauthorized' });

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/panel/eventos/456' },
    });
    expect(capturedError).toBeDefined();
  });

  it('should redirect to /403 on 403 Forbidden', () => {
    http.get('/api/v1/admin').subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne('/api/v1/admin');
    req.flush({ code: 'FORBIDDEN' }, { status: 403, statusText: 'Forbidden' });

    expect(routerMock.navigate).toHaveBeenCalledWith(['/403']);
  });

  it('should translate known error code to Spanish message', () => {
    let capturedError: ApiError | undefined;

    http.get('/api/v1/events/123').subscribe({
      error: (err: ApiError) => {
        capturedError = err;
      },
    });

    const req = httpMock.expectOne('/api/v1/events/123');
    req.flush(
      { code: 'CAPACITY_EXCEEDED', detail: 'Sold out' },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(capturedError?.userMessage).toBe(ERROR_MESSAGES['CAPACITY_EXCEEDED']);
    expect(capturedError?.status).toBe(400);
  });

  it('should fallback to default generic message on unknown error code', () => {
    let capturedError: ApiError | undefined;

    http.get('/api/v1/events/123').subscribe({
      error: (err: ApiError) => {
        capturedError = err;
      },
    });

    const req = httpMock.expectOne('/api/v1/events/123');
    req.flush({ code: 'NON_EXISTENT_CODE' }, { status: 400, statusText: 'Bad Request' });

    expect(capturedError?.userMessage).toBe(DEFAULT_ERROR_MESSAGE);
  });
});
