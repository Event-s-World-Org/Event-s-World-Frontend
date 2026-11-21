import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SUPABASE_AUTH, supabaseStorageKey } from './supabase-auth';

describe('AuthService', () => {
  let loader: ReturnType<typeof vi.fn>;
  let fakeClient: {
    getSession: ReturnType<typeof vi.fn>;
    onAuthStateChange: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
  };

  function setup(platform = 'browser') {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platform },
        { provide: SUPABASE_AUTH, useValue: loader },
      ],
    });
    return TestBed.inject(AuthService);
  }

  beforeEach(() => {
    localStorage.clear();
    fakeClient = {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'jwt', user: { id: 'u1' } } },
      }),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    };
    loader = vi.fn().mockResolvedValue(fakeClient);
  });

  it('does not load Supabase for an anonymous visitor', async () => {
    const auth = setup();

    expect(await auth.getAccessToken()).toBeNull();
    expect(loader).not.toHaveBeenCalled();
  });

  it('restores a stored session and returns its access token', async () => {
    localStorage.setItem(supabaseStorageKey(''), '{}');
    const auth = setup();

    expect(await auth.getAccessToken()).toBe('jwt');
    expect(auth.isAuthenticated()).toBe(true);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('loads the client on demand for the login flow', async () => {
    const auth = setup();

    expect(await auth.client()).toBe(fakeClient);
    expect(await auth.getAccessToken()).toBe('jwt');
  });

  it('never loads Supabase on the server', async () => {
    localStorage.setItem(supabaseStorageKey(''), '{}');
    const auth = setup('server');

    expect(await auth.getAccessToken()).toBeNull();
    expect(loader).not.toHaveBeenCalled();
  });

  it('signs out and clears the session', async () => {
    const auth = setup();
    await auth.client();

    await auth.signOut();

    expect(fakeClient.signOut).toHaveBeenCalled();
    expect(auth.isAuthenticated()).toBe(false);
  });
});

describe('supabaseStorageKey', () => {
  it('matches the key supabase-js uses', () => {
    expect(supabaseStorageKey('https://abcd1234.supabase.co')).toBe('sb-abcd1234-auth-token');
  });
});
