import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CurrentUserService } from '../current-user.service';

/** `/admin/**`: requires a session and the `super_admin` role from `GET /me` (ADR-0004). */
export const superAdminGuard: CanActivateFn = async (_route, state) => {
  // inject() only works before the first await.
  const router = inject(Router);
  const auth = inject(AuthService);
  const currentUser = inject(CurrentUserService);

  // Admin routes are client-rendered; the server only renders the shell.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }

  if (!(await auth.checkAuthenticated())) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const profile = await currentUser.load();
  return profile?.globalRole === 'super_admin' ? true : router.createUrlTree(['/403']);
};
