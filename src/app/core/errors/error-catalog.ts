import { ApiError, ProblemDetails } from './problem-details.model';

export const DEFAULT_ERROR_MESSAGE =
  'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';

export const ERROR_MESSAGES: Record<string, string> = {
  // Auth & Accounts
  VALIDATION_ERROR: 'Los datos ingresados no son válidos. Por favor, revisa el formulario.',
  UNAUTHORIZED: 'Debes iniciar sesión para continuar.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  ACCOUNT_SUSPENDED: 'Tu cuenta ha sido suspendida. Contacta a soporte para más información.',
  INVALID_CREDENTIALS: 'El correo electrónico o la contraseña son incorrectos.',
  EMAIL_ALREADY_EXISTS: 'Ya existe una cuenta registrada con este correo electrónico.',
  USER_NOT_FOUND: 'No se encontró el usuario solicitado.',
  RATE_LIMIT_EXCEEDED: 'Has excedido el límite de intentos. Por favor, intenta de nuevo más tarde.',

  // Events
  EVENT_NOT_FOUND: 'El evento no fue encontrado.',
  EVENT_SUSPENDED: 'Este evento se encuentra suspendido.',
  EVENT_CANCELLED: 'Este evento ha sido cancelado.',
  REGISTRATIONS_CLOSED: 'Las inscripciones para este evento están cerradas.',
  REGISTRATIONS_PAUSED: 'Las inscripciones están pausadas temporalmente.',
  CAPACITY_EXCEEDED: 'Lo sentimos, ya no quedan cupos disponibles para este evento.',

  // Registrations & Payments
  REGISTRATION_NOT_FOUND: 'La inscripción no fue encontrada.',
  DUPLICATE_REGISTRATION: 'Ya existe una inscripción registrada con estos datos.',
  INVALID_PARTICIPANT_TOKEN: 'El enlace de acceso es inválido o ha expirado.',
  PAYMENT_QR_EXPIRED: 'El código QR de pago ha expirado.',
  INVALID_VOUCHER: 'El comprobante subido no es válido o está dañado.',
  VOUCHER_TOO_LARGE: 'El archivo excede el tamaño máximo permitido de 5 MB.',
  PAYMENT_ALREADY_APPROVED: 'Este pago ya ha sido aprobado previamente.',
  PAYMENT_SUBMISSION_NOT_FOUND: 'El comprobante de pago no fue encontrado.',
  REASON_REQUIRED: 'El motivo es obligatorio para observar o rechazar.',

  // General HTTP status / Infrastructure
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  INTERNAL_SERVER_ERROR: 'Ocurrió un error interno en el servidor.',
};

export function getErrorMessage(
  code?: string | null,
  fallbackDetail?: string | null,
): string {
  if (code && typeof code === 'string' && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  if (fallbackDetail && typeof fallbackDetail === 'string' && fallbackDetail.trim().length > 0) {
    return fallbackDetail;
  }
  return DEFAULT_ERROR_MESSAGE;
}

export function parseProblemDetails(errorResponse: unknown, status = 500): ApiError {
  if (typeof errorResponse === 'object' && errorResponse !== null) {
    const details = errorResponse as ProblemDetails;
    const userMessage = getErrorMessage(details.code, details.detail);
    return new ApiError(userMessage, details.status ?? status, details);
  }

  const fallbackMessage = typeof errorResponse === 'string' ? errorResponse : DEFAULT_ERROR_MESSAGE;
  return new ApiError(fallbackMessage, status);
}
