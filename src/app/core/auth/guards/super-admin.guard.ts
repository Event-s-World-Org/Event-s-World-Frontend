import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const superAdminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const isAuthenticated = await authService.checkAuthenticated();
  if (!isAuthenticated) {
    return router.createUrlTree(['/login']);
  }

  if (authService.isSuperAdmin()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
