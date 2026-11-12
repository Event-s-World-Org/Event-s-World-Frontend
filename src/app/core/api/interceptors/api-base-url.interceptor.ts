import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigService } from '../../config';
import { API_PREFIX } from '../api-url';

/**
 * The generated client calls relative paths (`/api/v1/...`). This interceptor, the first of the
 * chain, sends them to the backend origin from the runtime configuration (`apiUrl`).
 */
export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_PREFIX)) {
    return next(req);
  }

  const apiUrl = inject(ConfigService).apiUrl;
  return next(req.clone({ url: `${apiUrl}${req.url}` }));
};
