import { isPlatformBrowser } from '@angular/common';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { AuthStore } from '../../features/auth/services/auth.store';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const platformId = inject(PLATFORM_ID);
  const authStore = inject(AuthStore);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  let token: string | null = null;

  if (req.url.includes('/participant/') || req.url.includes('/mi-inscripcion/')) {
    try {
      token = sessionStorage.getItem('ew_participant_token');
    } catch {
      token = null;
    }
  }

  if (!token) {
    try {
      const stored = localStorage.getItem('events_world_auth_token');
      if (stored) {
        token = stored;
      } else if (authStore.isAuthenticated()) {
        token = 'mock_jwt_token_shadith';
      }
    } catch {
      token = null;
    }
  }

  if (token && !req.headers.has('Authorization')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
