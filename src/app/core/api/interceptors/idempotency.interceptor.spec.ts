import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { idempotencyInterceptor } from './idempotency.interceptor';

describe('idempotencyInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([idempotencyInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Idempotency-Key header on registration POST requests', () => {
    http.post('/api/v1/events/123/registrations', { name: 'Test' }).subscribe();

    const req = httpMock.expectOne('/api/v1/events/123/registrations');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.has('Idempotency-Key')).toBe(true);
    const key = req.request.headers.get('Idempotency-Key');
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(10);
    req.flush({});
  });

  it('should not add Idempotency-Key header on GET requests', () => {
    http.get('/api/v1/events/123').subscribe();

    const req = httpMock.expectOne('/api/v1/events/123');
    expect(req.request.headers.has('Idempotency-Key')).toBe(false);
    req.flush({});
  });

  it('should preserve existing Idempotency-Key header if already present', () => {
    http
      .post(
        '/api/v1/events/123/registrations',
        {},
        { headers: { 'Idempotency-Key': 'custom-key-999' } },
      )
      .subscribe();

    const req = httpMock.expectOne('/api/v1/events/123/registrations');
    expect(req.request.headers.get('Idempotency-Key')).toBe('custom-key-999');
    req.flush({});
  });
});
