import { HttpContext, HttpContextToken, HttpInterceptorFn } from '@angular/common/http';

/**
 * The key must be created ONCE per form (US-008, US-024) and reused on every retry, so a retry
 * after a timeout returns the same registration instead of creating a second one
 * (backend.md §4). Usage:
 *
 * ```ts
 * readonly idempotencyKey = createIdempotencyKey();   // when the form opens
 * api.createInPersonRegistration(eventId, body, { context: withIdempotencyKey(this.idempotencyKey) });
 * ```
 */
export const IDEMPOTENCY_KEY = new HttpContextToken<string | null>(() => null);

export function createIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function withIdempotencyKey(key: string, context = new HttpContext()): HttpContext {
  return context.set(IDEMPOTENCY_KEY, key);
}

/** The two endpoints that accept the header (backend.md §4). */
const IDEMPOTENT_ENDPOINTS = [/\/api\/v1\/public\/events\/[^/]+\/registrations$/, /\/registrations\/in-person$/];

/**
 * Sends `Idempotency-Key` from the request context. As a safety net, registration POSTs without
 * one get a fresh key; that protects a single request but not a retry, so forms must pass theirs.
 */
export const idempotencyInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'POST' || req.headers.has('Idempotency-Key')) {
    return next(req);
  }

  const key =
    req.context.get(IDEMPOTENCY_KEY) ??
    (IDEMPOTENT_ENDPOINTS.some((endpoint) => endpoint.test(req.url)) ? createIdempotencyKey() : null);

  return next(key ? req.clone({ setHeaders: { 'Idempotency-Key': key } }) : req);
};
