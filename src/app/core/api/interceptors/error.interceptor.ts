import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { parseProblemDetails } from '../../errors';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const apiError = parseProblemDetails(error.error, error.status);

        if (isPlatformBrowser(platformId)) {
          if (error.status === 401) {
            const currentUrl = router.url || '/';
            // Only redirect if not already on the login or register page
            if (!currentUrl.startsWith('/login') && !currentUrl.startsWith('/registro')) {
              void router.navigate(['/login'], {
                queryParams: { returnUrl: currentUrl },
              });
            }
          } else if (error.status === 403) {
            void router.navigate(['/403']);
          }
        }

        return throwError(() => apiError);
      }

      return throwError(() => error);
    }),
  );
};
