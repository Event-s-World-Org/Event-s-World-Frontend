import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { retry } from 'rxjs';
import {
  createIdempotencyKey,
  idempotencyInterceptor,
  withIdempotencyKey,
} from './idempotency.interceptor';

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

  afterEach(() => httpMock.verify());

  const url = 'https://api.test/api/v1/events/42/registrations/in-person';

  it('sends the key of the form on every retry, so the backend sees one registration', () => {
    const key = createIdempotencyKey();
    http.post(url, {}, { context: withIdempotencyKey(key) }).pipe(retry(1)).subscribe();

    const first = httpMock.expectOne(url);
    expect(first.request.headers.get('Idempotency-Key')).toBe(key);
    first.flush({}, { status: 504, statusText: 'Gateway Timeout' });

    const retried = httpMock.expectOne(url);
    expect(retried.request.headers.get('Idempotency-Key')).toBe(key);
    retried.flush({});
  });

  it('adds a fallback key to registration POSTs without one', () => {
    const publicUrl = 'https://api.test/api/v1/public/events/fiesta/registrations';
    http.post(publicUrl, {}).subscribe();

    const req = httpMock.expectOne(publicUrl);
    expect(req.request.headers.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/);
    req.flush({});
  });

  it('adds nothing to other requests', () => {
    http.post('https://api.test/api/v1/events', {}).subscribe();
    http.get(url).subscribe();

    for (const req of httpMock.match(() => true)) {
      expect(req.request.headers.has('Idempotency-Key')).toBe(false);
      req.flush({});
    }
  });
});
