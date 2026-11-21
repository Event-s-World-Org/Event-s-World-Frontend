import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SUPABASE_AUTH } from './supabase-auth';

describe('SUPABASE_AUTH', () => {
  it('resolves null on the server (SSR-safe)', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    expect(await TestBed.inject(SUPABASE_AUTH)()).toBeNull();
  });

  it('creates one Auth client on demand in the browser', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
    const load = TestBed.inject(SUPABASE_AUTH);

    const first = await load();
    const second = await load();

    expect(first).not.toBeNull();
    expect(second).toBe(first);
  });
});
