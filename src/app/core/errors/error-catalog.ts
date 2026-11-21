import { ApiError, ProblemDetails } from './problem-details.model';

export const DEFAULT_ERROR_MESSAGE =
  'Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.';

/**
 * Spanish messages for the backend error codes. Codes follow the backend convention
 * `module.snake_case` (Error.Code in the Shared Kernel). Add a code here when a story adds it.
 */
export const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  // Accounts (US-001, US-002, US-006, US-031)
  'accounts.suspended': 'Tu cuenta está suspendida. Escríbenos si crees que es un error.',
  'accounts.underage': 'Debes ser mayor de 18 años para crear una cuenta.',
  'accounts.email_not_verified': 'Verifica tu correo electrónico para continuar.',
  'accounts.profile_missing': 'Completa tu perfil para continuar.',
  'accounts.has_active_events':
    'No puedes eliminar tu cuenta mientras tengas eventos publicados o con inscritos.',
  // Legal (US-001, US-015)
  'legal.outdated_version': 'Los términos cambiaron. Vuelve a aceptarlos para continuar.',
  // Events (US-027)
  'events.field_locked': 'Este dato ya no se puede cambiar porque el evento tiene inscripciones.',
  // Registrations (US-008, US-024, US-028)
  'registrations.capacity_full': 'Ya no quedan cupos para este evento.',
  'registrations.paused':
    'Las inscripciones están pausadas por ahora. Vuelve a intentarlo más tarde.',
};

/** Fallback by HTTP status when the code is unknown or missing (status 0 = no connection). */
const STATUS_MESSAGES: Readonly<Record<number, string>> = {
  0: 'No pudimos conectarnos. Revisa tu conexión a internet e inténtalo de nuevo.',
  401: 'Tu sesión terminó. Vuelve a ingresar para continuar.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No encontramos lo que buscabas.',
  429: 'Hiciste demasiados intentos. Espera un momento e inténtalo de nuevo.',
};

/**
 * The message shown to the user. The backend `detail` is never shown: it is technical and in
 * English. It stays in `ApiError.detail` for logs.
 */
export function getErrorMessage(code?: string | null, status?: number): string {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  if (status !== undefined && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status];
  }
  return DEFAULT_ERROR_MESSAGE;
}

export function parseProblemDetails(errorResponse: unknown, status = 500): ApiError {
  const details =
    typeof errorResponse === 'object' && errorResponse !== null && !(errorResponse instanceof Event)
      ? (errorResponse as ProblemDetails)
      : undefined;
  const effectiveStatus = details?.status ?? status;

  return new ApiError(getErrorMessage(details?.code, effectiveStatus), effectiveStatus, details);
}
