import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConfigService } from './config.service';
import { FeatureFlagService } from './feature-flag.service';

describe('FeatureFlagService', () => {
  let configService: ConfigService;
  let flagService: FeatureFlagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    configService = TestBed.inject(ConfigService);
    flagService = TestBed.inject(FeatureFlagService);
  });

  it('should return false for disabled default features', () => {
    expect(flagService.isEnabled('coAdmin')).toBe(false);
    expect(flagService.isEnabled('unknownFlag')).toBe(false);
  });

  it('should reactively return true when feature flag is enabled without rebuild', () => {
    expect(flagService.isEnabled('refunds')).toBe(false);

    configService.setConfig({
      features: {
        ...configService.config().features,
        refunds: true,
      },
    });

    expect(flagService.isEnabled('refunds')).toBe(true);
    expect(flagService.features()['refunds']).toBe(true);
  });
});
