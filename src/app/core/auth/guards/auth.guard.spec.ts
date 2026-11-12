import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn((commands, extras) => ({ commands, extras })),
          },
        },
        {
          provide: AuthService,
          useValue: {
            checkAuthenticated: vi.fn(),
          },
        },
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow access if user is authenticated', async () => {
    vi.mocked(authService.checkAuthenticated).mockResolvedValue(true);

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/panel/eventos' } as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('should redirect to /login with returnUrl if user is not authenticated', async () => {
    vi.mocked(authService.checkAuthenticated).mockResolvedValue(false);

    const result = (await TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/panel/eventos/123' } as RouterStateSnapshot),
    )) as UrlTree;

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/panel/eventos/123' },
    });
    expect(result).toBeDefined();
  });

  it('should allow pass-through during SSR', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        {
          provide: Router,
          useValue: { createUrlTree: vi.fn() },
        },
        {
          provide: AuthService,
          useValue: { checkAuthenticated: vi.fn() },
        },
      ],
    });

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/panel/eventos' } as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });
});
