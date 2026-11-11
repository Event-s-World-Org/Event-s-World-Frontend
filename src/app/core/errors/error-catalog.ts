import { AppError, ProblemDetails } from './error-catalog.types';

export const ERROR_MESSAGES_ES: Readonly<Record<string, string>> = {
  AUTH_UNAUTHORIZED: 'Debes iniciar sesión para continuar.',
  AUTH_FORBIDDEN: 'No tienes permisos suficientes para realizar esta acción.',
  AUTH_INVALID_CREDENTIALS: 'Las credenciales proporcionadas son incorrectas.',
  AUTH_ACCOUNT_SUSPENDED: 'Tu cuenta ha sido suspendida temporalmente.',
  AUTH_SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',

  EVENT_NOT_FOUND: 'El evento solicitado no existe o fue retirado.',
  EVENT_NOT_PUBLISHED: 'El evento aún no está abierto al público.',
  EVENT_CLOSED: 'El periodo de inscripción para este evento ha finalizado.',
  EVENT_CAPACITY_EXCEEDED: 'Se han agotado los cupos disponibles para este evento.',
  EVENT_LOCKED: 'Este evento tiene inscripciones activas y no puede ser modificado.',

  PAYMENT_QR_EXPIRED: 'El código QR de cobro ha expirado. Contacta al organizador.',
  PAYMENT_AMOUNT_MISMATCH: 'El monto ingresado no coincide con el precio de la entrada.',
  PAYMENT_ALREADY_APPROVED: 'Este pago ya fue validado anteriormente.',
  PAYMENT_NOT_FOUND: 'No se encontró el registro de pago solicitado.',

  PARTICIPANT_NOT_FOUND: 'El participante solicitado no existe.',
  PARTICIPANT_ALREADY_REGISTERED: 'Ya existe una inscripción registrada con estos datos.',
  PARTICIPANT_INVALID_ANSWERS: 'Los datos del formulario de inscripción contienen errores.',

  NETWORK_ERROR: 'No se pudo conectar con el servidor. Revisa tu conexión a internet.',
  GENERIC_ERROR: 'Ocurrió un error inesperado al procesar tu solicitud. Por favor intenta de nuevo.',
};

export function getErrorMessage(code?: string): string {
  if (!code) {
    return ERROR_MESSAGES_ES['GENERIC_ERROR'];
  }
  return ERROR_MESSAGES_ES[code] ?? ERROR_MESSAGES_ES['GENERIC_ERROR'];
}

export function parseProblemDetails(
  details: ProblemDetails | null | undefined,
  fallbackStatus = 500,
): AppError {
  const code =
    details?.code ||
    (fallbackStatus === 401
      ? 'AUTH_UNAUTHORIZED'
      : fallbackStatus === 403
        ? 'AUTH_FORBIDDEN'
        : 'GENERIC_ERROR');

  return {
    status: details?.status ?? fallbackStatus,
    code,
    message: getErrorMessage(code),
    title: details?.title ?? 'Error en la solicitud',
    detail: details?.detail,
    fieldErrors: details?.errors,
  };
}
