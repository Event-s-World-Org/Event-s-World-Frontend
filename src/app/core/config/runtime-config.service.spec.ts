import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { RuntimeConfigService } from './runtime-config.service';
import { FeatureFlagService } from './feature-flag.service';
import { DEFAULT_CONFIG } from './runtime-config.types';

describe('RuntimeConfigService & FeatureFlagService (TS-014)', () => {
  let configService: RuntimeConfigService;
  let flagService: FeatureFlagService;
  let originalFetch: typeof globalThis.fetch;

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    TestBed.configureTestingModule({
      providers: [
        RuntimeConfigService,
        FeatureFlagService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    configService = TestBed.inject(RuntimeConfigService);
    flagService = TestBed.inject(FeatureFlagService);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('debe iniciar con la configuración por defecto', () => {
    expect(configService.config().apiUrl).toBe(DEFAULT_CONFIG.apiUrl);
    expect(configService.isEnabled('enablePaymentReview')).toBe(false);
    expect(configService.isEnabled('enableInPersonRegistration')).toBe(true);
    expect(flagService.canReviewPayments()).toBe(false);
    expect(flagService.canRegisterInPerson()).toBe(true);
  });

  it('debe cargar exitosamente /config.json y actualizar las banderas', async () => {
    const mockJson = {
      apiUrl: 'https://api.eventsworld.bo/api/v1',
      featureFlags: {
        enablePaymentReview: true,
        enableSettings: true,
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockJson),
    } as unknown as Response);

    const loaded = await configService.loadConfig();

    expect(loaded.apiUrl).toBe('https://api.eventsworld.bo/api/v1');
    expect(configService.isEnabled('enablePaymentReview')).toBe(true);
    expect(flagService.canReviewPayments()).toBe(true);
  });

  it('debe manejar errores de red o excepciones inesperadas al cargar /config.json manteniendo el fallback seguro', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline or DNS failure'));

    const loaded = await configService.loadConfig();

    expect(loaded).toEqual(DEFAULT_CONFIG);
    expect(configService.isEnabled('enableInPersonRegistration')).toBe(true);
    expect(configService.isEnabled('enablePaymentReview')).toBe(false);
  });

  it('permite modificar banderas en caliente mediante setFlag', () => {
    expect(configService.isEnabled('enablePaymentReview')).toBe(false);
    expect(flagService.canReviewPayments()).toBe(false);

    configService.setFlag('enablePaymentReview', true);

    expect(configService.isEnabled('enablePaymentReview')).toBe(true);
    expect(flagService.canReviewPayments()).toBe(true);
  });

  it('en entorno de servidor (SSR) no realiza llamadas fetch y retorna configuración segura', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        RuntimeConfigService,
        FeatureFlagService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const ssrConfigService = TestBed.inject(RuntimeConfigService);
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const loaded = await ssrConfigService.loadConfig();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(loaded).toEqual(DEFAULT_CONFIG);
  });
});
