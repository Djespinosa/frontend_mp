import { ApiError } from '../types';

const MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Revisa los datos ingresados.',
  INVALID_LINK: 'El enlace no es válido.',
  APPROVAL_ALREADY_CLOSED: 'Esta aprobación ya fue procesada.',
  OTP_EXPIRED: 'El código expiró, solicita uno nuevo.',
  OTP_ATTEMPTS_EXCEEDED: 'Demasiados intentos, solicita un nuevo código.',
  INVALID_OTP: 'Código incorrecto.',
  INVALID_SESSION: 'Tu sesión expiró, valida el código nuevamente.',
  EVIDENCE_NOT_READY: 'La evidencia aún no está disponible.',
  REQUEST_NOT_FOUND: 'No se encontró la solicitud.',
  APPROVAL_NOT_FOUND: 'No se encontró la aprobación.',
  NETWORK_ERROR: 'No se pudo conectar con el servidor.',
  INTERNAL_ERROR: 'Ocurrió un error, intenta nuevamente.',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.code] ?? error.message ?? MESSAGES.INTERNAL_ERROR;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return MESSAGES.INTERNAL_ERROR;
}
