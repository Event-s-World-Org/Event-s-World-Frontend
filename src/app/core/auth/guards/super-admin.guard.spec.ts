import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';
import { CurrentUserService } from '../current-user.service';
import { superAdminGuard } from './super-admin.guard';

describe('superAdminGuard', () => {
  let checkAuthenticated: ReturnType<typeof vi.fn>;
  let load: ReturnType<typeof vi.fn>;
  let createUrlTree: ReturnType<typeof vi.fn>;

  function run(platform = 'browser') {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platform },
        { provide: Router, useValue: { createUrlTree } },
        { provide: AuthService, useValue: { checkAuthenticated } },
        { provide: CurrentUserService, useValue: { load } },
      ],
    });
    return TestBed.runInInjectionContext(() =>
      superAdminGuard({} as ActivatedRouteSnapshot, { url: '/admin/usuarios' } as RouterStateSnapshot),
    );
  }

  beforeEach(() => {
    checkAuthenticated = vi.fn().mockResolvedValue(true);
    load = vi.fn();
    createUrlTree = vi.fn((commands: unknown[]) => ({ commands }));
  });

  it('lets a Super Admin in, using the role from GET /me', async () => {
    load.mockResolvedValue({ globalRole: 'super_admin' });

    expect(await run()).toBe(true);
  });

  it('sends other users to the no-permission page', async () => {
    load.mockResolvedValue({ globalRole: 'user' });

    await run();

    expect(createUrlTree).toHaveBeenCalledWith(['/403']);
  });

  it('sends visitors without a session to login and back', async () => {
    checkAuthenticated.mockResolvedValue(false);

    await run();

    expect(createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/admin/usuarios' },
    });
    expect(load).not.toHaveBeenCalled();
  });

  it('only renders the shell on the server', async () => {
    expect(await run('server')).toBe(true);
    expect(checkAuthenticated).not.toHaveBeenCalled();
  });
});
