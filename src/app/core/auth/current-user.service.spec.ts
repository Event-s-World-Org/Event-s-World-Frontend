import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CurrentUserService } from './current-user.service';

describe('CurrentUserService', () => {
  let httpMock: HttpTestingController;
  let service: CurrentUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CurrentUserService);
  });

  afterEach(() => httpMock.verify());

  it('reads the global role from GET /api/v1/me once', async () => {
    const first = service.load();
    const second = service.load();
    httpMock.expectOne('/api/v1/me').flush({ id: 'u1', globalRole: 'super_admin' });

    expect(await first).toEqual({ id: 'u1', globalRole: 'super_admin' });
    expect(await second).toEqual(await first);
    expect(service.isSuperAdmin()).toBe(true);
  });

  it('returns null and allows a retry when the request fails', async () => {
    const result = service.load();
    httpMock.expectOne('/api/v1/me').flush({}, { status: 500, statusText: 'Error' });

    expect(await result).toBeNull();
    expect(service.isSuperAdmin()).toBe(false);

    void service.load();
    httpMock.expectOne('/api/v1/me').flush({ globalRole: 'user' });
  });
});
