import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';
import { FeatureFlagService } from './feature-flag.service';

describe('FeatureFlagService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('uses the defaults until config.json is loaded', () => {
    const flags = TestBed.inject(FeatureFlagService);

    expect(flags.isEnabled('teamSplitter')).toBe(false);
    expect(flags.isEnabled('paymentReview')).toBe(true);
  });

  it('follows config.json without a rebuild', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ features: { teamSplitter: true, paymentReview: false } }),
      }),
    );
    const flags = TestBed.inject(FeatureFlagService);

    await TestBed.inject(ConfigService).loadConfig();

    expect(flags.isEnabled('teamSplitter')).toBe(true);
    expect(flags.isEnabled('paymentReview')).toBe(false);
    expect(flags.isEnabled('refunds')).toBe(false);
  });
});
