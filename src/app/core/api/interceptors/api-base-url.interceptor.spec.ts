import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiBaseUrlInterceptor } from './api-base-url.interceptor';
import { TEST_API_URL, provideTestConfig } from './test-support';

describe('apiBaseUrlInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiBaseUrlInterceptor])),
        provideHttpClientTesting(),
        provideTestConfig(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends relative /api/ paths of the generated client to the backend origin', () => {
    http.get('/api/v1/me/events').subscribe();

    httpMock.expectOne(`${TEST_API_URL}/api/v1/me/events`).flush([]);
  });

  it('leaves other URLs untouched', () => {
    http.get('/config.json').subscribe();
    http.get('https://example.org/data').subscribe();

    httpMock.expectOne('/config.json').flush({});
    httpMock.expectOne('https://example.org/data').flush({});
  });
});
