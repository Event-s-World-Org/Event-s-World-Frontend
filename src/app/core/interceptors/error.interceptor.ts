import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { parseProblemDetails } from '../errors/error-catalog';
import { ProblemDetails } from '../errors/error-catalog.types';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const rawProblem =
          typeof error.error === 'object' && error.error !== null
            ? (error.error as ProblemDetails)
            : undefined;

        const appError = parseProblemDetails(rawProblem, error.status);

        if (error.status === 401 && !req.url.includes('/auth/login')) {
          const currentUrl = router.url;
          void router.navigate(['/auth/login'], {
            queryParams: { returnUrl: currentUrl },
          });
        }

        return throwError(() => appError);
      }

      const genericError = parseProblemDetails(null, 500);
      return throwError(() => genericError);
    }),
  );
};
