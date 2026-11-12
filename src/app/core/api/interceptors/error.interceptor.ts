import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ParticipantSessionService } from '../../auth';
import { ConfigService } from '../../config';
import { parseProblemDetails } from '../../errors';
import { apiPath, isApiRequest } from '../api-url';

const PARTICIPANT_PREFIX = '/api/v1/participant/';
const NO_LOGIN_REDIRECT = ['/login', '/registro', '/recuperar'];

/**
 * Turns failed backend responses into a typed `ApiError` with a Spanish message and handles
 * session problems: 401 → login with `returnUrl` (or link recovery for participants, who have
 * no account), 403 → the "no permission" page.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const participantSession = inject(ParticipantSessionService);
  const apiUrl = inject(ConfigService).apiUrl;

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || !isApiRequest(req.url, apiUrl)) {
        return throwError(() => error);
      }

      const apiError = parseProblemDetails(error.error, error.status);

      if (isPlatformBrowser(platformId)) {
        const isParticipantRequest = apiPath(req.url, apiUrl).startsWith(PARTICIPANT_PREFIX);

        if (error.status === 401 && isParticipantRequest) {
          // The 30-minute participant token expired: the personal link must be opened again.
          participantSession.clearSession();
          void router.navigate(['/mi-inscripcion/recuperar']);
        } else if (error.status === 401) {
          const currentUrl = router.url || '/';
          if (!NO_LOGIN_REDIRECT.some((path) => currentUrl.startsWith(path))) {
            void router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
          }
        } else if (error.status === 403) {
          void router.navigate(['/403']);
        }
      }

      return throwError(() => apiError);
    }),
  );
};
