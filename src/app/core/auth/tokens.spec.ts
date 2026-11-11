import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ConfigService } from '../config';
import { SUPABASE_CLIENT, provideSupabaseClient } from './tokens';

describe('provideSupabaseClient', () => {
  it('should return null in server environment (SSR-safe)', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        provideSupabaseClient(),
      ],
    });

    const client = TestBed.inject(SUPABASE_CLIENT);
    expect(client).toBeNull();
  });

  it('should create client in browser environment', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        ConfigService,
        provideSupabaseClient(),
      ],
    });

    const client = TestBed.inject(SUPABASE_CLIENT);
    expect(client).not.toBeNull();
  });
});
