import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { RuntimeConfigService } from '../config/runtime-config.service';
import { ApiClientService } from './api-client.service';
import {
  SUPABASE_CLIENT,
  provideSupabaseClient,
} from '../auth/supabase-client.provider';
import { InPersonRegistrationRequest } from './api.types';

describe('ApiClientService & SupabaseProvider (TS-014)', () => {
  let service: ApiClientService;
  let httpTesting: HttpTestingController;

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiClientService,
        provideSupabaseClient(),
        {
          provide: RuntimeConfigService,
          useValue: {
            apiUrl: vi.fn().mockReturnValue('http://localhost:5000/api/v1'),
            supabase: vi.fn().mockReturnValue({
              url: 'https://test.supabase.co',
              anonKey: 'test_key',
            }),
          },
        },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(ApiClientService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe obtener la lista de eventos desde /events', () => {
    service.getEvents().subscribe((events) => {
      expect(events.length).toBe(1);
      expect(events[0].title).toBe('Camp Kids');
    });

    const req = httpTesting.expectOne('http://localhost:5000/api/v1/events');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'ev-1', title: 'Camp Kids' }]);
  });

  it('debe enviar la solicitud de inscripcion presencial a /registrations/in-person', () => {
    const payload: InPersonRegistrationRequest = {
      eventId: 'ev-1',
      firstName: 'Mateo',
      lastName: 'Perez',
      phone: '77712345',
      amountPaid: 200,
      totalPrice: 200,
      paymentMethod: 'cash',
    };

    service.registerInPerson(payload).subscribe((res) => {
      expect(res.firstName).toBe('Mateo');
      expect(res.status).toBe('paid');
    });

    const req = httpTesting.expectOne(
      'http://localhost:5000/api/v1/registrations/in-person',
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'p-1', firstName: 'Mateo', status: 'paid' });
  });

  it('debe proveer el cliente supabase en entorno navegador', () => {
    const supabase = TestBed.inject(SUPABASE_CLIENT);
    expect(supabase).not.toBeNull();
    expect(supabase?.auth).toBeDefined();
  });

  it('en entorno SSR el cliente supabase debe ser null para evitar acceso al DOM o localStorage', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideSupabaseClient(),
        {
          provide: RuntimeConfigService,
          useValue: {
            supabase: vi.fn().mockReturnValue({
              url: 'https://test.supabase.co',
              anonKey: 'test_key',
            }),
          },
        },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const supabase = TestBed.inject(SUPABASE_CLIENT);
    expect(supabase).toBeNull();
  });
});
