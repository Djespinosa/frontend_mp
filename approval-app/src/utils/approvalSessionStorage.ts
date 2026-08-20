import { ValidateOtpResponse } from '@mp/shared';

interface StoredApprovalState {
  sessionExpiresAt: number;
  response: ValidateOtpResponse;
}

function storageKey(requestId: string, approverToken: string): string {
  return `approvalSession:${requestId}:${approverToken}`;
}

/**
 * Persiste el resultado de validar el OTP (incluye sessionToken) en
 * sessionStorage (no localStorage: se limpia al cerrar la pestaña, acorde
 * a un token de vida corta) para sobrevivir a un refresh accidental de la
 * página durante la ventana de sessionExpiresIn.
 */
export function saveApprovalSession(requestId: string, approverToken: string, response: ValidateOtpResponse): void {
  const stored: StoredApprovalState = {
    sessionExpiresAt: Date.now() + response.sessionExpiresIn * 1000,
    response,
  };
  try {
    window.sessionStorage.setItem(storageKey(requestId, approverToken), JSON.stringify(stored));
  } catch {
    // sessionStorage puede no estar disponible (modo privado, cuotas, etc.);
    // la sesión sigue funcionando en memoria durante el ciclo de vida de la página.
  }
}

export function loadApprovalSession(requestId: string, approverToken: string): ValidateOtpResponse | null {
  try {
    const raw = window.sessionStorage.getItem(storageKey(requestId, approverToken));
    if (!raw) return null;

    const stored = JSON.parse(raw) as StoredApprovalState;
    if (Date.now() > stored.sessionExpiresAt) {
      clearApprovalSession(requestId, approverToken);
      return null;
    }
    return stored.response;
  } catch {
    return null;
  }
}

export function clearApprovalSession(requestId: string, approverToken: string): void {
  try {
    window.sessionStorage.removeItem(storageKey(requestId, approverToken));
  } catch {
    // no-op
  }
}
