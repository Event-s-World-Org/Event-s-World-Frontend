import { DEFAULT_ERROR_MESSAGE, ERROR_MESSAGES, getErrorMessage, parseProblemDetails } from './error-catalog';

describe('error catalog', () => {
  it('maps backend codes (module.snake_case) to Spanish messages', () => {
    expect(getErrorMessage('registrations.capacity_full')).toBe(
      ERROR_MESSAGES['registrations.capacity_full'],
    );
    expect(getErrorMessage('accounts.suspended')).toContain('suspendida');
  });

  it('falls back to a message by status, then to the generic message', () => {
    expect(getErrorMessage('unknown.code', 429)).toContain('demasiados intentos');
    expect(getErrorMessage(undefined, 0)).toContain('conexión');
    expect(getErrorMessage('unknown.code', 400)).toBe(DEFAULT_ERROR_MESSAGE);
    expect(getErrorMessage(null)).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it('keeps the technical detail out of the user message', () => {
    const error = parseProblemDetails(
      { code: 'unknown.code', status: 500, detail: 'Npgsql timeout at line 42' },
      500,
    );

    expect(error.userMessage).toBe(DEFAULT_ERROR_MESSAGE);
    expect(error.detail).toBe('Npgsql timeout at line 42');
    expect(error.status).toBe(500);
  });

  it('uses the generic message for non-JSON bodies such as a proxy HTML page', () => {
    const error = parseProblemDetails('<html>502 Bad Gateway</html>', 502);

    expect(error.userMessage).toBe(DEFAULT_ERROR_MESSAGE);
    expect(error.status).toBe(502);
  });

  it('treats a network failure (status 0) as a connection problem', () => {
    const error = parseProblemDetails(new ProgressEvent('error'), 0);

    expect(error.userMessage).toContain('conexión');
  });
});
