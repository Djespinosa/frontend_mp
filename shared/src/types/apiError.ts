/** Códigos reales devueltos por errorMapper.ts en el backend (AppError.code). */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_LINK'
  | 'REQUEST_NOT_FOUND'
  | 'APPROVAL_NOT_FOUND'
  | 'APPROVAL_ALREADY_CLOSED'
  | 'EVIDENCE_NOT_READY'
  | 'INVALID_OTP'
  | 'OTP_EXPIRED'
  | 'OTP_ATTEMPTS_EXCEEDED'
  | 'INVALID_SESSION'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR';

/** Forma exacta del cuerpo de error de todos los endpoints (ver errorMapper.ts). */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode | string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
