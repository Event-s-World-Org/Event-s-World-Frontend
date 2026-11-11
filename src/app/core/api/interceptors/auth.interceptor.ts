import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService, ParticipantSessionService } from '../../auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const participantSession = inject(ParticipantSessionService);
  const authService = inject(AuthService);

  // 1. Participant requests (e.g. /api/v1/participant/... or /participant/...)
  if (req.url.includes('/participant/')) {
    const participantToken = participantSession.getToken();
    if (participantToken && !req.headers.has('Authorization')) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${participantToken}`),
      });
      return next(cloned);
    }
    return next(req);
  }

  // 2. User / Organizer / Admin requests (Supabase JWT)
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  return from(authService.getAccessToken()).pipe(
    switchMap((token) => {
      if (token) {
        const cloned = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
        return next(cloned);
      }
      return next(req);
    }),
  );
};
