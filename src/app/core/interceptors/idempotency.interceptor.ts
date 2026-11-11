import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const idempotencyInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const isMutation = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';
  const shouldBeIdempotent =
    isMutation &&
    (req.url.includes('/registrations') ||
      req.url.includes('/payments') ||
      req.url.includes('/attendees') ||
      req.url.includes('/sync/attendees') ||
      req.url.includes('/events'));

  if (shouldBeIdempotent && !req.headers.has('Idempotency-Key')) {
    const cloned = req.clone({
      setHeaders: {
        'Idempotency-Key': generateUuid(),
      },
    });
    return next(cloned);
  }

  return next(req);
};
