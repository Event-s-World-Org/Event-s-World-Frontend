import { HttpInterceptorFn } from '@angular/common/http';

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const idempotencyInterceptor: HttpInterceptorFn = (req, next) => {
  const isRegistrationPost =
    req.method === 'POST' &&
    (req.url.includes('/registrations') ||
      req.url.includes('/inscripcion') ||
      req.headers.has('X-Idempotent'));

  if (isRegistrationPost && !req.headers.has('Idempotency-Key')) {
    const cloned = req.clone({
      headers: req.headers.set('Idempotency-Key', generateUuid()),
    });
    return next(cloned);
  }

  return next(req);
};
