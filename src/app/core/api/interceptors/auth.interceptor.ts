import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService, ParticipantSessionService } from '../../auth';
import { ConfigService } from '../../config';
import { apiPath, isApiRequest } from '../api-url';

const PARTICIPANT_PREFIX = '/api/v1/participant/';
const PUBLIC_PREFIX = '/api/v1/public/';

/**
 * Adds the bearer token, only to requests for our backend (never to other hosts):
 * the participant token on `/participant/...`, nothing on `/public/...` (anonymous) and the
 * Supabase access token everywhere else (ADR-0004).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = inject(ConfigService).apiUrl;
  if (!isApiRequest(req.url, apiUrl) || req.headers.has('Authorization')) {
    return next(req);
  }

  const path = apiPath(req.url, apiUrl);

  if (path.startsWith(PARTICIPANT_PREFIX)) {
    const participantToken = inject(ParticipantSessionService).getToken();
    return next(
      participantToken
        ? req.clone({ setHeaders: { Authorization: `Bearer ${participantToken}` } })
        : req,
    );
  }

  if (path.startsWith(PUBLIC_PREFIX)) {
    return next(req);
  }

  return from(inject(AuthService).getAccessToken()).pipe(
    switchMap((token) =>
      next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req),
    ),
  );
};
