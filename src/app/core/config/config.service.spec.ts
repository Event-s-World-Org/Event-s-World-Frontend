import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONFIG } from './config.model';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('in browser platform', () => {
    it('should initialize with default config', () => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const service = TestBed.inject(ConfigService);
      expect(service.config()).toEqual(DEFAULT_CONFIG);
      expect(service.apiUrl).toBe(DEFAULT_CONFIG.apiUrl);
    });

    it('should load config from /config.json and merge with defaults', async () => {
      const mockConfig = {
        apiUrl: 'https://api.eventsworld.com',
        features: {
          coAdmin: true,
        },
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockConfig,
      });
      vi.stubGlobal('fetch', fetchMock);

      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const service = TestBed.inject(ConfigService);

      const loaded = await service.loadConfig();

      expect(fetchMock).toHaveBeenCalledWith('/config.json', expect.any(Object));
      expect(loaded.apiUrl).toBe('https://api.eventsworld.com');
      expect(loaded.features.coAdmin).toBe(true);
      expect(loaded.features.teamSplitter).toBe(false); // default retained
      expect(service.isLoaded()).toBe(true);
    });

    it('should fallback to default config if fetch fails', async () => {
      const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', fetchMock);

      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const service = TestBed.inject(ConfigService);

      const loaded = await service.loadConfig();

      expect(loaded).toEqual(DEFAULT_CONFIG);
      expect(service.isLoaded()).toBe(true);
    });
  });

  describe('in server platform (SSR)', () => {
    it('should not call fetch or touch localStorage in SSR', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });
      const service = TestBed.inject(ConfigService);

      const loaded = await service.loadConfig();

      expect(fetchMock).not.toHaveBeenCalled();
      expect(loaded).toEqual(DEFAULT_CONFIG);
      expect(service.isLoaded()).toBe(true);
    });
  });
});
